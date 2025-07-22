
// Consumer Product Management Module
class ProductManagement {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.products = [];
    }

    // Load products from API
    async loadProducts() {
        try {
            const response = await this.apiClient.getProducts();
            this.products = this.apiClient.extractArrayData(response, 'data') || [];
            console.log('Products loaded:', this.products);
            
            this.displayProducts(this.products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
        }
    }

    // Display products in grid with enhanced stock visibility
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
        
        // Filter out products with zero stock
        const availableProducts = productsToShow.filter(product => (product.quantity || 0) > 0);
        
        if (availableProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-600">All products are currently out of stock. Please check back later.</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = availableProducts.map(product => `
            <div class="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="product-image text-center text-4xl mb-3">🥬</div>
                <h3 class="font-semibold text-lg mb-2">${product.name || 'Unnamed Product'}</h3>
                <p class="text-gray-600 text-sm mb-3">${product.description || 'No description available'}</p>
                <div class="flex justify-between items-center mb-3">
                    <span class="font-bold text-lg text-green-600">Ksh${parseFloat(product.price || 0).toFixed(2)}</span>
                    <span class="text-sm ${product.quantity > 5 ? 'text-gray-500' : 'text-orange-500'}">
                        Stock: ${product.quantity || 0}
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500 capitalize">${product.category || 'Uncategorized'}</span>
                    <button class="btn-primary text-sm" onclick="cartManager.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
                ${product.quantity <= 5 && product.quantity > 0 ? 
                    `<div class="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">⚠️ Only ${product.quantity} left!</div>` : ''}
            </div>
        `).join('');
    }

    // Search products
    searchProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        let filteredProducts = this.products;
        
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                (product.name || '').toLowerCase().includes(searchTerm) ||
                (product.description || '').toLowerCase().includes(searchTerm)
            );
        }
        
        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(product =>
                (product.category || '').toLowerCase() === categoryFilter.toLowerCase()
            );
        }
        
        this.displayProducts(filteredProducts);
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.ProductManagement = ProductManagement;
