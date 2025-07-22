
// Admin Order Management Module
class OrderManagement {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.orders = [];
    }

    // Load orders with real-time data
    async loadOrders() {
        try {
            const response = await this.apiClient.getOrders();
            this.orders = this.apiClient.extractArrayData(response);
            console.log('Orders loaded:', this.orders);
            
            this.displayOrdersTable();
            
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showOrdersError();
        }
    }

    displayOrdersTable() {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.orders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-600">No orders found.</p>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        // Sort orders by date (newest first)
        this.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        this.orders.slice(0, 10).forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.created_at).toLocaleDateString();
            const amount = parseFloat(order.total_amount) || 0;
            
            // Get product names from items
            let productNames = 'No items';
            if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                productNames = order.items.map(item => item.name || item.product_name || 'Product').join(', ');
            }
            
            row.innerHTML = `
                <td class="font-medium">#${order.id}</td>
                <td class="text-sm">${productNames}</td>
                <td>${order.user?.name || order.customer_name || 'N/A'}</td>
                <td class="font-medium">Ksh${amount.toLocaleString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="text-sm text-gray-500">${orderDate}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="orderManager.viewOrderDetails('${order.id}')">
                            View
                        </button>
                        <button class="btn-primary text-sm" onclick="orderManager.updateOrderStatus('${order.id}')">
                            Update
                        </button>
                        <button class="btn-secondary text-sm" onclick="orderManager.assignToLogistics('${order.id}')">
                            Assign
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // View order details in modal
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        let itemsHtml = '';
        if (order.items && Array.isArray(order.items)) {
            itemsHtml = order.items.map(item => `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                        <div class="font-medium">${item.name || item.product_name || 'Product'}</div>
                        <div class="text-sm text-gray-600">Quantity: ${item.quantity || 0}</div>
                    </div>
                    <div class="font-medium">Ksh${(parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0)).toFixed(2)}</div>
                </div>
            `).join('');
        } else {
            itemsHtml = '<p class="text-gray-500">No items found</p>';
        }
        
        const modalHtml = `
            <div id="orderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Order Details #${order.id}</h3>
                        <button onclick="orderManager.closeOrderModal()" class="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Customer</label>
                                <p class="mt-1">${order.user?.name || order.customer_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <p class="mt-1"><span class="status-${order.status}">${order.status}</span></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Total Amount</label>
                                <p class="mt-1 font-medium">Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Order Date</label>
                                <p class="mt-1">${new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Items</label>
                            <div class="space-y-2">
                                ${itemsHtml}
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Delivery Address</label>
                            <p class="mt-1">${order.delivery_address || 'Not specified'}</p>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button onclick="orderManager.closeOrderModal()" class="btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Update order status
    updateOrderStatus(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        const newStatus = prompt('Enter new status (pending, confirmed, processing, shipped, delivered, cancelled):', order.status);
        if (newStatus && ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
            this.apiClient.updateOrder(orderId, { status: newStatus })
                .then(() => {
                    this.showNotification('Order status updated successfully', 'success');
                    this.loadOrders();
                })
                .catch(error => {
                    console.error('Error updating order status:', error);
                    this.showNotification('Failed to update order status', 'error');
                });
        } else if (newStatus) {
            this.showNotification('Invalid status. Please use: pending, confirmed, processing, shipped, delivered, or cancelled', 'error');
        }
    }

    // Assign order to logistics
    assignToLogistics(orderId) {
        const order = this.orders.find(o => o.id == orderId);
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }
        
        if (confirm(`Assign order #${orderId} to logistics for delivery?`)) {
            const deliveryData = {
                order_id: orderId,
                customer_name: order.user?.name || order.customer_name || 'Customer',
                delivery_address: order.delivery_address || 'Not specified',
                status: 'pending',
                priority: 'medium'
            };
            
            this.apiClient.createDelivery(deliveryData)
                .then(() => {
                    this.showNotification('Order assigned to logistics successfully', 'success');
                    this.updateOrderStatus(orderId, 'processing');
                })
                .catch(error => {
                    console.error('Error assigning to logistics:', error);
                    this.showNotification('Failed to assign order to logistics', 'error');
                });
        }
    }

    closeOrderModal() {
        const modal = document.getElementById('orderModal');
        if (modal) {
            modal.remove();
        }
    }

    showOrdersError() {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-red-400 text-4xl mb-4">⚠️</div>
                        <p class="text-gray-600 mb-4">Failed to load orders. Please try again.</p>
                        <button class="btn-primary" onclick="orderManager.loadOrders()">Retry</button>
                    </td>
                </tr>
            `;
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
