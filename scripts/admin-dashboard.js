// Admin Dashboard JavaScript - Enhanced with Real-time Metrics and User Management

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadRealTimeAnalytics();
    loadUsers();
    loadOrders();
    loadProducts();
});

// Data storage
let users = [];
let orders = [];
let products = [];
let currentUser = null;
let maintenanceMode = false;

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    try {
        currentUser = JSON.parse(user);
        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }
        await checkMaintenanceStatus();
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'index.html';
    }
}

// Load user data and update UI
async function loadUserData() {
    try {
        const userData = await apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Admin';
        document.getElementById('userRole').textContent = userData.role || 'Admin';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Admin';
    }
}

// Load real-time analytics with actual backend data
async function loadRealTimeAnalytics() {
    try {
        const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
            apiClient.getOrders(),
            apiClient.getUsers(),
            apiClient.getProducts()
        ]);
        
        const ordersList = apiClient.extractArrayData(ordersResponse);
        const usersList = apiClient.extractArrayData(usersResponse);
        const productsList = apiClient.extractArrayData(productsResponse);
        
        // Calculate real metrics
        const totalSales = ordersList
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        
        const totalOrders = ordersList.length;
        const totalUsers = usersList.length;
        const totalProducts = productsList.length;
        
        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = ordersList
            .filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate.getMonth() === currentMonth && 
                       orderDate.getFullYear() === currentYear &&
                       ['delivered', 'paid'].includes(order.status);
            })
            .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        
        const pendingOrders = ordersList.filter(order => 
            order.status === 'pending'
        ).length;
        
        // Update dashboard stats with real data
        document.getElementById('totalSales').textContent = `Ksh${totalSales.toLocaleString()}`;
        document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
        document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
        document.getElementById('monthlyRevenue').textContent = `Ksh${monthlyRevenue.toLocaleString()}`;
        document.getElementById('pendingOrders').textContent = pendingOrders.toLocaleString();
        document.getElementById('totalProducts').textContent = totalProducts.toLocaleString();
        
        // Calculate and display growth rates
        updateGrowthRates(ordersList, usersList);
        
        console.log('Real-time analytics loaded:', {
            totalSales, totalOrders, totalUsers, monthlyRevenue, pendingOrders
        });
        
    } catch (error) {
        console.error('Error loading real-time analytics:', error);
        showFallbackStats();
    }
}

// Calculate growth rates based on historical data
function updateGrowthRates(ordersList, usersList) {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = new Date().getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Orders growth
    const currentMonthOrders = ordersList.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthOrders = ordersList.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    }).length;
    
    const orderGrowth = lastMonthOrders > 0 ? 
        ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
    
    // Users growth
    const currentMonthUsers = usersList.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthUsers = usersList.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear;
    }).length;
    
    const userGrowth = lastMonthUsers > 0 ? 
        ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;
    
    // Update growth indicators
    updateGrowthIndicator('orderGrowth', orderGrowth);
    updateGrowthIndicator('userGrowth', userGrowth);
    updateGrowthIndicator('salesGrowth', orderGrowth); // Use same as orders for now
    updateGrowthIndicator('revenueGrowth', orderGrowth); // Use same as orders for now
}

// Update growth indicators with real data
function updateGrowthIndicator(elementId, growthRate) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const isPositive = growthRate >= 0;
    const arrow = isPositive ? '↑' : '↓';
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    element.className = `text-sm font-medium ${colorClass}`;
    element.textContent = `${arrow} ${Math.abs(growthRate).toFixed(1)}% from last month`;
}

// Load users from API
async function loadUsers() {
    try {
        const response = await apiClient.getUsers();
        users = apiClient.extractArrayData(response);
        console.log('Users loaded:', users);
        
        displayUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showUsersError();
    }
}

