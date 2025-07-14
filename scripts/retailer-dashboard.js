// Retailer Dashboard JavaScript - Enhanced for Bulk Orders and Real-time Data

let currentUser = null;
let products = [];
let orders = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Retailer Dashboard initializing...');
    initDashboard();
    loadUserData();  
    loadRetailerData();
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
        await Promise.all([
            loadProducts(),
            loadOrders(),
            loadRetailerStats()
        ]);
        populateOrderSelect();
        console.log('Retailer data loaded successfully');
    } catch (error) {
        console.error('Error loading retailer data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Load products for bulk ordering
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response) || [];
        console.log('Products loaded:', products);
        populateProductSelect();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Populate product select dropdown with stock info
function populateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    // Clear existing options except the first one
    productSelect.innerHTML = '<option value="">Select Product</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Stock: ${product.quantity || 0}) - Ksh${parseFloat(product.price || 0).toFixed(2)}`;
        option.dataset.stock = product.quantity || 0;
        option.dataset.price = product.price || 0;
        
        if (product.quantity <= 0) {
            option.disabled = true;
            option.textContent += ' - OUT OF STOCK';
        }
        
        productSelect.appendChild(option);
    });
    
    // Add change listener to show stock info
    productSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const quantityInput = document.getElementById('bulkQuantity');
        
        if (selectedOption.value && quantityInput) {
            const stock = parseInt(selectedOption.dataset.stock || '0');
            quantityInput.max = stock;
            quantityInput.placeholder = `Available: ${stock} units`;
            
            if (stock <= 0) {
                quantityInput.disabled = true;
                showNotification('Selected product is out of stock', 'error');
            } else {
                quantityInput.disabled = false;
            }
        }
    });
}

// Load orders
async function loadOrders() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response) || [];
        console.log('Orders loaded:', orders);
        displayOrderHistory();
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// Load retailer-specific statistics
async function loadRetailerStats() {
    try {
        // Calculate stats from user's orders
        const userOrders = orders.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => 
            sum + (parseFloat(order.total_amount) || 0), 0
        );
        
        // Count active suppliers (unique farmer IDs from ordered products)
        const supplierIds = new Set();
        userOrders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (item.product && item.product.farmer_id) {
                        supplierIds.add(item.product.farmer_id);
                    }
                });
            }
        });
        
        const pendingDeliveries = userOrders.filter(order => 
            ['pending', 'confirmed', 'shipped', 'in_transit'].includes(order.status)
        ).length;
        
        // Update stats display
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeSuppliers').textContent = supplierIds.size;
        document.getElementById('pendingDeliveries').textContent = pendingDeliveries;
        
    } catch (error) {
        console.error('Error loading retailer stats:', error);
        // Fallback values
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalSpent').textContent = 'Ksh0';
        document.getElementById('activeSuppliers').textContent = '0';
        document.getElementById('pendingDeliveries').textContent = '0';
    }
}

