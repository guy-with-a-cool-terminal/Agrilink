
// Retailer Dashboard JavaScript - Fixed Data Handling

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Retailer Dashboard initializing...');
    initDashboard();
    loadUserData();
    setMinDate();
    loadOrderHistory();
    loadRetailerStats();
});

// Data storage
let orders = [];
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
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Retailer';
        document.getElementById('userRole').textContent = userData.role || 'Retailer';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Retailer';
    }
}

// Load retailer statistics
async function loadRetailerStats() {
    try {
        const ordersResponse = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(ordersResponse);
        
        const totalOrders = ordersList.length;
        const totalSpent = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const pendingDeliveries = ordersList.filter(order => 
            order.status === 'pending' || order.status === 'processing' || order.status === 'in_transit'
        ).length;
        
        // Update stats display
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeSuppliers').textContent = Math.floor(totalOrders / 2) + 5; // Simulated
        document.getElementById('pendingDeliveries').textContent = pendingDeliveries;
        
    } catch (error) {
        console.error('Error loading retailer stats:', error);
    }
}

// Set minimum date for delivery date input
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// Place bulk order - Fixed to include items array
async function placeBulkOrder(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;
    
    const productName = document.getElementById('productSelect').value;
    const quantity = parseInt(document.getElementById('bulkQuantity').value);
    const budgetValue = document.getElementById('budgetRange').value;
    
    // Extract budget amount
    let budgetAmount = 0;
    if (budgetValue.includes('-')) {
        budgetAmount = parseFloat(budgetValue.split('-')[1]);
    } else {
        budgetAmount = parseFloat(budgetValue.replace('Ksh', '').replace('+', ''));
    }
    
    // Fixed: Include items array to prevent "At least one item is required" error
    const orderData = {
        type: 'bulk',
        items: [
            {
                name: productName,
                quantity: quantity,
                unit_price: budgetAmount / quantity
            }
        ],
        product_name: productName,
        quantity: quantity,
        delivery_address: 'Bulk delivery address',
        delivery_date: document.getElementById('deliveryDate').value,
        budget: budgetAmount,
        special_requirements: document.getElementById('specialRequirements').value,
        total_amount: budgetAmount,
        status: 'pending'
    };
    
    try {
        const response = await apiClient.createOrder(orderData);
        console.log('Bulk order created:', response);
        
        alert('Bulk order placed successfully! You will be contacted by suppliers soon.');
        
        // Reset form
        event.target.reset();
        setMinDate();
        
        // Reload order history and stats
        await Promise.all([loadOrderHistory(), loadRetailerStats()]);
        
    } catch (error) {
        console.error('Error placing bulk order:', error);
        alert('Failed to place bulk order: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
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
        orders = apiClient.extractArrayData(response);
        console.log('Orders loaded:', orders);
        
        const tableBody = document.getElementById('orderHistoryTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-600">No bulk orders yet. Place your first order above!</p>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.created_at).toLocaleDateString();
            
            row.innerHTML = `
                <td class="font-medium">#${order.id}</td>
                <td>
                    <div class="font-medium">${order.product_name || 'Mixed items'}</div>
                    <div class="text-sm text-gray-500">${order.type || 'Standard'} order</div>
                </td>
                <td>${order.quantity || 'Various'}</td>
                <td class="font-medium">Ksh${(order.total_amount || 0).toLocaleString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="text-sm text-gray-500">${orderDate}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="viewOrderDetails('${order.id}')">View Details</button>
                        <button class="btn-secondary text-sm" onclick="reorder('${order.id}')">Reorder</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update order select dropdown
        const orderSelect = document.getElementById('orderSelect');
        if (orderSelect) {
            orderSelect.innerHTML = '<option value="">Select Order</option>';
            orders.forEach(order => {
                const option = document.createElement('option');
                option.value = order.id;
                option.textContent = `Order #${order.id} - ${order.product_name || 'Mixed items'}`;
                orderSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading order history:', error);
        const tableBody = document.getElementById('orderHistoryTable');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-red-400 text-4xl mb-4">⚠️</div>
                        <p class="text-gray-600 mb-4">Failed to load order history. Please try again.</p>
                        <button class="btn-primary" onclick="loadOrderHistory()">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (order) {
        const details = `
Order ID: ${order.id}
Product: ${order.product_name || 'Mixed items'}
Quantity: ${order.quantity || 'Various'}
Amount: Ksh${(order.total_amount || 0).toLocaleString()}
Status: ${order.status}
Date: ${new Date(order.created_at).toLocaleDateString()}
${order.special_requirements ? 'Requirements: ' + order.special_requirements : ''}
        `;
        alert(details);
    } else {
        alert(`Order details not found for order ${orderId}`);
    }
}

// Reorder
function reorder(orderId) {
    const order = orders.find(o => o.id == orderId);
    
    if (order) {
        // Pre-fill the form with previous order data
        const productSelect = document.getElementById('productSelect');
        const quantityInput = document.getElementById('bulkQuantity');
        const requirementsTextarea = document.getElementById('specialRequirements');
        
        if (productSelect) productSelect.value = order.product_name || '';
        if (quantityInput) quantityInput.value = order.quantity || '';
        if (requirementsTextarea) requirementsTextarea.value = order.special_requirements || '';
        
        // Scroll to form
        window.scrollTo(0, 0);
        alert('Form pre-filled with previous order details. Please review and submit.');
    } else {
        alert('Order not found for reorder.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
