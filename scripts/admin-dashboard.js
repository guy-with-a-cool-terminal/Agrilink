// Admin Dashboard Logic
console.log('Admin dashboard script loaded');

let currentUser = null;
let users = [];
let products = [];
let orders = [];
let deliveries = [];

// Initialize dashboard
function initializeAdminDashboard() {
    console.log('Initializing admin dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    loadDashboardData();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // User Management
    document.getElementById('addUserBtn')?.addEventListener('click', showAddUserModal);
    document.getElementById('closeModal')?.addEventListener('click', () => closeModal('addUserModal'));
    document.getElementById('addUserForm')?.addEventListener('submit', handleAddUser);

    // Product Management
    document.getElementById('addProductBtn')?.addEventListener('click', showAddProductModal);
    document.getElementById('closeProductModal')?.addEventListener('click', () => closeModal('addProductModal'));
    document.getElementById('addProductForm')?.addEventListener('submit', handleAddProduct);

    // Delivery Management
    document.getElementById('assignDeliveryForm')?.addEventListener('submit', assignDelivery);
    document.getElementById('closeAssignDeliveryModal')?.addEventListener('click', () => closeModal('assignDeliveryModal'));

    // Close modal when clicking outside
    const addUserModal = document.getElementById('addUserModal');
    if (addUserModal) {
        addUserModal.addEventListener('click', (e) => {
            if (e.target === addUserModal) {
                addUserModal.classList.remove('active');
            }
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadAnalytics(),
            loadUsers(),
            loadProducts(),
            loadOrders(),
            loadDeliveries()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load analytics data
async function loadAnalytics() {
    try {
        const analytics = await apiClient.getAnalytics();
        console.log('Analytics data loaded:', analytics);

        document.getElementById('totalUsers').textContent = analytics.total_users || 0;
        document.getElementById('totalProducts').textContent = analytics.total_products || 0;
        document.getElementById('totalOrders').textContent = analytics.total_orders || 0;
        document.getElementById('totalRevenue').textContent = `Ksh${analytics.total_revenue?.toLocaleString() || 0}`;
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Failed to load analytics', 'error');
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await apiClient.getUsers();
        users = apiClient.extractArrayData(response) || [];
        console.log('Users loaded:', users);
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users', 'error');
    }
}

// Display users in table
function displayUsers(usersToShow) {
    const usersTableBody = document.querySelector('#usersTable tbody');
    if (!usersTableBody) return;

    usersTableBody.innerHTML = '';

    if (!Array.isArray(usersToShow) || usersToShow.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <p class="text-gray-500">No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-mono">#${user.id}</td>
            <td>${user.name || 'Unnamed'}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-${user.status || 'active'}">${user.status || 'active'}</span></td>
            <td>
                <div class="flex gap-2">
                    <button class="btn-secondary text-sm" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-danger text-sm" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Load products
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response) || [];
        console.log('Products loaded:', products);
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Display products in table
function displayProducts(productsToShow) {
    const productsTableBody = document.querySelector('#productsTable tbody');
    if (!productsTableBody) return;

    productsTableBody.innerHTML = '';

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-500">No products found</p>
                </td>
            </tr>
        `;
        return;
    }

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">📦</td>
            <td class="font-medium">${product.name || 'Unnamed Product'}</td>
            <td class="capitalize">${product.category || 'N/A'}</td>
            <td>${product.quantity || product.stock || 0}</td>
            <td class="font-medium">Ksh${parseFloat(product.price || 0).toFixed(2)}</td>
            <td><span class="status-${product.status || 'active'}">${(product.status || 'active').replace('_', ' ')}</span></td>
            <td>
                <div class="flex gap-2">
                    <button class="btn-secondary text-sm" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-danger text-sm" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;
        productsTableBody.appendChild(row);
    });
}

// Load orders
async function loadOrders() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response) || [];
        console.log('Orders loaded:', orders);
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// Display orders in table
function displayOrders(ordersToShow) {
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = '';

    if (!Array.isArray(ordersToShow) || ordersToShow.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-500">No orders found</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-mono">#${order.id}</td>
            <td>
                ${order.items ? order.items.map(item => `
                    <div class="text-sm">
                        <div class="font-medium">${item.name}</div>
                        <div class="text-gray-600">Qty: ${item.quantity}</div>
                    </div>
                `).join('') : 'No items'}
            </td>
            <td>${order.customer_name || order.user?.name || 'Unknown'}</td>
            <td class="font-medium">Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
            <td>
                <span class="status-${order.status || 'pending'}">${(order.status || 'pending').replace('_', ' ')}</span>
            </td>
            <td class="text-sm text-gray-600">${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn-secondary text-sm" onclick="viewOrderDetails(${order.id})">View</button>
                    <button class="btn-primary text-sm" onclick="updateOrderStatus(${order.id}, 'processing')">Process</button>
                </div>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
}

// Load deliveries
async function loadDeliveries() {
    try {
        const response = await apiClient.getDeliveries();
        deliveries = apiClient.extractArrayData(response) || [];
        console.log('Deliveries loaded:', deliveries);
        displayDeliveries(deliveries);
        populateDeliverySelect(deliveries);
    } catch (error) {
        console.error('Error loading deliveries:', error);
        showNotification('Failed to load deliveries', 'error');
    }
}

// Display deliveries in table
function displayDeliveries(deliveriesToShow) {
    const deliveriesTableBody = document.querySelector('#deliveriesTable tbody');
    if (!deliveriesTableBody) return;

    deliveriesTableBody.innerHTML = '';

    if (!Array.isArray(deliveriesToShow) || deliveriesToShow.length === 0) {
        deliveriesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-500">No deliveries found</p>
                </td>
            </tr>
        `;
        return;
    }

    deliveriesToShow.forEach(delivery => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-mono">#${delivery.id}</td>
            <td>${delivery.order_id || 'N/A'}</td>
            <td>${delivery.delivery_address || 'N/A'}</td>
            <td>${delivery.assigned_to || 'Unassigned'}</td>
            <td><span class="status-${delivery.status || 'pending'}">${delivery.status || 'pending'}</span></td>
            <td>${delivery.priority || 'Normal'}</td>
            <td>
                <button class="btn-secondary text-sm" onclick="showAssignDeliveryModal(${delivery.id})">Assign</button>
            </td>
        `;
        deliveriesTableBody.appendChild(row);
    });
}

// Populate delivery select options
function populateDeliverySelect(deliveriesList) {
    const deliverySelect = document.getElementById('deliverySelect');
    if (!deliverySelect) return;

    deliverySelect.innerHTML = '<option value="">Select Delivery</option>';

    deliveriesList.forEach(delivery => {
        const option = document.createElement('option');
        option.value = delivery.id;
        option.textContent = `#${delivery.id} - ${delivery.delivery_address}`;
        deliverySelect.appendChild(option);
    });
}

// Show add user modal
function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Show add product modal
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Show assign delivery modal
function showAssignDeliveryModal(deliveryId) {
    const modal = document.getElementById('assignDeliveryModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('deliveryId').value = deliveryId;
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

    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
        status: 'active'
    };

    try {
        const response = await apiClient.createUser(userData);
        console.log('User created successfully:', response);
        showNotification('User added successfully!', 'success');
        closeModal('addUserModal');
        event.target.reset();
        await loadUsers();
        await loadAnalytics();
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Failed to add user', 'error');
    }
}

// Handle add product
async function handleAddProduct(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity')),
        category: formData.get('category'),
        status: 'active'
    };

    try {
        const response = await apiClient.createProduct(productData);
        console.log('Product created successfully:', response);
        showNotification('Product added successfully!', 'success');
        closeModal('addProductModal');
        event.target.reset();
        await loadProducts();
        await loadAnalytics();
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('Failed to add product', 'error');
    }
}

// Edit user
async function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = prompt('Enter new status (active, inactive, suspended):', user.status);
    if (newStatus && ['active', 'inactive', 'suspended'].includes(newStatus.toLowerCase())) {
        try {
            await apiClient.updateUser(userId, { status: newStatus.toLowerCase() });
            showNotification('User updated successfully!', 'success');
            await loadUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            showNotification('Failed to update user', 'error');
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
            await loadAnalytics();
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user', 'error');
        }
    }
}

// Edit product
async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newPrice = prompt('Enter new price:', product.price);
    if (newPrice && !isNaN(newPrice)) {
        try {
            await apiClient.updateProduct(productId, { price: parseFloat(newPrice) });
            showNotification('Product updated successfully!', 'success');
            await loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Failed to update product', 'error');
        }
    }
}

// Delete product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await apiClient.deleteProduct(productId);
            showNotification('Product deleted successfully!', 'success');
            await loadProducts();
            await loadAnalytics();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product', 'error');
        }
    }
}

