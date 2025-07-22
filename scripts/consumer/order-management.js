
// Consumer Order Management Module
class OrderManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
        this.orders = [];
    }

    // Load order history for consumer
    async loadOrderHistory() {
        try {
            const response = await this.apiClient.getOrders();
            const ordersList = this.apiClient.extractArrayData(response) || [];
            
            // Filter orders for current user
            this.orders = ordersList.filter(order => 
                order.user_id == this.currentUser.id || 
                order.customer_email === this.currentUser.email
            );
            
            this.displayOrderHistory(this.orders);
            
        } catch (error) {
            console.error('Error loading order history:', error);
            this.displayOrderHistory([]);
        }
    }

    displayOrderHistory(userOrders) {
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
        
        orderHistoryTable.innerHTML = userOrders.map(order => `
            <tr>
                <td class="font-mono">#${order.id}</td>
                <td>
                    ${order.items ? order.items.map(item => `
                        <div class="text-sm">
                            <div class="font-medium">${item.name}</div>
                            <div class="text-gray-600">Qty: ${item.quantity} @ Ksh${parseFloat(item.unit_price || 0).toFixed(2)}</div>
                        </div>
                    `).join('') : 'No items'}
                </td>
                <td class="font-medium">Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                <td>
                    <span class="status-${order.status || 'pending'}">${(order.status || 'pending').replace('_', ' ')}</span>
                </td>
                <td class="text-sm text-gray-600">${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    ${['pending', 'confirmed'].includes(order.status) ? 
                        `<button class="btn-danger text-sm" onclick="orderManager.cancelOrder(${order.id})">Cancel</button>` :
                        '<span class="text-gray-400 text-sm">No actions</span>'
                    }
                </td>
            </tr>
        `).join('');
    }

    // Place order with enhanced payment processing and stock management
    async placeOrder(event) {
        event.preventDefault();
        const cart = window.cartManager ? window.cartManager.cart : [];
        
        if (cart.length === 0) return this.showNotification('Your cart is empty','error');

        const paymentMethod = document.getElementById('paymentMethod').value;
        if (!paymentMethod) return this.showNotification('Please select a payment method', 'error');
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing Order...';
        submitBtn.disabled = true;

        try {
            // Validate stock availability before placing order
            const products = window.productManager ? window.productManager.products : [];
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
            
            const response = await this.apiClient.createOrder(orderData);
            console.log('Order created:', response);
            
            // Handle M-Pesa STK push
            if (paymentMethod === 'mpesa') {
                this.showNotification('STK push sent to your phone. Please complete payment on your device.', 'info');
            } else if (paymentMethod === 'cod') {
                this.showNotification('Order placed successfully! You will pay on delivery.', 'success');
            } else {
                this.showNotification('Order placed successfully!', 'success');
            }
            
            // Clear cart and refresh data
            if (window.cartManager) {
                window.cartManager.clearCart();
            }
            this.closeModal('checkoutModal');
            event.target.reset();
            
            // Reload products to reflect updated stock
            if (window.productManager) await window.productManager.loadProducts();
            if (window.statsManager) await window.statsManager.loadConsumerStats();
            await this.loadOrderHistory();
            
        } catch (error) {
            console.error('Error placing order:', error);
            let errorMessage = 'Failed to place order';
            if (error.message.includes('Insufficient stock')) {
                errorMessage = error.message;
            } else if (error.message.includes('Invalid payment method')) {
                errorMessage = 'Invalid payment method selected. Please choose a valid payment option.';
            }
            this.showNotification(errorMessage, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        this.apiClient.cancelOrder(orderId)
            .then(() => {
                this.showNotification('Order cancelled successfully', 'success');
                this.loadOrderHistory();
                if (window.statsManager) window.statsManager.loadConsumerStats();
            })
            .catch(error => {
                console.error('Error cancelling order:', error);
                this.showNotification('Failed to cancel order', 'error');
            });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.OrderManagement = OrderManagement;
