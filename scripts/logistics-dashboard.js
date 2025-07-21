// Logistics Dashboard JavaScript - Enhanced with Real-time Delivery Tracking

let currentUser = null;
let deliveries = [];
let orders = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Logistics Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadLogisticsData();
    startRealTimeUpdates();
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
        console.log('Current user:', currentUser);
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
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Logistics';
        document.getElementById('userRole').textContent = userData.role || 'Logistics';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Logistics';
    }
}

// Load all logistics data
async function loadLogisticsData() {
    try {
        await Promise.all([
            loadDeliveries(),
            loadOrders(),
            loadLogisticsStats()
        ]);
        displayDeliveries();
        populateDeliverySelect();
        
        // Refresh map after data loads
        if (typeof refreshDeliveryMap === 'function') {
            setTimeout(refreshDeliveryMap, 1000); // Give time for data to be available
        }
        
        console.log('Logistics data loaded successfully');
    } catch (error) {
        console.error('Error loading logistics data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load deliveries
async function loadDeliveries() {
    try {
        const response = await apiClient.getDeliveries();
        deliveries = apiClient.extractArrayData(response) || [];
        console.log('Deliveries loaded:', deliveries);
    } catch (error) {
        console.error('Error loading deliveries:', error);
        showNotification('Failed to load deliveries', 'error');
    }
}

// Load orders for context
async function loadOrders() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response) || [];
        console.log('Orders loaded:', orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load logistics-specific statistics
async function loadLogisticsStats() {
    try {
        // Filter deliveries assigned to current user or available for assignment
        const userDeliveries = deliveries.filter(delivery => 
            !delivery.logistics_user_id || delivery.logistics_user_id == currentUser.id
        );
        
        const activeDeliveries = userDeliveries.filter(delivery => 
            ['pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(delivery.status)
        ).length;
        
        const completedToday = userDeliveries.filter(delivery => {
            const today = new Date().toDateString();
            const deliveryDate = new Date(delivery.updated_at).toDateString();
            return delivery.status === 'delivered' && deliveryDate === today;
        }).length;
        
        // Calculate total distance (simulated for now - will use Google Maps later)
        const totalDistance = userDeliveries.reduce((sum, delivery) => {
            return sum + (delivery.distance || Math.floor(Math.random() * 20) + 5);
        }, 0);
        
        // Calculate efficiency based on completed vs total deliveries
        const completedDeliveries = userDeliveries.filter(d => d.status === 'delivered').length;
        const totalAssigned = userDeliveries.filter(d => d.logistics_user_id == currentUser.id).length;
        const efficiency = totalAssigned > 0 ? Math.round((completedDeliveries / totalAssigned) * 100) : 0;
        
        // Update stats display
        document.getElementById('activeDeliveries').textContent = activeDeliveries;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('totalDistance').textContent = totalDistance;
        document.getElementById('efficiency').textContent = `${efficiency}%`;
        
    } catch (error) {
        console.error('Error loading logistics stats:', error);
        // Fallback values
        document.getElementById('activeDeliveries').textContent = '0';
        document.getElementById('completedToday').textContent = '0';
        document.getElementById('totalDistance').textContent = '0';
        document.getElementById('efficiency').textContent = '0%';
    }
}

// Display deliveries table
function displayDeliveries() {
    const tableBody = document.querySelector('#deliveriesTable');
    if (!tableBody) return;
    
    if (deliveries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-500">
                    No deliveries assigned yet.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = deliveries.map(delivery => {
        const order = orders.find(o => o.id === delivery.order_id);
        const statusClass = getDeliveryStatusClass(delivery.status);
        const priorityClass = getPriorityClass(delivery.priority);
        
        // Get order details
        let orderDetails = 'N/A';
        let customerInfo = 'N/A';
        if (order) {
            if (order.items && order.items.length > 0) {
                orderDetails = order.items.length === 1 
                    ? order.items[0].name || 'Unknown Product'
                    : `${order.items.length} items`;
            }
            customerInfo = order.user?.name || order.customer_name || 'Unknown Customer';
        }
        
        return `
            <tr>
                <td>#${delivery.id}</td>
                <td>${orderDetails}</td>
                <td>${customerInfo}</td>
                <td class="max-w-xs truncate" title="${delivery.delivery_address}">
                    ${delivery.delivery_address || 'Not specified'}
                </td>
                <td><span class="status-badge ${statusClass}">${delivery.status}</span></td>
                <td><span class="priority-badge ${priorityClass}">${delivery.priority || 'medium'}</span></td>
                <td>
                    <button class="btn-primary text-sm mr-2" onclick="updateDeliveryLocation(${delivery.id})">
                        Update Location
                    </button>
                    <button class="btn-secondary text-sm" onclick="viewDeliveryDetails(${delivery.id})">
                        Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status class for styling
function getDeliveryStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'assigned': 'bg-blue-100 text-blue-800',
        'picked_up': 'bg-purple-100 text-purple-800',
        'in_transit': 'bg-orange-100 text-orange-800',
        'out_for_delivery': 'bg-green-100 text-green-800',
        'delivered': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Get priority class for styling
function getPriorityClass(priority) {
    const priorityClasses = {
        'low': 'bg-gray-100 text-gray-800',
        'medium': 'bg-blue-100 text-blue-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
    };
    return priorityClasses[priority] || 'bg-blue-100 text-blue-800';
}

// Populate delivery select for status updates
function populateDeliverySelect() {
    const deliverySelect = document.getElementById('deliverySelect');
    if (!deliverySelect) return;
    
    // Clear existing options
    deliverySelect.innerHTML = '<option value="">Select Delivery</option>';
    
    // Filter deliveries that can be updated
    const updateableDeliveries = deliveries.filter(delivery => 
        !['delivered', 'failed'].includes(delivery.status)
    );
    
    updateableDeliveries.forEach(delivery => {
        const option = document.createElement('option');
        option.value = delivery.id;
        
        const order = orders.find(o => o.id === delivery.order_id);
        const orderInfo = order ? `Order #${order.id}` : `Delivery #${delivery.id}`;
        
        option.textContent = `${orderInfo} - ${delivery.status}`;
        deliverySelect.appendChild(option);
    });
}

// Update delivery status
async function updateDeliveryStatus(event) {
    event.preventDefault();
    
    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('statusNotes').value;
    
    if (!deliveryId || !newStatus) {
        showNotification('Please select delivery and status', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
    
    try {
        const updateData = {
            status: newStatus,
            current_location: location,
            notes: notes,
            updated_at: new Date().toISOString()
        };
        
        const response = await apiClient.updateDeliveryStatus(deliveryId, updateData);
        console.log('Delivery status updated:', response);
        
        showNotification('Delivery status updated successfully!', 'success');
        
        // Reset form
        event.target.reset();
        
        // Reload data and refresh map
        await loadLogisticsData();
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        showNotification('Failed to update delivery status: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Update delivery location
function updateDeliveryLocation(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
        showNotification('Delivery not found', 'error');
        return;
    }
    
    const newLocation = prompt('Enter current location:', delivery.current_location || '');
    if (newLocation === null) return; // User cancelled
    
    // Update delivery location
    updateDeliveryWithLocation(deliveryId, newLocation);
}

// Update delivery with location
async function updateDeliveryWithLocation(deliveryId, location) {
    try {
        const updateData = {
            current_location: location,
            updated_at: new Date().toISOString()
        };
        
        await apiClient.updateDeliveryStatus(deliveryId, updateData);
        showNotification('Location updated successfully!', 'success');
        
        // Reload data and refresh map
        await loadLogisticsData();
        
    } catch (error) {
        console.error('Error updating location:', error);
        showNotification('Failed to update location: ' + error.message, 'error');
    }
}

// View delivery details
function viewDeliveryDetails(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
        showNotification('Delivery not found', 'error');
        return;
    }
    
    const order = orders.find(o => o.id === delivery.order_id);
    
    let details = `Delivery #${delivery.id}\n`;
    details += `Status: ${delivery.status}\n`;
    details += `Priority: ${delivery.priority || 'medium'}\n`;
    details += `Address: ${delivery.delivery_address}\n`;
    
    if (delivery.current_location) {
        details += `Current Location: ${delivery.current_location}\n`;
    }
    
    if (delivery.scheduled_date) {
        details += `Scheduled: ${new Date(delivery.scheduled_date).toLocaleString()}\n`;
    }
    
    if (order) {
        details += `\nOrder Details:\n`;
        details += `Order #${order.id}\n`;
        details += `Customer: ${order.user?.name || 'Unknown'}\n`;
        details += `Total: Ksh${parseFloat(order.total_amount || 0).toFixed(2)}\n`;
        
        if (order.items) {
            details += `Items:\n`;
            order.items.forEach(item => {
                details += `- ${item.name}: ${item.quantity} units\n`;
            });
        }
    }
    
    alert(details);
}

// Refresh deliveries
async function refreshDeliveries() {
    showNotification('Refreshing deliveries...', 'info');
    await loadLogisticsData();
    showNotification('Deliveries refreshed!', 'success');
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update deliveries every 2 minutes
    setInterval(async () => {
        try {
            await loadLogisticsData();
            console.log('Real-time update completed');
        } catch (error) {
            console.error('Real-time update failed:', error);
        }
    }, 120000); // 2 minutes
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Notification system
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

// Make functions globally available
window.updateDeliveryStatus = updateDeliveryStatus;
window.updateDeliveryLocation = updateDeliveryLocation;
window.viewDeliveryDetails = viewDeliveryDetails;
window.refreshDeliveries = refreshDeliveries;
window.logout = logout;
