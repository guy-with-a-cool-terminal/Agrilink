// Replace the assignOrder method in your AdminDashboard class

async assignOrder(orderId) {
    try {
        // STEP 1: Check for existing delivery via API call (more reliable than local data)
        console.log(`Checking for existing delivery for order ${orderId}...`);
        
        let existingDelivery = null;
        try {
            // Try to find existing delivery by making an API call
            const deliveriesResponse = await apiClient.getDeliveries();
            const allDeliveries = apiClient.extractArrayData(deliveriesResponse);
            existingDelivery = allDeliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
        } catch (error) {
            console.warn('Could not fetch deliveries for checking:', error);
            // Fallback to local data
            existingDelivery = this.data.deliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
        }

        if (existingDelivery) {
            // STEP 2: If delivery exists, offer to UPDATE it instead of creating new one
            const confirmUpdate = confirm(
                `Order #${orderId} already has a delivery assigned (ID: #${existingDelivery.id}).\n\n` +
                `Current Status: ${existingDelivery.status}\n` +
                `Assigned To: ${existingDelivery.assigned_to || 'Unassigned'}\n\n` +
                `Would you like to UPDATE this existing delivery instead?`
            );
            
            if (confirmUpdate) {
                // Redirect to update existing delivery
                await this.updateExistingDelivery(existingDelivery);
                return;
            } else {
                return; // User cancelled
            }
        }

        // STEP 3: Get logistics users
        const logisticsUsers = this.data.users.filter(u => u.role === 'logistics');
        if (logisticsUsers.length === 0) {
            this.showNotification('No logistics users available', 'error');
            return;
        }

        // STEP 4: Get order details
        const order = this.data.orders.find(o => parseInt(o.id) === parseInt(orderId));
        if (!order) {
            this.showNotification('Order not found', 'error');
            return;
        }

        // STEP 5: Show assignment modal
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = tomorrow.toISOString().slice(0, 16);

        const modal = this.createModal('assignOrderModal', 'Assign Order to Logistics', `
            <div class="mb-4">
                <p class="text-sm text-gray-600">Order #${order.id} - Ksh${parseFloat(order.total_amount || 0).toLocaleString()}</p>
                <p class="text-xs text-gray-500">Customer: ${order.user?.name || 'N/A'}</p>
            </div>
            <form id="assignOrderForm">
                <div class="form-group mb-4">
                    <label>Logistics User *</label>
                    <select id="logisticsUser" required class="w-full p-2 border rounded">
                        <option value="">Choose Logistics User</option>
                        ${logisticsUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label>Scheduled Date & Time *</label>
                    <input type="datetime-local" id="scheduledDate" required class="w-full p-2 border rounded" 
                           value="${defaultDate}" min="${new Date().toISOString().slice(0, 16)}">
                </div>
                <div class="form-group mb-4">
                    <label>Priority</label>
                    <select id="priority" class="w-full p-2 border rounded">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label>Delivery Address *</label>
                    <textarea id="deliveryAddress" required class="w-full p-2 border rounded" rows="3" 
                              placeholder="Enter delivery address...">${order.delivery_address || ''}</textarea>
                </div>
                <div class="form-group mb-4">
                    <label>Delivery Notes (optional)</label>
                    <textarea id="deliveryNotes" class="w-full p-2 border rounded" rows="2" 
                              placeholder="Special instructions, contact info, etc..."></textarea>
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="btn-primary flex-1">Assign Order</button>
                    <button type="button" onclick="dashboard.closeModal('assignOrderModal')" class="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        `);

        // STEP 6: Handle form submission
        document.getElementById('assignOrderForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const deliveryData = {
                order_id: parseInt(orderId),
                assigned_to: parseInt(document.getElementById('logisticsUser').value),
                scheduled_date: new Date(document.getElementById('scheduledDate').value).toISOString(),
                delivery_address: document.getElementById('deliveryAddress').value.trim(),
                priority: document.getElementById('priority').value,
                delivery_notes: document.getElementById('deliveryNotes').value.trim() || null
            };

            console.log('Creating delivery with data:', deliveryData);

            try {
                const response = await apiClient.createDelivery(deliveryData);
                this.showNotification('Order assigned successfully!', 'success');
                this.closeModal('assignOrderModal');
                await this.loadAllData(); // Refresh all data
            } catch (error) {
                console.error('Error assigning order:', error);
                
                // Handle specific error cases
                if (error.message.includes('already exists')) {
                    this.showNotification(
                        'This order already has a delivery assigned. Please refresh the page and try updating the existing delivery instead.', 
                        'error'
                    );
                    // Force refresh data
                    await this.loadAllData();
                } else {
                    this.showNotification('Failed to assign order: ' + error.message, 'error');
                }
            }
        };

    } catch (error) {
        console.error('Error in assignOrder:', error);
        this.showNotification('Failed to load assignment data: ' + error.message, 'error');
    }
}

