
// Refactored Consumer Dashboard - Main Coordinator
console.log('Consumer dashboard script loaded');

let currentUser = null;
let productManager = null;
let cartManager = null;
let orderManager = null;
let statsManager = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Consumer Dashboard initializing...');
    initDashboard();
    loadUserData();
    initializeManagers();
    loadConsumerData();
    setupEventListeners();
});

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) window.location.href = 'index.html';
    try {
        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);
    } catch {
        window.location.href = 'index.html';
    }
}

// Initialize all managers
function initializeManagers() {
    productManager = new ProductManagement(apiClient);
    cartManager = new CartManagement(apiClient, currentUser);
    orderManager = new OrderManagement(apiClient, currentUser);
    statsManager = new StatsManagement(apiClient, currentUser);
    
    // Make managers globally available
    window.productManager = productManager;
    window.cartManager = cartManager;
    window.orderManager = orderManager;
    window.statsManager = statsManager;
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') productManager.searchProducts();
        });
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => productManager.searchProducts());
    }

    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    if (cartModal) {
        cartModal.addEventListener('click', e => {
            if (e.target === cartModal) closeModal('cartModal');
        });
    }
    if (checkoutModal) {
        checkoutModal.addEventListener('click', e => {
            if (e.target === checkoutModal) closeModal('checkoutModal');
        });
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
        document.getElementById('userName').textContent = currentUser.name || 'Consumer';
    }
}

// Load all consumer data
async function loadConsumerData() {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    try {
        if (loadingState) loadingState.style.display = 'block';
        if (productGrid) productGrid.style.display = 'none';
        
        await Promise.all([
            productManager.loadProducts(), 
            statsManager.loadConsumerStats(), 
            orderManager.loadOrderHistory()
        ]);
        
        if (loadingState) loadingState.style.display = 'none';
        if (productGrid) productGrid.style.display = 'grid';
    } catch {
        showNotification('Failed to load dashboard data', 'error');
        if (loadingState) loadingState.style.display = 'none';
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cartManager.cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    closeModal('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.add('active');
        cartManager.updateCartSummary();
        setupPaymentOptions();
    }
}

// Setup payment options
function setupPaymentOptions() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            showPaymentForm(this.value);
        });
    }
}

// Show payment form based on selection
function showPaymentForm(paymentMethod) {
    const existingForm = document.getElementById('paymentForm');
    if (existingForm) existingForm.remove();
    
    if (!paymentMethod) return;
    
    const checkoutForm = document.querySelector('#checkoutModal form');
    const formContainer = document.createElement('div');
    formContainer.id = 'paymentForm';
    formContainer.className = 'mt-4 p-4 bg-gray-50 rounded-lg';
    
    if (paymentMethod === 'card') {
        formContainer.innerHTML = `
            <h4 class="font-semibold mb-3">Card Payment</h4>
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" placeholder="123" maxlength="3">
                </div>
                <div class="form-group">
                    <label for="cardName">Cardholder Name</label>
                    <input type="text" id="cardName" placeholder="John Doe">
                </div>
            </div>
        `;
    } else if (paymentMethod === 'mpesa') {
        const total = cartManager.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50;
        formContainer.innerHTML = `
            <h4 class="font-semibold mb-3">M-Pesa Payment</h4>
            <div class="space-y-4">
                <div class="form-group">
                    <label for="mpesaPhone">M-Pesa Phone Number</label>
                    <input type="tel" id="mpesaPhone" placeholder="254712345678" required>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h5 class="font-medium text-green-800 mb-2">Payment Instructions:</h5>
                    <ol class="text-sm text-green-700 list-decimal list-inside space-y-1">
                        <li>Enter your M-Pesa registered phone number above</li>
                        <li>You will receive an STK push notification on your phone</li>
                        <li>Enter your M-Pesa PIN to complete the payment</li>
                        <li>You will receive a confirmation SMS from M-Pesa</li>
                    </ol>
                    <div class="mt-3 p-3 bg-green-100 rounded border-l-4 border-green-500">
                        <p class="text-sm font-medium text-green-800">
                            Total Amount: Ksh${total}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    checkoutForm.appendChild(formContainer);
}

// Close modal
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

// Show notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'info' ? 'bg-blue-500 text-white' :
        'bg-gray-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Global function assignments for HTML onclick handlers
window.searchProducts = () => productManager.searchProducts();
window.addToCart = (productId) => cartManager.addToCart(productId);
window.showCart = () => cartManager.showCart();
window.updateCartQuantity = (productId, change) => cartManager.updateCartQuantity(productId, change);
window.removeFromCart = (productId) => cartManager.removeFromCart(productId);
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = (event) => orderManager.placeOrder(event);
window.closeModal = closeModal;
window.logout = logout;
window.refreshOrders = () => {
    orderManager.loadOrderHistory();
    statsManager.loadConsumerStats();
};
window.cancelOrder = (orderId) => orderManager.cancelOrder(orderId);
window.showNotification = showNotification;

console.log('Consumer dashboard script setup complete');
