// Logistics Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadDeliveries();
});

// Sample deliveries data
let deliveries = [
    {
        id: 'DEL001',
        orderId: 'ORD001',
        customer: 'John Doe',
        phone: '+91 98765 43210',
        product: 'Tomatoes - 5kg',
        address: '123 Main St, City',
        status: 'assigned',
        priority: 'high'
    },
    {
        id: 'DEL002',
        orderId: 'ORD002',
        customer: 'Jane Smith',
        phone: '+91 87654 32109',
        product: 'Corn - 10kg',
        address: '456 Oak Ave, Town',
        status: 'in_transit',
        priority: 'medium'
    }
];

// Load deliveries into table
function loadDeliveries() {
    const tableBody = document.querySelector('#deliveriesTable');
    tableBody.innerHTML = '';
    
    deliveries.forEach(delivery => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${delivery.id}</td>
            <td>${delivery.product}<br><small>Order #${delivery.orderId}</small></td>
            <td>${delivery.customer}<br><small>${delivery.phone}</small></td>
            <td>${delivery.address}</td>
            <td><span class="status-${delivery.status}">${delivery.status}</span></td>
            <td><span class="priority-${delivery.priority}">${delivery.priority}</span></td>
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
        option.textContent = `${delivery.id} - ${delivery.customer} (${delivery.product})`;
        deliverySelect.appendChild(option);
    });
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
function updateDeliveryStatus(event) {
    event.preventDefault();
    
    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('statusNotes').value;
    
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
        delivery.status = newStatus;
        
        // Create status update record
        const statusUpdate = {
            deliveryId: deliveryId,
            status: newStatus,
            location: location,
            notes: notes,
            timestamp: new Date().toISOString(),
            updatedBy: 'Current User'
        };
        
        // Save status update (in real app, this would go to backend)
        let statusUpdates = JSON.parse(localStorage.getItem('statusUpdates')) || [];
        statusUpdates.push(statusUpdate);
        localStorage.setItem('statusUpdates', JSON.stringify(statusUpdates));
        
        alert(`Delivery ${deliveryId} status updated to: ${newStatus}`);
        
        // Reset form
        event.target.reset();
        loadDeliveries();
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
