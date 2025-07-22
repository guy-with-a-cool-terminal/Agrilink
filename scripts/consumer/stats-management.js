
// Consumer Statistics Management Module
class StatsManagement {
    constructor(apiClient, currentUser) {
        this.apiClient = apiClient;
        this.currentUser = currentUser;
    }

    // Load consumer-specific statistics
    async loadConsumerStats() {
        try {
            const ordersResponse = await this.apiClient.getOrders();
            const ordersList = this.apiClient.extractArrayData(ordersResponse) || [];
            
            // Filter orders for current user
            const userOrders = ordersList.filter(order => 
                order.user_id == this.currentUser.id || 
                order.customer_email === this.currentUser.email
            );
            
            const totalOrders = userOrders.length;
            const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
            const activeOrders = userOrders.filter(order => 
                ['pending', 'processing', 'confirmed', 'shipped', 'in_transit'].includes(order.status)
            ).length;
            
            // Calculate favorite products based on order history
            const productCount = {};
            userOrders.forEach(order => {
                if (order.items) {
                    order.items.forEach(item => {
                        productCount[item.product_id] = (productCount[item.product_id] || 0) + 1;
                    });
                }
            });
            const favoriteProducts = Object.keys(productCount).length;
            
            // Update stats display with consumer-specific data
            this.updateStatElement('totalOrders', totalOrders);
            this.updateStatElement('totalSpent', `Ksh${totalSpent.toLocaleString()}`);
            this.updateStatElement('activeOrders', activeOrders);
            this.updateStatElement('favoriteProducts', favoriteProducts);
            
        } catch (error) {
            console.error('Error loading consumer stats:', error);
            // Fallback to basic counts
            this.updateStatElement('totalOrders', '0');
            this.updateStatElement('totalSpent', 'Ksh0');
            this.updateStatElement('activeOrders', '0');
            this.updateStatElement('favoriteProducts', '0');
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
window.StatsManagement = StatsManagement;
