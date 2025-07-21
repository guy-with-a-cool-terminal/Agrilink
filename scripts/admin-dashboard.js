
// Admin Dashboard JavaScript

let currentUser = null;
let users = [];
let products = [];
let orders = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadDashboardData();
});

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);
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

// Load dashboard data
async function loadDashboardData() {
    const loadingState = document.getElementById('loadingState');
    
    try {
        if (loadingState) loadingState.style.display = 'block';
        
        await Promise.all([
            loadUsers(),
            loadProducts(),
            loadOrders(),
            loadAdminStats()
        ]);

        if (loadingState) loadingState.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Load users
async function loadUsers() {
    try {
        console.log('Loading users...');
        const response = await apiClient.getUsers();
        users = apiClient.extractArrayData(response) || [];
        console.log('Users loaded:', users);
        
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
        displayUsers([]);
    }
}

// Display users
function displayUsers(usersToShow) {
    const usersTableBody = document.querySelector('#usersTable tbody');
    if (!usersTableBody) return;

    usersTableBody.innerHTML = '';

    if (!Array.isArray(usersToShow) || usersToShow.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">👤</div>
                    <p class="text-gray-500">No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        const statusClass = getUserStatusClass(user.status);
        row.innerHTML = `
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-${user.status} ${statusClass}">${user.status}</span></td>
            <td>
                <button class="btn-secondary text-sm" onclick="editUser(${user.id})">Edit</button>
                <button class="btn-danger text-sm" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Get user status class
function getUserStatusClass(status) {
    const statusClasses = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-yellow-100 text-yellow-800',
        'suspended': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Load products
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response) || [];
        console.log('Products loaded:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
        displayProducts([]);
    }
}

// Display products
function displayProducts(productsToShow) {
    const productsTableBody = document.querySelector('#productsTable tbody');
    if (!productsTableBody) return;

    productsTableBody.innerHTML = '';

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-500">No products found</p>
                </td>
            </tr>
        `;
        return;
    }

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        const statusClass = getProductStatusClass(product.status);
        row.innerHTML = `
            <td>📦</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>Ksh${product.price}</td>
            <td><span class="status-${product.status} ${statusClass}">${product.status}</span></td>
        `;
        productsTableBody.appendChild(row);
    });
}

// Get product status class
function getProductStatusClass(status) {
    const statusClasses = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-yellow-100 text-yellow-800',
        'out_of_stock': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Load orders
async function loadOrders() {
    try {
        console.log('Loading orders...');
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response) || [];
        console.log('Orders loaded:', orders);
        
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
        displayOrders([]);
    }
}

// Display orders
function displayOrders(ordersToShow) {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = '';

    if (!Array.isArray(ordersToShow) || ordersToShow.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-500">No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    // Show recent orders (last 10)
    const recentOrders = ordersToShow.slice(0, 10);

    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        const customerName = order.user?.name || 'Unknown Customer';
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = getOrderStatusClass(order.status);
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${customerName}</td>
            <td>Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
            <td><span class="status-${order.status} ${statusClass}">${order.status}</span></td>
            <td>${orderDate}</td>
            <td>
                <button class="btn-secondary text-sm" onclick="viewOrderDetails(${order.id})">View</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
}

// Get order status class
function getOrderStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'processing': 'bg-purple-100 text-purple-800',
        'shipped': 'bg-orange-100 text-orange-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Load admin statistics
async function loadAdminStats() {
    try {
        console.log('Loading admin stats...');
        
        // Calculate real stats from loaded data
        const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const totalProducts = products.length;
        const totalUsers = users.length;
        
        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = orders
            .filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            })
            .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

        // Update stats display
        updateStatCard('totalSales', `Ksh${totalSales.toFixed(2)}`);
        updateStatCard('totalOrders', totalOrders);
        updateStatCard('monthlyRevenue', `Ksh${monthlyRevenue.toFixed(2)}`);
        updateStatCard('pendingOrders', pendingOrders);
        updateStatCard('totalProducts', totalProducts);
        updateStatCard('totalUsers', totalUsers);
        
        console.log('Admin stats updated successfully');
    } catch (error) {
        console.error('Error loading admin stats:', error);
        // Fallback values
        updateStatCard('totalSales', 'Ksh0');
        updateStatCard('totalOrders', 0);
        updateStatCard('monthlyRevenue', 'Ksh0');
        updateStatCard('pendingOrders', 0);
        updateStatCard('totalProducts', products.length);
        updateStatCard('totalUsers', users.length);
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Edit user
async function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = prompt('Enter new status (active, inactive, suspended):', user.status);
    if (newStatus && ['active', 'inactive', 'suspended'].includes(newStatus.toLowerCase())) {
        try {
            await apiClient.updateUser(userId, { ...user, status: newStatus.toLowerCase() });
            showNotification('User updated successfully!', 'success');
            await loadUsers();
            await loadAdminStats(); // Refresh stats after user update
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification('Failed to update user: ' + error.message, 'error');
        }
    }
}

// Delete user
async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await apiClient.deleteUser(userId);
            showNotification('User deleted successfully!', 'success');
            await loadUsers();
            await loadAdminStats(); // Refresh stats after user deletion
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user: ' + error.message, 'error');
        }
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    let details = `Order #${order.id}\n`;
    details += `Customer: ${order.user?.name || 'Unknown'}\n`;
    details += `Status: ${order.status}\n`;
    details += `Total: Ksh${parseFloat(order.total_amount || 0).toFixed(2)}\n`;
    details += `Date: ${new Date(order.created_at).toLocaleString()}\n`;
    
    if (order.delivery_address) {
        details += `Delivery Address: ${order.delivery_address}\n`;
    }
    
    if (order.notes) {
        details += `Notes: ${order.notes}\n`;
    }
    
    if (order.order_items && order.order_items.length > 0) {
        details += `\nItems:\n`;
        order.order_items.forEach(item => {
            details += `- ${item.product?.name || 'Unknown Product'}: ${item.quantity} x Ksh${parseFloat(item.unit_price || 0).toFixed(2)} = Ksh${parseFloat(item.total_price || 0).toFixed(2)}\n`;
        });
    }
    
    alert(details);
}

// Show create user modal
function showCreateUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Handle add user
async function handleAddUser(event) {
    event.preventDefault();
    console.log('Adding new user...');

    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        password_confirmation: formData.get('password'),
        role: formData.get('role'),
        status: 'active'
    };

    console.log('User data to submit:', userData);

    try {
        const response = await apiClient.createUser(userData);
        console.log('User created successfully:', response);
        
        showNotification('User added successfully!', 'success');
        
        // Close modal and reset form
        closeModal('addUserModal');
        event.target.reset();
        
        // Immediately reload users and stats
        await loadUsers();
        await loadAdminStats();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Failed to add user: ' + error.message, 'error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Notification system
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

// Make functions globally available
window.editUser = editUser;
window.deleteUser = deleteUser;
window.showCreateUserModal = showCreateUserModal;
window.closeModal = closeModal;
window.handleAddUser = handleAddUser;
window.viewOrderDetails = viewOrderDetails;
window.logout = logout;

