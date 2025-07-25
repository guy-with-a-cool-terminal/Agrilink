// Admin Orders Management Module
// Handles order management, delivery assignment, and order status updates

console.log('Admin Orders module loaded successfully');

// Orders management functionality for AdminDashboard
const AdminOrders = {
    // Update orders table
    updateOrdersTable() {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;

        if (dashboard.data.orders.length === 0) {
            tableBody.innerHTML = getEmptyTableRow('orders', 6);
            return;
        }

        const recentOrders = dashboard.data.orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        tableBody.innerHTML = recentOrders.map(order => `
            <tr>
                <td class="font-medium">#${order.id}</td>
                <td>${order.user?.name || order.customer_name || 'N/A'}</td>
                <td class="font-medium">Ksh${(parseFloat(order.total_amount) || 0).toLocaleString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="text-sm text-gray-500">${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${this.getOrderActions(order)}</td>
            </tr>
        `).join('');
    },

    // IMPROVED ORDER ACTIONS - Better logic for delivery management
    getOrderActions(order) {
        const hasDelivery = dashboard.data.deliveries.some(d => parseInt(d.order_id) === parseInt(order.id));
        const orderStatus = order.status;
        
        let actions = `<button class="btn-secondary text-sm" onclick="AdminOrders.viewOrder('${order.id}')">View</button>`;
        
        if (hasDelivery) {
            // Order has delivery - show management option
            actions += ` <button class="btn-success text-sm" onclick="AdminOrders.manageDelivery('${order.id}')">Manage Delivery</button>`;
        } else {
            // No delivery exists
            if (orderStatus === 'pending') {
                actions += ` <button class="btn-warning text-sm" onclick="AdminOrders.updateOrderStatus('${order.id}')">Confirm Order</button>`;
            } else if (orderStatus === 'confirmed') {
                actions += ` <button class="btn-primary text-sm" onclick="AdminOrders.showAssignOrderModal('${order.id}')">Assign</button>`;
            } else {
                actions += ` <button class="btn-secondary text-sm" onclick="AdminOrders.updateOrderStatus('${order.id}')">Update Status</button>`;
            }
        }
        
        return `<div class="flex space-x-2">${actions}</div>`;
    },

    // View order details
    async viewOrder(orderId) {
        const order = dashboard.data.orders.find(o => o.id == orderId);
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }

        const modal = createModal('orderViewModal', `Order #${order.id} Details`, `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Customer</label>
                        <p class="mt-1 text-sm text-gray-900">${order.user?.name || order.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${order.user?.email || order.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Total Amount</label>
                        <p class="mt-1 text-sm text-gray-900">Ksh${(parseFloat(order.total_amount) || 0).toLocaleString()}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <p class="mt-1 text-sm text-gray-900"><span class="status-${order.status}">${order.status}</span></p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Order Date</label>
                        <p class="mt-1 text-sm text-gray-900">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Delivery Address</label>
                        <p class="mt-1 text-sm text-gray-900">${order.delivery_address || 'Not specified'}</p>
                    </div>
                </div>
                ${order.items ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                        <div class="space-y-2">
                            ${order.items.map(item => `
                                <div class="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>${item.name || 'Product'}</span>
                                    <span>Qty: ${item.quantity} × Ksh${(parseFloat(item.unit_price) || 0).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="mt-6 flex justify-end space-x-2">
                    <button class="btn-secondary" onclick="this.closest('.fixed').remove()">Close</button>
                    <button class="btn-primary" onclick="AdminOrders.updateOrderStatus('${order.id}'); this.closest('.fixed').remove();">Update Status</button>
                </div>
            </div>
        `);
    },

    // Show assign order modal
    async showAssignOrderModal(orderId) {
        const requestKey = `assign-order-${orderId}`;
        
        // Prevent multiple simultaneous requests for the same order
        if (dashboard.pendingRequests.has(requestKey)) {
            showNotification(`Assignment already in progress for Order #${orderId}...`, 'warning');
            return;
        }

        dashboard.pendingRequests.add(requestKey);

        try {
            // Get logistics users
            const logisticsUsers = dashboard.data.users.filter(u => u.role === 'logistics');
            if (logisticsUsers.length === 0) {
                showNotification('No logistics users available. Please create logistics users first.', 'error');
                return;
            }

            const order = dashboard.data.orders.find(o => o.id == orderId);
            if (!order) {
                showNotification('Order not found', 'error');
                return;
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const defaultDate = tomorrow.toISOString().slice(0, 16);

            const modal = createModal('assignOrderModal', 'Assign Order to Logistics', `
                <div class="mb-4 p-3 bg-gray-50 rounded">
                    <p class="text-sm text-gray-700"><strong>Order #${order.id}</strong></p>
                    <p class="text-sm text-gray-600">Customer: ${order.user?.name || 'N/A'}</p>
                    <p class="text-sm text-gray-600">Amount: Ksh${parseFloat(order.total_amount || 0).toLocaleString()}</p>
                    <p class="text-sm text-gray-600">Status: ${order.status}</p>
                </div>
                <form id="assignOrderForm">
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Assign to Logistics User</label>
                        <select id="logisticsUser" required class="w-full p-2 border rounded">
                            <option value="">Choose Logistics User</option>
                            ${logisticsUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Scheduled Date & Time</label>
                        <input type="datetime-local" id="scheduledDate" required class="w-full p-2 border rounded" 
                               value="${defaultDate}" min="${new Date().toISOString().slice(0, 16)}">
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Priority</label>
                        <select id="priority" class="w-full p-2 border rounded">
                            <option value="low">Low Priority</option>
                            <option value="medium" selected>Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Delivery Address</label>
                        <textarea id="deliveryAddress" required class="w-full p-2 border rounded" rows="3" 
                                  placeholder="Enter complete delivery address">${order.delivery_address || ''}</textarea>
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Delivery Notes (optional)</label>
                        <textarea id="deliveryNotes" class="w-full p-2 border rounded" rows="2" 
                                  placeholder="Special instructions, contact info, etc."></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Assign Order</button>
                    </div>
                </form>
            `);

            // Add form submit handler
            const form = document.getElementById('assignOrderForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    order_id: orderId,
                    assigned_to: document.getElementById('logisticsUser').value,
                    scheduled_date: document.getElementById('scheduledDate').value,
                    priority: document.getElementById('priority').value,
                    delivery_address: document.getElementById('deliveryAddress').value,
                    delivery_notes: document.getElementById('deliveryNotes').value
                };

                try {
                    const response = await apiClient.createDelivery(formData);
                    console.log('Delivery assigned successfully:', response);
                    showNotification(`Order #${orderId} assigned to logistics successfully!`, 'success');
                    modal.remove();
                    await dashboard.loadAllData();
                } catch (error) {
                    console.error('Error assigning order:', error);
                    showNotification('Failed to assign order: ' + error.message, 'error');
                }
            });

        } catch (error) {
            console.error('Error in assign order modal:', error);
            showNotification('Failed to load assignment form', 'error');
        } finally {
            dashboard.pendingRequests.delete(requestKey);
        }
    },

    // Update order status
    async updateOrderStatus(orderId) {
        const order = dashboard.data.orders.find(o => o.id == orderId);
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }

        const modal = createModal('updateOrderStatusModal', `Update Order #${orderId} Status`, `
            <form id="updateOrderStatusForm">
                <div class="form-group mb-4">
                    <label class="block text-sm font-medium mb-1">Current Status: <span class="status-${order.status}">${order.status}</span></label>
                    <label class="block text-sm font-medium mb-1">New Status</label>
                    <select id="newOrderStatus" required class="w-full p-2 border rounded">
                        <option value="">Select Status</option>
                        <option value="pending" ${order.status === 'pending' ? 'disabled' : ''}>Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label class="block text-sm font-medium mb-1">Notes (optional)</label>
                    <textarea id="statusNotes" class="w-full p-2 border rounded" rows="3" 
                              placeholder="Additional notes about this status change"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Status</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('updateOrderStatusForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newStatus = document.getElementById('newOrderStatus').value;
            const notes = document.getElementById('statusNotes').value;

            try {
                await apiClient.updateOrderStatus(orderId, newStatus);
                showNotification(`Order #${orderId} status updated to ${newStatus}!`, 'success');
                modal.remove();
                await dashboard.loadAllData();
            } catch (error) {
                console.error('Error updating order status:', error);
                showNotification('Failed to update order status: ' + error.message, 'error');
            }
        });
    },

    // Manage delivery for order
    async manageDelivery(orderId) {
        const delivery = dashboard.data.deliveries.find(d => d.order_id == orderId);
        if (!delivery) {
            showNotification('Delivery not found for this order', 'error');
            return;
        }

        const modal = createModal('manageDeliveryModal', `Manage Delivery for Order #${orderId}`, `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Delivery ID</label>
                        <p class="mt-1 text-sm text-gray-900">#${delivery.id}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <p class="mt-1 text-sm text-gray-900"><span class="status-${delivery.status}">${delivery.status}</span></p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Assigned To</label>
                        <p class="mt-1 text-sm text-gray-900">${delivery.assigned_user?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Priority</label>
                        <p class="mt-1 text-sm text-gray-900">${delivery.priority || 'Medium'}</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Delivery Address</label>
                        <p class="mt-1 text-sm text-gray-900">${delivery.delivery_address || 'Not specified'}</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button class="btn-secondary" onclick="this.closest('.fixed').remove()">Close</button>
                    <button class="btn-primary" onclick="AdminOrders.updateDeliveryStatus('${delivery.id}'); this.closest('.fixed').remove();">Update Status</button>
                </div>
            </div>
        `);
    },

    // Update delivery status
    async updateDeliveryStatus(deliveryId) {
        const delivery = dashboard.data.deliveries.find(d => d.id == deliveryId);
        if (!delivery) {
            showNotification('Delivery not found', 'error');
            return;
        }

        const modal = createModal('updateDeliveryStatusModal', `Update Delivery #${deliveryId} Status`, `
            <form id="updateDeliveryStatusForm">
                <div class="form-group mb-4">
                    <label class="block text-sm font-medium mb-1">Current Status: <span class="status-${delivery.status}">${delivery.status}</span></label>
                    <label class="block text-sm font-medium mb-1">New Status</label>
                    <select id="newDeliveryStatus" required class="w-full p-2 border rounded">
                        <option value="">Select Status</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label class="block text-sm font-medium mb-1">Location/Notes</label>
                    <textarea id="deliveryStatusNotes" class="w-full p-2 border rounded" rows="3" 
                              placeholder="Current location or delivery notes"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Update Status</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('updateDeliveryStatusForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const statusData = {
                status: document.getElementById('newDeliveryStatus').value,
                notes: document.getElementById('deliveryStatusNotes').value
            };

            try {
                await apiClient.updateDeliveryStatus(deliveryId, statusData);
                showNotification(`Delivery #${deliveryId} status updated!`, 'success');
                modal.remove();
                await dashboard.loadAllData();
            } catch (error) {
                console.error('Error updating delivery status:', error);
                showNotification('Failed to update delivery status: ' + error.message, 'error');
            }
        });
    }
};

// Extend AdminDashboard prototype
if (typeof window !== 'undefined' && window.AdminDashboard) {
    Object.assign(window.AdminDashboard.prototype, {
        updateOrdersTable: AdminOrders.updateOrdersTable
    });
    
    // Make AdminOrders methods globally available
    window.AdminOrders = AdminOrders;
    window.viewOrder = AdminOrders.viewOrder;
    window.updateOrderStatus = AdminOrders.updateOrderStatus;
    window.showAssignOrderModal = AdminOrders.showAssignOrderModal;
    window.manageDelivery = AdminOrders.manageDelivery;
}

console.log('Admin Orders module setup complete');