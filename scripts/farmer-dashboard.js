
// Farmer Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadProducts();
});

// Sample products data
let products = [
    {
        id: 1,
        name: 'Fresh Tomatoes',
        category: 'vegetables',
        description: 'Farm fresh red tomatoes',
        quantity: '50 kg',
        price: '₹40/kg',
        image: '🍅',
        status: 'active'
    },
    {
        id: 2,
        name: 'Sweet Corn',
        category: 'vegetables',
        description: 'Sweet and tender corn',
        quantity: '30 kg',
        price: '₹35/kg',
        image: '🌽',
        status: 'active'
    }
];

// Load products into table
function loadProducts() {
    const tableBody = document.querySelector('#productsTable tbody');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.image}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${product.price}</td>
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
function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value;
    const quantity = document.getElementById('productQuantity').value;
    const price = document.getElementById('productPrice').value;
    
    // Get category emoji
    const categoryEmojis = {
        'vegetables': '🥬',
        'fruits': '🍎',
        'grains': '🌾',
        'dairy': '🥛',
        'spices': '🌶️'
    };
    
    const newProduct = {
        id: products.length + 1,
        name: name,
        category: category,
        description: description,
        quantity: quantity,
        price: price,
        image: categoryEmojis[category] || '🥕',
        status: 'active'
    };
    
    products.push(newProduct);
    loadProducts();
    closeModal('addProductModal');
    
    // Reset form
    document.querySelector('#addProductModal form').reset();
    
    alert('Product added successfully!');
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        // Fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productQuantity').value = product.quantity;
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
function updateProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        product.name = document.getElementById('productName').value;
        product.category = document.getElementById('productCategory').value;
        product.description = document.getElementById('productDescription').value;
        product.quantity = document.getElementById('productQuantity').value;
        product.price = document.getElementById('productPrice').value;
        
        loadProducts();
        closeModal('addProductModal');
        
        // Reset form submission back to add
        const form = document.querySelector('#addProductModal form');
        form.onsubmit = addProduct;
        
        alert('Product updated successfully!');
    }
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        loadProducts();
        alert('Product deleted successfully!');
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