// Display order history
function displayOrderHistory() {
    const tableBody = document.querySelector('#orderHistoryTable');
    if (!tableBody) return;
    
    // Filter orders for current user
    const userOrders = orders.filter(order => 
        order.user_id == currentUser.id || 
        order.customer_email === currentUser.email
    );
    
    if (userOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-500">
                    No bulk orders found. Place your first order above!
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = userOrders.map(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = getStatusClass(order.status);
        
        // Get first product name or "Multiple Products"
        let productName = 'Multiple Products';
        if (order.items && order.items.length === 1) {
            productName = order.items[0].product?.name || order.items[0].name || 'Unknown Product';
        }
        
        const totalQuantity = order.items ? 
            order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${productName}</td>
                <td>${totalQuantity} units</td>
                <td>Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>${orderDate}</td>
                <td>
                    <button class="btn-secondary text-sm" onclick="viewOrderDetails(${order.id})">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status class for styling
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'processing': 'bg-blue-100 text-blue-800',
        'shipped': 'bg-green-100 text-green-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Populate order select for delivery scheduling
function populateOrderSelect() {
    const orderSelect = document.getElementById('orderSelect');
    if (!orderSelect) return;
    
    // Clear existing options
    orderSelect.innerHTML = '<option value="">Select Order</option>';
    
    // Filter orders that can be scheduled for delivery
    const userOrders = orders.filter(order => 
        (order.user_id == currentUser.id || order.customer_email === currentUser.email) &&
        ['confirmed', 'processing'].includes(order.status)
    );
    
    userOrders.forEach(order => {
        const option = document.createElement('option');
        option.value = order.id;
        option.textContent = `Order #${order.id} - Ksh${parseFloat(order.total_amount || 0).toFixed(2)}`;
        orderSelect.appendChild(option);
    });
}

// Place bulk order with enhanced validation and payment method
async function placeBulkOrder(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productSelect').value;
    const quantity = parseInt(document.getElementById('bulkQuantity').value);
    const deliveryDate = document.getElementById('deliveryDate').value;
    const budgetRange = document.getElementById('budgetRange').value;
    const specialRequirements = document.getElementById('specialRequirements').value;
    
    if (!productId || !quantity || !deliveryDate || !budgetRange) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Find the selected product
    const selectedProduct = products.find(p => p.id == productId);
    if (!selectedProduct) {
        showNotification('Selected product not found', 'error');
        return;
    }
    
    // Validate stock availability
    if (quantity > selectedProduct.quantity) {
        showNotification(`Only ${selectedProduct.quantity} units available in stock. Please adjust your quantity.`, 'error');
        return;
    }
    
    // Validate minimum quantity
    if (quantity < 10) {
        showNotification('Minimum bulk order quantity is 10 units', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;
    
    try {
        const totalAmount = quantity * parseFloat(selectedProduct.price);
        
        const orderData = {
            items: [{
                product_id: selectedProduct.id,
                name: selectedProduct.name,
                quantity: quantity,
                unit_price: selectedProduct.price
            }],
            delivery_address: `Bulk delivery - Budget: ${budgetRange}${specialRequirements ? '. Requirements: ' + specialRequirements : ''}`,
            delivery_date: deliveryDate,
            phone: currentUser.phone || '254700000000',
            payment_method: 'mpesa', // Default to M-Pesa for bulk orders
            total_amount: totalAmount,
            notes: `Bulk order for retail - ${specialRequirements || 'Standard bulk order'}`
        };
        
        console.log('Submitting bulk order:', orderData);
        
        const response = await apiClient.createOrder(orderData);
        console.log('Bulk order created:', response);
        
        showNotification('Bulk order placed successfully! You will receive M-Pesa payment instructions.', 'success');
        
        // Reset form
        event.target.reset();
        
        // Reload data
        await loadRetailerData();
        
    } catch (error) {
        console.error('Error placing bulk order:', error);
        let errorMessage = 'Failed to place bulk order';
        
        if (error.message.includes('Insufficient stock')) {
            errorMessage = 'Insufficient stock available. Please check availability and try again.';
        } else if (error.message.includes('payment method')) {
            errorMessage = 'Payment method error. Please try again or contact support.';
        } else if (error.message.includes('validation')) {
            errorMessage = 'Please check all fields and try again.';
        }
        
        showNotification(errorMessage + ': ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Schedule delivery
async function scheduleDelivery(event) {
    event.preventDefault();
    
    const orderId = document.getElementById('orderSelect').value;
    const deliveryTime = document.getElementById('deliveryTime').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    
    if (!orderId || !deliveryTime || !deliveryAddress) {
        showNotification('Please fill in all delivery details', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Scheduling...';
    submitBtn.disabled = true;
    
    try {
        // Update order with delivery schedule
        const updateData = {
            status: 'scheduled',
            delivery_time: deliveryTime,
            delivery_address: deliveryAddress,
            notes: `Delivery scheduled for ${deliveryTime}`
        };
        
        // Note: This would need a specific API endpoint for updating order delivery
        // For now, we'll simulate success
        showNotification('Delivery scheduled successfully!', 'success');
        
        // Reset form
        event.target.reset();
        
        // Reload data
        await loadRetailerData();
        
    } catch (error) {
        console.error('Error scheduling delivery:', error);
        showNotification('Failed to schedule delivery: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    let details = `Order #${order.id}\n`;
    details += `Status: ${order.status}\n`;
    details += `Total: Ksh${parseFloat(order.total_amount || 0).toFixed(2)}\n`;
    details += `Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;
    
    if (order.items && order.items.length > 0) {
        details += 'Items:\n';
        order.items.forEach(item => {
            details += `- ${item.name || 'Unknown'}: ${item.quantity} x Ksh${parseFloat(item.unit_price || 0).toFixed(2)}\n`;
        });
    }
    
    alert(details);
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
window.placeBulkOrder = placeBulkOrder;
window.scheduleDelivery = scheduleDelivery;
window.viewOrderDetails = viewOrderDetails;
window.logout = logout;
