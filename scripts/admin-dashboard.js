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
        // const activeUsersCount = usersList.filter(user => user.status === 'active').length;
        // document.getElementById('totalUsers').textContent = activeUsersCount.toLocaleString();

        console.log('Total users from API:', totalUsers);
        const totalUsersElement = document.getElementById('totalUsers');
        console.log('Element for #totalUsers:', totalUsersElement);
        if (!totalUsersElement) {
            console.warn('⚠️ Element with id="totalUsers" not found in the DOM');
        }
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
                        ${order.status === 'confirmed' ?
                            `<button class="btn-primary text-sm" onclick="showAssignOrderModal('${order.id}')">
                                Assign
                            </button>` :
                            `<button class="btn-primary text-sm" onclick="updateOrderStatus('${order.id}')">
                                Update
                            </button>`
                        }
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

// Show create user modal
function showCreateUserModal() {
    const modalHtml = `
        <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Create New User</h3>
                <form id="createUserForm">
                    <div class="form-group mb-4">
                        <label for="userName">Name</label>
                        <input type="text" id="newUserName" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group mb-4">
                        <label for="userEmail">Email</label>
                        <input type="email" id="newUserEmail" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group mb-4">
                        <label for="userRole">Role</label>
                        <select id="newUserRole" required class="w-full p-2 border rounded">
                            <option value="">Select Role</option>
                            <option value="farmer">Farmer</option>
                            <option value="consumer">Consumer</option>
                            <option value="retailer">Retailer</option>
                            <option value="logistics">Logistics</option>
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label for="userPhone">Phone</label>
                        <input type="tel" id="newUserPhone" class="w-full p-2 border rounded">
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Create User</button>
                        <button type="button" onclick="closeUserModal()" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    console.log('Modal inserted:', document.getElementById('userModal'));
    console.log('userName input found:', document.getElementById('userName'));
    console.log('userRole input found:', document.getElementById('userRole'));
    
    document.getElementById('createUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
    const userData = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        role: document.getElementById('newUserRole').value,
        phone: document.getElementById('newUserPhone').value,
        password: 'DefaultPassword123!',
        password_confirmation: 'DefaultPassword123!',
        status: 'active'
}
   console.log('userData being sent:', userData);

        
        try {
            console.log('Sending userData:', userData);
            await apiClient.createUser(userData);
            showNotification('User created successfully!', 'success');
            closeUserModal();
            await loadUsers();
            await loadRealTimeAnalytics(); // Update user count
        } catch (error) {
            console.error('Error creating user:', error);
            showNotification('Failed to create user: ' + error.message, 'error');
        }
    });
}

// Edit user modal
function editUser(userId) {
    const user = users.find(u => u.id == userId);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    const modalHtml = `
        <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Edit User</h3>
                <form id="editUserForm">
                    <div class="form-group mb-4">
                        <label for="userName">Name</label>
                        <input type="text" id="userName" required class="w-full p-2 border rounded" value="${user.name || ''}">
                    </div>
                    <div class="form-group mb-4">
                        <label for="userEmail">Email</label>
                        <input type="email" id="userEmail" required class="w-full p-2 border rounded" value="${user.email}">
                    </div>
                    <div class="form-group mb-4">
                        <label for="userRole">Role</label>
                        <select id="userRole" required class="w-full p-2 border rounded">
                            <option value="farmer" ${user.role === 'farmer' ? 'selected' : ''}>Farmer</option>
                            <option value="consumer" ${user.role === 'consumer' ? 'selected' : ''}>Consumer</option>
                            <option value="retailer" ${user.role === 'retailer' ? 'selected' : ''}>Retailer</option>
                            <option value="logistics" ${user.role === 'logistics' ? 'selected' : ''}>Logistics</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label for="userPhone">Phone</label>
                        <input type="tel" id="userPhone" class="w-full p-2 border rounded" value="${user.phone || ''}">
                    </div>
                    <div class="form-group mb-4">
                        <label for="userStatus">Status</label>
                        <select id="userStatus" required class="w-full p-2 border rounded">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                        </select>
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Update User</button>
                        <button type="button" onclick="closeUserModal()" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('editUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            phone: document.getElementById('userPhone').value,
            status: document.getElementById('userStatus').value
        };
        
        try {
            await apiClient.updateUser(userId, userData);
            showNotification('User updated successfully!', 'success');
            closeUserModal();
            await loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification('Failed to update user: ' + error.message, 'error');
        }
    });
}

// Close user modal
function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.remove();
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
    const newStatus = isCurrentlyActive ? 'suspended' : 'active';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        await apiClient.updateUserStatus(userId, newStatus);
        showNotification(`User ${action}d successfully.`, 'success');
        await loadUsers(); // Refresh user list
        await loadRealTimeAnalytics(); // Update user count
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
        await loadRealTimeAnalytics(); // Update user count immediately
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

// View order details function
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    // Calculate total items
    let totalItems = 0;
    let itemsDisplay = 'No items';
    
    if (order.items && Array.isArray(order.items)) {
        totalItems = order.items.length;
        itemsDisplay = order.items.map(item => 
            `${item.product?.name || item.name || 'Product'} (Qty: ${item.quantity || 0})`
        ).join('\n');
    }
    
    const orderDate = new Date(order.created_at).toLocaleDateString();
    const deliveryDate = order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set';
    
    alert(`Order Details:

Order ID: #${order.id}
Order Number: ${order.order_number || 'N/A'}
Customer: ${order.user?.name || order.customer_name || 'N/A'}
Status: ${order.status}
Total Amount: Ksh${parseFloat(order.total_amount || 0).toLocaleString()}
Order Date: ${orderDate}
Delivery Date: ${deliveryDate}
Delivery Address: ${order.delivery_address || 'Not provided'}
Total Items: ${totalItems}

Items:
${itemsDisplay}

Notes: ${order.notes || 'No notes'}`);
}

