// Consumer Dashboard JavaScript - Dynamic Data Implementation

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Consumer Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadProducts();
    loadUserStats();
    updateCartCount();
});

// Products data and user data
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = null;

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'index.html';
    }
}

// Load user data and update UI
async function loadUserData() {
    try {
        const userData = await apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Consumer';
        document.getElementById('userRole').textContent = userData.role || 'Consumer';
    } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to stored user data
        document.getElementById('userName').textContent = currentUser.name || 'Consumer';
    }
}

// Load user statistics
async function loadUserStats() {
    try {
        const orders = await apiClient.getOrders();
        console.log('User orders loaded:', orders);
        
        const ordersList = orders.data || orders || [];
        const totalOrders = ordersList.length;
        const activeOrders = ordersList.filter(order => 
            order.status === 'pending' || order.status === 'processing' || order.status === 'in_transit'
        ).length;
        
        const totalSpent = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        // Update stats display
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeOrders').textContent = activeOrders;
        document.getElementById('favoriteProducts').textContent = Math.floor(totalOrders / 3); // Simple calculation
        
    } catch (error) {
        console.error('Error loading user stats:', error);
        // Keep default values on error
    }
}

// Load products from API
async function loadProducts(productsToShow = null) {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    
    try {
        if (!productsToShow) {
            loadingState.style.display = 'block';
            const response = await apiClient.getProducts();
            products = response.data || response || [];
            console.log('Products loaded:', products);
            productsToShow = products;
        }
        
        loadingState.style.display = 'none';
        productGrid.innerHTML = '';
        
        if (productsToShow.length === 0) {
            productGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🛒</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                    <p class="text-gray-600">Check back later for new products!</p>
                </div>
            `;
            return;
        }
        
        productsToShow.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const isOutOfStock = (product.stock || 0) <= 0;
            const stockClass = isOutOfStock ? 'text-red-600' : 'text-green-600';
            const stockText = isOutOfStock ? 'Out of Stock' : `${product.stock} ${product.unit || 'kg'} available`;
            
            productCard.innerHTML = `
                <div class="product-image">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" class="w-full h-full object-cover">` : 
                        `<div class="text-6xl">${getCategoryEmoji(product.category)}</div>`
                    }
                </div>
                <div class="product-info">
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">${product.name}</h4>
                    <p class="text-gray-600 text-sm mb-3">${product.description || 'Fresh and quality product'}</p>
                    <p class="text-sm ${stockClass} mb-3 font-medium">${stockText}</p>
                    <div class="product-price text-xl font-bold text-green-600 mb-4">
                        Ksh${product.price}/${product.unit || 'kg'}
                    </div>
                    <button 
                        class="btn-primary w-full ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}" 
                        onclick="addToCart(${product.id})" 
                        ${isOutOfStock ? 'disabled' : ''}
                    >
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.style.display = 'none';
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
                <p class="text-gray-600 mb-4">Please check your connection and try again.</p>
                <button class="btn-primary" onclick="loadProducts()">Retry</button>
            </div>
        `;
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

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description || '').toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter
        );
    }
    
    console.log('Filtered products:', filteredProducts);
    loadProducts(filteredProducts);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || (product.stock || 0) <= 0) {
        alert('Product is out of stock!');
        return;
    }
    
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
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = `${product.name} added to cart!`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
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
        cartItemsContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="text-gray-400 text-4xl mb-4">🛒</div>
                <p class="text-gray-600">Your cart is empty</p>
            </div>
        `;
        updateCartSummary();
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg">` : 
                    `<div class="text-2xl">${getCategoryEmoji('default')}</div>`
                }
            </div>
            <div class="cart-item-info">
                <h4 class="font-medium text-gray-900">${item.name}</h4>
                <p class="text-sm text-gray-600">Ksh${item.price}/${item.unit}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="mx-3 font-medium">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="text-right">
                <div class="font-bold text-gray-900">Ksh${(item.price * item.quantity).toLocaleString()}</div>
                <button class="btn-danger text-sm mt-2" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartSummary();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
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
    
    document.getElementById('subtotal').textContent = `Ksh${subtotal.toLocaleString()}`;
    document.getElementById('total').textContent = `Ksh${total.toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `Ksh${total.toLocaleString()}`;
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
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;
    
    try {
        const orderData = {
            delivery_address: address,
            phone: phone,
            payment_method: paymentMethod,
            total_amount: total,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };
        
        console.log('Placing order:', orderData);
        const response = await apiClient.createOrder(orderData);
        console.log('Order created:', response);
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        closeModal('checkoutModal');
        
        // Show success message
        alert(`Order placed successfully! Order ID: ${response.data?.id || response.id || 'Unknown'}`);
        
        // Reset form
        event.target.reset();
        
        // Refresh user stats
        loadUserStats();
        
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
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

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
}
