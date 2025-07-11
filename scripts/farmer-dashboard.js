
// Farmer Dashboard JavaScript - Fixed Data Handling

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Farmer Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadProducts();
    loadOrderHistory();
    loadFarmerStats();
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
        const [productsResponse, ordersResponse] = await Promise.all([
            apiClient.getProducts(),
            apiClient.getOrders()
        ]);
        
        // Extract arrays properly using helper method
        const productsList = apiClient.extractArrayData(productsResponse);
        const ordersList = apiClient.extractArrayData(ordersResponse);
        
        const totalProducts = productsList.length;
        const totalSales = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const pendingOrders = ordersList.filter(order => order.status === 'pending').length;
        const monthlyRevenue = ordersList
            .filter(order => {
                const orderDate = new Date(order.created_at);
                const now = new Date();
                return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
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
        productsContainer.style.display = 'none';
        
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response);
        console.log('Products loaded:', products);
        
        const tableBody = document.querySelector('#productsTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (products.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">🌱</div>
                    <p class="text-gray-600">No products listed yet. Add your first product!</p>
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            ${getProductIcon(product.category)}
                        </div>
                    </td>
                    <td class="font-medium">${product.name}</td>
                    <td class="capitalize">${product.category}</td>
                    <td>${product.quantity || product.stock || 0} ${product.unit || 'units'}</td>
                    <td class="font-semibold">Ksh${(product.price || 0).toFixed(2)}</td>
                    <td><span class="status-${product.status || 'active'}">${product.status || 'active'}</span></td>
                    <td>
                        <div class="flex space-x-2">
                            <button class="btn-secondary text-sm" onclick="editProduct(${product.id})">Edit</button>
                            <button class="btn-danger text-sm" onclick="deleteProduct(${product.id})">Delete</button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        loadingState.style.display = 'none';
        productsContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-400 text-4xl mb-4">⚠️</div>
                <p class="text-gray-600 mb-4">Failed to load products. Please try again.</p>
                <button class="btn-primary" onclick="loadProducts()">Retry</button>
            </div>
        `;
    }
}

// Load order history
async function loadOrderHistory() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response);
        console.log('Orders loaded:', orders);
        
        const ordersContainer = document.getElementById('ordersContainer');
        const tableBody = document.querySelector('#ordersTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-600">No orders received yet.</p>
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            orders.slice(0, 10).forEach(order => {
                const row = document.createElement('tr');
                const orderDate = new Date(order.created_at).toLocaleDateString();
                
                row.innerHTML = `
                    <td class="font-medium">#${order.id}</td>
                    <td>${order.product_name || 'Various items'}</td>
                    <td>${order.quantity || 1}</td>
                    <td>${order.customer_name || 'Customer'}</td>
                    <td><span class="status-${order.status}">${order.status}</span></td>
                    <td class="font-semibold">Ksh${(order.total_amount || 0).toLocaleString()}</td>
                    <td class="text-sm text-gray-500">${orderDate}</td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        ordersContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}

// Show add product modal
function showAddProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    openModal('addProductModal');
}

// Handle product form submission
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    // Fix field name mismatch - use 'quantity' instead of 'stock'
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        quantity: parseInt(document.getElementById('productStock').value), // Fixed field name
        unit: document.getElementById('productUnit').value,
        price: parseFloat(document.getElementById('productPrice').value),
        status: 'active'
    };
    
    try {
        if (editingProductId) {
            await apiClient.updateProduct(editingProductId, productData);
            alert('Product updated successfully!');
        } else {
            await apiClient.createProduct(productData);
            alert('Product added successfully!');
        }
        
        closeModal('addProductModal');
        await Promise.all([loadProducts(), loadFarmerStats()]);
        
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    
    editingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('submitBtn').textContent = 'Update Product';
    
    // Fill form with product data
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStock').value = product.quantity || product.stock || 0;
    document.getElementById('productUnit').value = product.unit || 'kg';
    document.getElementById('productPrice').value = product.price || 0;
    
    openModal('addProductModal');
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        await apiClient.deleteProduct(productId);
        alert('Product deleted successfully!');
        await Promise.all([loadProducts(), loadFarmerStats()]);
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    }
}

// Helper function to get product icon
function getProductIcon(category) {
    const icons = {
        vegetables: '🥬',
        fruits: '🍎',
        grains: '🌾',
        dairy: '🥛',
        spices: '🌶️'
    };
    return icons[category] || '🌱';
}

// Modal helper functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
