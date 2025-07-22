// Refactored Retailer Dashboard - Main Coordinator
console.log('Retailer dashboard script loaded');

let currentUser = null;
let retailerProductManager = null;
let retailerOrderManager = null;
let retailerStatsManager = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Retailer Dashboard initializing...');
    initDashboard();
    loadUserData();
    initializeManagers();
    loadRetailerData();
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

function initializeManagers() {
    retailerProductManager = new RetailerProductManagement(apiClient);
    retailerOrderManager = new RetailerOrderManagement(apiClient, currentUser);
    retailerStatsManager = new RetailerStatsManagement(apiClient, currentUser);
    
    // Make managers globally available
    window.retailerProductManager = retailerProductManager;
    window.retailerOrderManager = retailerOrderManager;
    window.retailerStatsManager = retailerStatsManager;
}

// Setup event listeners
function setupEventListeners() {
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.addEventListener('change', () => retailerProductManager.updateOrderSummary());
    }
}

// Load user data and update UI
async function loadUserData() {
    try {
        const userData = await this.apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Retailer';
        document.getElementById('userRole').textContent = userData.role || 'Retailer';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Retailer';
    }
}

// Load all retailer data
async function loadRetailerData() {
    try {
        await retailerProductManager.loadProducts();
        await retailerStatsManager.loadRetailerStats();
        await retailerOrderManager.loadOrderHistory();
        retailerProductManager.populateProductSelect();
    } catch (error) {
        showNotification('Failed to load dashboard data', 'error');
    }
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
window.cancelOrder = (orderId) => retailerOrderManager.cancelOrder(orderId);
window.searchProducts = () => {}; // Placeholder
window.addToCart = () => {}; // Placeholder
window.showCart = () => {}; // Placeholder
window.updateCartQuantity = () => {}; // Placeholder
window.removeFromCart = () => {}; // Placeholder
window.proceedToCheckout = () => {}; // Placeholder
window.placeOrder = (event) => retailerOrderManager.placeBulkOrder(event);
window.closeModal = () => {}; // Placeholder
window.logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
};
window.showNotification = showNotification;

console.log('Retailer dashboard script setup complete');
