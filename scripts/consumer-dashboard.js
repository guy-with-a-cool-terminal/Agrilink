
// Consumer Dashboard Logic
console.log('Consumer dashboard script loaded');

let currentUser = null;
let products = [];
let cart = [];
let orders = [];

// Initialize dashboard
function initializeConsumerDashboard() {
    console.log('Initializing consumer dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'consumer') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    loadDashboardData();
    setupEventListeners();
    loadCart();
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartModal) cartModal.classList.remove('active');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Close modal when clicking outside
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove('active');
            }
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadProducts(),
            loadOrders(),
            loadStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load products
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await apiClient.getProducts();
        console.log('Products response:', response);
        
        // Extract products array from response
        products = apiClient.extractArrayData(response, 'data') || [];
        console.log('Extracted products:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Display products
function displayProducts(productsToShow) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500">No products available at the moment.</p>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                📦
            </div>
            <div class="product-info">
                <h4>${product.name || 'Unnamed Product'}</h4>
                <p>${product.description || 'No description available'}</p>
                <div class="product-price">$${parseFloat(product.price || 0).toFixed(2)}</div>
                <div class="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>Stock: ${product.quantity || product.stock || 0}</span>
                    <span class="capitalize">${product.category || 'General'}</span>
                </div>
                <button onclick="addToCart(${product.id})" 
                        class="btn-primary w-full" 
                        ${(product.quantity || product.stock || 0) <= 0 ? 'disabled' : ''}>
                    ${(product.quantity || product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `).join('');
}

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem(`cart_${currentUser.id}`);
        cart = savedCart ? JSON.parse(savedCart) : [];
        updateCartDisplay();
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if ((product.quantity || product.stock || 0) <= 0) {
        showNotification('Product is out of stock', 'warning');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">📦</div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="updateCartQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                        <span class="px-3">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">×</button>
                </div>
            `).join('');
        }
    }

    if (cartTotal) {
        cartTotal.textContent = `$${totalAmount.toFixed(2)}`;
    }
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    updateCartDisplay();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Item removed from cart', 'info');
}

// Show cart
function showCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.add('active');
    }
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        (product.name || '').toLowerCase().includes(searchTerm) ||
        (product.description || '').toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

// Handle category filter
function handleCategoryFilter(event) {
    const category = event.target.value;
    const filteredProducts = category 
        ? products.filter(product => product.category === category)
        : products;
    displayProducts(filteredProducts);
}

// Handle checkout
async function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }

    try {
        const orderData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        console.log('Placing order:', orderData);
        const response = await apiClient.createOrder(orderData);
        console.log('Order placed successfully:', response);

        // Clear cart
        cart = [];
        saveCart();
        updateCartDisplay();

        // Close cart modal
        const cartModal = document.getElementById('cartModal');
        if (cartModal) cartModal.classList.remove('active');

        showNotification('Order placed successfully!', 'success');
        
        // Reload orders and stats
        await loadOrders();
        await loadStats();

    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Failed to place order: ' + error.message, 'error');
    }
}

// Load orders
async function loadOrders() {
    try {
        console.log('Loading orders...');
        const response = await apiClient.getOrders();
        console.log('Orders response:', response);
        
        orders = apiClient.extractArrayData(response, 'data') || [];
        console.log('Extracted orders:', orders);
        
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// Display orders
function displayOrders(ordersToShow) {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    if (!Array.isArray(ordersToShow) || ordersToShow.length === 0) {
        ordersContainer.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-gray-500">No orders found</td>
            </tr>
        `;
        return;
    }

    ordersContainer.innerHTML = ordersToShow.slice(0, 10).map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>$${parseFloat(order.total_amount || 0).toFixed(2)}</td>
            <td><span class="status-${order.status}">${(order.status || 'pending').replace('_', ' ')}</span></td>
            <td>
                <button onclick="viewOrder(${order.id})" class="btn-secondary">View</button>
            </td>
        </tr>
    `).join('');
}

// Load stats
async function loadStats() {
    try {
        console.log('Loading consumer stats...');
        
        // Calculate stats from existing data
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        // Update stats display
        updateStatCard('totalOrders', totalOrders);
        updateStatCard('pendingOrders', pendingOrders);
        updateStatCard('completedOrders', completedOrders);
        updateStatCard('totalSpent', `$${totalSpent.toFixed(2)}`);
        
        console.log('Stats updated successfully');
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Failed to load statistics', 'error');
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// View order details
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showNotification(`Order #${orderId} - Status: ${order.status}`, 'info');
    }
}

// Make functions globally available
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.showCart = showCart;
window.viewOrder = viewOrder;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeConsumerDashboard);

console.log('Consumer dashboard script setup complete');
