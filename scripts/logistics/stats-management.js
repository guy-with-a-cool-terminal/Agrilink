
// Logistics Statistics Management Module
class LogisticsStatsManagement {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    // Load logistics-specific statistics
    async loadLogisticsStats() {
        try {
            // Fetch deliveries data
            const response = await this.apiClient.getDeliveries();
            const deliveriesList = this.apiClient.extractArrayData(response) || [];

            // Calculate statistics
            const activeDeliveries = deliveriesList.filter(delivery => delivery.status !== 'delivered').length;
            const completedToday = deliveriesList.filter(delivery => {
                const deliveredDate = new Date(delivery.updated_at).toLocaleDateString();
                const todayDate = new Date().toLocaleDateString();
                return delivery.status === 'delivered' && deliveredDate === todayDate;
            }).length;
            const totalDistance = deliveriesList.reduce((sum, delivery) => sum + (delivery.distance || 0), 0);
            const efficiency = deliveriesList.length > 0 ? ((deliveriesList.filter(delivery => delivery.status === 'delivered').length / deliveriesList.length) * 100).toFixed(2) + '%' : '0%';

            // Update stat cards
            this.updateStatCard('activeDeliveries', activeDeliveries);
            this.updateStatCard('completedToday', completedToday);
            this.updateStatCard('totalDistance', totalDistance);
            this.updateStatCard('efficiency', efficiency);

        } catch (error) {
            console.error('Error loading logistics stats:', error);
            // Fallback values
            this.updateStatCard('activeDeliveries', 'N/A');
            this.updateStatCard('completedToday', 'N/A');
            this.updateStatCard('totalDistance', 'N/A');
            this.updateStatCard('efficiency', 'N/A');
        }
    }

    // Update stat card
    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}

// Export for use in other modules
window.LogisticsStatsManagement = LogisticsStatsManagement;
