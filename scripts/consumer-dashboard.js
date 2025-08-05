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

// ============= UNIT DISPLAY HELPER FUNCTIONS (FROM FARMER.JS) =============

// Helper function to format quantity with units
function formatQuantityWithUnit(quantity, productId) {
    if (!quantity) return '0';
    
    // Find the product to get its unit
    const product = products.find(p => p.id == productId);
    const unit = product?.unit || '';
    
    return unit ? `${quantity} ${unit}` : quantity.toString();
}

// Helper function to get product unit
function getProductUnit(productId) {
    const product = products.find(p => p.id == productId);
    return product?.unit || '';
}

// Helper function to get singular form of unit for pricing display
function getSingularUnit(unit) {
    if (!unit) return 'unit';
    
    const singularUnits = {
        'liters': 'liter',
        'pieces': 'piece', 
        'bags': 'bag',
        'boxes': 'box',
        'bunches': 'bunch',
        'kg': 'kg',
        'g': 'g',
        'ml': 'ml',
        'pcs': 'piece',
        'L': 'liter'
    };
    
    return singularUnits[unit] || unit;
}

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

// UPDATED: Display products in grid with enhanced stock visibility AND UNITS
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
    
    productGrid.innerHTML = availableProducts.map(product => {
        const quantity = product.quantity || product.stock || 0;
        const unit = product.unit || '';
        const quantityWithUnit = unit ? `${quantity} ${unit}` : quantity;
        const singularUnit = getSingularUnit(unit);
        const priceDisplay = unit ? `Ksh${parseFloat(product.price || 0).toFixed(2)} per ${singularUnit}` : `Ksh${parseFloat(product.price || 0).toFixed(2)}`;
        
        return `
            <div class="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="product-image text-center text-4xl mb-3">🥬</div>
                <h3 class="font-semibold text-lg mb-2">${product.name || 'Unnamed Product'}</h3>
                <p class="text-gray-600 text-sm mb-3">${product.description || 'No description available'}</p>
                <div class="flex justify-between items-center mb-3">
                    <span class="font-bold text-lg text-green-600">${priceDisplay}</span>
                    <span class="text-sm ${quantity > 5 ? 'text-gray-500' : 'text-orange-500'}">
                        Stock: ${quantityWithUnit}
                    </span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500 capitalize">${product.category || 'Uncategorized'}</span>
                    <button class="btn-primary text-sm" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
                ${quantity <= 5 && quantity > 0 ? 
                    `<div class="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">⚠️ Only ${quantityWithUnit} left!</div>` : ''}
            </div>
        `;
    }).join('');
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

// UPDATED: Add to cart with stock validation AND UNITS
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return showNotification('Product not found','error');
  
  if (product.quantity <= 0) {
    return showNotification('Product is out of stock', 'error');
  }

  const existing = cart.find(i => i.id === productId);
  const currentQty = existing ? existing.quantity : 0;
  
  if (currentQty >= product.quantity) {
    const unit = product.unit || '';
    const quantityWithUnit = unit ? `${product.quantity} ${unit}` : `${product.quantity} units`;
    return showNotification(`Only ${quantityWithUnit} available in stock`, 'error');
  }

  if (existing) existing.quantity += 1;
  else cart.push({ 
    id: product.id, 
    name: product.name, 
    price: parseFloat(product.price), 
    quantity: 1,
    product_id: product.id,
    max_stock: product.quantity,
    unit: product.unit || '' // Store unit in cart
  });

  localStorage.setItem(getCartKey(), JSON.stringify(cart));
  updateCartCount();
  showNotification('Product added to cart!', 'success');
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = cart.reduce((sum,i)=>sum+i.quantity, 0);
}

