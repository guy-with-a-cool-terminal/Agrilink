
// Consumer Cart Management Module
class CartManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
        this.cart = [];
        this.loadCart();
    }

    // Helper to define per-user cart key
    getCartKey() {
        return this.currentUser?.email ? `cart_${this.currentUser.email}` : 'cart';
    }

    // Load cart from localStorage
    loadCart() {
        this.cart = JSON.parse(localStorage.getItem(this.getCartKey())) || [];
        this.updateCartCount();
    }

    // Add to cart with stock validation
    addToCart(productId) {
        const products = window.productManager ? window.productManager.products : [];
        const product = products.find(p => p.id === productId);
        if (!product) return this.showNotification('Product not found','error');
        
        if (product.quantity <= 0) {
            return this.showNotification('Product is out of stock', 'error');
        }

        const existing = this.cart.find(i => i.id === productId);
        const currentQty = existing ? existing.quantity : 0;
        
        if (currentQty >= product.quantity) {
            return this.showNotification(`Only ${product.quantity} units available in stock`, 'error');
        }

        if (existing) existing.quantity += 1;
        else this.cart.push({ 
            id: product.id, 
            name: product.name, 
            price: parseFloat(product.price), 
            quantity: 1,
            product_id: product.id,
            max_stock: product.quantity
        });

        this.saveCart();
        this.updateCartCount();
        this.showNotification('Product added to cart!', 'success');
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem(this.getCartKey(), JSON.stringify(this.cart));
    }

    // Update cart count display
    updateCartCount() {
        const countEl = document.getElementById('cartCount');
        if (countEl) countEl.textContent = this.cart.reduce((sum,i)=>sum+i.quantity, 0);
    }

    // Show cart modal
    showCart() {
        const modal = document.getElementById('cartModal');
        const cartItems = document.getElementById('cartItems');
        if (!modal || !cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Your cart is empty</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="flex justify-between items-center p-4 border-b">
                    <div>
                        <h4 class="font-medium">${item.name}</h4>
                        <p class="text-sm text-gray-600">Ksh${parseFloat(item.price).toFixed(2)} x ${item.quantity}</p>
                        ${item.max_stock ? `<p class="text-xs text-gray-500">Stock: ${item.max_stock}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="btn-secondary text-sm" onclick="cartManager.updateCartQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-secondary text-sm ${item.quantity >= (item.max_stock || 999) ? 'opacity-50 cursor-not-allowed' : ''}" 
                                onclick="cartManager.updateCartQuantity(${item.id}, 1)"
                                ${item.quantity >= (item.max_stock || 999) ? 'disabled' : ''}>+</button>
                        <button class="btn-danger text-sm ml-2" onclick="cartManager.removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        }
        
        this.updateCartSummary();
        modal.classList.add('active');
    }

    // Update cart quantity with stock validation
    updateCartQuantity(productId, change) {
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            if (item.max_stock && newQuantity > item.max_stock) {
                this.showNotification(`Only ${item.max_stock} units available in stock`, 'error');
                return;
            }
            
            item.quantity = newQuantity;
            this.saveCart();
            this.showCart();
            this.updateCartCount();
        }
    }

    // Remove from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.saveCart();
        this.showCart();
        this.updateCartCount();
        this.showNotification('Product removed from cart', 'success');
    }

    // Update cart summary
    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const delivery = 50;
        const total = subtotal + delivery;
        
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        const checkoutTotalEl = document.getElementById('checkoutTotal');
        
        if (subtotalEl) subtotalEl.textContent = `Ksh${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `Ksh${total.toFixed(2)}`;
        if (checkoutTotalEl) checkoutTotalEl.textContent = `Ksh${total.toFixed(2)}`;
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.CartManagement = CartManagement;
