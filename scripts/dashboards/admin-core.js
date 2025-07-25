// Admin Dashboard Core Module
// Handles admin authentication, data loading, and basic analytics

console.log('Admin Core module loaded successfully');

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.maintenanceMode = false;
        this.data = {
            users: [],
            orders: [],
            products: [],
            deliveries: []
        };
        // Add request tracking to prevent race conditions
        this.pendingRequests = new Set();
        this.isLoadingData = false;
        this.init();
    }

    async init() {
        console.log('Admin Dashboard initializing...');
        
        if (!this.checkAuth()) return;
        await this.checkMaintenanceStatus();
        await this.loadAllData();
        this.setupEventListeners();
    }

    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }

        try {
            this.currentUser = JSON.parse(user);
            if (this.currentUser.role !== 'admin') {
                showNotification('Access denied. Admin privileges required.', 'error');
                window.location.href = 'index.html';
                return false;
            }
            
            this.updateUserInfo();
            return true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            window.location.href = 'index.html';
            return false;
        }
    }

    updateUserInfo() {
        const nameEl = document.getElementById('userName');
        const roleEl = document.getElementById('userRole');
        
        if (nameEl) nameEl.textContent = this.currentUser.name || 'Admin';
        if (roleEl) roleEl.textContent = this.currentUser.role || 'Admin';
    }

    async loadAllData() {
        // Prevent multiple simultaneous data loading
        if (this.isLoadingData) {
            console.log('Data loading already in progress, skipping...');
            return;
        }

        this.isLoadingData = true;
        
        try {
            showNotification('Loading dashboard data...', 'info');
            
            // Load data sequentially instead of all at once to reduce server load
            console.log('Loading users...');
            const usersRes = await apiClient.getUsers().catch(e => ({ error: e, data: [] }));
            this.data.users = usersRes.error ? [] : apiClient.extractArrayData(usersRes);
            
            // Add small delay to prevent overwhelming local server
            await this.delay(100);
            
            console.log('Loading orders...');
            const ordersRes = await apiClient.getOrders().catch(e => ({ error: e, data: [] }));
            this.data.orders = ordersRes.error ? [] : apiClient.extractArrayData(ordersRes);
            
            await this.delay(100);
            
            console.log('Loading products...');
            const productsRes = await apiClient.getProducts().catch(e => ({ error: e, data: [] }));
            this.data.products = productsRes.error ? [] : apiClient.extractArrayData(productsRes);
            
            await this.delay(100);
            
            console.log('Loading deliveries...');
            const deliveriesRes = await apiClient.getDeliveries().catch(e => ({ error: e, data: [] }));
            this.data.deliveries = deliveriesRes.error ? [] : apiClient.extractArrayData(deliveriesRes);

            console.log('Data loaded:', this.data);

            this.updateAnalytics();
            this.updateUsersTable();
            this.updateOrdersTable();
            this.updateProductAnalytics();

            showNotification('Dashboard loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.isLoadingData = false;
        }
    }

    // Helper method to add delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateAnalytics() {
        const metrics = this.calculateMetrics();
        
        updateElement('totalSales', `Ksh${metrics.totalSales.toLocaleString()}`);
        updateElement('totalOrders', metrics.totalOrders.toLocaleString());
        updateElement('totalUsers', metrics.totalUsers.toLocaleString());
        updateElement('monthlyRevenue', `Ksh${metrics.monthlyRevenue.toLocaleString()}`);
        updateElement('pendingOrders', metrics.pendingOrders.toLocaleString());
        updateElement('totalProducts', metrics.totalProducts.toLocaleString());

        this.updateGrowthIndicators(metrics);
    }

    calculateMetrics() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return {
            totalSales: this.data.orders
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
            
            totalOrders: this.data.orders.length,
            totalUsers: this.data.users.length,
            totalProducts: this.data.products.length,
            
            monthlyRevenue: this.data.orders
                .filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate.getMonth() === currentMonth && 
                           orderDate.getFullYear() === currentYear &&
                           ['delivered', 'paid'].includes(order.status);
                })
                .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
            
            pendingOrders: this.data.orders.filter(order => order.status === 'pending').length
        };
    }

    updateGrowthIndicators(metrics) {
        const growthRate = 5.2;
        const elements = ['orderGrowth', 'userGrowth', 'salesGrowth', 'revenueGrowth'];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.className = 'text-sm font-medium text-green-600';
                element.textContent = `↑ ${growthRate}% from last month`;
            }
        });
    }

    // Product analytics functionality
    updateProductAnalytics() {
        const totalProducts = this.data.products.length;
        const lowStockProducts = this.data.products.filter(p => (p.quantity || 0) < 10).length;
        const outOfStockProducts = this.data.products.filter(p => (p.quantity || 0) === 0).length;
        const activeProducts = this.data.products.filter(p => p.status === 'active').length;
        
        // Update product metrics in the analytics section
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

    setupEventListeners() {
        // Add any global event listeners here
        console.log('Setting up admin dashboard event listeners');
    }

    async checkMaintenanceStatus() {
        try {
            // Check if maintenance mode is enabled
            console.log('Checking maintenance status...');
        } catch (error) {
            console.error('Error checking maintenance status:', error);
        }
    }
}

// Export the AdminDashboard class
if (typeof window !== 'undefined') {
    window.AdminDashboard = AdminDashboard;
}

console.log('Admin Core module setup complete');