// Assign delivery
async function assignDelivery(event) {
    event.preventDefault();

    const deliveryId = document.getElementById('deliveryId').value;
    const logisticsId = document.getElementById('logisticsSelect').value;

    try {
        await apiClient.assignDelivery(deliveryId, { assigned_to: logisticsId });
        showNotification('Delivery assigned successfully!', 'success');
        closeModal('assignDeliveryModal');
        event.target.reset();
        await loadDeliveries();
    } catch (error) {
        console.error('Error assigning delivery:', error);
        showNotification('Failed to assign delivery', 'error');
    }
}

// Make functions globally available
window.showAddUserModal = showAddUserModal;
window.closeModal = closeModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.showAssignDeliveryModal = showAssignDeliveryModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);

// Add missing functions for order management
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    const orderDetails = `
        <div class="space-y-4">
            <div><strong>Order ID:</strong> ${order.id}</div>
            <div><strong>Customer:</strong> ${order.customer_name || order.user?.name || 'Unknown'}</div>
            <div><strong>Total:</strong> Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</div>
            <div><strong>Status:</strong> ${order.status}</div>
            <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
            ${order.items ? `
                <div><strong>Items:</strong>
                    <ul class="mt-2 space-y-1">
                        ${order.items.map(item => `
                            <li>• ${item.name || 'Product'} x${item.quantity} @ Ksh${parseFloat(item.unit_price || 0).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    alert(orderDetails);
}

function updateOrderStatus(orderId, newStatus) {
    if (!confirm(`Update order status to ${newStatus}?`)) return;
    
    apiClient.updateOrder(orderId, { status: newStatus })
        .then(() => {
            showNotification('Order status updated successfully', 'success');
            loadOrders();
            loadAnalytics();
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            showNotification('Failed to update order status', 'error');
        });
}

// Make functions globally available
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
