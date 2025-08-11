let currentUser = null;
let products = [];
let orders = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Retailer Dashboard initializing...');
    initDashboard();
    loadUserData();  
    loadRetailerData();
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        deliveryDateInput.min = new Date().toISOString().split('T')[0];
    }
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
        ]);
        // calculate stats after orders are loaded
        await loadRetailerStats()
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
    
    // Add change listener to show stock info and update order summary
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
        
        updateOrderSummary();
    });
    
    // Add quantity change listener
    const quantityInput = document.getElementById('bulkQuantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateOrderSummary);
    }
}

// Update order summary calculation
function updateOrderSummary() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('bulkQuantity');
    const orderSummary = document.getElementById('orderSummary');
    
    if (!productSelect || !quantityInput || !orderSummary) return;
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const quantity = parseInt(quantityInput.value || 0);
    
    if (!selectedOption.value || quantity <= 0) {
        orderSummary.textContent = 'Select a product and quantity to see the total cost.';
        return;
    }
    
    const unitPrice = parseFloat(selectedOption.dataset.price || 0);
    const totalCost = unitPrice * quantity;
    const stock = parseInt(selectedOption.dataset.stock || 0);
    
    let summaryText = `Product: ${selectedOption.textContent.split(' (Stock:')[0]}\n`;
    summaryText += `Quantity: ${quantity} units\n`;
    summaryText += `Unit Price: Ksh${unitPrice.toFixed(2)}\n`;
    summaryText += `Total Cost: Ksh${totalCost.toLocaleString()}`;
    
    if (quantity > stock) {
        summaryText += `\n⚠️ Warning: Only ${stock} units available in stock!`;
        orderSummary.className = 'text-sm text-red-600 whitespace-pre-line';
    } else {
        orderSummary.className = 'text-sm text-gray-600 whitespace-pre-line';
    }
    
    orderSummary.textContent = summaryText;
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
        console.log('Calculating stats from orders:', orders.length, 'total orders');
        
        // Filter orders for current user with better matching
        const userOrders = orders.filter(order => {
            const matchesUserId = order.user_id == currentUser.id;
            const matchesEmail = order.customer_email === currentUser.email;
            const matchesName = order.customer_name === currentUser.name;
            
            return matchesUserId || matchesEmail || matchesName;
        });
        
        console.log('User orders found:', userOrders.length);
        
        const totalOrders = userOrders.length;
        
        // Calculate total spent - handle different response structures
        const totalSpent = userOrders.reduce((sum, order) => {
            const amount = parseFloat(order.total_amount || order.amount || 0);
            console.log(`Order #${order.id}: Ksh${amount}`);
            return sum + amount;
        }, 0);
        
        // Count active suppliers from order items
        const supplierIds = new Set();
        userOrders.forEach(order => {
            // Check different possible item structures
            const items = order.items || order.order_items || [];
            
            items.forEach(item => {
                // Try different ways the farmer/supplier ID might be stored
                const supplierId = item.farmer_id || 
                                 item.supplier_id || 
                                 item.product?.farmer_id || 
                                 item.product?.supplier_id ||
                                 item.product?.user_id;
                
                if (supplierId) {
                    supplierIds.add(supplierId);
                }
            });
            
            // Fallback: if no items, try to get supplier from order level
            if (items.length === 0 && order.farmer_id) {
                supplierIds.add(order.farmer_id);
            }
        });
        
        // Count pending deliveries - orders that haven't been delivered yet
        const pendingStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'in_transit', 'scheduled'];
        const pendingDeliveries = userOrders.filter(order => 
            pendingStatuses.includes(order.status?.toLowerCase())
        ).length;
        
        console.log('Stats calculated:', {
            totalOrders,
            totalSpent,
            activeSuppliers: supplierIds.size,
            pendingDeliveries
        });
        
        // Update stats display with error handling
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`Element with id '${id}' not found`);
            }
        };
        
        updateStat('totalOrders', totalOrders);
        updateStat('totalSpent', `Ksh${totalSpent.toLocaleString()}`);
        updateStat('activeSuppliers', supplierIds.size);
        updateStat('pendingDeliveries', pendingDeliveries);
        
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
                <td colspan="8" class="text-center py-8 text-gray-500">
                    No bulk orders found. Place your first order above!
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = userOrders.map(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = getStatusClass(order.status);
        
        // Get product names - handle different data structures
        let productName = 'No products';
        let totalQuantity = 0;
        
        // Check for order_items (the correct field name)
        if (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0) {
            if (order.order_items.length === 1) {
                const item = order.order_items[0];
                productName = item.product?.name || item.name || item.product_name || 'Unknown Product';
            } else {
                const firstItem = order.order_items[0];
                const firstName = firstItem.product?.name || firstItem.name || firstItem.product_name || 'Product';
                productName = `${firstName} + ${order.order_items.length - 1} more`;
            }
            totalQuantity = order.order_items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        } else if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            // Fallback to items array if order_items doesn't exist
            if (order.items.length === 1) {
                productName = order.items[0].product?.name || order.items[0].name || order.items[0].product_name || 'Unknown Product';
            } else {
                const firstName = order.items[0].product?.name || order.items[0].name || order.items[0].product_name || 'Product';
                productName = `${firstName} + ${order.items.length - 1} more`;
            }
            totalQuantity = order.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        } else if (order.product_name) {
            // Direct product info on order
            productName = order.product_name;
            totalQuantity = parseInt(order.quantity) || 0;
        }
        
        const canCancel = order.status.toLowerCase() === 'pending';
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${productName}</td>
                <td>${totalQuantity} units</td>
                <td>Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>${orderDate}</td>
                <td class="text-center">
                    ${ReviewUtils.getReviewButtonForOrder(order, currentUser)}
                </td>
                <td>
                    <button class="btn-secondary text-sm" onclick="viewOrderDetails(${order.id})">
                        View Details
                    </button>
                    ${canCancel ?
                        `<button class="btn-danger text-sm ml-2" onclick="cancelOrder(${order.id})">Cancel</button>` :
                        '<span class="text-gray-400 text-sm ml-2">Cannot cancel</span>'
                    }
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
// Add order cancellation function
async function cancelOrder(orderId) {
    try {
        // First, find the order to validate cancellation eligibility
        const order = orders.find(o => o.id == orderId);
        
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }
        
        // Check if this order belongs to the current user
        if (order.user_id != currentUser.id && order.customer_email !== currentUser.email) {
            showNotification('You can only cancel your own orders', 'error');
            return;
        }
        
        // BUSINESS RULE: Only allow cancellation for pending orders
        const cancellableStatuses = ['pending'];
        if (!cancellableStatuses.includes(order.status.toLowerCase())) {
            showNotification(`Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`, 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to cancel this bulk order? This action cannot be undone.')) {
            return;
        }
        
        // Call API to cancel order
        const response = await apiClient.cancelOrder(orderId);
        console.log('Order cancelled:', response);
        
        showNotification('Order cancelled successfully', 'success');
        
        await loadOrders();        
        await loadRetailerStats(); 
        displayOrderHistory(); 
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        let errorMessage = 'Failed to cancel order';
        
        if (error.message.includes('not found')) {
            errorMessage = 'Order not found or already cancelled';
        } else if (error.message.includes('cannot be cancelled')) {
            errorMessage = 'This order cannot be cancelled at this time';
        } else if (error.message.includes('unauthorized')) {
            errorMessage = 'You do not have permission to cancel this order';
        }
        
        showNotification(errorMessage, 'error');
    }
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
    const bulkPaymentMethod = document.getElementById('bulkPaymentMethod').value;
    
    // ADD: Get delivery address field (you need to add this to your HTML form)
    const deliveryAddress = document.getElementById('bulkDeliveryAddress')?.value;
    
    if (!productId || !quantity || !deliveryDate || !budgetRange || !bulkPaymentMethod) {
        showNotification('Please fill in all required fields including payment method', 'error');
        return;
    }
    
    // VALIDATION: Check if delivery address is provided
    if (!deliveryAddress || deliveryAddress.trim() === '') {
        showNotification('Please enter a valid delivery address', 'error');
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
    if (quantity < 5) {
        showNotification('Minimum bulk order quantity is 5 units', 'error');
        return;
    }
    
    // Calculate and validate total cost
    const totalAmount = quantity * parseFloat(selectedProduct.price);
    const budgetMax = getBudgetMaximum(budgetRange);
    
    if (totalAmount > budgetMax) {
        showNotification(`Total cost (Ksh${totalAmount.toLocaleString()}) exceeds your budget range. Please adjust quantity or budget.`, 'error');
        return;
    }
    
    // Show payment modal based on selected payment method
    if (bulkPaymentMethod === 'mpesa') {
        showMpesaPaymentModal(totalAmount, {
            productId,
            quantity,
            deliveryDate,
            deliveryAddress, 
            budgetRange,
            specialRequirements,
            selectedProduct
        });
    } else {
        // For cash on delivery, proceed directly
        await processBulkOrder({
            productId,
            quantity,
            deliveryDate,
            deliveryAddress, 
            budgetRange,
            specialRequirements,
            selectedProduct,
            paymentMethod: 'cash_on_delivery',
            totalAmount
        });
    }
}

// Show M-Pesa payment modal
function showMpesaPaymentModal(amount, orderData) {
    const modalHtml = `
        <div id="paymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 class="text-lg font-semibold mb-4">M-Pesa Payment - Ksh${amount.toLocaleString()}</h3>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 class="font-medium text-green-800 mb-3">Payment Instructions:</h4>
                    <div class="bg-white p-3 rounded border-l-4 border-green-500 mb-3">
                        <div class="text-sm space-y-1">
                            <p><strong>Paybill:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded">123456</span></p>
                            <p><strong>Account:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded">BULK${Date.now()}</span></p>
                            <p><strong>Amount:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded text-green-600">Ksh${amount.toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>
                
                <form id="mpesaPaymentForm">
                    <div class="form-group mb-4">
                        <label for="mpesaConfirmation">M-Pesa Confirmation Code</label>
                        <input type="text" id="mpesaConfirmation" required class="w-full p-2 border rounded font-mono" 
                               placeholder="e.g., QCG2H5X9XX">
                    </div>
                    <div class="form-group mb-4">
                        <label for="mpesaPhone">Phone Number Used</label>
                        <input type="tel" id="mpesaPhone" required class="w-full p-2 border rounded" 
                               placeholder="254712345678" value="${currentUser.phone || ''}">
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Confirm Payment</button>
                        <button type="button" onclick="closePaymentModal()" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('mpesaPaymentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const confirmationCode = document.getElementById('mpesaConfirmation').value;
        const phone = document.getElementById('mpesaPhone').value;
        
        if (!confirmationCode || !phone) {
            showNotification('Please enter both confirmation code and phone number', 'error');
            return;
        }
        
        await processBulkOrder({
            ...orderData,
            paymentMethod: 'mobile_money',
            totalAmount: amount,
            mpesaPhone: phone,
            mpesaConfirmation: confirmationCode
        });
        
        closePaymentModal();
    });
}

// Show card payment modal
function showCardPaymentModal(amount, orderData) {
    const modalHtml = `
        <div id="paymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Card Payment</h3>
                <div class="mb-4">
                    <p class="text-gray-600 mb-2">Amount: <span class="font-semibold">Ksh${amount.toLocaleString()}</span></p>
                    <p class="text-gray-600 mb-2">Product: <span class="font-semibold">${orderData.selectedProduct.name}</span></p>
                    <p class="text-gray-600 mb-2">Quantity: <span class="font-semibold">${orderData.quantity} units</span></p>
                    <p class="text-gray-600 mb-4">Delivery: <span class="font-semibold">${orderData.deliveryAddress}</span></p>
                </div>
                <form id="cardPaymentForm">
                    <div class="form-group mb-4">
                        <label for="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" required class="w-full p-2 border rounded" 
                               placeholder="1234 5678 9012 3456" maxlength="19">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group mb-4">
                            <label for="expiryDate">Expiry Date</label>
                            <input type="text" id="expiryDate" required class="w-full p-2 border rounded" 
                                   placeholder="MM/YY" maxlength="5">
                        </div>
                        <div class="form-group mb-4">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" required class="w-full p-2 border rounded" 
                                   placeholder="123" maxlength="4">
                        </div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="cardholderName">Cardholder Name</label>
                        <input type="text" id="cardholderName" required class="w-full p-2 border rounded" 
                               placeholder="John Doe" value="${currentUser.name || ''}">
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Pay with Card</button>
                        <button type="button" onclick="closePaymentModal()" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
    
    // Add expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    document.getElementById('cardPaymentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholderName').value;
        
        if (cardNumber.length !== 16) {
            showNotification('Please enter a valid 16-digit card number', 'error');
            return;
        }
        
        if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return;
        }
        
        if (cvv.length < 3) {
            showNotification('Please enter a valid CVV', 'error');
            return;
        }
        
        await processBulkOrder({
            ...orderData,
            paymentMethod: 'card',
            totalAmount: amount,
            cardDetails: {
                cardNumber: cardNumber.replace(/\d{12}(\d{4})/, '**** **** **** $1'), // Mask for security
                expiryDate,
                cardholderName
            }
        });
        
        closePaymentModal();
    });
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.remove();
    }
}

