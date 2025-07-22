// Retailer Dashboard Logic
console.log('Retailer dashboard script loaded');

let currentUser = null;
let products = [];
let orders = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Retailer Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadRetailerData();
    setupEventListeners();
});

// Initialize dashboard with user authentication
async function initDashboard() {
  const user = localStorage.getItem('currentUser');
  if (!user) window.location.href = 'index.html';
  try {
    currentUser = JSON.parse(user);
    console.log('Current user:', currentUser);
  } catch {
    window.location.href = 'index.html';
  }
}

// Setup event listeners
function setupEventListeners() {
  const productSelect = document.getElementById('productSelect');
  if (productSelect) {
    productSelect.addEventListener('change', updateOrderSummary);
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

// Load all retailer data
async function loadRetailerData() {
  try {
    await loadProducts();
    await loadRetailerStats();
    await loadOrderHistory();
    populateProductSelect();
  } catch (error) {
    showNotification('Failed to load dashboard data', 'error');
  }
}

// Load products from API
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response, 'data') || [];
        console.log('Products loaded:', products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Load retailer-specific statistics
async function loadRetailerStats() {
    try {
        const ordersResponse = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(ordersResponse) || [];
        
        // Filter orders for current retailer
        const retailerOrders = ordersList.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        const totalOrders = retailerOrders.length;
        const totalSpent = retailerOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        const pendingDeliveries = retailerOrders.filter(order => 
            ['pending', 'processing', 'confirmed'].includes(order.status)
        ).length;
        
        // Mock active suppliers (replace with actual logic later)
        const activeSuppliers = Math.floor(Math.random() * 10) + 5; // Random number between 5 and 15
        
        // Update stats display with retailer-specific data
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeSuppliers').textContent = activeSuppliers;
        document.getElementById('pendingDeliveries').textContent = pendingDeliveries;
        
    } catch (error) {
        console.error('Error loading retailer stats:', error);
        // Fallback to basic counts
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalSpent').textContent = 'Ksh0';
        document.getElementById('activeSuppliers').textContent = '0';
        document.getElementById('pendingDeliveries').textContent = '0';
    }
}

// Populate product select
function populateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    productSelect.innerHTML = '<option value="">Select Product</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
}

// Update order summary
function updateOrderSummary() {
    const productSelect = document.getElementById('productSelect');
    const bulkQuantity = document.getElementById('bulkQuantity');
    const orderSummary = document.getElementById('orderSummary');
    
    if (!productSelect || !bulkQuantity || !orderSummary) return;
    
    const productId = productSelect.value;
    const quantity = parseInt(bulkQuantity.value);
    
    if (!productId || isNaN(quantity) || quantity < 10) {
        orderSummary.textContent = 'Select a product and quantity to see the total cost.';
        return;
    }
    
    const product = products.find(p => p.id == productId);
    if (!product) {
        orderSummary.textContent = 'Product not found.';
        return;
    }
    
    const totalCost = product.price * quantity;
    orderSummary.textContent = `
        ${product.name} x ${quantity} = Ksh${totalCost.toLocaleString()}
    `;
}

// Place bulk order
async function placeBulkOrder(event) {
    event.preventDefault();
    
    const productSelect = document.getElementById('productSelect');
    const bulkQuantity = document.getElementById('bulkQuantity');
    const deliveryDate = document.getElementById('deliveryDate');
    const budgetRange = document.getElementById('budgetRange');
    const bulkPaymentMethod = document.getElementById('bulkPaymentMethod');
    const specialRequirements = document.getElementById('specialRequirements');
    
    if (!productSelect || !bulkQuantity || !deliveryDate || !budgetRange || !bulkPaymentMethod) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const productId = productSelect.value;
    const quantity = parseInt(bulkQuantity.value);
    
    if (!productId || isNaN(quantity) || quantity < 10) {
        showNotification('Please select a product and enter a quantity of at least 10', 'error');
        return;
    }
    
    const orderData = {
        product_id: productId,
        quantity: quantity,
        delivery_date: deliveryDate.value,
        budget_range: budgetRange.value,
        payment_method: bulkPaymentMethod.value,
        special_requirements: specialRequirements.value
    };
    
    try {
        // const response = await apiClient.createBulkOrder(orderData);
        // console.log('Bulk order created:', response);
        
        showNotification('Bulk order placed successfully!', 'success');
        event.target.reset();
        updateOrderSummary();
        
    } catch (error) {
        console.error('Error placing bulk order:', error);
        showNotification('Failed to place bulk order', 'error');
    }
}

// Schedule delivery
async function scheduleDelivery(event) {
    event.preventDefault();
    
    const orderSelect = document.getElementById('orderSelect');
    const deliveryTime = document.getElementById('deliveryTime');
    const deliveryAddress = document.getElementById('deliveryAddress');
    
    if (!orderSelect || !deliveryTime || !deliveryAddress) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const orderId = orderSelect.value;
    
    const deliveryData = {
        order_id: orderId,
        delivery_time: deliveryTime.value,
        delivery_address: deliveryAddress.value
    };
    
    try {
        // const response = await apiClient.scheduleDelivery(deliveryData);
        // console.log('Delivery scheduled:', response);
        
        showNotification('Delivery scheduled successfully!', 'success');
        event.target.reset();
        
    } catch (error) {
        console.error('Error scheduling delivery:', error);
        showNotification('Failed to schedule delivery', 'error');
    }
}

// Load and display order history with detailed product information
async function loadOrderHistory() {
    try {
        const response = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(response) || [];
        
        // Filter orders for current retailer
        const retailerOrders = ordersList.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        displayOrderHistory(retailerOrders);
        
    } catch (error) {
        console.error('Error loading order history:', error);
        displayOrderHistory([]);
    }
}

function displayOrderHistory(orders) {
    const orderHistoryTable = document.getElementById('orderHistoryTable');
    if (!orderHistoryTable) return;
    
    if (!Array.isArray(orders) || orders.length === 0) {
        orderHistoryTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-500">No bulk orders found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    orderHistoryTable.innerHTML = orders.map(order => `
        <tr>
            <td class="font-mono">#${order.id}</td>
            <td>
                ${order.items ? order.items.map(item => `
                    <div class="text-sm mb-1">
                        <div class="font-medium">${item.name}</div>
                        <div class="text-gray-600">Qty: ${item.quantity}</div>
                    </div>
                `).join('') : '<span class="text-gray-500">No items</span>'}
            </td>
            <td>${order.items ? order.items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0) : 0}</td>
            <td class="font-medium">Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
            <td>
                <span class="status-${order.status || 'pending'}">${(order.status || 'pending').replace('_', ' ')}</span>
            </td>
            <td class="text-sm text-gray-600">${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                ${['pending', 'confirmed'].includes(order.status) ? 
                    `<button class="btn-danger text-sm" onclick="cancelOrder(${order.id})">Cancel</button>` :
                    '<span class="text-gray-400 text-sm">Completed</span>'
                }
            </td>
        </tr>
    `).join('');
}

// Add order cancellation function
function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this bulk order?')) return;
    
    apiClient.cancelOrder(orderId)
        .then(() => {
            showNotification('Order cancelled successfully', 'success');
            loadOrderHistory();
            loadRetailerStats();
        })
        .catch(error => {
            console.error('Error cancelling order:', error);
            showNotification('Failed to cancel order', 'error');
        });
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
window.cancelOrder = cancelOrder;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.showCart = showCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;
window.closeModal = closeModal;
window.logout = logout;
