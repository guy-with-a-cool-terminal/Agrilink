// Analytics Data Processor Module
// Handles data analysis, metrics calculation, and analytics processing

console.log('Analytics Data Processor module loaded successfully');

// Process real data into analytics format
function processRealAnalyticsData(analytics, orders, products, users) {
    const totalSales = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const totalOrders = orders.length;
    const activeUsers = users.filter(user => user.status !== 'inactive').length || 100; // Fallback if no user data
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Calculate monthly data
    const monthlyData = calculateMonthlyData(orders);
    const categoryData = calculateCategoryData(orders, products);
    const userGrowthData = calculateUserGrowthData(users);
    
    return {
        totalSales,
        totalOrders,
        activeUsers,
        avgOrderValue,
        monthlyData,
        categoryData,
        userGrowthData,
        salesGrowth: analytics?.sales_growth || calculateGrowthRate(monthlyData.sales),
        orderGrowth: analytics?.order_growth || calculateGrowthRate(monthlyData.orders),
        userGrowth: analytics?.user_growth || calculateGrowthRate(userGrowthData)
    };
}

// Calculate monthly sales and orders data
function calculateMonthlyData(orders) {
    const monthlyStats = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyStats[key] = { sales: 0, orders: 0 };
    }
    
    // Process orders
    orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        if (orderDate.getFullYear() >= currentYear - 1) {
            const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyStats[key]) {
                monthlyStats[key].sales += parseFloat(order.total_amount) || 0;
                monthlyStats[key].orders += 1;
            }
        }
    });
    
    return {
        sales: Object.values(monthlyStats).map(m => m.sales),
        orders: Object.values(monthlyStats).map(m => m.orders),
        labels: Object.keys(monthlyStats).map(key => {
            const [year, month] = key.split('-');
            return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        })
    };
}

// Calculate category distribution
function calculateCategoryData(orders, products) {
    const categories = {};
    
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const product = products.find(p => p.id == item.product_id);
                const category = product?.category || 'Other';
                categories[category] = (categories[category] || 0) + (parseFloat(item.unit_price) * item.quantity);
            });
        } else {
            // Fallback for orders without detailed items
            const category = 'General';
            categories[category] = (categories[category] || 0) + (parseFloat(order.total_amount) || 0);
        }
    });
    
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        // Return default categories if no data
        return [
            { label: 'Vegetables', value: 35, color: '#10B981', amount: 0 },
            { label: 'Fruits', value: 28, color: '#F59E0B', amount: 0 },
            { label: 'Grains', value: 20, color: '#8B5CF6', amount: 0 },
            { label: 'Dairy', value: 12, color: '#EF4444', amount: 0 },
            { label: 'Spices', value: 5, color: '#6B7280', amount: 0 }
        ];
    }
    
    return Object.entries(categories).map(([name, value]) => ({
        label: name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        amount: value,
        color: getCategoryColor(name)
    }));
}

// Calculate user growth data
function calculateUserGrowthData(users) {
    if (!users || users.length === 0) {
        // Return sample growth data if no user data available
        return Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 50) + 20);
    }
    
    const monthlyGrowth = {};
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyGrowth[key] = 0;
    }
    
    // Process user registrations
    users.forEach(user => {
        const joinDate = new Date(user.created_at);
        const key = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyGrowth[key] !== undefined) {
            monthlyGrowth[key] += 1;
        }
    });
    
    return Object.values(monthlyGrowth);
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'vegetables': '#10B981',
        'fruits': '#F59E0B',
        'grains': '#8B5CF6',
        'dairy': '#EF4444',
        'spices': '#6B7280',
        'other': '#9CA3AF',
        'general': '#3B82F6'
    };
    return colors[category.toLowerCase()] || colors.other;
}

// Calculate growth rate
function calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

// Calculate comprehensive analytics
function calculateComprehensiveAnalytics(orders, products, users, deliveries) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return {
        // Sales Analytics
        sales: {
            total: orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
            monthly: orders
                .filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                })
                .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
            daily: orders
                .filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate.toDateString() === now.toDateString();
                })
                .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
        },
        
        // Orders Analytics
        orders: {
            total: orders.length,
            pending: orders.filter(order => order.status === 'pending').length,
            confirmed: orders.filter(order => order.status === 'confirmed').length,
            delivered: orders.filter(order => order.status === 'delivered').length,
            cancelled: orders.filter(order => order.status === 'cancelled').length
        },
        
        // Products Analytics
        products: {
            total: products.length,
            active: products.filter(product => product.status === 'active').length,
            lowStock: products.filter(product => (product.quantity || 0) < 10).length,
            outOfStock: products.filter(product => (product.quantity || 0) === 0).length
        },
        
        // Users Analytics
        users: {
            total: users.length,
            farmers: users.filter(user => user.role === 'farmer').length,
            consumers: users.filter(user => user.role === 'consumer').length,
            retailers: users.filter(user => user.role === 'retailer').length,
            logistics: users.filter(user => user.role === 'logistics').length,
            admins: users.filter(user => user.role === 'admin').length
        },
        
        // Deliveries Analytics
        deliveries: {
            total: deliveries.length,
            pending: deliveries.filter(delivery => delivery.status === 'pending').length,
            inTransit: deliveries.filter(delivery => delivery.status === 'in_transit').length,
            delivered: deliveries.filter(delivery => delivery.status === 'delivered').length,
            failed: deliveries.filter(delivery => delivery.status === 'failed').length
        }
    };
}

// Generate random value within range for demo purposes
function generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Process top selling products
function processTopSellingProducts(orders, products) {
    const productSales = {};
    
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                const productId = item.product_id;
                const quantity = parseInt(item.quantity) || 0;
                const revenue = parseFloat(item.unit_price) * quantity;
                
                if (!productSales[productId]) {
                    const product = products.find(p => p.id == productId);
                    productSales[productId] = {
                        name: product?.name || 'Unknown Product',
                        category: product?.category || 'Unknown',
                        totalQuantity: 0,
                        totalRevenue: 0,
                        orderCount: 0
                    };
                }
                
                productSales[productId].totalQuantity += quantity;
                productSales[productId].totalRevenue += revenue;
                productSales[productId].orderCount += 1;
            });
        }
    });
    
    return Object.entries(productSales)
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);
}

// Process regional performance
function processRegionalPerformance(orders, users) {
    const regions = {};
    
    orders.forEach(order => {
        const user = users.find(u => u.id == order.user_id);
        const region = user?.region || order.region || 'Unknown';
        
        if (!regions[region]) {
            regions[region] = {
                orderCount: 0,
                totalRevenue: 0,
                customerCount: new Set()
            };
        }
        
        regions[region].orderCount += 1;
        regions[region].totalRevenue += parseFloat(order.total_amount) || 0;
        regions[region].customerCount.add(order.user_id);
    });
    
    return Object.entries(regions).map(([region, data]) => ({
        region,
        orderCount: data.orderCount,
        totalRevenue: data.totalRevenue,
        customerCount: data.customerCount.size,
        avgOrderValue: data.orderCount > 0 ? data.totalRevenue / data.orderCount : 0
    }));
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.analyticsProcessor = {
        processRealAnalyticsData,
        calculateMonthlyData,
        calculateCategoryData,
        calculateUserGrowthData,
        calculateGrowthRate,
        calculateComprehensiveAnalytics,
        processTopSellingProducts,
        processRegionalPerformance,
        getCategoryColor,
        generateRandomValue
    };
}

console.log('Analytics Data Processor module setup complete');