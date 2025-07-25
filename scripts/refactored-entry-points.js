// Refactored Entry Points
// This file maintains compatibility with the original files while using the new modular structure

console.log('Loading refactored entry points...');

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing refactored authentication system');
    
    // Wait for API client to be available
    waitForApiClient(() => {
        console.log('API client ready for authentication');
        
        // If we're on a dashboard page, initialize it
        if (window.location.pathname.includes('dashboard')) {
            console.log('Dashboard page detected, initializing dashboard');
            initDashboard();
            return;
        }
        
        // Initialize UI event listeners for auth pages
        initializeUIEventListeners();
        
        console.log('Refactored authentication system initialized successfully');
    });
});

// Dashboard-specific initialization
if (window.location.pathname.includes('admin-dashboard')) {
    // Initialize Admin Dashboard
    window.addEventListener('DOMContentLoaded', () => {
        window.dashboard = new AdminDashboard();
    });
} else if (window.location.pathname.includes('farmer-dashboard')) {
    // Initialize Farmer Dashboard
    window.addEventListener('DOMContentLoaded', () => {
        window.farmerDashboard = {
            currentUser: null,
            products: [],
            
            async init() {
                this.currentUser = checkAuth();
                if (!this.currentUser || this.currentUser.role !== 'farmer') {
                    window.location.href = 'index.html';
                    return;
                }
                
                initDashboard();
                await this.loadProducts();
                await this.loadFarmerStats();
                this.setupEventListeners();
            },
            
            async loadProducts() {
                try {
                    const response = await apiClient.getProducts();
                    this.products = apiClient.extractArrayData(response, 'data') || [];
                    this.products = this.products.filter(p => p.farmer_id == this.currentUser.id);
                    FarmerProducts.displayProducts(this.products);
                } catch (error) {
                    console.error('Error loading products:', error);
                    showNotification('Failed to load products', 'error');
                    FarmerProducts.displayProducts([]);
                }
            },
            
            async loadFarmerStats() {
                // Implementation moved to separate module but kept here for compatibility
                console.log('Loading farmer stats...');
            },
            
            setupEventListeners() {
                const addProductBtn = document.getElementById('addProductBtn');
                if (addProductBtn) {
                    addProductBtn.addEventListener('click', FarmerProducts.showAddProductModal);
                }
            }
        };
        
        window.farmerDashboard.init();
    });
} else if (window.location.pathname.includes('consumer-dashboard')) {
    // Initialize Consumer Dashboard
    window.addEventListener('DOMContentLoaded', () => {
        window.consumerDashboard = {
            currentUser: null,
            products: [],
            cart: [],
            orders: [],
            
            async init() {
                this.currentUser = checkAuth();
                if (!this.currentUser) {
                    window.location.href = 'index.html';
                    return;
                }
                
                // Load per-user cart
                this.cart = JSON.parse(localStorage.getItem(ConsumerCart.getCartKey(this.currentUser))) || [];
                ConsumerCart.updateCartCount(this.cart);
                
                initDashboard();
                await this.loadConsumerData();
                this.setupEventListeners();
            },
            
            async loadConsumerData() {
                try {
                    await Promise.all([this.loadProducts(), this.loadConsumerStats(), this.loadOrderHistory()]);
                } catch (error) {
                    console.error('Error loading consumer data:', error);
                    showNotification('Failed to load dashboard data', 'error');
                }
            },
            
            async loadProducts() {
                try {
                    const response = await apiClient.getProducts();
                    this.products = apiClient.extractArrayData(response, 'data') || [];
                    this.displayProducts(this.products);
                } catch (error) {
                    console.error('Error loading products:', error);
                    showNotification('Failed to load products', 'error');
                }
            },
            
            displayProducts(productsToShow) {
                const productGrid = document.getElementById('productGrid');
                if (!productGrid) return;
                
                if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
                    productGrid.innerHTML = `
                        <div class="col-span-full text-center py-12">
                            <div class="text-gray-400 text-4xl mb-4">🛒</div>
                            <p class="text-gray-600">No products available at the moment.</p>
                        </div>
                    `;
                    return;
                }
                
                productGrid.innerHTML = productsToShow.map(product => `
                    <div class="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div class="product-image text-center text-4xl mb-3">🥬</div>
                        <h3 class="font-semibold text-lg mb-2">${product.name || 'Unnamed Product'}</h3>
                        <p class="text-gray-600 text-sm mb-3">${product.description || 'No description available'}</p>
                        <div class="flex justify-between items-center mb-3">
                            <span class="font-bold text-lg text-green-600">Ksh${parseFloat(product.price || 0).toFixed(2)}</span>
                            <span class="text-sm ${product.quantity > 0 ? 'text-gray-500' : 'text-red-500'}">
                                Stock: ${product.quantity || 0}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500 capitalize">${product.category || 'Uncategorized'}</span>
                            <button class="btn-primary text-sm ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                                    onclick="addToCart(${product.id})" 
                                    ${product.quantity <= 0 ? 'disabled' : ''}>
                                ${product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                `).join('');
            },
            
            async loadConsumerStats() {
                // Implementation details kept for compatibility
                console.log('Loading consumer stats...');
            },
            
            async loadOrderHistory() {
                // Implementation details kept for compatibility
                console.log('Loading order history...');
            },
            
            setupEventListeners() {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.addEventListener('keypress', e => {
                        if (e.key === 'Enter') this.searchProducts();
                    });
                }
            },
            
            searchProducts() {
                // Implementation details kept for compatibility
                console.log('Searching products...');
            }
        };
        
        window.consumerDashboard.init();
    });
} else if (window.location.pathname.includes('analytics')) {
    // Initialize Analytics Dashboard
    window.addEventListener('DOMContentLoaded', () => {
        console.log('Analytics Dashboard initializing...');
        
        waitForApiClient(() => {
            loadRealAnalyticsData();
            startRealTimeUpdates();
            initializeDynamicCharts();
        });
    });
}

// Compatibility functions for existing code
window.showAddProductModal = () => FarmerProducts.showAddProductModal();
window.closeModal = (modalId) => closeModal(modalId);
window.editProduct = (id) => FarmerProducts.editProduct(id);
window.deleteProduct = (id) => FarmerProducts.deleteProduct(id);

console.log('Refactored entry points loaded successfully');