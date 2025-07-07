
// Retailer Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    setMinDate();
});

// Set minimum date for delivery date input
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const deliveryDateInput = document.getElementById('deliveryDate');
    deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
}

// Place bulk order
function placeBulkOrder(event) {
    event.preventDefault();
    
    const product = document.getElementById('productSelect').value;
    const quantity = document.getElementById('bulkQuantity').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const budget = document.getElementById('budgetRange').value;
    const requirements = document.getElementById('specialRequirements').value;
    
    // Create order object
    const bulkOrder = {
        id: 'BULK' + Date.now(),
        product: product,
        quantity: quantity,
        deliveryDate: deliveryDate,
        budget: budget,
        requirements: requirements,
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0]
    };
    
    // Save order (in real app, this would go to backend)
    let bulkOrders = JSON.parse(localStorage.getItem('bulkOrders')) || [];
    bulkOrders.push(bulkOrder);
    localStorage.setItem('bulkOrders', JSON.stringify(bulkOrders));
    
    alert('Bulk order placed successfully! You will be contacted by suppliers soon.');
    
    // Reset form
    event.target.reset();
    setMinDate();
}

// Schedule delivery
function scheduleDelivery(event) {
    event.preventDefault();
    
    const orderId = document.getElementById('orderSelect').value;
    const deliveryTime = document.getElementById('deliveryTime').value;
    const address = document.getElementById('deliveryAddress').value;
    
    const delivery = {
        id: 'DEL' + Date.now(),
        orderId: orderId,
        deliveryTime: deliveryTime,
        address: address,
        status: 'scheduled',
        scheduledDate: new Date().toISOString()
    };
    
    // Save delivery schedule (in real app, this would go to backend)
    let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    deliveries.push(delivery);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
    
    alert('Delivery scheduled successfully!');
    
    // Reset form
    event.target.reset();
}

// Load order history
function loadOrderHistory() {
    const bulkOrders = JSON.parse(localStorage.getItem('bulkOrders')) || [];
    const tableBody = document.getElementById('orderHistoryTable');
    
    // Clear existing rows except sample data
    // In a real app, you'd replace all data
    
    bulkOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.product}</td>
            <td>${order.quantity}</td>
            <td>Calculating...</td>
            <td><span class="status-${order.status}">${order.status}</span></td>
            <td>${order.deliveryDate}</td>
            <td>
                <button class="btn-secondary" onclick="viewOrderDetails('${order.id}')">View Details</button>
                <button class="btn-secondary" onclick="reorder('${order.id}')">Reorder</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// View order details
function viewOrderDetails(orderId) {
    alert(`Viewing details for order ${orderId}`);
    // In a real app, this would open a detailed view
}

// Reorder
function reorder(orderId) {
    const bulkOrders = JSON.parse(localStorage.getItem('bulkOrders')) || [];
    const order = bulkOrders.find(o => o.id === orderId);
    
    if (order) {
        // Pre-fill the form with previous order data
        document.getElementById('productSelect').value = order.product;
        document.getElementById('bulkQuantity').value = order.quantity;
        document.getElementById('budgetRange').value = order.budget;
        document.getElementById('specialRequirements').value = order.requirements;
        
        // Scroll to form
        window.scrollTo(0, 0);
        alert('Form pre-filled with previous order details. Please review and submit.');
    }
}

// Call loadOrderHistory when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadOrderHistory();
});
