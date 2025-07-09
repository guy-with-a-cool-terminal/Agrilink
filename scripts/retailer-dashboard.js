
// Retailer Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    setMinDate();
    loadOrderHistory();
    
    // Load API configuration
    const script = document.createElement('script');
    script.src = 'scripts/config.js';
    document.head.appendChild(script);
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
async function placeBulkOrder(event) {
    event.preventDefault();
    
    const product = document.getElementById('productSelect').value;
    const quantity = document.getElementById('bulkQuantity').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const budget = document.getElementById('budgetRange').value;
    const requirements = document.getElementById('specialRequirements').value;
    
    try {
        // Create order data for bulk order
        const orderData = {
            type: 'bulk',
            product_name: product,
            quantity: parseInt(quantity),
            delivery_address: 'Bulk delivery address', // In real app, get from form
            delivery_date: deliveryDate,
            budget: parseFloat(budget),
            special_requirements: requirements,
            total_amount: parseFloat(budget) // Use budget as estimated total
        };
        
        const response = await apiClient.createOrder(orderData);
        console.log('Bulk order created:', response);
        
        alert('Bulk order placed successfully! You will be contacted by suppliers soon.');
        
        // Reset form
        event.target.reset();
        setMinDate();
        
        // Reload order history
        loadOrderHistory();
        
    } catch (error) {
        console.error('Error placing bulk order:', error);
        alert('Failed to place bulk order: ' + error.message);
    }
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

// Load order history from API
async function loadOrderHistory() {
    try {
        const response = await apiClient.getOrders();
        const orders = response.data || response;
        console.log('Orders loaded:', orders);
        
        const tableBody = document.getElementById('orderHistoryTable');
        tableBody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.product_name || 'Mixed items'}</td>
                <td>${order.quantity || 'Various'}</td>
                <td>Ksh${order.total_amount}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary" onclick="viewOrderDetails('${order.id}')">View Details</button>
                    <button class="btn-secondary" onclick="reorder('${order.id}')">Reorder</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading order history:', error);
        alert('Failed to load order history: ' + error.message);
    }
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
