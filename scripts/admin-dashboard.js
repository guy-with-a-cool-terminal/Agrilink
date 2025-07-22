
// Refactored Admin Dashboard - Main Coordinator
console.log('Admin dashboard script loaded');

// Data storage and instances
let currentUser = null;
let maintenanceMode = false;
let userManager = null;
let orderManager = null;
let analytics = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    initDashboard();
    loadUserData();
    initializeManagers();
    loadAllData();
});

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    try {
        currentUser = JSON.parse(user);
        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }
        await checkMaintenanceStatus();
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
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Admin';
        document.getElementById('userRole').textContent = userData.role || 'Admin';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Admin';
    }
}

// Initialize all managers
function initializeManagers() {
    userManager = new UserManagement(apiClient);
    orderManager = new OrderManagement(apiClient);
    analytics = new Analytics(apiClient);
    
    // Make managers globally available
    window.userManager = userManager;
    window.orderManager = orderManager;
    window.analytics = analytics;
}

// Load all dashboard data
async function loadAllData() {
    try {
        await Promise.all([
            analytics.loadRealTimeAnalytics(),
            userManager.loadUsers(),
            orderManager.loadOrders(),
            loadProducts()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load some dashboard data', 'error');
    }
}

// Load products with real inventory data
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        const products = apiClient.extractArrayData(response);
        console.log('Products loaded:', products);
        
        // Update product analytics
        analytics.updateProductAnalytics(products);
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Maintenance mode functionality
async function toggleMaintenanceMode() {
    try {
        const action = maintenanceMode ? 'disable' : 'enable';
        if (action === 'enable') {
            await apiClient.enableMaintenanceMode();
            showNotification('Maintenance mode enabled.', 'info');
        } else {
            await apiClient.disableMaintenanceMode();
            showNotification('Maintenance mode disabled.', 'success');
        }

        maintenanceMode = !maintenanceMode;
        updateMaintenanceButton();
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

async function checkMaintenanceStatus() {
    try {
        const status = await apiClient.getMaintenanceStatus();
        maintenanceMode = !!status.maintenance;
        updateMaintenanceButton();
    } catch (error) {
        console.error('Could not fetch maintenance status:', error);
    }
}

function updateMaintenanceButton() {
    const btn = document.getElementById('maintenanceToggle');
    if (!btn) return;
    btn.textContent = maintenanceMode ? '🔧 Disable Maintenance' : '🔧 Enable Maintenance';
    btn.className = maintenanceMode ? 'btn-primary' : 'btn-secondary';
}

// Refresh all data
async function refreshData() {
    try {
        await loadAllData();
        showNotification('System Data refreshed with latest information!', 'success');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Failed to refresh System Data!', 'error');
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

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Global function assignments for HTML onclick handlers
window.showCreateUserModal = () => userManager.showCreateUserModal();
window.editUser = (userId) => userManager.editUser(userId);
window.closeUserModal = () => userManager.closeUserModal();
window.viewUserDetails = (userId) => userManager.viewUserDetails(userId);
window.toggleUserStatus = (userId, isActive) => userManager.toggleUserStatus(userId, isActive);
window.deleteUser = (userId) => userManager.deleteUser(userId);
window.toggleMaintenanceMode = toggleMaintenanceMode;
window.viewOrderDetails = (orderId) => orderManager.viewOrderDetails(orderId);
window.updateOrderStatus = (orderId) => orderManager.updateOrderStatus(orderId);
window.refreshData = refreshData;
window.loadUsers = () => userManager.loadUsers();
window.logout = logout;
window.showNotification = showNotification;

console.log('Admin dashboard script setup complete');