// Display users in table with enhanced actions
function displayUsersTable() {
    const tableBody = document.querySelector('#usersTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center py-8">
                <div class="text-gray-400 text-4xl mb-4">👥</div>
                <p class="text-gray-600 mb-4">No users found.</p>
                <button class="btn-primary" onclick="showCreateUserModal()">Create First User</button>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const joinDate = new Date(user.created_at).toLocaleDateString();
        const isActive = user.status !== 'inactive' && user.status !== 'suspended';
        
        row.innerHTML = `
            <td class="font-medium">${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge role-${user.role}">${user.role}</span>
            </td>
            <td>
                <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="text-sm text-gray-500">${joinDate}</td>
            <td>
                <div class="flex space-x-2">
                    <button class="btn-secondary text-sm" onclick="viewUserDetails('${user.id}')">
                        View
                    </button>
                    <button class="btn-secondary text-sm" onclick="editUser('${user.id}')">
                        Edit
                    </button>
                    <button class="btn-${isActive ? 'danger' : 'primary'} text-sm" 
                            onclick="toggleUserStatus('${user.id}', ${isActive})">
                        ${isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <button class="btn-danger text-sm" onclick="deleteUser('${user.id}')">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load orders with real-time data
async function loadOrders() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response);
        console.log('Orders loaded:', orders);
        
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-600">No orders found.</p>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        orders.slice(0, 10).forEach(order => { // Show latest 10 orders
            const row = document.createElement('tr');
            const orderDate = new Date(order.created_at).toLocaleDateString();
            const amount = parseFloat(order.total_amount) || 0;
            
            row.innerHTML = `
                <td class="font-medium">#${order.id}</td>
                <td>${order.user?.name || order.customer_name || 'N/A'}</td>
                <td class="font-medium">Ksh${amount.toLocaleString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="text-sm text-gray-500">${orderDate}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="viewOrderDetails('${order.id}')">
                            View
                        </button>
                        <button class="btn-primary text-sm" onclick="updateOrderStatus('${order.id}')">
                            Update
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load products with real inventory data
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response);
        console.log('Products loaded:', products);
        
        // Update product analytics
        updateProductAnalytics();
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Update product analytics section
function updateProductAnalytics() {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => (p.quantity || 0) < 10).length;
    const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0).length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    
    // Update product metrics in the analytics section
    const productMetrics = document.getElementById('productMetrics');
    if (productMetrics) {
        productMetrics.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800">Total Products</h4>
                    <p class="text-2xl font-bold text-blue-600">${totalProducts}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-green-800">Active Products</h4>
                    <p class="text-2xl font-bold text-green-600">${activeProducts}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-yellow-800">Low Stock</h4>
                    <p class="text-2xl font-bold text-yellow-600">${lowStockProducts}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-red-800">Out of Stock</h4>
                    <p class="text-2xl font-bold text-red-600">${outOfStockProducts}</p>
                </div>
            </div>
        `;
    }
}

// View user details
function viewUserDetails(userId) {
    const user = users.find(u => u.id == userId);
    if (user) {
        const userOrders = orders.filter(o => o.user_id == userId);
        const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        
        alert(`User Details:
        
Name: ${user.name || 'N/A'}
Email: ${user.email}
Role: ${user.role}
Status: ${user.status || 'Active'}
Joined: ${new Date(user.created_at).toLocaleDateString()}
Total Orders: ${userOrders.length}
Total Spent: Ksh${totalSpent.toLocaleString()}
Phone: ${user.phone || 'N/A'}
Location: ${user.location || 'N/A'}`);
    }
}

// Toggle user status with proper API integration
async function toggleUserStatus(userId, isCurrentlyActive) {
    const action = isCurrentlyActive ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        await apiClient.toggleUserStatus(userId);
        showNotification(`User ${action}d successfully.`, 'success');
        await loadUsers(); // Refresh user list
    } catch (error) {
        console.error('Error toggling user status:', error);
        showNotification('Failed to update user status: ' + error.message, 'error');
    }
}

// Delete user with confirmation
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiClient.deleteUser(userId);
        showNotification('User deleted successfully.', 'success');
        await loadUsers(); // Refresh user list
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user: ' + error.message, 'error');
    }
}

// Maintenance mode toggle
async function toggleMaintenanceMode() {
    try {
        const action = maintenanceMode ? 'disable' : 'enable';
        if (action === 'enable') {
            await apiClient.enableMaintenanceMode();
            showNotification('Maintenance mode enabled.', 'info');
        } else {
            await apiClient.disableMaintenanceMode();
            showNotification('Maintenance mode disabled.', 'success');
        }

        maintenanceMode = !maintenanceMode;
        updateMaintenanceButton();
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Call this on dashboard load
async function checkMaintenanceStatus() {
    try {
        const status = await apiClient.getMaintenanceStatus();
        maintenanceMode = !!status.maintenance;
        updateMaintenanceButton();
    } catch (error) {
        console.error('Could not fetch maintenance status:', error);
    }
}

function updateMaintenanceButton() {
    const btn = document.getElementById('maintenanceToggle');
    if (!btn) return;
    btn.textContent = maintenanceMode ? '🔧 Disable Maintenance' : '🔧 Enable Maintenance';
    btn.className = maintenanceMode ? 'btn-primary' : 'btn-secondary';
}

// Show notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'info' ? 'bg-blue-500 text-white' :
        'bg-gray-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Display fallback stats in case of error
function showFallbackStats() {
    document.getElementById('totalSales').textContent = 'Ksh0';
    document.getElementById('totalOrders').textContent = '0';
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('monthlyRevenue').textContent = 'Ksh0';
    document.getElementById('pendingOrders').textContent = '0';
    document.getElementById('totalProducts').textContent = '0';
}

// Display error message when loading users fails
function showUsersError() {
    const tableBody = document.querySelector('#usersTable tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="text-red-400 text-4xl mb-4">⚠️</div>
                    <p class="text-gray-600 mb-4">Failed to load users. Please try again.</p>
                    <button class="btn-primary" onclick="loadUsers()">Retry</button>
                </td>
            </tr>
        `;
    }
}
// Refresh all data
async function refreshData() {
    try {
        await Promise.all([
            loadRealTimeAnalytics(),
            loadUsers(),
            loadOrders(),
            loadProducts()
        ]);
        showNotification('System Data refreshed with latest information!', 'success');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Failed to refresh System Data!', 'error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Make functions globally available
window.viewUserDetails = viewUserDetails;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.toggleMaintenanceMode = toggleMaintenanceMode;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.refreshData = refreshData;
window.refreshData = refreshData;
window.loadUsers = loadUsers;
window.logout = logout;
