// Consumer Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadProducts();
    updateCartCount();
    
    // Load API configuration
    const script = document.createElement('script');
    script.src = 'scripts/config.js';
    document.head.appendChild(script);
});

// Products data from API
let products = [];

// Shopping cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load products from API
async function loadProducts(productsToShow = null) {
    try {
        if (!productsToShow) {
            const response = await apiClient.getProducts();
            products = response.data || response;
            console.log('Products loaded:', products);
            productsToShow = products;
        }
        
        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '';
        
        if (productsToShow.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; padding: 40px;">No products available</p>';
            return;
        }
        
        productsToShow.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">` : getCategoryEmoji(product.category)}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <p style="color: #666; font-size: 0.9rem;">Stock: ${product.stock} ${product.unit || 'kg'}</p>
                    <div class="product-price">Ksh${product.price}/${product.unit || 'kg'}</div>
                    <button class="btn-primary" onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Failed to load products. Please try again.</p>';
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
    return `<div style="font-size: 4rem; text-align: center; padding: 20px;">${categoryEmojis[category] || '🥕'}</div>`;
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
    if (product && product.stock > 0) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
            } else {
                alert('Cannot add more items. Stock limit reached.');
                return;
            }
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit || 'kg',
                image: product.image_url,
                quantity: 1,
                maxStock: product.stock
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
    } else {
        alert('Product is out of stock!');
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
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : getCategoryEmoji('default')}
            </div>
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
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= item.maxStock) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCartItems();
            updateCartCount();
        } else {
            alert('Cannot add more items. Stock limit reached.');
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
async function placeOrder(event) {
    event.preventDefault();
    
    const address = document.getElementById('deliveryAddress').value;
    const phone = document.getElementById('phoneNumber').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;
    
    try {
        // Create order items array
        const orderItems = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        }));
        
        const orderData = {
            delivery_address: address,
            phone: phone,
            payment_method: paymentMethod,
            total_amount: total,
            items: orderItems
        };
        
        const response = await apiClient.createOrder(orderData);
        console.log('Order created:', response);
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        closeModal('checkoutModal');
        alert(`Order placed successfully! Order ID: ${response.data?.id || response.id}`);
        
        // Reset form
        document.querySelector('#checkoutModal form').reset();
        
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order: ' + error.message);
    }
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