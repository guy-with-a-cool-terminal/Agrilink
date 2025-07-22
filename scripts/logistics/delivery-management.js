
// Logistics Delivery Management Module
class DeliveryManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
        this.deliveries = [];
    }

    // Enhanced loadDeliveries function to show assigned deliveries
    async loadDeliveries() {
        try {
            const response = await this.apiClient.getDeliveries();
            const deliveriesList = this.apiClient.extractArrayData(response) || [];
            
            // Filter deliveries assigned to current user or unassigned ones
            this.deliveries = deliveriesList.filter(delivery => 
                !delivery.assigned_to || delivery.assigned_to == this.currentUser.id
            );
            
            this.displayDeliveries(this.deliveries);
            this.updateDeliverySelect(this.deliveries);
            
        } catch (error) {
            console.error('Error loading deliveries:', error);
            this.displayDeliveries([]);
        }
    }

    // Display deliveries in table
    displayDeliveries(deliveriesList) {
        const deliveriesTable = document.getElementById('deliveriesTable');
        if (!deliveriesTable) return;
        
        if (!Array.isArray(deliveriesList) || deliveriesList.length === 0) {
            deliveriesTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <p class="text-gray-500">No deliveries assigned</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        deliveriesTable.innerHTML = deliveriesList.map(delivery => `
            <tr>
                <td class="font-mono">#${delivery.id}</td>
                <td>
                    ${delivery.order ? `
                        <div class="text-sm">
                            <div class="font-medium">Order #${delivery.order.id}</div>
                            <div class="text-gray-600">${delivery.order.items?.length || 0} items</div>
                        </div>
                    ` : 'No order details'}
                </td>
                <td>${delivery.customer_name || delivery.order?.customer_name || 'Unknown'}</td>
                <td class="text-sm">${delivery.delivery_address || 'Not specified'}</td>
                <td>
                    <span class="status-${delivery.status || 'pending'}">${(delivery.status || 'pending').replace('_', ' ')}</span>
                </td>
                <td>
                    <span class="priority-${delivery.priority || 'medium'}">${delivery.priority || 'medium'}</span>
                </td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn-secondary text-sm" onclick="deliveryManager.updateDeliveryStatus('${delivery.id}', 'in_transit')">
                            Start
                        </button>
                        <button class="btn-primary text-sm" onclick="deliveryManager.updateDeliveryStatus('${delivery.id}', 'delivered')">
                            Complete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update delivery status
    async updateDeliveryStatus(deliveryId, newStatus, event = null) {
        if (event) {
            event.preventDefault();
            
            const deliverySelect = document.getElementById('deliverySelect');
            const statusSelect = document.getElementById('newStatus');
            const location = document.getElementById('location');
            const statusNotes = document.getElementById('statusNotes');

            if (!deliverySelect || !statusSelect) {
                this.showNotification('Please select delivery and new status', 'warning');
                return;
            }

            deliveryId = deliverySelect.value;
            newStatus = statusSelect.value;
            
            if (!deliveryId || !newStatus) {
                this.showNotification('Please select delivery and new status', 'warning');
                return;
            }
        }

        try {
            const updateData = { status: newStatus };
            
            if (event) {
                const location = document.getElementById('location');
                const statusNotes = document.getElementById('statusNotes');
                if (location) updateData.location = location.value;
                if (statusNotes) updateData.notes = statusNotes.value;
            }

            const response = await this.apiClient.updateDelivery(deliveryId, updateData);

            console.log('Delivery status updated:', response);
            this.showNotification('Delivery status updated successfully!', 'success');
            
            this.loadDeliveries(); // Refresh deliveries
            if (window.logisticsStatsManager) window.logisticsStatsManager.loadLogisticsStats(); // Refresh stats
        } catch (error) {
            console.error('Error updating delivery status:', error);
            this.showNotification('Failed to update delivery status', 'error');
        }
    }

    // Populate delivery select
    updateDeliverySelect(deliveriesList) {
        const deliverySelect = document.getElementById('deliverySelect');
        if (!deliverySelect) return;

        deliverySelect.innerHTML = '<option value="">Select Delivery</option>';

        deliveriesList.forEach(delivery => {
            const option = document.createElement('option');
            option.value = delivery.id;
            option.textContent = `#${delivery.id} - ${delivery.customer_name || 'Customer'}`;
            deliverySelect.appendChild(option);
        });
    }

    // Refresh deliveries
    refreshDeliveries() {
        this.loadDeliveries();
        if (window.logisticsStatsManager) window.logisticsStatsManager.loadLogisticsStats();
    }

    // Refresh delivery map (Placeholder function)
    refreshDeliveryMap() {
        this.showNotification('Refreshing delivery map...', 'info');
        // Implement your map refresh logic here
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.DeliveryManagement = DeliveryManagement;
