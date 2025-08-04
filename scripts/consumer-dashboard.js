// Consumer Dashboard JavaScript - Enhanced with Real-time Data and Complete Checkout

// ============= ORDER UTILITIES - SHARED UTILITIES =============
class OrderDisplayUtils {
    /**
     * Safely extract product information from order items
     * Handles different API response structures and deployment inconsistencies
     */
    static getOrderProductInfo(order) {
        if (!order) {
            return {
                productName: 'No items',
                totalQuantity: 0,
                items: []
            };
        }

        // Try different possible field names for order items
        const itemsArray = order.order_items || order.items || order.products || [];
        
        if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
            // Fallback: check if product info is directly on the order object
            if (order.product_name || order.name) {
                return {
                    productName: order.product_name || order.name,
                    totalQuantity: parseInt(order.quantity) || 1,
                    items: [{
                        name: order.product_name || order.name,
                        quantity: parseInt(order.quantity) || 1,
                        unit_price: parseFloat(order.unit_price || order.price || 0)
                    }]
                };
            }
            
            return {
                productName: 'No items',
                totalQuantity: 0,
                items: []
            };
        }

        // Calculate total quantity across all items
        const totalQuantity = itemsArray.reduce((sum, item) => {
            return sum + (parseInt(item.quantity) || 0);
        }, 0);

        let productName;
        const items = itemsArray.map(item => ({
            name: this.extractProductName(item),
            quantity: parseInt(item.quantity) || 0,
            unit_price: parseFloat(item.unit_price || item.price || 0)
        }));

        // Generate display name based on number of items
        if (itemsArray.length === 1) {
            productName = this.extractProductName(itemsArray[0]);
        } else if (itemsArray.length > 1) {
            const firstName = this.extractProductName(itemsArray[0]);
            productName = `${firstName} + ${itemsArray.length - 1} more`;
        } else {
            productName = 'No items';
        }

        return {
            productName,
            totalQuantity,
            items
        };
    }

    /**
     * Extract product name from a single item with multiple fallbacks
     */
    static extractProductName(item) {
        if (!item) return 'Unknown Product';
        
        // Try different possible field names for product name
        return item.product?.name || 
               item.name || 
               item.product_name || 
               item.title ||
               (item.product && typeof item.product === 'string' ? item.product : null) ||
               'Unknown Product';
    }

    /**
     * Check if order can be cancelled based on status
     */
    static canCancelOrder(order) {
        if (!order || !order.status) return false;
        
        // Only allow cancellation for pending orders
        const cancellableStatuses = ['pending'];
        return cancellableStatuses.includes(order.status.toLowerCase());
    }

    /**
     * Get appropriate status styling class
     */
    static getStatusClass(status) {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-green-100 text-green-800',
            'in_transit': 'bg-green-100 text-green-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'completed': 'bg-green-100 text-green-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }
}

let currentUser = null;
let products = [];
let cart = [];
let orders = [];

// Helper to define per-user cart key
function getCartKey() {
  return currentUser?.email ? `cart_${currentUser.email}` : 'cart';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Consumer Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadConsumerData();
    setupEventListeners();
});

// Initialize dashboard with user authentication
async function initDashboard() {
  const user = localStorage.getItem('currentUser');
  if (!user) window.location.href = 'index.html';
  try {
    currentUser = JSON.parse(user);
    console.log('Current user:', currentUser);
    // Load per-user cart
    cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    updateCartCount();
  } catch {
    window.location.href = 'index.html';
  }
}

// Setup event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchProducts();
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', searchProducts);
  }

  const cartModal = document.getElementById('cartModal');
  const checkoutModal = document.getElementById('checkoutModal');
  if (cartModal) {
    cartModal.addEventListener('click', e => {
      if (e.target === cartModal) closeModal('cartModal');
    });
  }
  if (checkoutModal) {
    checkoutModal.addEventListener('click', e => {
      if (e.target === checkoutModal) closeModal('checkoutModal');
    });
  }
}

// Load user data and update UI
async function loadUserData() {
    try {
        const userData = await apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Consumer';
        document.getElementById('userRole').textContent = userData.role || 'Consumer';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Consumer';
    }
}

