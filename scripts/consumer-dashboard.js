// Consumer Dashboard JavaScript - Enhanced with Real-time Data and Complete Checkout

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
    await Promise.all([loadProducts(), loadConsumerStats(), loadOrders()]);
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

// Display products in grid
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
    
    productGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="product-image text-center text-4xl mb-3">🥬</div>
            <h3 class="font-semibold text-lg mb-2">${product.name || 'Unnamed Product'}</h3>
            <p class="text-gray-600 text-sm mb-3">${product.description || 'No description available'}</p>
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-lg text-green-600">Ksh${parseFloat(product.price || 0).toFixed(2)}</span>
                <span class="text-sm ${product.quantity > 0 ? 'text-gray-500' : 'text-red-500'}">
                    Stock: ${product.quantity || 0}
                </span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 capitalize">${product.category || 'Uncategorized'}</span>
                <button class="btn-primary text-sm ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                        onclick="addToCart(${product.id})" 
                        ${product.quantity <= 0 ? 'disabled' : ''}>
                    ${product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
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
            if (order.items) {
                order.items.forEach(item => {
                    productCount[item.product_id] = (productCount[item.product_id] || 0) + 1;
                });
            }
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

// Place order with enhanced payment processing
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
        const orderData = {
            items: cart.map(i => ({
                product_id: i.product_id || i.id,
                name: i.name,
                quantity: i.quantity,
                unit_price: i.price
            })),
            delivery_address: document.getElementById('deliveryAddress').value,
            phone: document.getElementById('phoneNumber').value,
            payment_method: paymentMethod === 'mpesa' ? 'mobile_money' : paymentMethod, // Map mpesa to mobile_money for backend
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
        } else {
            showNotification('Order placed successfully!', 'success');
        }
        
        cart = [];
        localStorage.removeItem(getCartKey());
        updateCartCount();
        closeModal('checkoutModal');
        event.target.reset();
        await loadConsumerStats();
        
    } catch (error) {
        console.error('Error placing order:', error);
        let errorMessage = 'Failed to place order';
        if (error.message.includes('Insufficient stock')) {
            errorMessage = 'Some items in your cart are no longer available. Please check stock and try again.';
        }
        showNotification(errorMessage + ': ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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

// Make functions globally available
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.showCart = showCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;
window.closeModal = closeModal;
window.logout = logout;
