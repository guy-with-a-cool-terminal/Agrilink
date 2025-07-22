
// Farmer Product Management Module
class FarmerProductManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
        this.products = [];
    }

    // Load products - Fixed to handle paginated response correctly
    async loadProducts() {
        try {
            console.log('Loading products...');
            const response = await this.apiClient.getProducts();
            console.log('Products response:', response);
            
            // Use improved data extraction method to handle pagination
            this.products = this.apiClient.extractArrayData(response, 'data') || [];
            this.products = this.products.filter(p => p.farmer_id == this.currentUser.id);
            console.log('Extracted products:', this.products);
            
            this.displayProducts(this.products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
            this.displayProducts([]); // Show empty state
        }
    }

    // Display products - Ensure proper rendering
    displayProducts(productsToShow) {
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
                        <button class="btn-secondary text-sm" onclick="farmerProductManager.editProduct(${product.id})">Edit</button>
                        <button class="btn-danger text-sm" onclick="farmerProductManager.deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    }

    // Handle add product - Enhanced with immediate refresh
    async handleAddProduct(event) {
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
            const response = await this.apiClient.createProduct(productData);
            console.log('Product created successfully:', response);
            
            this.showNotification('Product added successfully!', 'success');
            
            // Close modal and reset form
            this.closeModal('addProductModal');
            event.target.reset();
            
            // Immediately reload products and stats to show new product
            await this.loadProducts();
            if (window.farmerStatsManager) await window.farmerStatsManager.loadFarmerStats();
            
        } catch (error) {
            console.error('Error creating product:', error);
            this.showNotification('Failed to add product: ' + error.message, 'error');
        }
    }

    // Edit product
    async editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const newPrice = prompt('Enter new price:', product.price);
        if (newPrice && !isNaN(newPrice)) {
            try {
                await this.apiClient.updateProduct(productId, { 
                    ...product, 
                    price: parseFloat(newPrice) 
                });
                this.showNotification('Product updated successfully!', 'success');
                await this.loadProducts();
                if (window.farmerStatsManager) await window.farmerStatsManager.loadFarmerStats();
            } catch (error) {
                console.error('Error updating product:', error);
                this.showNotification('Failed to update product: ' + error.message, 'error');
            }
        }
    }

    // Delete product
    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await this.apiClient.deleteProduct(productId);
                this.showNotification('Product deleted successfully!', 'success');
                await this.loadProducts();
                if (window.farmerStatsManager) await window.farmerStatsManager.loadFarmerStats();
            } catch (error) {
                console.error('Error deleting product:', error);
                this.showNotification('Failed to delete product: ' + error.message, 'error');
            }
        }
    }

    // Global function to show add product modal
    showAddProductModal() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Global function to close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.FarmerProductManagement = FarmerProductManagement;
