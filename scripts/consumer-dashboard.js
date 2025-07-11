
// Consumer Dashboard JavaScript - Fixed Data Handling

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
    await Promise.all([loadProducts(), loadStats(), loadOrders()]);
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
                <span class="text-sm text-gray-500">Stock: ${product.quantity || 0}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 capitalize">${product.category || 'Uncategorized'}</span>
                <button class="btn-primary text-sm" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Load consumer statistics
async function loadStats() {
    try {
        const ordersResponse = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(ordersResponse) || [];
        
        const totalOrders = ordersList.length;
        const totalSpent = ordersList.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const activeOrders = ordersList.filter(order => 
            order.status === 'pending' || order.status === 'processing' || order.status === 'in_transit'
        ).length;
        
        // Update stats display
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeOrders').textContent = activeOrders;
        document.getElementById('favoriteProducts').textContent = Math.min(products.length, 5);
        
    } catch (error) {
        console.error('Error loading stats:', error);
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

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return showNotification('Product not found','error');

  const existing = cart.find(i => i.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });

  localStorage.setItem(getCartKey(), JSON.stringify(cart)); // persist per user
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
                </div>
                <div class="flex items-center gap-2">
                    <button class="btn-secondary text-sm" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-secondary text-sm" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                    <button class="btn-danger text-sm ml-2" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }
    
    updateCartSummary();
    modal.classList.add('active');
}

// Update cart quantity
function updateCartQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(productId);
    else {
      localStorage.setItem(getCartKey(), JSON.stringify(cart));
      showCart();
      updateCartCount();
    }
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
    }
}

// Place order
async function placeOrder(event) {
  event.preventDefault();
  if (cart.length === 0) return showNotification('Your cart is empty','error');

  const orderData = {
    items: cart.map(i => ({
      product_id: i.id,
      name: i.name,
      quantity: i.quantity,
      unit_price: i.price
    })),
    delivery_address: document.getElementById('deliveryAddress').value,
    phone: document.getElementById('phoneNumber').value,
    payment_method: document.getElementById('paymentMethod').value,
    total_amount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50
  };
    
    try {
    const response = await apiClient.createOrder(orderData);
    console.log('Order created:', response);
    showNotification('Order placed successfully!', 'success');
    cart = [];
    localStorage.removeItem(getCartKey()); // clear only on checkout
    updateCartCount();
    closeModal('checkoutModal');
    event.target.reset();
    await loadStats();
  } catch (error) {
    console.error('Error placing order:', error);
    showNotification('Failed to place order: ' + error.message, 'error');
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
