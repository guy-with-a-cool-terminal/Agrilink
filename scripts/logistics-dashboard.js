// Logistics Dashboard Logic
console.log('Logistics dashboard script loaded');

let currentUser = null;
let deliveries = [];

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
    loadDashboardData();
    setupEventListeners();
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
        updateStatusForm.addEventListener('submit', updateDeliveryStatus);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await loadDeliveries();
        await loadLogisticsStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Enhanced loadDeliveries function to show assigned deliveries
async function loadDeliveries() {
    try {
        const response = await apiClient.getUserDeliveries();
        const deliveriesList = apiClient.extractArrayData(response) || [];
        
        // Filter deliveries assigned to current user or unassigned ones
        const relevantDeliveries = deliveriesList.filter(delivery => 
            !delivery.assigned_to || delivery.assigned_to == currentUser.id
        );
        
        displayDeliveries(relevantDeliveries);
        updateDeliverySelect(relevantDeliveries);
        
    } catch (error) {
        console.error('Error loading deliveries:', error);
        displayDeliveries([]);
    }
}

// Display deliveries in table
function displayDeliveries(deliveriesList) {
    const deliveriesTable = document.getElementById('deliveriesTable');
    if (!deliveriesTable) return;
    
    if (!Array.isArray(deliveriesList) || deliveriesList.length === 0) {
        deliveriesTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-500">No deliveries assigned</p>
                </td>
            </tr>
        `;
        return;
    }
    
    deliveriesTable.innerHTML = deliveriesList.map(delivery => `
        <tr>
            <td class="font-mono">#${delivery.id}</td>
            <td>
                ${delivery.order ? `
                    <div class="text-sm">
                        <div class="font-medium">Order #${delivery.order.id}</div>
                        <div class="text-gray-600">${delivery.order.items?.length || 0} items</div>
                    </div>
                ` : 'No order details'}
            </td>
            <td>${delivery.customer_name || delivery.order?.customer_name || 'Unknown'}</td>
            <td class="text-sm">${delivery.delivery_address || 'Not specified'}</td>
            <td>
                <span class="status-${delivery.status || 'pending'}">${(delivery.status || 'pending').replace('_', ' ')}</span>
            </td>
            <td>
                <span class="priority-${delivery.priority || 'medium'}">${delivery.priority || 'medium'}</span>
            </td>
            <td>
                <div class="flex gap-2">
                    <button class="btn-secondary text-sm" onclick="updateDeliveryStatus('${delivery.id}', 'in_transit')">
                        Start
                    </button>
                    <button class="btn-primary text-sm" onclick="updateDeliveryStatus('${delivery.id}', 'delivered')">
                        Complete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load logistics-specific statistics
async function loadLogisticsStats() {
    try {
        // Fetch deliveries data
        const response = await apiClient.getUserDeliveries();
        const deliveriesList = apiClient.extractArrayData(response) || [];

        // Calculate statistics
        const activeDeliveries = deliveriesList.filter(delivery => delivery.status !== 'delivered').length;
        const completedToday = deliveriesList.filter(delivery => {
            const deliveredDate = new Date(delivery.updated_at).toLocaleDateString();
            const todayDate = new Date().toLocaleDateString();
            return delivery.status === 'delivered' && deliveredDate === todayDate;
        }).length;
        const totalDistance = deliveriesList.reduce((sum, delivery) => sum + (delivery.distance || 0), 0);
        const efficiency = deliveriesList.length > 0 ? ((deliveriesList.filter(delivery => delivery.status === 'delivered').length / deliveriesList.length) * 100).toFixed(2) + '%' : '0%';

        // Update stat cards
        updateStatCard('activeDeliveries', activeDeliveries);
        updateStatCard('completedToday', completedToday);
        updateStatCard('totalDistance', totalDistance);
        updateStatCard('efficiency', efficiency);

    } catch (error) {
        console.error('Error loading logistics stats:', error);
        // Fallback values
        updateStatCard('activeDeliveries', 'N/A');
        updateStatCard('completedToday', 'N/A');
        updateStatCard('totalDistance', 'N/A');
        updateStatCard('efficiency', 'N/A');
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Update delivery status
async function updateDeliveryStatus(event) {
    event.preventDefault();

    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const statusNotes = document.getElementById('statusNotes').value;

    if (!deliveryId || !newStatus) {
        showNotification('Please select delivery and new status', 'warning');
        return;
    }

    try {
        const response = await apiClient.updateDelivery(deliveryId, {
            status: newStatus,
            location: location,
            notes: statusNotes
        });

        console.log('Delivery status updated:', response);
        showNotification('Delivery status updated successfully!', 'success');
        loadDeliveries(); // Refresh deliveries
        loadLogisticsStats(); // Refresh stats
    } catch (error) {
        console.error('Error updating delivery status:', error);
        showNotification('Failed to update delivery status', 'error');
    }
}

// Populate delivery select
function updateDeliverySelect(deliveriesList) {
    const deliverySelect = document.getElementById('deliverySelect');
    if (!deliverySelect) return;

    deliverySelect.innerHTML = '<option value="">Select Delivery</option>';

    deliveriesList.forEach(delivery => {
        const option = document.createElement('option');
        option.value = delivery.id;
        option.textContent = `#${delivery.id} - ${delivery.customer_name || 'Customer'}`;
        deliverySelect.appendChild(option);
    });
}

// Refresh deliveries
function refreshDeliveries() {
    loadDeliveries();
    loadLogisticsStats();
}

// Refresh delivery map (Placeholder function)
function refreshDeliveryMap() {
    showNotification('Refreshing delivery map...', 'info');
    // Implement your map refresh logic here
}

// Make functions globally available
window.updateDeliveryStatus = updateDeliveryStatus;
window.refreshDeliveries = refreshDeliveries;
window.refreshDeliveryMap = refreshDeliveryMap;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLogisticsDashboard);

console.log('Logistics dashboard script setup complete');