// Update order status function
async function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    const currentStatus = order.status;
    const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    let optionsHtml = statusOptions.map(status => 
        `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`
    ).join('');
    
    const modalHtml = `
        <div id="orderStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Update Order Status</h3>
                <div class="mb-4">
                    <p class="text-sm text-gray-600 mb-2">Order #${order.id} - ${order.user?.name || order.customer_name || 'Customer'}</p>
                    <p class="text-sm text-gray-600 mb-4">Current Status: <span class="font-medium">${currentStatus}</span></p>
                </div>
                <form id="updateOrderStatusForm">
                    <div class="form-group mb-4">
                        <label for="newOrderStatus">New Status</label>
                        <select id="newOrderStatus" required class="w-full p-2 border rounded">
                            ${optionsHtml}
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label for="statusNotes">Notes (optional)</label>
                        <textarea id="statusNotes" class="w-full p-2 border rounded" rows="3" placeholder="Add any notes about this status update..."></textarea>
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Update Status</button>
                        <button type="button" onclick="closeOrderStatusModal()" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('updateOrderStatusForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newStatus = document.getElementById('newOrderStatus').value;
        const notes = document.getElementById('statusNotes').value;
        
        try {
            await apiClient.updateOrderStatus(orderId, newStatus);
            showNotification(`Order status updated to ${newStatus}`, 'success');
            closeOrderStatusModal();
            await loadOrders(); // Refresh orders list
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification('Failed to update order status: ' + error.message, 'error');
        }
    });
}

// Close order status modal
function closeOrderStatusModal() {
    const modal = document.getElementById('orderStatusModal');
    if (modal) {
        modal.remove();
    }
}

// Show assign order modal
async function showAssignOrderModal(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    try {
        const usersResponse = await apiClient.getUsers();
        const usersList = apiClient.extractArrayData(usersResponse) || [];
        const logisticsUsers = usersList.filter(user => user.role === 'logistics');
        
        if (logisticsUsers.length === 0) {
            showNotification('No logistics users available', 'error');
            return;
        }
        
        const logisticsOptions = logisticsUsers.map(user => 
            `<option value="${user.id}">${user.name} (${user.email})</option>`
        ).join('');
        
        const modalHtml = `
            <div id="assignOrderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Assign Order to Logistics User</h3>
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-2">Order #${order.id}</p>
                        <p class="text-sm text-gray-600 mb-2">Customer: ${order.user?.name || order.customer_name || 'N/A'}</p>
                        <p class="text-sm text-gray-600 mb-4">Amount: Ksh${parseFloat(order.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <form id="assignOrderForm">
                        <div class="form-group mb-4">
                            <label for="assignLogisticsUser">Assign to Logistics User</label>
                            <select id="assignLogisticsUser" required class="w-full p-2 border rounded">
                                <option value="">Choose Logistics User</option>
                                ${logisticsOptions}
                            </select>
                        </div>
                        <div class="form-group mb-4">
                            <label for="deliveryAddress">Delivery Address</label>
                            <textarea id="deliveryAddress" class="w-full p-2 border rounded" rows="3" required placeholder="Enter delivery address...">${order.delivery_address || ''}</textarea>
                        </div>
                        <div class="form-group mb-4">
                            <label for="assignmentNotes">Notes (optional)</label>
                            <textarea id="assignmentNotes" class="w-full p-2 border rounded" rows="3" placeholder="Add any special instructions..."></textarea>
                        </div>
                        <div class="flex space-x-2">
                            <button type="submit" class="btn-primary flex-1">Assign Order</button>
                            <button type="button" onclick="closeAssignOrderModal()" class="btn-secondary flex-1">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('assignOrderForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const logisticsUserId = document.getElementById('assignLogisticsUser').value;
            const deliveryAddress = document.getElementById('deliveryAddress').value;
            const notes = document.getElementById('assignmentNotes').value;
            
            if (!logisticsUserId || !deliveryAddress) {
                showNotification('Please select logistics user and provide delivery address', 'warning');
                return;
            }
            
            try {
                // Create delivery record and assign it
                const deliveryData = {
                    order_id: orderId,
                    assigned_to: logisticsUserId,
                    delivery_address: deliveryAddress,
                    status: 'assigned',
                    priority: 'medium',
                    notes: notes
                };
                
                // Create delivery assignment
                await apiClient.createDelivery(deliveryData);
                
                showNotification('Order assigned to logistics user successfully!', 'success');
                closeAssignOrderModal();
                await loadOrders(); // Refresh orders list
                
            } catch (error) {
                console.error('Error assigning order:', error);
                showNotification('Failed to assign order: ' + error.message, 'error');
            }
        });
        
    } catch (error) {
        console.error('Error loading logistics users:', error);
        showNotification('Failed to load logistics users', 'error');
    }
}

// Close assign order modal
function closeAssignOrderModal() {
    const modal = document.getElementById('assignOrderModal');
    if (modal) {
        modal.remove();
    }
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
window.showCreateUserModal = showCreateUserModal;
window.editUser = editUser;
window.closeUserModal = closeUserModal;
window.viewUserDetails = viewUserDetails;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.toggleMaintenanceMode = toggleMaintenanceMode;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.closeOrderStatusModal = closeOrderStatusModal;
window.showAssignOrderModal = showAssignOrderModal;
window.closeAssignOrderModal = closeAssignOrderModal;
window.refreshData = refreshData;
window.loadUsers = loadUsers;
window.logout = logout;