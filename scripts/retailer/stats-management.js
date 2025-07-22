
// Retailer Statistics Management Module
class RetailerStatsManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
    }

    // Load retailer-specific statistics
    async loadRetailerStats() {
        try {
            const ordersResponse = await this.apiClient.getOrders();
            const ordersList = this.apiClient.extractArrayData(ordersResponse) || [];
            
            // Filter orders for current retailer
            const retailerOrders = ordersList.filter(order => 
                order.user_id == this.currentUser.id || 
                order.customer_email === this.currentUser.email
            );
            
            const totalOrders = retailerOrders.length;
            const totalSpent = retailerOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
            const pendingDeliveries = retailerOrders.filter(order => 
                ['pending', 'processing', 'confirmed'].includes(order.status)
            ).length;
            
            // Mock active suppliers (replace with actual logic later)
            const activeSuppliers = Math.floor(Math.random() * 10) + 5; // Random number between 5 and 15
            
            // Update stats display with retailer-specific data
            this.updateStatElement('totalOrders', totalOrders);
            this.updateStatElement('totalSpent', `Ksh${totalSpent.toLocaleString()}`);
            this.updateStatElement('activeSuppliers', activeSuppliers);
            this.updateStatElement('pendingDeliveries', pendingDeliveries);
            
        } catch (error) {
            console.error('Error loading retailer stats:', error);
            // Fallback to basic counts
            this.updateStatElement('totalOrders', '0');
            this.updateStatElement('totalSpent', 'Ksh0');
            this.updateStatElement('activeSuppliers', '0');
            this.updateStatElement('pendingDeliveries', '0');
        }
    }

    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Export for use in other modules
window.RetailerStatsManagement = RetailerStatsManagement;