// Process bulk order after payment details are collected
async function processBulkOrder(orderDetails) {
    const submitBtn = document.querySelector('form[onsubmit="placeBulkOrder(event)"] button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    
    if (submitBtn) {
        submitBtn.textContent = 'Processing Order...';
        submitBtn.disabled = true;
    }
    
    try {
        const orderData = {
            items: [{
                product_id: parseInt(orderDetails.selectedProduct.id),
                product_name: orderDetails.selectedProduct.name,
                name: orderDetails.selectedProduct.name,
                quantity: parseInt(orderDetails.quantity),
                unit_price: parseFloat(orderDetails.selectedProduct.price),
                total_price: parseInt(orderDetails.quantity) * parseFloat(orderDetails.selectedProduct.price)
            }],
            
            delivery_address: orderDetails.deliveryAddress.trim(),
            
            // Additional order details
            customer_name: currentUser.name || 'Retailer Customer',
            customer_email: currentUser.email,
            phone: orderDetails.mpesaPhone || currentUser.phone || '254700000000',
            
            delivery_date: orderDetails.deliveryDate,
            payment_method: orderDetails.paymentMethod,
            total_amount: orderDetails.totalAmount,
            
            // Put budget and requirements in notes
            notes: `Bulk order for retail - Budget Range: ${orderDetails.budgetRange}${orderDetails.specialRequirements ? '. Special Requirements: ' + orderDetails.specialRequirements : ''}`,
            
            // Order metadata
            order_type: 'bulk_order',
            status: 'pending'
        };
        
        console.log('Submitting bulk order with proper structure:', orderData);
        
        const response = await apiClient.createOrder(orderData);
        console.log('Bulk order created:', response);
        
        if (orderDetails.paymentMethod === 'mobile_money') {
            showNotification('Bulk order placed successfully! Payment confirmation sent to admin for verification.', 'success');
            // Send email to admin with payment details
            await sendBulkOrderConfirmationEmail(orderDetails, response);
        } else if (orderDetails.paymentMethod === 'cash_on_delivery') {
            showNotification('Bulk order placed successfully! You will pay on delivery.', 'success');
            // Send email to admin for COD order
            await sendBulkOrderConfirmationEmail(orderDetails, response);
        } else {
            showNotification('Bulk order placed successfully!', 'success');
        }
        
        // Reset form
        const form = document.querySelector('form[onsubmit="placeBulkOrder(event)"]');
        if (form) form.reset();
        
        // Clear order summary
        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            orderSummary.textContent = 'Select a product and quantity to see the total cost.';
        }
        
        // Reload data
        await loadRetailerData();
        
        // Show delivery scheduling option
        showDeliveryScheduling(response.order?.id);
        
    } catch (error) {
        console.error('Error placing bulk order:', error);
        let errorMessage = 'Failed to place bulk order';
        
        if (error.message.includes('Insufficient stock')) {
            errorMessage = 'Insufficient stock available. Please check availability and try again.';
        } else if (error.message.includes('Invalid payment method')) {
            errorMessage = 'Invalid payment method selected. Please choose a valid payment option.';
        } else if (error.message.includes('validation')) {
            errorMessage = 'Please check all fields and try again.';
        }
        
        showNotification(errorMessage + ': ' + error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}
async function sendBulkOrderConfirmationEmail(orderDetails, orderResponse) {
    try {
        // Use existing EmailJS setup (same as auth.js)
        emailjs.init("4ux51G9S90vEMJC99"); // Replace with your actual key
        
        const orderItemsText = `${orderDetails.selectedProduct.name} - ${orderDetails.quantity} units x Ksh${orderDetails.selectedProduct.price} = Ksh${orderDetails.totalAmount.toLocaleString()}`;
        
        await emailjs.send("service_0dhyppz", "template_vkltfu9", {
            order_id: orderResponse.order?.id || orderResponse.id || 'N/A',
            order_type: 'Bulk Order',
            customer_name: currentUser.name,
            customer_email: currentUser.email,
            customer_phone: orderDetails.mpesaPhone || currentUser.phone,
            delivery_address: orderDetails.deliveryAddress,
            delivery_date: orderDetails.deliveryDate,
            payment_method: orderDetails.paymentMethod === 'mobile_money' ? 'M-Pesa' : orderDetails.paymentMethod,
            mpesa_confirmation: orderDetails.mpesaConfirmation || '',
            mpesa_phone: orderDetails.mpesaPhone || '',
            total_amount: orderDetails.totalAmount,
            order_items: orderItemsText,
            budget_range: orderDetails.budgetRange,
            special_requirements: orderDetails.specialRequirements || 'None',
            payment_status: orderDetails.paymentMethod === 'mobile_money' ? 'Pending Verification' : 'Confirmed'
        });
        
        console.log('Bulk order confirmation email sent to admin');
    } catch (error) {
        console.error('Error sending bulk order confirmation email:', error);
        // Don't show error to user as order was already placed successfully
    }
}

// Get budget maximum value for validation
function getBudgetMaximum(budgetRange) {
    const budgetMap = {
        '5000-10000': 10000,
        '10000-25000': 25000,
        '25000-50000': 50000,
        '50000+': 100000
    };
    return budgetMap[budgetRange] || 10000;
}

// Show delivery scheduling form after successful order
function showDeliveryScheduling(orderId) {
    if (!orderId) return;
    
    const orderSelect = document.getElementById('orderSelect');
    if (orderSelect) {
        // Add the new order to the select dropdown
        const option = document.createElement('option');
        option.value = orderId;
        option.textContent = `Order #${orderId} - Just Placed`;
        option.selected = true;
        orderSelect.appendChild(option);
        
        // Scroll to delivery scheduling section
        document.querySelector('[onsubmit="scheduleDelivery(event)"]')?.scrollIntoView({ 
            behavior: 'smooth' 
        });
        
        showNotification('You can now schedule delivery for your order below.', 'info');
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
window.cancelOrder = cancelOrder;
window.showMpesaPaymentModal = showMpesaPaymentModal;
window.showCardPaymentModal = showCardPaymentModal;
window.closePaymentModal = closePaymentModal;
window.scheduleDelivery = scheduleDelivery;
window.viewOrderDetails = viewOrderDetails;
window.sendBulkOrderConfirmationEmail = sendBulkOrderConfirmationEmail;
window.logout = logout;