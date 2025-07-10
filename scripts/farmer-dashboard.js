
// Farmer Dashboard JavaScript - Dynamic Data Implementation

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Farmer Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadProducts();
    loadFarmerStats();
    loadOrders();
});

// Data storage
let products = [];
let orders = [];
let currentUser = null;
let editingProductId = null;

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
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Farmer';
        document.getElementById('userRole').textContent = userData.role || 'Farmer';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Farmer';
    }
}

// Load farmer statistics
async function loadFarmerStats() {
    try {
        // Load products and orders to calculate stats
        const [productsResponse, ordersResponse] = await Promise.all([
            apiClient.getProducts(),
            apiClient.getOrders()
        ]);
        
        const productsList = productsResponse.data || productsResponse || [];
        const ordersList = ordersResponse.data || ordersResponse || [];
        
        // Filter for this farmer's data (assuming API returns user-specific data)
        const totalProducts = productsList.length;
        const pendingOrders = ordersList.filter(order => 
            order.status === 'pending' || order.status === 'processing'
        ).length;
        
        const totalSales = ordersList
            .filter(order => order.status === 'completed' || order.status === 'delivered')
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        // Calculate monthly revenue (orders from current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = ordersList
            .filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate.getMonth() === currentMonth && 
                       orderDate.getFullYear() === currentYear &&
                       (order.status === 'completed' || order.status === 'delivered');
            })
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        // Update stats display
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalSales').textContent = `Ksh${totalSales.toLocaleString()}`;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('monthlyRevenue').textContent = `Ksh${monthlyRevenue.toLocaleString()}`;
        
    } catch (error) {
        console.error('Error loading farmer stats:', error);
    }
}

// Load products from API
async function loadProducts() {
    const loadingState = document.getElementById('loadingState');
    const productsContainer = document.getElementById('productsContainer');
    
    try {
        loadingState.style.display = 'block';
        const response = await apiClient.getProducts();
        products = response.data || response || [];
        console.log('Products loaded:', products);
        
        loadingState.style.display = 'none';
        productsContainer.style.display = 'block';
        
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">🌾</div>
                        <p class="text-gray-600">No products listed yet. Add your first product!</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        ${getCategoryEmoji(product.category)}
                    </div>
                </td>
                <td>
                    <div class="font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-500">${product.description || 'No description'}</div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ${product.category}
                    </span>
                </td>
                <td>
                    <span class="${(product.stock || 0) <= 5 ? 'text-red-600' : 'text-green-600'} font-medium">
                        ${product.stock || 0} ${product.unit || 'kg'}
                    </span>
                </td>
                <td class="font-medium">Ksh${product.price}/${product.unit || 'kg'}</td>
                <td>
                    <span class="status-${product.status || 'active'}">${product.status || 'active'}</span>
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn-danger text-sm" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.style.display = 'none';
        productsContainer.style.display = 'block';
        
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <div class="text-red-400 text-4xl mb-4">⚠️</div>
                    <p class="text-gray-600 mb-4">Failed to load products. Please try again.</p>
                    <button class="btn-primary" onclick="loadProducts()">Retry</button>
                </td>
            </tr>
        `;
    }
}

// Load orders from API
async function loadOrders() {
    try {
        const response = await apiClient.getOrders();
        orders = response.data || response || [];
        console.log('Orders loaded:', orders);
        
        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.style.display = 'block';
        
        const tableBody = document.querySelector('#ordersTable tbody');
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">📋</div>
                        <p class="text-gray-600">No orders yet. Orders will appear here when customers purchase your products.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Show only recent orders (last 10)
        const recentOrders = orders.slice(0, 10);
        
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.created_at).toLocaleDateString();
            
            row.innerHTML = `
                <td class="font-medium">#${order.id}</td>
                <td>
                    <div class="font-medium">${order.product_name || 'Multiple items'}</div>
                    <div class="text-sm text-gray-500">${order.items?.length || 1} item(s)</div>
                </td>
                <td>${order.quantity || 'Various'}</td>
                <td>
                    <div class="font-medium">${order.customer_name || 'Customer'}</div>
                    <div class="text-sm text-gray-500">${order.customer_phone || 'N/A'}</div>
                </td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="font-medium">Ksh${(order.total_amount || 0).toLocaleString()}</td>
                <td class="text-sm text-gray-500">${orderDate}</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const ordersContainer = document.getElementById('ordersContainer');
        ordersContainer.style.display = 'block';
        
        const tableBody = document.querySelector('#ordersTable tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-600">Unable to load orders at this time.</p>
                </td>
            </tr>
        `;
    }
}

// Helper function to get category emoji
function getCategoryEmoji(category) {
    const categoryEmojis = {
        'vegetables': '🥬',
        'fruits': '🍎',
        'grains': '🌾',
        'dairy': '🥛',
        'spices': '🌶️'
    };
    return categoryEmojis[category] || '🥕';
}

// Show add product modal
function showAddProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('addProductModal').classList.add('active');
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingProductId = id;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('submitBtn').textContent = 'Update Product';
    
    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productUnit').value = product.unit || 'kg';
    document.getElementById('productPrice').value = product.price || 0;
    
    document.getElementById('addProductModal').classList.add('active');
}

// Handle product form submission (add or edit)
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = editingProductId ? 'Updating...' : 'Adding...';
    submitBtn.disabled = true;
    
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        stock: parseInt(document.getElementById('productStock').value),
        unit: document.getElementById('productUnit').value,
        price: parseFloat(document.getElementById('productPrice').value),
        status: 'active'
    };
    
    try {
        let response;
        if (editingProductId) {
            response = await apiClient.updateProduct(editingProductId, productData);
            console.log('Product updated:', response);
        } else {
            response = await apiClient.createProduct(productData);
            console.log('Product created:', response);
        }
        
        // Reload products and stats
        await Promise.all([loadProducts(), loadFarmerStats()]);
        
        closeModal('addProductModal');
        alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiClient.deleteProduct(id);
        console.log('Product deleted:', id);
        
        // Reload products and stats
        await Promise.all([loadProducts(), loadFarmerStats()]);
        alert('Product deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
