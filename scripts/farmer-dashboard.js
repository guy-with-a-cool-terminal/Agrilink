
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
        addProductBtn.addEventListener('click', () => {
            if (addProductModal) addProductModal.classList.add('active');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (addProductModal) addProductModal.classList.remove('active');
        });
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

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadProducts(),
            loadStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load products
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await apiClient.getProducts();
        console.log('Products response:', response);
        
        // Extract products array from response
        products = apiClient.extractArrayData(response, 'data') || [];
        console.log('Extracted products:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Display products
function displayProducts(productsToShow) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No products found. Add your first product to get started!</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                📦
            </div>
            <div class="product-info">
                <h4>${product.name || 'Unnamed Product'}</h4>
                <p>${product.description || 'No description available'}</p>
                <div class="product-price">$${parseFloat(product.price || 0).toFixed(2)}</div>
                <div class="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>Stock: ${product.quantity || product.stock || 0}</span>
                    <span class="status-${product.status || 'active'}">${(product.status || 'active').replace('_', ' ')}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editProduct(${product.id})" class="btn-secondary flex-1">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="btn-danger flex-1">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load stats
async function loadStats() {
    try {
        console.log('Loading farmer stats...');
        const response = await apiClient.getProducts();
        const productsData = apiClient.extractArrayData(response, 'data') || [];
        
        // Calculate stats
        const totalProducts = productsData.length;
        const activeProducts = productsData.filter(p => p.status === 'active').length;
        const totalRevenue = productsData.reduce((sum, p) => sum + (parseFloat(p.price || 0) * parseInt(p.quantity || 0)), 0);
        const lowStockProducts = productsData.filter(p => parseInt(p.quantity || 0) < 10).length;

        // Update stats display
        updateStatCard('totalProducts', totalProducts);
        updateStatCard('activeProducts', activeProducts);
        updateStatCard('totalRevenue', `$${totalRevenue.toFixed(2)}`);
        updateStatCard('lowStockProducts', lowStockProducts);
        
        console.log('Stats updated successfully');
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Failed to load statistics', 'error');
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Handle add product
async function handleAddProduct(event) {
    event.preventDefault();
    console.log('Adding new product...');

    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity')), // Using 'quantity' to match backend expectation
        category: formData.get('category'),
        status: 'active'
    };

    console.log('Product data to submit:', productData);

    try {
        const response = await apiClient.createProduct(productData);
        console.log('Product created successfully:', response);
        
        showNotification('Product added successfully!', 'success');
        
        // Close modal and reset form
        const modal = document.getElementById('addProductModal');
        if (modal) modal.classList.remove('active');
        event.target.reset();
        
        // Reload products
        await loadProducts();
        await loadStats();
        
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('Failed to add product: ' + error.message, 'error');
    }
}

// Edit product
async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // For now, show a simple prompt - in a real app, you'd open an edit modal
    const newPrice = prompt('Enter new price:', product.price);
    if (newPrice && !isNaN(newPrice)) {
        try {
            await apiClient.updateProduct(productId, { 
                ...product, 
                price: parseFloat(newPrice) 
            });
            showNotification('Product updated successfully!', 'success');
            await loadProducts();
            await loadStats();
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
            await loadStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product: ' + error.message, 'error');
        }
    }
}

// Make functions globally available
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFarmerDashboard);

console.log('Farmer dashboard script setup complete');