// Load all consumer data
async function loadConsumerData() {
  const loadingState = document.getElementById('loadingState');
  const productGrid = document.getElementById('productGrid');
  try {
    if (loadingState) loadingState.style.display = 'block';
    if (productGrid) productGrid.style.display = 'none';
    await Promise.all([loadProducts(), loadConsumerStats(), loadOrderHistory()]);
    if (loadingState) loadingState.style.display = 'none';
    if (productGrid) productGrid.style.display = 'grid';
  } catch {
    showNotification('Failed to load dashboard data', 'error');
    if (loadingState) loadingState.style.display = 'none';
  }
}

// Load products from API
async function loadProducts() {
    try {
        const response = await apiClient.getProducts();
        products = apiClient.extractArrayData(response, 'data') || [];
        console.log('Products loaded:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

// Display products in grid with enhanced stock visibility
function displayProducts(productsToShow) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-4xl mb-4">🛒</div>
                <p class="text-gray-600">No products available at the moment.</p>
            </div>
        `;
        return;
    }
    
    // Filter out products with zero stock
    const availableProducts = productsToShow.filter(product => (product.quantity || 0) > 0);
    
    if (availableProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 text-4xl mb-4">📦</div>
                <p class="text-gray-600">All products are currently out of stock. Please check back later.</p>
            </div>
        `;
        return;
    }
    
    productGrid.innerHTML = availableProducts.map(product => `
        <div class="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="product-image text-center text-4xl mb-3">🥬</div>
            <h3 class="font-semibold text-lg mb-2">${product.name || 'Unnamed Product'}</h3>
            <p class="text-gray-600 text-sm mb-3">${product.description || 'No description available'}</p>
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-lg text-green-600">Ksh${parseFloat(product.price || 0).toFixed(2)}</span>
                <span class="text-sm ${product.quantity > 5 ? 'text-gray-500' : 'text-orange-500'}">
                    Stock: ${product.quantity || 0}
                </span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 capitalize">${product.category || 'Uncategorized'}</span>
                <button class="btn-primary text-sm" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
            ${product.quantity <= 5 && product.quantity > 0 ? 
                `<div class="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">⚠️ Only ${product.quantity} left!</div>` : ''}
        </div>
    `).join('');
}

// Load consumer-specific statistics (no admin analytics)
async function loadConsumerStats() {
    try {
        const ordersResponse = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(ordersResponse) || [];
        
        // Filter orders for current user
        const userOrders = ordersList.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        const activeOrders = userOrders.filter(order => 
            ['pending', 'processing', 'confirmed', 'shipped', 'in_transit'].includes(order.status)
        ).length;
        
        // Calculate favorite products based on order history
        const productCount = {};
        userOrders.forEach(order => {
            const orderInfo = OrderDisplayUtils.getOrderProductInfo(order);
            orderInfo.items.forEach(item => {
                productCount[item.name] = (productCount[item.name] || 0) + 1;
            });
        });
        const favoriteProducts = Object.keys(productCount).length;
        
        // Update stats display with consumer-specific data
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeOrders').textContent = activeOrders;
        document.getElementById('favoriteProducts').textContent = favoriteProducts;
        
    } catch (error) {
        console.error('Error loading consumer stats:', error);
        // Fallback to basic counts
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalSpent').textContent = 'Ksh0';
        document.getElementById('activeOrders').textContent = '0';
        document.getElementById('favoriteProducts').textContent = '0';
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response) || [];
        console.log('Orders loaded:', orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            (product.name || '').toLowerCase().includes(searchTerm) ||
            (product.description || '').toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product =>
            (product.category || '').toLowerCase() === categoryFilter.toLowerCase()
        );
    }
    
    displayProducts(filteredProducts);
}

// Add to cart with stock validation
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return showNotification('Product not found','error');
  
  if (product.quantity <= 0) {
    return showNotification('Product is out of stock', 'error');
  }

  const existing = cart.find(i => i.id === productId);
  const currentQty = existing ? existing.quantity : 0;
  
  if (currentQty >= product.quantity) {
    return showNotification(`Only ${product.quantity} units available in stock`, 'error');
  }

  if (existing) existing.quantity += 1;
  else cart.push({ 
    id: product.id, 
    name: product.name, 
    price: parseFloat(product.price), 
    quantity: 1,
    product_id: product.id,
    max_stock: product.quantity
  });

  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  updateCartCount();
  showNotification('Product added to cart!', 'success');
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = cart.reduce((sum,i)=>sum+i.quantity, 0);
}

