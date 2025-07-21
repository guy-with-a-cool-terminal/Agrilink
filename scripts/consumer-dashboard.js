
// Consumer Dashboard Logic
console.log('Consumer dashboard script loaded');

let currentUser = null;
let products = [];
let cart = [];
let orders = [];

// Initialize dashboard
function initializeConsumerDashboard() {
    console.log('Initializing consumer dashboard');
    
    currentUser = checkAuth();
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    loadDashboardData();
}

// Load dashboard data
async function loadDashboardData() {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    
    try {
        if (loadingState) loadingState.style.display = 'block';
        if (productGrid) productGrid.style.display = 'none';
        
        await Promise.all([
            loadProducts(),
            loadUserOrders(),
            loadConsumerStats()
        ]);

        if (loadingState) loadingState.style.display = 'none';
        if (productGrid) productGrid.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Load user's orders
async function loadUserOrders() {
    try {
        console.log('Loading user orders...');
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response) || [];
        console.log('Orders loaded:', orders);
        
        updateOrderHistory();
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
    }
}

// Update order history display
function updateOrderHistory() {
    // This would be used if there's an order history section in the UI
    console.log('User orders:', orders);
}

// Load consumer-specific statistics
async function loadConsumerStats() {
    try {
        // Calculate stats from orders
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
        const activeOrders = orders.filter(order => 
            ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
        ).length;
        
        // Update stats display
        updateStatCard('totalOrders', totalOrders);
        updateStatCard('totalSpent', `Ksh${totalSpent.toFixed(2)}`);
        updateStatCard('activeOrders', activeOrders);
        updateStatCard('favoriteProducts', Math.min(products.length, 5)); // Estimate
        
        console.log('Consumer stats updated');
    } catch (error) {
        console.error('Error loading consumer stats:', error);
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Load products
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response) || [];
        console.log('Products loaded:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
        displayProducts([]);
    }
}

// Display products
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    productGrid.innerHTML = '';

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🛒</div>
                <p class="text-gray-500 text-lg">No products available at the moment</p>
            </div>
        `;
        return;
    }

    // Filter out products with 0 quantity
    const availableProducts = productsToShow.filter(product => 
        product.status === 'active' && (product.quantity || product.stock || 0) > 0
    );

    if (availableProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">📦</div>
                <p class="text-gray-500 text-lg">All products are currently out of stock</p>
            </div>
        `;
        return;
    }

    availableProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <div class="image-placeholder">📦</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name || 'Unnamed Product'}</h3>
                <p class="product-category">${product.category || 'Uncategorized'}</p>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-details">
                    <span class="product-price">Ksh${parseFloat(product.price || 0).toFixed(2)}</span>
                    <span class="product-stock">${product.quantity || product.stock || 0} available</span>
                </div>
                <button class="btn-primary w-full" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.product_id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            product_id: productId,
            quantity: 1,
            product: product
        });
    }

    updateCartUI();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// Show cart
function showCart() {
    const cartModal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    
    if (!cartModal || !cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center py-8 text-gray-500">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="flex justify-between items-center p-4 border-b">
                    <div>
                        <h4 class="font-medium">${item.product.name}</h4>
                        <p class="text-gray-600">Ksh${parseFloat(item.product.price).toFixed(2)} each</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="updateCartQuantity(${item.product_id}, -1)" class="btn-secondary text-sm">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.product_id}, 1)" class="btn-secondary text-sm">+</button>
                        <button onclick="removeFromCart(${item.product_id})" class="btn-danger text-sm ml-2">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateCartSummary();
    cartModal.style.display = 'flex';
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.product_id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    showCart(); // Refresh cart display
    updateCartUI();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.product_id !== productId);
    showCart(); // Refresh cart display
    updateCartUI();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
    const delivery = 50;
    const total = subtotal + delivery;

    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (subtotalElement) subtotalElement.textContent = `Ksh${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `Ksh${total.toFixed(2)}`;
    if (checkoutTotal) checkoutTotal.textContent = `Ksh${total.toFixed(2)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    closeModal('cartModal');
    
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'flex';
        updateCartSummary();
    }
}

// Place order
async function placeOrder(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!deliveryAddress || !phoneNumber || !paymentMethod) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;

    try {
        const orderData = {
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            delivery_address: deliveryAddress,
            payment_method: paymentMethod,
            notes: `Phone: ${phoneNumber}`
        };

        console.log('Placing order:', orderData);
        const response = await apiClient.createOrder(orderData);
        console.log('Order placed successfully:', response);

        showNotification('Order placed successfully!', 'success');
        
        // Clear cart and close modal
        cart = [];
        updateCartUI();
        closeModal('checkoutModal');
        
        // Reset form
        event.target.reset();
        
        // Reload data to show new order and updated products
        await loadDashboardData();

    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!searchInput || !categoryFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter_value = categoryFilter.value;

    let filteredProducts = products;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            (product.name || '').toLowerCase().includes(searchTerm) ||
            (product.description || '').toLowerCase().includes(searchTerm)
        );
    }

    if (categoryFilter_value) {
        filteredProducts = filteredProducts.filter(product =>
            product.category === categoryFilter_value
        );
    }

    displayProducts(filteredProducts);
}

// Make functions globally available
window.showCart = showCart;
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.searchProducts = searchProducts;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeConsumerDashboard);

console.log('Consumer dashboard script setup complete');
