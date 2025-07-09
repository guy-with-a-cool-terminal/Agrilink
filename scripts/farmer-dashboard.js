
// Farmer Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadProducts();
    
    // Load API configuration
    const script = document.createElement('script');
    script.src = 'scripts/config.js';
    document.head.appendChild(script);
});

// Products data from API
let products = [];

// Load products from API
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        products = response.data || response;
        console.log('Products loaded:', products);
        
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${getCategoryEmoji(product.category)}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.stock} ${product.unit || 'kg'}</td>
                <td>Ksh${product.price}</td>
                <td><span class="status-${product.status}">${product.status}</span></td>
                <td>
                    <button class="btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update stats
        document.getElementById('totalProducts').textContent = products.length;
        
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Failed to load products: ' + error.message);
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
    document.getElementById('addProductModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Add new product
async function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    const quantity = document.getElementById('productQuantity').value;
    const price = document.getElementById('productPrice').value;
    
    try {
        const productData = {
            name: name,
            category: category,
            description: description,
            stock: quantity,
            price: parseFloat(price),
            unit: 'kg',
            status: 'active'
        };
        
        const response = await apiClient.createProduct(productData);
        console.log('Product created:', response);
        
        // Reload products
        await loadProducts();
        closeModal('addProductModal');
        
        // Reset form
        document.querySelector('#addProductModal form').reset();
        
        alert('Product added successfully!');
        
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product: ' + error.message);
    }
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        // Fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productQuantity').value = product.stock;
        document.getElementById('productPrice').value = product.price;
        
        showAddProductModal();
        
        // Change form submission to update instead of add
        const form = document.querySelector('#addProductModal form');
        form.onsubmit = function(event) {
            event.preventDefault();
            updateProduct(id);
        };
    }
}

// Update product
async function updateProduct(id) {
    try {
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            stock: document.getElementById('productQuantity').value,
            price: parseFloat(document.getElementById('productPrice').value),
            unit: 'kg'
        };
        
        const response = await apiClient.updateProduct(id, productData);
        console.log('Product updated:', response);
        
        // Reload products
        await loadProducts();
        closeModal('addProductModal');
        
        // Reset form submission back to add
        const form = document.querySelector('#addProductModal form');
        form.onsubmit = addProduct;
        
        alert('Product updated successfully!');
        
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product: ' + error.message);
    }
}

// Delete product
async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await apiClient.deleteProduct(id);
            console.log('Product deleted:', id);
            
            // Reload products
            await loadProducts();
            alert('Product deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product: ' + error.message);
        }
    }
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
