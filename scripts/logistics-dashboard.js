// Logistics Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadDeliveries();
    
    // Load API configuration
    const script = document.createElement('script');
    script.src = 'scripts/config.js';
    document.head.appendChild(script);
});

// Deliveries data from API
let deliveries = [];

// Load deliveries from API
async function loadDeliveries() {
    try {
        const response = await apiClient.getDeliveries();
        deliveries = response.data || response;
        console.log('Deliveries loaded:', deliveries);
        
        const tableBody = document.querySelector('#deliveriesTable');
        tableBody.innerHTML = '';
        
        deliveries.forEach(delivery => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${delivery.id}</td>
                <td>${delivery.product_name}<br><small>Order #${delivery.order_id}</small></td>
                <td>${delivery.customer_name}<br><small>${delivery.customer_phone}</small></td>
                <td>${delivery.delivery_address}</td>
                <td><span class="status-${delivery.status}">${delivery.status}</span></td>
                <td><span class="priority-${delivery.priority || 'medium'}">${delivery.priority || 'medium'}</span></td>
                <td>
                    <button class="btn-secondary" onclick="startDelivery('${delivery.id}')">Start</button>
                    <button class="btn-secondary" onclick="viewRoute('${delivery.id}')">Route</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update stats
        document.getElementById('activeDeliveries').textContent = deliveries.filter(d => d.status !== 'delivered').length;
        document.getElementById('completedToday').textContent = Math.floor(Math.random() * 10) + 5;
        document.getElementById('totalDistance').textContent = Math.floor(Math.random() * 300) + 100;
        document.getElementById('efficiency').textContent = Math.floor(Math.random() * 10) + 90 + '%';
        
        // Update delivery select dropdown
        const deliverySelect = document.getElementById('deliverySelect');
        deliverySelect.innerHTML = '<option value="">Select Delivery</option>';
        
        deliveries.forEach(delivery => {
            const option = document.createElement('option');
            option.value = delivery.id;
            option.textContent = `${delivery.id} - ${delivery.customer_name} (${delivery.product_name})`;
            deliverySelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading deliveries:', error);
        alert('Failed to load deliveries: ' + error.message);
    }
}

// Start delivery
function startDelivery(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
        delivery.status = 'in_transit';
        alert(`Started delivery ${deliveryId}. Status updated to "In Transit"`);
        loadDeliveries();
    }
}

// View route
function viewRoute(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
        alert(`Opening route to: ${delivery.address}\n\nIn a real application, this would open an integrated map with turn-by-turn navigation.`);
    }
}

// Update status from table action
function updateStatus(deliveryId) {
    // Pre-select the delivery in the form
    document.getElementById('deliverySelect').value = deliveryId;
    
    // Scroll to update form
    document.querySelector('form[onsubmit="updateDeliveryStatus(event)"]').scrollIntoView({
        behavior: 'smooth'
    });
}

// Contact customer
function contactCustomer(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
        if (confirm(`Call ${delivery.customer} at ${delivery.phone}?`)) {
            // In a real app, this would integrate with phone system
            alert(`Calling ${delivery.phone}...`);
        }
    }
}

// Update delivery status
async function updateDeliveryStatus(event) {
    event.preventDefault();
    
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
        loadDeliveries();
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        alert('Failed to update delivery status: ' + error.message);
    }
}

// Refresh deliveries
function refreshDeliveries() {
    // In a real app, this would fetch fresh data from backend
    alert('Refreshing delivery data...');
    loadDeliveries();
    
    // Update stats (simulated)
    document.getElementById('activeDeliveries').textContent = deliveries.filter(d => d.status !== 'delivered').length;
    document.getElementById('completedToday').textContent = Math.floor(Math.random() * 10) + 5;
}

// Simulate real-time updates
setInterval(() => {
    // Randomly update some delivery statuses (for demo purposes)
    if (Math.random() > 0.9) { // 10% chance every 5 seconds
        const activeDeliveries = deliveries.filter(d => d.status === 'in_transit');
        if (activeDeliveries.length > 0) {
            const randomDelivery = activeDeliveries[Math.floor(Math.random() * activeDeliveries.length)];
            console.log(`Auto-updating delivery ${randomDelivery.id} status`);
        }
    }
}, 5000);
