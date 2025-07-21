
// Logistics Dashboard Logic
console.log('Logistics dashboard script loaded');

let currentUser = null;
let deliveries = [];

// Initialize dashboard
function initializeLogisticsDashboard() {
    console.log('Initializing logistics dashboard');
    
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
    const updateStatusForm = document.querySelector('form[onsubmit="updateDeliveryStatus(event)"]');
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', updateDeliveryStatus);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadDeliveries(),
            loadLogisticsStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load deliveries
async function loadDeliveries() {
    try {
        console.log('Loading deliveries...');
        const response = await apiClient.getDeliveries();
        deliveries = apiClient.extractArrayData(response) || [];
        console.log('Deliveries loaded:', deliveries);
        
        displayDeliveries(deliveries);
        populateDeliverySelect();
    } catch (error) {
        console.error('Error loading deliveries:', error);
        deliveries = [];
        displayDeliveries([]);
    }
}

// Display deliveries
function displayDeliveries(deliveriesToShow) {
    const deliveriesTableBody = document.querySelector('#deliveriesTable');
    if (!deliveriesTableBody) return;

    deliveriesTableBody.innerHTML = '';

    if (!Array.isArray(deliveriesToShow) || deliveriesToShow.length === 0) {
        deliveriesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">🚚</div>
                    <p class="text-gray-500">No deliveries assigned</p>
                </td>
            </tr>
        `;
        return;
    }

    deliveriesToShow.forEach(delivery => {
        const row = document.createElement('tr');
        const statusClass = getDeliveryStatusClass(delivery.status);
        const priorityClass = getPriorityClass(delivery.priority);
        
        row.innerHTML = `
            <td>#${delivery.id}</td>
            <td>Order #${delivery.order_id}</td>
            <td>${delivery.order?.user?.name || 'Unknown Customer'}</td>
            <td class="max-w-xs truncate">${delivery.delivery_address || 'No address'}</td>
            <td><span class="status-${delivery.status} ${statusClass}">${delivery.status.replace('_', ' ')}</span></td>
            <td><span class="priority-${delivery.priority} ${priorityClass}">${delivery.priority}</span></td>
            <td>
                <button class="btn-primary text-sm" onclick="selectDeliveryForUpdate(${delivery.id})">Update</button>
            </td>
        `;
        deliveriesTableBody.appendChild(row);
    });
}

// Get delivery status class
function getDeliveryStatusClass(status) {
    const statusClasses = {
        'assigned': 'bg-blue-100 text-blue-800',
        'picked_up': 'bg-purple-100 text-purple-800',
        'in_transit': 'bg-orange-100 text-orange-800',
        'out_for_delivery': 'bg-yellow-100 text-yellow-800',
        'delivered': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Get priority class
function getPriorityClass(priority) {
    const priorityClasses = {
        'low': 'bg-gray-100 text-gray-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'high': 'bg-red-100 text-red-800'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-800';
}

// Populate delivery select dropdown
function populateDeliverySelect() {
    const deliverySelect = document.getElementById('deliverySelect');
    if (!deliverySelect) return;

    deliverySelect.innerHTML = '<option value="">Select Delivery</option>';
    
    deliveries.forEach(delivery => {
        const option = document.createElement('option');
        option.value = delivery.id;
        option.textContent = `#${delivery.id} - Order #${delivery.order_id}`;
        deliverySelect.appendChild(option);
    });
}

// Select delivery for update
function selectDeliveryForUpdate(deliveryId) {
    const deliverySelect = document.getElementById('deliverySelect');
    if (deliverySelect) {
        deliverySelect.value = deliveryId;
    }
}

// Update delivery status
async function updateDeliveryStatus(event) {
    event.preventDefault();
    
    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('statusNotes').value;

    if (!deliveryId || !newStatus) {
        showNotification('Please select a delivery and status', 'error');
        return;
    }

    try {
        const updateData = {
            status: newStatus,
            current_location: location,
            notes: notes
        };

        await apiClient.updateDelivery(deliveryId, updateData);
        showNotification('Delivery status updated successfully!', 'success');
        
        // Reset form
        event.target.reset();
        
        // Reload deliveries
        await loadDeliveries();
        await loadLogisticsStats();
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        showNotification('Failed to update delivery status: ' + error.message, 'error');
    }
}

// Load logistics statistics
async function loadLogisticsStats() {
    try {
        const activeDeliveries = deliveries.filter(d => 
            ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)
        ).length;
        
        const completedToday = deliveries.filter(d => {
            const today = new Date().toDateString();
            const deliveryDate = new Date(d.updated_at).toDateString();
            return d.status === 'delivered' && deliveryDate === today;
        }).length;
        
        // Calculate estimated total distance (placeholder)
        const totalDistance = deliveries.length * 15; // Rough estimate
        
        // Calculate efficiency
        const totalDeliveries = deliveries.length;
        const successfulDeliveries = deliveries.filter(d => d.status === 'delivered').length;
        const efficiency = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0;

        // Update stats display
        updateStatCard('activeDeliveries', activeDeliveries);
        updateStatCard('completedToday', completedToday);
        updateStatCard('totalDistance', `${totalDistance}`);
        updateStatCard('efficiency', `${efficiency}`);
        
        console.log('Logistics stats updated');
    } catch (error) {
        console.error('Error loading logistics stats:', error);
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Refresh deliveries
function refreshDeliveries() {
    loadDeliveries();
}

// Refresh delivery map (placeholder)
function refreshDeliveryMap() {
    showNotification('Map refreshed', 'info');
}

// Make functions globally available
window.selectDeliveryForUpdate = selectDeliveryForUpdate;
window.updateDeliveryStatus = updateDeliveryStatus;
window.refreshDeliveries = refreshDeliveries;
window.refreshDeliveryMap = refreshDeliveryMap;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLogisticsDashboard);

console.log('Logistics dashboard script setup complete');

