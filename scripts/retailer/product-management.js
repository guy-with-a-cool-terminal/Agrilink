
// Retailer Product Management Module
class RetailerProductManagement {
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
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
        }
    }

    // Populate product select
    populateProductSelect() {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect) return;
        
        productSelect.innerHTML = '<option value="">Select Product</option>';
        
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    }

    // Update order summary
    updateOrderSummary() {
        const productSelect = document.getElementById('productSelect');
        const bulkQuantity = document.getElementById('bulkQuantity');
        const orderSummary = document.getElementById('orderSummary');
        
        if (!productSelect || !bulkQuantity || !orderSummary) return;
        
        const productId = productSelect.value;
        const quantity = parseInt(bulkQuantity.value);
        
        if (!productId || isNaN(quantity) || quantity < 10) {
            orderSummary.textContent = 'Select a product and quantity to see the total cost.';
            return;
        }
        
        const product = this.products.find(p => p.id == productId);
        if (!product) {
            orderSummary.textContent = 'Product not found.';
            return;
        }
        
        const totalCost = product.price * quantity;
        orderSummary.textContent = `
            ${product.name} x ${quantity} = Ksh${totalCost.toLocaleString()}
        `;
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.RetailerProductManagement = RetailerProductManagement;
