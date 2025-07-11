
// Consumer Dashboard JavaScript - Fixed Data Handling

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Consumer Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadProducts();
    loadConsumerStats();
    updateCartDisplay();
});

// Data storage
let products = [];
let orders = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = null;

// Initialize dashboard
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

// Load user data
async function loadUserData() {
    try {
        const userData = await apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Consumer';
        document.getElementById('userRole').textContent = userData.role || 'Consumer';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Consumer';
    }
}

// Load consumer statistics
async function loadConsumerStats() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response);
        
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const activeOrders = orders.filter(order => 
            order.status === 'pending' || order.status === 'processing' || order.status === 'in_transit'
        ).length;
        const favoriteProducts = Math.floor(totalOrders / 3); // Simulated
        
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeOrders').textContent = activeOrders;
        document.getElementById('favoriteProducts').textContent = favoriteProducts;
        
    } catch (error) {
        console.error('Error loading consumer stats:', error);
    }
}

// Load products from API
async function loadProducts() {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    
    try {
        loadingState.style.display = 'block';
        productGrid.style.display = 'none';
        
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response);
        console.log('Products loaded:', products);
        
        displayProducts(products);
        
        loadingState.style.display = 'none';
        productGrid.style.display = 'grid';
        
    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-400 text-4xl mb-4">⚠️</div>
                <p class="text-gray-600 mb-4">Failed to load products. Please try again.</p>
                <button class="btn-primary" onclick="loadProducts()">Retry</button>
            </div>
        `;
    }
}

// Display products
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🛒</div>
                <p class="text-gray-600 text-lg">No products found. Try adjusting your search.</p>
            </div>
        `;
        return;
    }
    
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                ${getProductIcon(product.category)}
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="text-sm text-gray-600 capitalize">${product.category}</p>
                <p class="text-sm text-gray-500">${product.description || 'Fresh and quality product'}</p>
                <div class="product-price">Ksh${(product.price || 0).toFixed(2)} / ${product.unit || 'unit'}</div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Stock: ${product.quantity || product.stock || 0}</span>
                    <button class="btn-primary" onclick="addToCart(${product.id})" 
                            ${(product.quantity || product.stock || 0) === 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description || '').toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    
    const existingItem = cart.find(item => item.id == productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            quantity: 1,
            unit: product.unit || 'unit',
            category: product.category
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    alert(`${product.name} added to cart!`);
}

// Update cart display
function updateCartDisplay() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = cartCount;
}

// Show cart modal
function showCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-8">
                <div class="text-gray-400 text-4xl mb-4">🛒</div>
                <p class="text-gray-600">Your cart is empty</p>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    ${getProductIcon(item.category)}
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Ksh${item.price.toFixed(2)} / ${item.unit}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
                <button class="btn-danger text-sm" onclick="removeFromCart(${index})">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    updateCartSummary();
    openModal('cartModal');
}

// Update cart quantity
function updateCartQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        showCart();
        updateCartDisplay();
    }
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    showCart();
    updateCartDisplay();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + 50; // Adding delivery fee
    
    document.getElementById('subtotal').textContent = `Ksh${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `Ksh${total.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `Ksh${total.toFixed(2)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    closeModal('cartModal');
    openModal('checkoutModal');
}

// Place order
async function placeOrder(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;
    
    const orderData = {
        items: cart,
        delivery_address: document.getElementById('deliveryAddress').value,
        phone_number: document.getElementById('phoneNumber').value,
        payment_method: document.getElementById('paymentMethod').value,
        total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50,
        status: 'pending'
    };
    
    try {
        await apiClient.createOrder(orderData);
        alert('Order placed successfully!');
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        
        closeModal('checkoutModal');
        await loadConsumerStats();
        
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Helper function to get product icon
function getProductIcon(category) {
    const icons = {
        vegetables: '🥬',
        fruits: '🍎',
        grains: '🌾',
        dairy: '🥛',
        spices: '🌶️'
    };
    return icons[category] || '🌱';
}

// Modal helper functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
