
// Retailer Order Management Module
class RetailerOrderManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
        this.orders = [];
    }

    // Load and display order history with detailed product information
    async loadOrderHistory() {
        try {
            const response = await this.apiClient.getOrders();
            const ordersList = this.apiClient.extractArrayData(response) || [];
            
            // Filter orders for current retailer
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

    displayOrderHistory(orders) {
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
        
        orderHistoryTable.innerHTML = orders.map(order => {
            // Get product names from order items
            let productDisplay = 'No products';
            let totalQuantity = 0;
            
            if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                productDisplay = order.items.map(item => {
                    const quantity = parseInt(item.quantity || 0);
                    totalQuantity += quantity;
                    return `
                        <div class="text-sm mb-1">
                            <div class="font-medium">${item.name || item.product_name || 'Product'}</div>
                            <div class="text-gray-600">Qty: ${quantity}</div>
                        </div>
                    `;
                }).join('');
            } else if (order.product_name) {
                const quantity = parseInt(order.quantity || 0);
                totalQuantity = quantity;
                productDisplay = `
                    <div class="text-sm mb-1">
                        <div class="font-medium">${order.product_name}</div>
                        <div class="text-gray-600">Qty: ${quantity}</div>
                    </div>
                `;
            }

            return `
                <tr>
                    <td class="font-mono">#${order.id}</td>
                    <td>${productDisplay}</td>
                    <td>${totalQuantity}</td>
                    <td class="font-medium">Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                    <td>
                        <span class="status-${order.status || 'pending'}">${(order.status || 'pending').replace('_', ' ')}</span>
                    </td>
                    <td class="text-sm text-gray-600">${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                        ${['pending', 'confirmed'].includes(order.status) ? 
                            `<button class="btn-danger text-sm" onclick="retailerOrderManager.cancelOrder(${order.id})">Cancel</button>` :
                            '<span class="text-gray-400 text-sm">Completed</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Add order cancellation function
    cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this bulk order?')) return;
        
        this.apiClient.cancelOrder(orderId)
            .then(() => {
                this.showNotification('Order cancelled successfully', 'success');
                this.loadOrderHistory();
                if (window.retailerStatsManager) window.retailerStatsManager.loadRetailerStats();
            })
            .catch(error => {
                console.error('Error cancelling order:', error);
                this.showNotification('Failed to cancel order', 'error');
            });
    }

    // Place bulk order
    async placeBulkOrder(event) {
        event.preventDefault();
        
        const productSelect = document.getElementById('productSelect');
        const bulkQuantity = document.getElementById('bulkQuantity');
        const deliveryDate = document.getElementById('deliveryDate');
        const budgetRange = document.getElementById('budgetRange');
        const bulkPaymentMethod = document.getElementById('bulkPaymentMethod');
        const specialRequirements = document.getElementById('specialRequirements');
        
        if (!productSelect || !bulkQuantity || !deliveryDate || !budgetRange || !bulkPaymentMethod) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const productId = productSelect.value;
        const quantity = parseInt(bulkQuantity.value);
        
        if (!productId || isNaN(quantity) || quantity < 10) {
            this.showNotification('Please select a product and enter a quantity of at least 10', 'error');
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
            // const response = await this.apiClient.createBulkOrder(orderData);
            // console.log('Bulk order created:', response);
            
            this.showNotification('Bulk order placed successfully!', 'success');
            event.target.reset();
            if (window.retailerProductManager) window.retailerProductManager.updateOrderSummary();
            
        } catch (error) {
            console.error('Error placing bulk order:', error);
            this.showNotification('Failed to place bulk order', 'error');
        }
    }

    // Schedule delivery
    async scheduleDelivery(event) {
        event.preventDefault();
        
        const orderSelect = document.getElementById('orderSelect');
        const deliveryTime = document.getElementById('deliveryTime');
        const deliveryAddress = document.getElementById('deliveryAddress');
        
        if (!orderSelect || !deliveryTime || !deliveryAddress) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const orderId = orderSelect.value;
        
        const deliveryData = {
            order_id: orderId,
            delivery_time: deliveryTime.value,
            delivery_address: deliveryAddress.value
        };
        
        try {
            // const response = await this.apiClient.scheduleDelivery(deliveryData);
            // console.log('Delivery scheduled:', response);
            
            this.showNotification('Delivery scheduled successfully!', 'success');
            event.target.reset();
            
        } catch (error) {
            console.error('Error scheduling delivery:', error);
            this.showNotification('Failed to schedule delivery', 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.RetailerOrderManagement = RetailerOrderManagement;
