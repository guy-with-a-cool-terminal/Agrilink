
// Consumer Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadProducts();
    updateCartCount();
});

// Sample products data
const products = [
    {
        id: 1,
        name: 'Fresh Tomatoes',
        category: 'vegetables',
        description: 'Farm fresh red tomatoes, perfect for cooking',
        price: 40,
        unit: 'kg',
        image: '🍅',
        farmer: 'John Farm'
    },
    {
        id: 2,
        name: 'Sweet Corn',
        category: 'vegetables',
        description: 'Sweet and tender corn, freshly harvested',
        price: 35,
        unit: 'kg',
        image: '🌽',
        farmer: 'Green Valley Farm'
    },
    {
        id: 3,
        name: 'Red Apples',
        category: 'fruits',
        description: 'Crispy red apples, rich in vitamins',
        price: 120,
        unit: 'kg',
        image: '🍎',
        farmer: 'Mountain Orchards'
    },
    {
        id: 4,
        name: 'Basmati Rice',
        category: 'grains',
        description: 'Premium quality basmati rice',
        price: 80,
        unit: 'kg',
        image: '🌾',
        farmer: 'Rice Valley'
    },
    {
        id: 5,
        name: 'Fresh Milk',
        category: 'dairy',
        description: 'Pure cow milk, delivered fresh daily',
        price: 25,
        unit: 'liter',
        image: '🥛',
        farmer: 'Dairy Fresh'
    },
    {
        id: 6,
        name: 'Red Chili',
        category: 'spices',
        description: 'Hot red chilies, dried and ground',
        price: 200,
        unit: 'kg',
        image: '🌶️',
        farmer: 'Spice Garden'
    }
];

// Shopping cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load products into grid
function loadProducts(productsToShow = products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <p style="color: #666; font-size: 0.9rem;">By: ${product.farmer}</p>
                <div class="product-price">Ksh${product.price}/${product.unit}</div>
                <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter
        );
    }
    
    loadProducts(filteredProducts);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Show cart
function showCart() {
    loadCartItems();
    document.getElementById('cartModal').classList.add('active');
}

// Load cart items
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        updateCartSummary();
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">${item.image}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Ksh${item.price}/${item.unit}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div style="font-weight: bold;">Ksh${item.price * item.quantity}</div>
            <button class="btn-danger" onclick="removeFromCart(${item.id})" style="margin-left: 10px;">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartSummary();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCartItems();
            updateCartCount();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = cart.length > 0 ? 50 : 0;
    const total = subtotal + delivery;
    
    document.getElementById('subtotal').textContent = `Ksh${subtotal}`;
    document.getElementById('total').textContent = `Ksh${total}`;
    document.getElementById('checkoutTotal').textContent = `Ksh${total}`;
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    closeModal('cartModal');
    document.getElementById('checkoutModal').classList.add('active');
}

// Place order
function placeOrder(event) {
    event.preventDefault();
    
    const address = document.getElementById('deliveryAddress').value;
    const phone = document.getElementById('phoneNumber').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    const order = {
        id: 'ORD' + Date.now(),
        items: [...cart],
        address: address,
        phone: phone,
        paymentMethod: paymentMethod,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50,
        status: 'processing',
        date: new Date().toISOString()
    };
    
    // Save order (in real app, this would go to backend)
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    closeModal('checkoutModal');
    alert(`Order placed successfully! Order ID: ${order.id}`);
    
    // Reset form
    document.querySelector('#checkoutModal form').reset();
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
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
