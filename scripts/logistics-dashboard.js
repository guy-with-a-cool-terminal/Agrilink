
// Logistics Dashboard JavaScript - Fixed Data Handling

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Logistics Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadDeliveries();
    loadLogisticsStats();
});

// Data storage
let deliveries = [];
let currentUser = null;

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
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Logistics Manager';
        document.getElementById('userRole').textContent = userData.role || 'Logistics';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Logistics Manager';
    }
}

// Load logistics statistics
async function loadLogisticsStats() {
    try {
        const deliveriesResponse = await apiClient.getDeliveries();
        const deliveriesList = apiClient.extractArrayData(deliveriesResponse);
        
        const activeDeliveries = deliveriesList.filter(d => 
            d.status !== 'delivered' && d.status !== 'cancelled'
        ).length;
        
        const completedToday = deliveriesList.filter(d => {
            const deliveryDate = new Date(d.updated_at || d.created_at);
            const today = new Date();
            return deliveryDate.toDateString() === today.toDateString() && d.status === 'delivered';
        }).length;
        
        // Update stats display
        document.getElementById('activeDeliveries').textContent = activeDeliveries;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('totalDistance').textContent = Math.floor(Math.random() * 300) + 100;
        document.getElementById('efficiency').textContent = Math.floor(Math.random() * 10) + 90 + '%';
        
    } catch (error) {
        console.error('Error loading logistics stats:', error);
    }
}

// Load deliveries from API
async function loadDeliveries() {
    try {
        const response = await apiClient.getDeliveries();
        deliveries = apiClient.extractArrayData(response);
        console.log('Deliveries loaded:', deliveries);
        
        const tableBody = document.querySelector('#deliveriesTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (deliveries.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">🚚</div>
                        <p class="text-gray-600">No deliveries assigned yet.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        deliveries.forEach(delivery => {
            const row = document.createElement('tr');
            const priorityClass = delivery.priority === 'high' ? 'priority-high' : 
                                 delivery.priority === 'low' ? 'priority-low' : 'priority-medium';
            
            row.innerHTML = `
                <td class="font-medium">#${delivery.id}</td>
                <td>
                    <div class="font-medium">${delivery.product_name || 'Order items'}</div>
                    <div class="text-sm text-gray-500">Order #${delivery.order_id}</div>
                </td>
                <td>
                    <div class="font-medium">${delivery.customer_name || 'Customer'}</div>
                    <div class="text-sm text-gray-500">${delivery.customer_phone || 'No phone'}</div>
                </td>
                <td class="text-sm">${delivery.delivery_address || 'Address not provided'}</td>
                <td><span class="status-${delivery.status}">${delivery.status}</span></td>
                <td><span class="${priorityClass}">${delivery.priority || 'medium'}</span></td>
                <td>
                    <div class="flex space-x-2">
                        ${delivery.status === 'assigned' ? 
                            `<button class="btn-primary text-sm" onclick="startDelivery('${delivery.id}')">Start</button>` :
                            `<button class="btn-secondary text-sm" onclick="updateStatus('${delivery.id}')">Update</button>`
                        }
                        <button class="btn-secondary text-sm" onclick="viewRoute('${delivery.id}')">Route</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update delivery select dropdown
        const deliverySelect = document.getElementById('deliverySelect');
        if (deliverySelect) {
            deliverySelect.innerHTML = '<option value="">Select Delivery</option>';
            deliveries.forEach(delivery => {
                const option = document.createElement('option');
                option.value = delivery.id;
                option.textContent = `${delivery.id} - ${delivery.customer_name || 'Customer'} (${delivery.product_name || 'Items'})`;
                deliverySelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading deliveries:', error);
        const tableBody = document.querySelector('#deliveriesTable');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-red-400 text-4xl mb-4">⚠️</div>
                        <p class="text-gray-600 mb-4">Failed to load deliveries. Please try again.</p>
                        <button class="btn-primary" onclick="loadDeliveries()">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Start delivery
async function startDelivery(deliveryId) {
    try {
        await apiClient.updateDeliveryStatus(deliveryId, { status: 'in_transit' });
        console.log('Started delivery:', deliveryId);
        
        alert(`Started delivery ${deliveryId}. Status updated to "In Transit"`);
        await Promise.all([loadDeliveries(), loadLogisticsStats()]);
        
    } catch (error) {
        console.error('Error starting delivery:', error);
        alert('Failed to start delivery: ' + error.message);
    }
}

// View route
function viewRoute(deliveryId) {
    const delivery = deliveries.find(d => d.id == deliveryId);
    if (delivery) {
        alert(`Opening route to: ${delivery.delivery_address}\n\nIn a real application, this would open an integrated map with turn-by-turn navigation.`);
    } else {
        alert('Delivery not found.');
    }
}

// Update status from table action
function updateStatus(deliveryId) {
    // Pre-select the delivery in the form
    const deliverySelect = document.getElementById('deliverySelect');
    if (deliverySelect) {
        deliverySelect.value = deliveryId;
    }
    
    // Scroll to update form
    const updateForm = document.querySelector('form[onsubmit="updateDeliveryStatus(event)"]');
    if (updateForm) {
        updateForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update delivery status
async function updateDeliveryStatus(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
    
    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('statusNotes').value;
    
    try {
        const statusData = {
            status: newStatus,
            location: location,
            notes: notes
        };
        
        await apiClient.updateDeliveryStatus(deliveryId, statusData);
        console.log('Delivery status updated:', deliveryId, newStatus);
        
        alert(`Delivery ${deliveryId} status updated to: ${newStatus}`);
        
        // Reset form
        event.target.reset();
        await Promise.all([loadDeliveries(), loadLogisticsStats()]);
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        alert('Failed to update delivery status: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Refresh deliveries
async function refreshDeliveries() {
    alert('Refreshing delivery data...');
    await Promise.all([loadDeliveries(), loadLogisticsStats()]);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
