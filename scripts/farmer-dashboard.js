
// Refactored Farmer Dashboard - Main Coordinator
console.log('Farmer dashboard script loaded');

let currentUser = null;
let farmerProductManager = null;
let farmerStatsManager = null;

// Initialize dashboard
function initializeFarmerDashboard() {
    console.log('Initializing farmer dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'farmer') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    initializeManagers();
    loadDashboardData();
    setupEventListeners();
}

function initializeManagers() {
    farmerProductManager = new FarmerProductManagement(apiClient, currentUser);
    farmerStatsManager = new FarmerStatsManagement(apiClient, currentUser);
    
    // Make managers globally available
    window.farmerProductManager = farmerProductManager;
    window.farmerStatsManager = farmerStatsManager;
}

// Setup event listeners
function setupEventListeners() {
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeModalBtn = document.getElementById('closeModal');
    const addProductForm = document.getElementById('addProductForm');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => farmerProductManager.showAddProductModal());
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => farmerProductManager.closeModal('addProductModal'));
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', (event) => farmerProductManager.handleAddProduct(event));
    }

    // Close modal when clicking outside
    if (addProductModal) {
        addProductModal.addEventListener('click', (e) => {
            if (e.target === addProductModal) {
                addProductModal.classList.remove('active');
            }
        });
    }
}

// Load dashboard data
async function loadDashboardData() {
    const loadingState = document.getElementById('loadingState');
    const productsContainer = document.getElementById('productsContainer');
    const ordersContainer = document.getElementById('ordersContainer');
    
    try {
        // Show loading state
        if (loadingState) loadingState.style.display = 'block';
        if (productsContainer) productsContainer.style.display = 'none';
        if (ordersContainer) ordersContainer.style.display = 'none';
        
        await farmerProductManager.loadProducts();
        await farmerStatsManager.loadFarmerStats();

        // Hide loading state and show content
        if (loadingState) loadingState.style.display = 'none';
        if (productsContainer) productsContainer.style.display = 'block';
        if (ordersContainer) ordersContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        if (loadingState) loadingState.style.display = 'none';
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
window.showAddProductModal = () => farmerProductManager.showAddProductModal();
window.closeModal = (modalId) => farmerProductManager.closeModal(modalId);
window.editProduct = (productId) => farmerProductManager.editProduct(productId);
window.deleteProduct = (productId) => farmerProductManager.deleteProduct(productId);
window.showNotification = showNotification;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFarmerDashboard);

console.log('Farmer dashboard script setup complete');
