// Consumer Cart Management Module
// Handles shopping cart operations, checkout process, and order placement

console.log('Consumer Cart module loaded successfully');

// Cart management functionality for Consumer Dashboard
const ConsumerCart = {
    // Add to cart with stock validation
    addToCart(productId, products, cart, currentUser) {
        const product = products.find(p => p.id === productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return cart;
        }
        
        if (product.quantity <= 0) {
            showNotification('Product is out of stock', 'error');
            return cart;
        }

        const existing = cart.find(i => i.id === productId);
        const currentQty = existing ? existing.quantity : 0;
        
        if (currentQty >= product.quantity) {
            showNotification(`Only ${product.quantity} units available in stock`, 'error');
            return cart;
        }

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ 
                id: product.id, 
                name: product.name, 
                price: parseFloat(product.price), 
                quantity: 1,
                product_id: product.id,
                max_stock: product.quantity
            });
        }

        const cartKey = this.getCartKey(currentUser);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        this.updateCartCount(cart);
        showNotification('Product added to cart!', 'success');
        
        return cart;
    },

    // Helper to define per-user cart key
    getCartKey(currentUser) {
        return currentUser?.email ? `cart_${currentUser.email}` : 'cart';
    },

    // Update cart count display
    updateCartCount(cart) {
        const countEl = document.getElementById('cartCount');
        if (countEl) {
            countEl.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
        }
    },

    // Show cart modal
    showCart(cart, currentUser) {
        const modal = document.getElementById('cartModal') || this.createCartModal();
        const cartItems = document.getElementById('cartItems');
        
        if (!cartItems) return;

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
                        <button class="btn-secondary text-sm" onclick="ConsumerCart.updateCartQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-secondary text-sm ${item.quantity >= (item.max_stock || 999) ? 'opacity-50 cursor-not-allowed' : ''}" 
                                onclick="ConsumerCart.updateCartQuantity(${item.id}, 1)"
                                ${item.quantity >= (item.max_stock || 999) ? 'disabled' : ''}>+</button>
                        <button class="btn-danger text-sm ml-2" onclick="ConsumerCart.removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        }
        
        this.updateCartSummary(cart);
        modal.classList.add('active');
    },

    // Create cart modal if it doesn't exist
    createCartModal() {
        const modal = document.createElement('div');
        modal.id = 'cartModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Shopping Cart</h3>
                    <button onclick="closeModal('cartModal')" class="text-gray-500 hover:text-gray-700">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 6-12 12M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div id="cartItems"></div>
                <div class="border-t pt-4 mt-4">
                    <div class="flex justify-between items-center mb-2">
                        <span>Subtotal:</span>
                        <span id="subtotal">Ksh0.00</span>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <span>Delivery:</span>
                        <span>Ksh50.00</span>
                    </div>
                    <div class="flex justify-between items-center font-semibold text-lg">
                        <span>Total:</span>
                        <span id="total">Ksh50.00</span>
                    </div>
                    <button class="btn-primary w-full mt-4" onclick="ConsumerCart.proceedToCheckout()">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    },

    // Update cart quantity with stock validation
    updateCartQuantity(productId, change) {
        const cart = window.consumerDashboard?.cart || [];
        const currentUser = window.consumerDashboard?.currentUser;
        
        const item = cart.find(i => i.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            if (item.max_stock && newQuantity > item.max_stock) {
                showNotification(`Only ${item.max_stock} units available in stock`, 'error');
                return;
            }
            
            item.quantity = newQuantity;
            const cartKey = this.getCartKey(currentUser);
            localStorage.setItem(cartKey, JSON.stringify(cart));
            this.showCart(cart, currentUser);
            this.updateCartCount(cart);
        }
    },

    // Remove from cart
    removeFromCart(productId) {
        const cart = window.consumerDashboard?.cart || [];
        const currentUser = window.consumerDashboard?.currentUser;
        
        const updatedCart = cart.filter(i => i.id !== productId);
        const cartKey = this.getCartKey(currentUser);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        
        if (window.consumerDashboard) {
            window.consumerDashboard.cart = updatedCart;
        }
        
        this.showCart(updatedCart, currentUser);
        this.updateCartCount(updatedCart);
        showNotification('Product removed from cart', 'success');
    },

    // Update cart summary
    updateCartSummary(cart) {
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const delivery = 50;
        const total = subtotal + delivery;
        
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        const checkoutTotalEl = document.getElementById('checkoutTotal');
        
        if (subtotalEl) subtotalEl.textContent = `Ksh${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `Ksh${total.toFixed(2)}`;
        if (checkoutTotalEl) checkoutTotalEl.textContent = `Ksh${total.toFixed(2)}`;
    },

    // Proceed to checkout
    proceedToCheckout() {
        const cart = window.consumerDashboard?.cart || [];
        
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }
        
        closeModal('cartModal');
        this.showCheckoutModal(cart);
    },

    // Show checkout modal
    showCheckoutModal(cart) {
        const modal = createModal('checkoutModal', 'Checkout', `
            <form id="checkoutForm">
                <div class="space-y-4">
                    <div class="form-group">
                        <label for="deliveryAddress">Delivery Address</label>
                        <textarea id="deliveryAddress" required class="w-full p-2 border rounded" rows="3" 
                                  placeholder="Enter your complete delivery address"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="phoneNumber">Phone Number</label>
                        <input type="tel" id="phoneNumber" required class="w-full p-2 border rounded" 
                               placeholder="254712345678">
                    </div>
                    <div class="form-group">
                        <label for="paymentMethod">Payment Method</label>
                        <select id="paymentMethod" required class="w-full p-2 border rounded">
                            <option value="">Select Payment Method</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="cod">Cash on Delivery</option>
                        </select>
                    </div>
                    <div class="border-t pt-4">
                        <div class="flex justify-between items-center font-semibold text-lg">
                            <span>Total Amount:</span>
                            <span id="checkoutTotal">Ksh${(cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Place Order</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('checkoutForm');
        form.addEventListener('submit', this.placeOrder.bind(this));

        // Add payment method change handler
        const paymentMethodSelect = document.getElementById('paymentMethod');
        paymentMethodSelect.addEventListener('change', this.showPaymentForm.bind(this));
    },

    // Show payment form based on selection
    showPaymentForm(event) {
        const paymentMethod = event.target.value;
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
            const cart = window.consumerDashboard?.cart || [];
            const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50;
            
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
                                Total Amount: Ksh${total.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        checkoutForm.appendChild(formContainer);
    },

    // Place order
    async placeOrder(event) {
        event.preventDefault();
        const cart = window.consumerDashboard?.cart || [];
        const currentUser = window.consumerDashboard?.currentUser;
        
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!paymentMethod) {
            showNotification('Please select a payment method', 'error');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing Order...';
        submitBtn.disabled = true;

        try {
            // Validate stock availability before placing order
            const products = window.consumerDashboard?.products || [];
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
                              paymentMethod === 'mpesa' ? 'mobile_money' : 'credit_card',
                total_amount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0) + 50
            };

            const response = await apiClient.createOrder(orderData);
            console.log('Order placed successfully:', response);

            showNotification('Order placed successfully! You will receive updates on your order status.', 'success');
            
            // Clear cart
            const cartKey = this.getCartKey(currentUser);
            localStorage.removeItem(cartKey);
            if (window.consumerDashboard) {
                window.consumerDashboard.cart = [];
            }
            this.updateCartCount([]);
            
            // Close modal
            document.getElementById('checkoutModal')?.remove();
            
            // Refresh dashboard data
            if (window.consumerDashboard) {
                await window.consumerDashboard.loadConsumerData();
            }

        } catch (error) {
            console.error('Error placing order:', error);
            showNotification('Failed to place order: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
};

// Make functions globally available
if (typeof window !== 'undefined') {
    window.ConsumerCart = ConsumerCart;
    window.addToCart = function(productId) {
        if (window.consumerDashboard) {
            window.consumerDashboard.cart = ConsumerCart.addToCart(
                productId, 
                window.consumerDashboard.products, 
                window.consumerDashboard.cart, 
                window.consumerDashboard.currentUser
            );
        }
    };
    window.showCart = function() {
        if (window.consumerDashboard) {
            ConsumerCart.showCart(window.consumerDashboard.cart, window.consumerDashboard.currentUser);
        }
    };
    window.updateCartQuantity = ConsumerCart.updateCartQuantity.bind(ConsumerCart);
    window.removeFromCart = ConsumerCart.removeFromCart.bind(ConsumerCart);
    window.proceedToCheckout = ConsumerCart.proceedToCheckout.bind(ConsumerCart);
}

console.log('Consumer Cart module setup complete');