// NEW METHOD: Update existing delivery instead of creating new one
async updateExistingDelivery(delivery) {
    try {
        // Get logistics users
        const logisticsUsers = this.data.users.filter(u => u.role === 'logistics');
        if (logisticsUsers.length === 0) {
            this.showNotification('No logistics users available', 'error');
            return;
        }

        // Format current scheduled date for input
        const currentDate = delivery.scheduled_date ? 
            new Date(delivery.scheduled_date).toISOString().slice(0, 16) : 
            new Date().toISOString().slice(0, 16);

        const modal = this.createModal('updateDeliveryModal', 'Update Existing Delivery', `
            <div class="mb-4">
                <p class="text-sm text-gray-600">Delivery #${delivery.id} for Order #${delivery.order_id}</p>
                <p class="text-xs text-gray-500">Current Status: ${delivery.status}</p>
            </div>
            <form id="updateDeliveryForm">
                <div class="form-group mb-4">
                    <label>Logistics User *</label>
                    <select id="updateLogisticsUser" required class="w-full p-2 border rounded">
                        <option value="">Choose Logistics User</option>
                        ${logisticsUsers.map(u => 
                            `<option value="${u.id}" ${parseInt(u.id) === parseInt(delivery.assigned_to) ? 'selected' : ''}>${u.name} (${u.email})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label>Scheduled Date & Time *</label>
                    <input type="datetime-local" id="updateScheduledDate" required class="w-full p-2 border rounded" 
                           value="${currentDate}" min="${new Date().toISOString().slice(0, 16)}">
                </div>
                <div class="form-group mb-4">
                    <label>Priority</label>
                    <select id="updatePriority" class="w-full p-2 border rounded">
                        <option value="low" ${delivery.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${delivery.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${delivery.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="urgent" ${delivery.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label>Delivery Address *</label>
                    <textarea id="updateDeliveryAddress" required class="w-full p-2 border rounded" rows="3">${delivery.delivery_address || ''}</textarea>
                </div>
                <div class="form-group mb-4">
                    <label>Delivery Notes</label>
                    <textarea id="updateDeliveryNotes" class="w-full p-2 border rounded" rows="2">${delivery.delivery_notes || ''}</textarea>
                </div>
                <div class="form-group mb-4">
                    <label>Status</label>
                    <select id="updateDeliveryStatus" class="w-full p-2 border rounded">
                        <option value="assigned" ${delivery.status === 'assigned' ? 'selected' : ''}>Assigned</option>
                        <option value="picked_up" ${delivery.status === 'picked_up' ? 'selected' : ''}>Picked Up</option>
                        <option value="in_transit" ${delivery.status === 'in_transit' ? 'selected' : ''}>In Transit</option>
                        <option value="delivered" ${delivery.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="failed" ${delivery.status === 'failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="btn-primary flex-1">Update Delivery</button>
                    <button type="button" onclick="dashboard.closeModal('updateDeliveryModal')" class="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        `);

        // Handle form submission
        document.getElementById('updateDeliveryForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const updateData = {
                assigned_to: parseInt(document.getElementById('updateLogisticsUser').value),
                scheduled_date: new Date(document.getElementById('updateScheduledDate').value).toISOString(),
                delivery_address: document.getElementById('updateDeliveryAddress').value.trim(),
                priority: document.getElementById('updatePriority').value,
                delivery_notes: document.getElementById('updateDeliveryNotes').value.trim() || null,
                status: document.getElementById('updateDeliveryStatus').value
            };

            try {
                await apiClient.updateDelivery(delivery.id, updateData);
                this.showNotification('Delivery updated successfully!', 'success');
                this.closeModal('updateDeliveryModal');
                await this.loadAllData();
            } catch (error) {
                console.error('Error updating delivery:', error);
                this.showNotification('Failed to update delivery: ' + error.message, 'error');
            }
        };

    } catch (error) {
        console.error('Error in updateExistingDelivery:', error);
        this.showNotification('Failed to load delivery update form', 'error');
    }
}