// UPDATED: Show cart modal WITH UNITS
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
        cartItems.innerHTML = cart.map(item => {
            const unit = item.unit || '';
            const quantityWithUnit = unit ? `${item.quantity} ${unit}` : item.quantity;
            const maxStockWithUnit = unit && item.max_stock ? `${item.max_stock} ${unit}` : item.max_stock;
            const singularUnit = getSingularUnit(unit);
            const priceDisplay = unit ? `Ksh${parseFloat(item.price).toFixed(2)} per ${singularUnit}` : `Ksh${parseFloat(item.price).toFixed(2)}`;
            
            return `
                <div class="flex justify-between items-center p-4 border-b">
                    <div>
                        <h4 class="font-medium">${item.name}</h4>
                        <p class="text-sm text-gray-600">${priceDisplay} × ${quantityWithUnit}</p>
                        ${item.max_stock ? `<p class="text-xs text-gray-500">Stock: ${maxStockWithUnit}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="btn-secondary text-sm" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                        <span>${quantityWithUnit}</span>
                        <button class="btn-secondary text-sm ${item.quantity >= (item.max_stock || 999) ? 'opacity-50 cursor-not-allowed' : ''}" 
                                onclick="updateCartQuantity(${item.id}, 1)"
                                ${item.quantity >= (item.max_stock || 999) ? 'disabled' : ''}>+</button>
                        <button class="btn-danger text-sm ml-2" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateCartSummary();
    modal.classList.add('active');
}

// UPDATED: Update cart quantity with stock validation AND UNITS
function updateCartQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    if (item.max_stock && newQuantity > item.max_stock) {
      const unit = item.unit || '';
      const maxStockWithUnit = unit ? `${item.max_stock} ${unit}` : `${item.max_stock} units`;
      showNotification(`Only ${maxStockWithUnit} available in stock`, 'error');
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
    
    if (!paymentMethod || paymentMethod === 'cod') return;
    
    const checkoutForm = document.querySelector('#checkoutModal form');
    const formContainer = document.createElement('div');
    formContainer.id = 'paymentForm';
    formContainer.className = 'mt-4 p-4 bg-gray-50 rounded-lg';
    
    if (paymentMethod === 'mpesa') {
        const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50;
        formContainer.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 class="font-semibold text-green-800 mb-4 flex items-center">
                    <span class="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                    M-Pesa Payment Instructions
                </h4>
                
                <div class="space-y-4">
                    <div class="bg-white p-4 rounded border-l-4 border-green-500">
                        <h5 class="font-medium text-gray-800 mb-2">Step 1: Make Payment</h5>
                        <div class="text-sm text-gray-700 space-y-1">
                            <p><strong>Paybill Number:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded">123456</span></p>
                            <p><strong>Account Number:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded">ORDER${Date.now()}</span></p>
                            <p><strong>Amount:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded text-green-600">Ksh ${total.toLocaleString()}</span></p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded border-l-4 border-blue-500">
                        <h5 class="font-medium text-gray-800 mb-2">Step 2: Enter Payment Details</h5>
                        <div class="form-group">
                            <label for="mpesaConfirmation" class="block text-sm font-medium text-gray-700 mb-2">
                                M-Pesa Confirmation Code (e.g., QCG2H5X9XX)
                            </label>
                            <input type="text" id="mpesaConfirmation" required 
                                   class="w-full p-3 border border-gray-300 rounded-lg font-mono"
                                   placeholder="Enter M-Pesa confirmation code">
                        </div>
                        
                        <div class="form-group mt-3">
                            <label for="mpesaPhone" class="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number Used for Payment
                            </label>
                            <input type="tel" id="mpesaPhone" required 
                                   class="w-full p-3 border border-gray-300 rounded-lg"
                                   placeholder="254712345678" value="${currentUser.phone || ''}">
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 p-3 rounded text-sm text-blue-800">
                        <p class="font-medium mb-1">📱 How to pay via M-Pesa:</p>
                        <ol class="list-decimal list-inside space-y-1 text-xs">
                            <li>Go to M-Pesa menu on your phone</li>
                            <li>Select "Lipa na M-Pesa" then "Pay Bill"</li>
                            <li>Enter Business Number: <strong>123456</strong></li>
                            <li>Enter Account Number: <strong>ORDER${Date.now()}</strong></li>
                            <li>Enter Amount: <strong>Ksh ${total.toLocaleString()}</strong></li>
                            <li>Enter your M-Pesa PIN and confirm</li>
                            <li>Copy the confirmation code and paste it above</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
    }
    
    checkoutForm.appendChild(formContainer);
}

// UPDATED: Place order with enhanced payment processing and stock management AND UNITS
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
                const unit = product?.unit || '';
                const availableWithUnit = unit ? `${product?.quantity || 0} ${unit}` : `${product?.quantity || 0} units`;
                const requestedWithUnit = unit ? `${item.quantity} ${unit}` : `${item.quantity} units`;
                throw new Error(`Insufficient stock for ${item.name}. Available: ${availableWithUnit}, Requested: ${requestedWithUnit}`);
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

    if (paymentMethod === 'mpesa') {
    const confirmationCode = document.getElementById('mpesaConfirmation')?.value;
    const mpesaPhone = document.getElementById('mpesaPhone')?.value;
    
    if (!confirmationCode || !mpesaPhone) {
        throw new Error('Please enter M-Pesa confirmation code and phone number');
    }
    
    orderData.mpesa_confirmation = confirmationCode;
    orderData.mpesa_phone = mpesaPhone;
    orderData.payment_details = `M-Pesa Confirmation: ${confirmationCode}`;
}

const response = await apiClient.createOrder(orderData);

// Handle different payment methods
if (paymentMethod === 'mpesa') {
    showNotification('Order placed successfully! Payment confirmation sent to admin for verification.', 'success');
    
    // Send email to admin with payment details
    await sendPaymentConfirmationEmail(orderData, response);
} else if (paymentMethod === 'cod') {
    showNotification('Order placed successfully! You will pay on delivery.', 'success');
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
async function sendPaymentConfirmationEmail(orderData, orderResponse) {
    try {
        // Use existing EmailJS setup
        emailjs.init("aW3CSorS208n9Sw8R");
        
        const orderDetails = cart.map(item => 
            `${item.name} - ${item.quantity} x Ksh${item.price} = Ksh${(item.quantity * item.price).toFixed(2)}`
        ).join('\n');
        
        await emailjs.send("service_byyqwv6", "template_obw1ma8", {
            order_id: orderResponse.id || 'N/A',
            customer_name: currentUser.name,
            customer_email: currentUser.email,
            customer_phone: orderData.phone,
            delivery_address: orderData.delivery_address,
            payment_method: 'M-Pesa',
            mpesa_confirmation: orderData.mpesa_confirmation,
            mpesa_phone: orderData.mpesa_phone,
            total_amount: orderData.total_amount,
            order_items: orderDetails,
            payment_status: 'Pending Verification'
        });
        
        console.log('Payment confirmation email sent to admin');
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        // Don't show error to user as order was already placed successfully
    }
}

// Load order history for consumer
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

// UPDATED: Display order history WITH UNITS
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
                    ${orderInfo.items.length > 0 ? orderInfo.items.map(item => {
                        // Get product details to show units
                        const product = products.find(p => p.name === item.name || p.id === item.product_id);
                        const unit = product?.unit || '';
                        const quantityWithUnit = unit ? `${item.quantity} ${unit}` : item.quantity;
                        const singularUnit = getSingularUnit(unit);
                        const priceDisplay = unit ? `Ksh${item.unit_price.toFixed(2)} per ${singularUnit}` : `Ksh${item.unit_price.toFixed(2)}`;
                        
                        return `
                            <div class="text-sm mb-1">
                                <div class="font-medium">${item.name}</div>
                                <div class="text-gray-600">Qty: ${quantityWithUnit} @ ${priceDisplay}</div>
                            </div>
                        `;
                    }).join('') : `
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
                    ${ReviewUtils.getReviewButtonForOrder ? ReviewUtils.getReviewButtonForOrder(order, currentUser) : ''}
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
window.formatQuantityWithUnit = formatQuantityWithUnit;
window.getProductUnit = getProductUnit;
window.getSingularUnit = getSingularUnit;
window.sendPaymentConfirmationEmail = sendPaymentConfirmationEmail;