
// Admin Analytics Module
class Analytics {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    // Load real-time analytics with actual backend data
    async loadRealTimeAnalytics() {
        try {
            const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
                this.apiClient.getOrders(),
                this.apiClient.getUsers(),
                this.apiClient.getProducts()
            ]);
            
            const ordersList = this.apiClient.extractArrayData(ordersResponse);
            const usersList = this.apiClient.extractArrayData(usersResponse);
            const productsList = this.apiClient.extractArrayData(productsResponse);
            
            // Calculate real metrics
            const totalSales = ordersList
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
            
            const totalOrders = ordersList.length;
            const totalUsers = usersList.length;
            
            const totalProducts = productsList.length;
            
            // Calculate monthly revenue (current month)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = ordersList
                .filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate.getMonth() === currentMonth && 
                           orderDate.getFullYear() === currentYear &&
                           ['delivered', 'paid'].includes(order.status);
                })
                .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
            
            const pendingOrders = ordersList.filter(order => 
                order.status === 'pending'
            ).length;
            
            // Update dashboard stats with real data
            this.updateStatElement('totalSales', `Ksh${totalSales.toLocaleString()}`);
            this.updateStatElement('totalOrders', totalOrders.toLocaleString());
            this.updateStatElement('totalUsers', totalUsers.toLocaleString());
            this.updateStatElement('monthlyRevenue', `Ksh${monthlyRevenue.toLocaleString()}`);
            this.updateStatElement('pendingOrders', pendingOrders.toLocaleString());
            this.updateStatElement('totalProducts', totalProducts.toLocaleString());
            
            // Calculate and display growth rates
            this.updateGrowthRates(ordersList, usersList);
            
            console.log('Real-time analytics loaded:', {
                totalSales, totalOrders, totalUsers, monthlyRevenue, pendingOrders
            });
            
        } catch (error) {
            console.error('Error loading real-time analytics:', error);
            this.showFallbackStats();
        }
    }

    // Update individual stat element
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Calculate growth rates based on historical data
    updateGrowthRates(ordersList, usersList) {
        const currentMonth = new Date().getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const currentYear = new Date().getFullYear();
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // Orders growth
        const currentMonthOrders = ordersList.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        }).length;
        
        const lastMonthOrders = ordersList.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        }).length;
        
        const orderGrowth = lastMonthOrders > 0 ? 
            ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
        
        // Users growth
        const currentMonthUsers = usersList.filter(user => {
            const userDate = new Date(user.created_at);
            return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
        }).length;
        
        const lastMonthUsers = usersList.filter(user => {
            const userDate = new Date(user.created_at);
            return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastMonthYear;
        }).length;
        
        const userGrowth = lastMonthUsers > 0 ? 
            ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;
        
        // Update growth indicators
        this.updateGrowthIndicator('orderGrowth', orderGrowth);
        this.updateGrowthIndicator('userGrowth', userGrowth);
        this.updateGrowthIndicator('salesGrowth', orderGrowth);
        this.updateGrowthIndicator('revenueGrowth', orderGrowth);
    }

    // Update growth indicators with real data
    updateGrowthIndicator(elementId, growthRate) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const isPositive = growthRate >= 0;
        const arrow = isPositive ? '↑' : '↓';
        const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
        
        element.className = `text-sm font-medium ${colorClass}`;
        element.textContent = `${arrow} ${Math.abs(growthRate).toFixed(1)}% from last month`;
    }

    // Display fallback stats in case of error
    showFallbackStats() {
        this.updateStatElement('totalSales', 'Ksh0');
        this.updateStatElement('totalOrders', '0');
        this.updateStatElement('totalUsers', '0');
        this.updateStatElement('monthlyRevenue', 'Ksh0');
        this.updateStatElement('pendingOrders', '0');
        this.updateStatElement('totalProducts', '0');
    }

    // Update product analytics section
    updateProductAnalytics(products) {
        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => (p.quantity || 0) < 10).length;
        const outOfStockProducts = products.filter(p => (p.quantity || 0) === 0).length;
        const activeProducts = products.filter(p => p.status === 'active').length;
        
        const productMetrics = document.getElementById('productMetrics');
        if (productMetrics) {
            productMetrics.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-800">Total Products</h4>
                        <p class="text-2xl font-bold text-blue-600">${totalProducts}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800">Active Products</h4>
                        <p class="text-2xl font-bold text-green-600">${activeProducts}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-yellow-800">Low Stock</h4>
                        <p class="text-2xl font-bold text-yellow-600">${lowStockProducts}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-red-800">Out of Stock</h4>
                        <p class="text-2xl font-bold text-red-600">${outOfStockProducts}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Export for use in other modules
window.Analytics = Analytics;
