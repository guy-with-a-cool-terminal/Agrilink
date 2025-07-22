
// Refactored Logistics Dashboard - Main Coordinator
console.log('Logistics dashboard script loaded');

let currentUser = null;
let deliveryManager = null;
let logisticsStatsManager = null;

// Initialize dashboard
function initializeLogisticsDashboard() {
    console.log('Initializing logistics dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'logistics') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    initializeManagers();
    loadDashboardData();
    setupEventListeners();
}

function initializeManagers() {
    deliveryManager = new DeliveryManagement(apiClient, currentUser);
    logisticsStatsManager = new LogisticsStatsManagement(apiClient);
    
    // Make managers globally available
    window.deliveryManager = deliveryManager;
    window.logisticsStatsManager = logisticsStatsManager;
}

// Setup event listeners
function setupEventListeners() {
    const deliverySelect = document.getElementById('deliverySelect');
    const newStatusSelect = document.getElementById('newStatus');
    const updateStatusForm = document.querySelector('form');

    if (deliverySelect) {
        deliverySelect.addEventListener('change', () => {
            // You can add additional logic here if needed
        });
    }

    if (newStatusSelect) {
        newStatusSelect.addEventListener('change', () => {
            // You can add additional logic here if needed
        });
    }

    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', (event) => deliveryManager.updateDeliveryStatus(null, null, event));
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await deliveryManager.loadDeliveries();
        await logisticsStatsManager.loadLogisticsStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
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
window.updateDeliveryStatus = (deliveryId, status) => deliveryManager.updateDeliveryStatus(deliveryId, status);
window.refreshDeliveries = () => deliveryManager.refreshDeliveries();
window.refreshDeliveryMap = () => deliveryManager.refreshDeliveryMap();
window.showNotification = showNotification;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLogisticsDashboard);

console.log('Logistics dashboard script setup complete');
