// Farmer Products Management Module
// Handles product CRUD operations, stock management, and product display

console.log('Farmer Products module loaded successfully');

// Products management functionality for Farmer Dashboard
const FarmerProducts = {
    // Display products
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
                        <button class="btn-secondary text-sm" onclick="FarmerProducts.editProduct(${product.id})">Edit</button>
                        <button class="btn-danger text-sm" onclick="FarmerProducts.deleteProduct(${product.id})">Delete</button>
                    </div>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    },

    // Show add product modal
    showAddProductModal() {
        const modal = createModal('addProductModal', 'Add New Product', `
            <form id="addProductForm">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="productName">Product Name</label>
                        <input type="text" id="productName" name="name" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group">
                        <label for="productCategory">Category</label>
                        <select id="productCategory" name="category" required class="w-full p-2 border rounded">
                            <option value="">Select Category</option>
                            <option value="vegetables">Vegetables</option>
                            <option value="fruits">Fruits</option>
                            <option value="grains">Grains</option>
                            <option value="dairy">Dairy</option>
                            <option value="spices">Spices</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="productPrice">Price per Unit (Ksh)</label>
                        <input type="number" id="productPrice" name="price" step="0.01" min="0" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group">
                        <label for="productStock">Stock Quantity</label>
                        <input type="number" id="productStock" name="quantity" min="0" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group col-span-2">
                        <label for="productDescription">Description</label>
                        <textarea id="productDescription" name="description" rows="3" class="w-full p-2 border rounded" placeholder="Describe your product..."></textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Product</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('addProductForm');
        form.addEventListener('submit', this.handleAddProduct);
    },

    // Handle add product
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
            const response = await apiClient.createProduct(productData);
            console.log('Product created successfully:', response);
            
            showNotification('Product added successfully!', 'success');
            
            // Close modal and reset form
            document.getElementById('addProductModal')?.remove();
            
            // Reload products and stats
            if (window.farmerDashboard) {
                await window.farmerDashboard.loadProducts();
                await window.farmerDashboard.loadFarmerStats();
            }
            
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('Failed to add product: ' + error.message, 'error');
        }
    },

    // Edit product
    async editProduct(productId) {
        const products = window.farmerDashboard?.products || [];
        const product = products.find(p => p.id === productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }

        const modal = createModal('editProductModal', 'Edit Product', `
            <form id="editProductForm">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="editProductName">Product Name</label>
                        <input type="text" id="editProductName" value="${product.name || ''}" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group">
                        <label for="editProductCategory">Category</label>
                        <select id="editProductCategory" required class="w-full p-2 border rounded">
                            <option value="vegetables" ${product.category === 'vegetables' ? 'selected' : ''}>Vegetables</option>
                            <option value="fruits" ${product.category === 'fruits' ? 'selected' : ''}>Fruits</option>
                            <option value="grains" ${product.category === 'grains' ? 'selected' : ''}>Grains</option>
                            <option value="dairy" ${product.category === 'dairy' ? 'selected' : ''}>Dairy</option>
                            <option value="spices" ${product.category === 'spices' ? 'selected' : ''}>Spices</option>
                            <option value="other" ${product.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editProductPrice">Price per Unit (Ksh)</label>
                        <input type="number" id="editProductPrice" value="${product.price || 0}" step="0.01" min="0" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group">
                        <label for="editProductStock">Stock Quantity</label>
                        <input type="number" id="editProductStock" value="${product.quantity || product.stock || 0}" min="0" required class="w-full p-2 border rounded">
                    </div>
                    <div class="form-group col-span-2">
                        <label for="editProductDescription">Description</label>
                        <textarea id="editProductDescription" rows="3" class="w-full p-2 border rounded">${product.description || ''}</textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Product</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('editProductForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedProduct = {
                ...product,
                name: document.getElementById('editProductName').value,
                category: document.getElementById('editProductCategory').value,
                price: parseFloat(document.getElementById('editProductPrice').value),
                quantity: parseInt(document.getElementById('editProductStock').value),
                description: document.getElementById('editProductDescription').value
            };

            try {
                await apiClient.updateProduct(productId, updatedProduct);
                showNotification('Product updated successfully!', 'success');
                modal.remove();
                
                if (window.farmerDashboard) {
                    await window.farmerDashboard.loadProducts();
                    await window.farmerDashboard.loadFarmerStats();
                }
            } catch (error) {
                console.error('Error updating product:', error);
                showNotification('Failed to update product: ' + error.message, 'error');
            }
        });
    },

    // Delete product
    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await apiClient.deleteProduct(productId);
                showNotification('Product deleted successfully!', 'success');
                
                if (window.farmerDashboard) {
                    await window.farmerDashboard.loadProducts();
                    await window.farmerDashboard.loadFarmerStats();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Failed to delete product: ' + error.message, 'error');
            }
        }
    },

    // Update stock for a product
    async updateStock(productId, newStock) {
        const products = window.farmerDashboard?.products || [];
        const product = products.find(p => p.id === productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }

        try {
            const updatedProduct = { ...product, quantity: newStock };
            await apiClient.updateProduct(productId, updatedProduct);
            showNotification('Stock updated successfully!', 'success');
            
            if (window.farmerDashboard) {
                await window.farmerDashboard.loadProducts();
                await window.farmerDashboard.loadFarmerStats();
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            showNotification('Failed to update stock: ' + error.message, 'error');
        }
    },

    // Toggle product status
    async toggleProductStatus(productId) {
        const products = window.farmerDashboard?.products || [];
        const product = products.find(p => p.id === productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }

        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        
        try {
            const updatedProduct = { ...product, status: newStatus };
            await apiClient.updateProduct(productId, updatedProduct);
            showNotification(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
            
            if (window.farmerDashboard) {
                await window.farmerDashboard.loadProducts();
                await window.farmerDashboard.loadFarmerStats();
            }
        } catch (error) {
            console.error('Error updating product status:', error);
            showNotification('Failed to update product status: ' + error.message, 'error');
        }
    }
};

// Make functions globally available
if (typeof window !== 'undefined') {
    window.FarmerProducts = FarmerProducts;
    window.showAddProductModal = FarmerProducts.showAddProductModal;
    window.editProduct = FarmerProducts.editProduct;
    window.deleteProduct = FarmerProducts.deleteProduct;
}

console.log('Farmer Products module setup complete');