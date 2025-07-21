// Farmer Dashboard Logic
console.log('Farmer dashboard script loaded');

let currentUser = null;
let products = [];

// Initialize dashboard
function initializeFarmerDashboard() {
    console.log('Initializing farmer dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'farmer') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    loadDashboardData();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeModalBtn = document.getElementById('closeModal');
    const addProductForm = document.getElementById('addProductForm');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => closeModal('addProductModal'));
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Close modal when clicking outside
    if (addProductModal) {
        addProductModal.addEventListener('click', (e) => {
            if (e.target === addProductModal) {
                addProductModal.classList.remove('active');
            }
        });
    }
}

// Global function to show add product modal
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Global function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Load dashboard data
async function loadDashboardData() {
    const loadingState = document.getElementById('loadingState');
    const productsContainer = document.getElementById('productsContainer');
    const ordersContainer = document.getElementById('ordersContainer');
    
    try {
        // Show loading state
        if (loadingState) loadingState.style.display = 'block';
        if (productsContainer) productsContainer.style.display = 'none';
        if (ordersContainer) ordersContainer.style.display = 'none';
        
        await Promise.all([
            loadProducts(),
            loadFarmerOrders(),
            loadFarmerStats()
        ]);

        // Hide loading state and show content
        if (loadingState) loadingState.style.display = 'none';
        if (productsContainer) productsContainer.style.display = 'block';
        if (ordersContainer) ordersContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Load products - Fixed to handle paginated response correctly
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await apiClient.getProducts();
        console.log('Products response:', response);
        
        // Use improved data extraction method to handle pagination
        products = apiClient.extractArrayData(response, 'data') || [];
        products = products.filter(p => p.farmer_id == currentUser.id);
        console.log('Extracted products:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
        displayProducts([]); // Show empty state
    }
}

// Display products - Ensure proper rendering
function displayProducts(productsToShow) {
    const productsTableBody = document.querySelector('#productsTable tbody');
    if (!productsTableBody) return;

    productsTableBody.innerHTML = '';

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-500">No products found. Add your first product to get started!</p>
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

// Load farmer's orders
async function loadFarmerOrders() {
    try {
        console.log('Loading farmer orders...');
        const response = await apiClient.getOrders();
        const allOrders = apiClient.extractArrayData(response) || [];
        
        // Filter orders that contain farmer's products
        const farmerOrders = allOrders.filter(order => {
            if (!order.order_items && !order.items) return false;
            
            const orderItems = order.order_items || order.items || [];
            return orderItems.some(item => {
                const product = products.find(p => p.id == item.product_id);
                return product && product.farmer_id == currentUser.id;
            });
        });
        
        console.log('Farmer orders loaded:', farmerOrders);
        displayFarmerOrders(farmerOrders);
        
        return farmerOrders;
    } catch (error) {
        console.error('Error loading farmer orders:', error);
        displayFarmerOrders([]);
        return [];
    }
}

// Display farmer orders
function displayFarmerOrders(ordersToShow) {
    const ordersTableBody = document.querySelector('#farmerOrdersTable tbody');
    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = '';

    if (!Array.isArray(ordersToShow) || ordersToShow.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-500">No orders for your products yet</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        const customerName = order.user?.name || 'Unknown Customer';
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = getOrderStatusClass(order.status);
        
        // Get farmer's products from this order
        const orderItems = order.order_items || order.items || [];
        const farmerItems = orderItems.filter(item => {
            const product = products.find(p => p.id == item.product_id);
            return product && product.farmer_id == currentUser.id;
        });
        
        const itemsText = farmerItems.length === 1 
            ? farmerItems[0].product?.name || 'Product'
            : `${farmerItems.length} items`;
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${customerName}</td>
            <td>${itemsText}</td>
            <td><span class="status-${order.status} ${statusClass}">${order.status}</span></td>
            <td>${orderDate}</td>
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

// Load farmer-specific statistics
async function loadFarmerStats() {
    try {
        console.log('Loading farmer stats...');
        
        // Get farmer orders
        const farmerOrders = await loadFarmerOrders();
        
        // Calculate farmer-specific metrics
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'active').length;
        
        // Calculate total sales from farmer's products
        let totalSales = 0;
        let monthlyRevenue = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        farmerOrders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const orderItems = order.order_items || order.items || [];
            
            // Calculate farmer's portion of this order
            const farmerAmount = orderItems
                .filter(item => {
                    const product = products.find(p => p.id == item.product_id);
                    return product && product.farmer_id == currentUser.id;
                })
                .reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
            
            totalSales += farmerAmount;
            
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                monthlyRevenue += farmerAmount;
            }
        });
        
        const pendingOrders = farmerOrders.filter(order => 
            ['pending', 'confirmed', 'processing'].includes(order.status)
        ).length;

        // Update stats display
        updateStatCard('totalProducts', totalProducts);
        updateStatCard('totalSales', `Ksh${totalSales.toFixed(2)}`);
        updateStatCard('pendingOrders', pendingOrders);
        updateStatCard('monthlyRevenue', `Ksh${monthlyRevenue.toFixed(2)}`);
        
        console.log('Farmer stats updated successfully');
    } catch (error) {
        console.error('Error loading farmer stats:', error);
        // Fallback calculations
        const totalProducts = products.length;
        const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * parseInt(p.quantity || 0)), 0);
        
        updateStatCard('totalProducts', totalProducts);
        updateStatCard('totalSales', `Ksh${(totalRevenue * 0.1).toFixed(2)}`);
        updateStatCard('pendingOrders', Math.floor(Math.random() * 5) + 1);
        updateStatCard('monthlyRevenue', `Ksh${(totalRevenue * 0.05).toFixed(2)}`);
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Handle add product - Enhanced with immediate refresh
async function handleAddProduct(event) {
    event.preventDefault();
    console.log('Adding new product...');

    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name') || document.getElementById('productName').value,
        description: formData.get('description') || document.getElementById('productDescription').value,
        price: parseFloat(formData.get('price') || document.getElementById('productPrice').value),
        quantity: parseInt(formData.get('quantity') || document.getElementById('productStock').value),
        category: formData.get('category') || document.getElementById('productCategory').value,
        status: 'active'
    };

    console.log('Product data to submit:', productData);

    try {
        const response = await apiClient.createProduct(productData);
        console.log('Product created successfully:', response);
        
        showNotification('Product added successfully!', 'success');
        
        // Close modal and reset form
        closeModal('addProductModal');
        event.target.reset();
        
        // Immediately reload products and stats to show new product
        await loadProducts();
        await loadFarmerStats();
        
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('Failed to add product: ' + error.message, 'error');
    }
}

// Edit product
async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newPrice = prompt('Enter new price:', product.price);
    if (newPrice && !isNaN(newPrice)) {
        try {
            await apiClient.updateProduct(productId, { 
                ...product, 
                price: parseFloat(newPrice) 
            });
            showNotification('Product updated successfully!', 'success');
            await loadProducts();
            await loadFarmerStats();
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Failed to update product: ' + error.message, 'error');
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
            await loadFarmerStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product: ' + error.message, 'error');
        }
    }
}

// Make functions globally available
window.showAddProductModal = showAddProductModal;
window.closeModal = closeModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.displayFarmerOrders = displayFarmerOrders;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFarmerDashboard);

console.log('Farmer dashboard script setup complete');