// Show cart modal
function showCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    if (!modal || !cartItems) return;
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500">Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center p-4 border-b">
                <div>
                    <h4 class="font-medium">${item.name}</h4>
                    <p class="text-sm text-gray-600">Ksh${parseFloat(item.price).toFixed(2)} x ${item.quantity}</p>
                    ${item.max_stock ? `<p class="text-xs text-gray-500">Stock: ${item.max_stock}</p>` : ''}
                </div>
                <div class="flex items-center gap-2">
                    <button class="btn-secondary text-sm" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-secondary text-sm ${item.quantity >= (item.max_stock || 999) ? 'opacity-50 cursor-not-allowed' : ''}" 
                            onclick="updateCartQuantity(${item.id}, 1)"
                            ${item.quantity >= (item.max_stock || 999) ? 'disabled' : ''}>+</button>
                    <button class="btn-danger text-sm ml-2" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }
    
    updateCartSummary();
    modal.classList.add('active');
}

// Update cart quantity with stock validation
function updateCartQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (item.max_stock && newQuantity > item.max_stock) {
      showNotification(`Only ${item.max_stock} units available in stock`, 'error');
      return;
    }
    
    item.quantity = newQuantity;
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    showCart();
    updateCartCount();
  }
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  showCart();
  updateCartCount();
  showNotification('Product removed from cart', 'success');
}

// Update cart summary
function updateCartSummary() {
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const delivery = 50;
  const total = subtotal + delivery;
  document.getElementById('subtotal').textContent = `Ksh${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent = `Ksh${total.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `Ksh${total.toFixed(2)}`;
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    closeModal('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.add('active');
        updateCartSummary();
        setupPaymentOptions();
    }
}

// Setup payment options
function setupPaymentOptions() {
    const paymentMethodSelect = document.getElementById('paymentMethod');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            showPaymentForm(this.value);
        });
    }
}

// Show payment form based on selection
function showPaymentForm(paymentMethod) {
    const existingForm = document.getElementById('paymentForm');
    if (existingForm) existingForm.remove();
    
    if (!paymentMethod) return;
    
    const checkoutForm = document.querySelector('#checkoutModal form');
    const formContainer = document.createElement('div');
    formContainer.id = 'paymentForm';
    formContainer.className = 'mt-4 p-4 bg-gray-50 rounded-lg';
    
    if (paymentMethod === 'card') {
        formContainer.innerHTML = `
            <h4 class="font-semibold mb-3">Card Payment</h4>
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" placeholder="123" maxlength="3">
                </div>
                <div class="form-group">
                    <label for="cardName">Cardholder Name</label>
                    <input type="text" id="cardName" placeholder="John Doe">
                </div>
            </div>
        `;
    } else if (paymentMethod === 'mpesa') {
        formContainer.innerHTML = `
            <h4 class="font-semibold mb-3">M-Pesa Payment</h4>
            <div class="space-y-4">
                <div class="form-group">
                    <label for="mpesaPhone">M-Pesa Phone Number</label>
                    <input type="tel" id="mpesaPhone" placeholder="254712345678" required>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h5 class="font-medium text-green-800 mb-2">Payment Instructions:</h5>
                    <ol class="text-sm text-green-700 list-decimal list-inside space-y-1">
                        <li>Enter your M-Pesa registered phone number above</li>
                        <li>You will receive an STK push notification on your phone</li>
                        <li>Enter your M-Pesa PIN to complete the payment</li>
                        <li>You will receive a confirmation SMS from M-Pesa</li>
                    </ol>
                    <div class="mt-3 p-3 bg-green-100 rounded border-l-4 border-green-500">
                        <p class="text-sm font-medium text-green-800">
                            Total Amount: Ksh${cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    checkoutForm.appendChild(formContainer);
}

// Place order with enhanced payment processing and stock management
async function placeOrder(event) {
    event.preventDefault();
    if (cart.length === 0) return showNotification('Your cart is empty','error');

    const paymentMethod = document.getElementById('paymentMethod').value;
    if (!paymentMethod) return showNotification('Please select a payment method', 'error');
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing Order...';
    submitBtn.disabled = true;

    try {
        // Validate stock availability before placing order
        for (const item of cart) {
            const product = products.find(p => p.id === item.id);
            if (!product || product.quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}. Available: ${product?.quantity || 0}, Requested: ${item.quantity}`);
            }
        }

        const orderData = {
            items: cart.map(i => ({
                product_id: i.product_id || i.id,
                name: i.name,
                quantity: i.quantity,
                unit_price: i.price
            })),
            delivery_address: document.getElementById('deliveryAddress').value,
            phone: document.getElementById('phoneNumber').value,
            payment_method: paymentMethod === 'cod' ? 'cash_on_delivery' : 
                          paymentMethod === 'mpesa' ? 'mobile_money' : 
                          paymentMethod,
            total_amount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50
        };

        // Add payment-specific data
        if (paymentMethod === 'card') {
            orderData.card_details = {
                card_number: document.getElementById('cardNumber')?.value,
                expiry_date: document.getElementById('expiryDate')?.value,
                cardholder_name: document.getElementById('cardName')?.value
            };
        } else if (paymentMethod === 'mpesa') {
            orderData.mpesa_phone = document.getElementById('mpesaPhone')?.value;
        }
        
        const response = await apiClient.createOrder(orderData);
        console.log('Order created:', response);
        
        // Handle M-Pesa STK push
        if (paymentMethod === 'mpesa') {
            showNotification('STK push sent to your phone. Please complete payment on your device.', 'info');
        } else if (paymentMethod === 'cod') {
            showNotification('Order placed successfully! You will pay on delivery.', 'success');
        } else {
            showNotification('Order placed successfully!', 'success');
        }
        
        // Clear cart and refresh data
        cart = [];
        localStorage.removeItem(getCartKey());
        updateCartCount();
        closeModal('checkoutModal');
        event.target.reset();
        
        // Reload products to reflect updated stock
        await loadProducts();
        await loadConsumerStats();
        
    } catch (error) {
        console.error('Error placing order:', error);
        let errorMessage = 'Failed to place order';
        if (error.message.includes('Insufficient stock')) {
            errorMessage = error.message;
        } else if (error.message.includes('Invalid payment method')) {
            errorMessage = 'Invalid payment method selected. Please choose a valid payment option.';
        }
        showNotification(errorMessage, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Load order history for consumer - UPDATED WITH FIXES
async function loadOrderHistory() {
    try {
        const response = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(response) || [];
        
        // Filter orders for current user
        const userOrders = ordersList.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        displayOrderHistory(userOrders);
        
    } catch (error) {
        console.error('Error loading order history:', error);
        displayOrderHistory([]);
    }
}

// Display order history - UPDATED WITH FIXES
function displayOrderHistory(userOrders) {
    const orderHistoryTable = document.getElementById('orderHistoryTable');
    if (!orderHistoryTable) return;
    
    if (!Array.isArray(userOrders) || userOrders.length === 0) {
        orderHistoryTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <p class="text-gray-500">No orders found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    orderHistoryTable.innerHTML = userOrders.map(order => {
        const orderInfo = OrderDisplayUtils.getOrderProductInfo(order);
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const canCancel = OrderDisplayUtils.canCancelOrder(order);
        
        return `
            <tr>
                <td class="font-mono">#${order.id}</td>
                <td>
                    ${orderInfo.items.length > 0 ? orderInfo.items.map(item => `
                        <div class="text-sm mb-1">
                            <div class="font-medium">${item.name}</div>
                            <div class="text-gray-600">Qty: ${item.quantity} @ Ksh${item.unit_price.toFixed(2)}</div>
                        </div>
                    `).join('') : `
                        <div class="text-sm text-gray-500">
                            ${orderInfo.productName}
                        </div>
                    `}
                </td>
                <td class="font-medium">Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                <td>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${OrderDisplayUtils.getStatusClass(order.status)}">
                        ${(order.status || 'pending').replace('_', ' ')}
                    </span>
                </td>
                <td class="text-sm text-gray-600">${orderDate}</td>
                <td>
                    ${canCancel ? 
                        `<button class="btn-danger text-sm" onclick="cancelOrder(${order.id})">Cancel</button>` :
                        '<span class="text-gray-400 text-sm">No actions</span>'
                    }
                </td>
                <td>
                    ${ReviewUtils.getReviewButtonForOrder(order, currentUser)}
                </td>
            </tr>
        `;
    }).join('');
}

async function cancelOrder(orderId) {
    try {
        // First, reload orders to ensure we have the latest data
        await loadOrders();
        
        // Find the order in the loaded orders array
        const order = orders.find(o => o.id == orderId);
        
        if (!order) {
            // If not found in orders array, try to get it directly from API
            try {
                const orderResponse = await apiClient.getOrder(orderId);
                if (!orderResponse || !orderResponse.id) {
                    showNotification('Order not found', 'error');
                    return;
                }
                // Use the order from API response
                const fetchedOrder = orderResponse;
                
                // Check if this order belongs to the current user
                if (fetchedOrder.user_id != currentUser.id && fetchedOrder.customer_email !== currentUser.email) {
                    showNotification('You can only cancel your own orders', 'error');
                    return;
                }
                
                // Check if order can be cancelled
                if (!OrderDisplayUtils.canCancelOrder(fetchedOrder)) {
                    showNotification(`Cannot cancel order with status "${fetchedOrder.status}". Only pending orders can be cancelled.`, 'error');
                    return;
                }
            } catch (apiError) {
                console.error('Error fetching order from API:', apiError);
                showNotification('Order not found or unable to verify order details', 'error');
                return;
            }
        } else {
            // Check if this order belongs to the current user
            if (order.user_id != currentUser.id && order.customer_email !== currentUser.email) {
                showNotification('You can only cancel your own orders', 'error');
                return;
            }
            
            // Check if order can be cancelled
            if (!OrderDisplayUtils.canCancelOrder(order)) {
                showNotification(`Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`, 'error');
                return;
            }
        }
        
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }
        
        // Call API to cancel order
        const response = await apiClient.cancelOrder(orderId);
        console.log('Order cancelled:', response);
        
        showNotification('Order cancelled successfully', 'success');
        
        // Refresh the orders list and stats
        await loadOrders();
        await loadConsumerStats();
        await loadOrderHistory();
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        let errorMessage = 'Failed to cancel order';
        
        if (error.message.includes('not found')) {
            errorMessage = 'Order not found or already cancelled';
        } else if (error.message.includes('cannot be cancelled')) {
            errorMessage = 'This order cannot be cancelled at this time';
        } else if (error.message.includes('unauthorized')) {
            errorMessage = 'You do not have permission to cancel this order';
        } else if (error.message.includes('Order not found')) {
            errorMessage = 'Order not found in the system';
        }
        
        showNotification(errorMessage, 'error');
    }
}

function refreshOrders() {
    loadOrderHistory();
    loadConsumerStats();
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
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

// Debug helper function
function debugOrderStructure(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) {
        console.log('Order not found');
        return;
    }
    
    console.log('=== ORDER DEBUG INFO ===');
    console.log('Order ID:', order.id);
    console.log('Order object:', order);
    console.log('Available item fields:');
    
    const possibleItemFields = ['order_items', 'items', 'products'];
    possibleItemFields.forEach(field => {
        if (order[field]) {
            console.log(`${field}:`, order[field]);
            if (Array.isArray(order[field]) && order[field].length > 0) {
                console.log(`First item in ${field}:`, order[field][0]);
                console.log('Available keys in first item:', Object.keys(order[field][0]));
            }
        }
    });
    
    console.log('Extracted info:', OrderDisplayUtils.getOrderProductInfo(order));
    console.log('========================');
}

// Make functions globally available
window.OrderDisplayUtils = OrderDisplayUtils;
window.debugOrderStructure = debugOrderStructure;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.showCart = showCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;
window.closeModal = closeModal;
window.logout = logout;
window.refreshOrders = refreshOrders;
window.cancelOrder = cancelOrder;