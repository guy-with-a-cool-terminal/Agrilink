// Analytics Dashboard JavaScript - Dynamic Data Implementation with Real Charts

// Initialize analytics
document.addEventListener('DOMContentLoaded', function() {
    console.log('Analytics Dashboard initializing...');
    loadAnalyticsData();
    startRealTimeUpdates();
    initializeCharts();
});

// Chart instances
let salesChart = null;
let categoryChart = null;
let userGrowthChart = null;
let priceChart = null;

// Load analytics data from API
async function loadAnalyticsData() {
    try {
        const response = await apiClient.getAnalytics();
        const analytics = response.data || response.analytics || response;
        console.log('Analytics loaded:', analytics);
        
        updateKeyMetrics(analytics);
        updateCharts(analytics);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Fallback to demo data
        updateKeyMetrics();
        updateCharts();
    }
}

// Update key metrics
function updateKeyMetrics(analytics = null) {
    let metrics;
    
    if (analytics) {
        // Use real data from API
        metrics = {
            totalSales: analytics.total_sales || 0,
            totalOrders: analytics.total_orders || 0,
            activeUsers: analytics.active_users || 0,
            avgOrderValue: analytics.avg_order_value || 0
        };
    } else {
        // Fallback to simulated data
        metrics = {
            totalSales: generateRandomValue(400000, 450000),
            totalOrders: generateRandomValue(1300, 1400),
            activeUsers: generateRandomValue(2100, 2200),
            avgOrderValue: generateRandomValue(300, 350)
        };
    }
    
    document.getElementById('totalSales').textContent = `Ksh${metrics.totalSales.toLocaleString()}`;
    document.getElementById('totalOrders').textContent = metrics.totalOrders.toLocaleString();
    document.getElementById('activeUsers').textContent = metrics.activeUsers.toLocaleString();
    document.getElementById('avgOrderValue').textContent = `Ksh${metrics.avgOrderValue}`;
}

// Generate random value within range (for demo purposes)
function generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initialize charts with Chart.js-like functionality using canvas
function initializeCharts() {
    createSalesChart();
    createCategoryChart();
    createUserGrowthChart();
    createPriceChart();
}

// Create sales trend chart
function createSalesChart() {
    const salesContainer = document.querySelector('.chart-container .chart-placeholder');
    if (salesContainer) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 300;
        canvas.style.width = '100%';
        canvas.style.height = '300px';
        
        salesContainer.innerHTML = '';
        salesContainer.appendChild(canvas);
        
        // Simple line chart simulation
        const ctx = canvas.getContext('2d');
        drawLineChart(ctx, canvas.width, canvas.height, generateSalesData());
    }
}

// Create category pie chart
function createCategoryChart() {
    const containers = document.querySelectorAll('.chart-container .chart-placeholder');
    if (containers.length > 1) {
        const categoryContainer = containers[1];
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 250;
        canvas.style.width = '100%';
        canvas.style.height = '250px';
        
        categoryContainer.innerHTML = '';
        categoryContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        drawPieChart(ctx, canvas.width, canvas.height, [
            { label: 'Vegetables', value: 35, color: '#10B981' },
            { label: 'Fruits', value: 28, color: '#F59E0B' },
            { label: 'Grains', value: 20, color: '#8B5CF6' },
            { label: 'Dairy', value: 12, color: '#EF4444' },
            { label: 'Spices', value: 5, color: '#6B7280' }
        ]);
    }
}

// Create user growth chart
function createUserGrowthChart() {
    const containers = document.querySelectorAll('.chart-container .chart-placeholder');
    if (containers.length > 2) {
        const userContainer = containers[2];
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 250;
        canvas.style.width = '100%';
        canvas.style.height = '250px';
        
        userContainer.innerHTML = '';
        userContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        drawBarChart(ctx, canvas.width, canvas.height, generateUserGrowthData());
    }
}

// Create price tracking chart
function createPriceChart() {
    const containers = document.querySelectorAll('.chart-container .chart-placeholder');
    if (containers.length > 3) {
        const priceContainer = containers[3];
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 200;
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        
        priceContainer.innerHTML = '';
        priceContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        drawLineChart(ctx, canvas.width, canvas.height, generatePriceData(), '#EF4444');
    }
}

// Chart drawing functions
function drawLineChart(ctx, width, height, data, color = '#10B981') {
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw data line
    if (data.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const stepX = chartWidth / (data.length - 1);
        const maxValue = Math.max(...data);
        
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

function drawPieChart(ctx, width, height, data) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    ctx.clearRect(0, 0, width, height);
    
    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    data.forEach(item => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

function drawBarChart(ctx, width, height, data) {
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw bars
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    const maxValue = Math.max(...data);
    
    ctx.fillStyle = '#3B82F6';
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
        const y = height - padding - barHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
    });
}

// Data generators
function generateSalesData() {
    return Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 10000);
}

function generateUserGrowthData() {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 50);
}

function generatePriceData() {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 100) + 20);
}

// Update charts based on time range
function updateCharts(analytics = null) {
    const timeRange = document.getElementById('timeRange').value;
    console.log(`Updating charts for ${timeRange} days`);
    
    showLoadingEffect();
    
    setTimeout(() => {
        hideLoadingEffect();
        initializeCharts(); // Recreate charts with new data
        showNotification(`Charts updated for the last ${timeRange} days!`, 'success');
    }, 1500);
}

// Show loading effect
function showLoadingEffect() {
    const placeholders = document.querySelectorAll('.chart-placeholder');
    placeholders.forEach(placeholder => {
        placeholder.style.opacity = '0.5';
        placeholder.innerHTML = '🔄 Loading data...';
    });
}

// Hide loading effect
function hideLoadingEffect() {
    const placeholders = document.querySelectorAll('.chart-placeholder');
    placeholders.forEach((placeholder, index) => {
        placeholder.style.opacity = '1';
        
        // Restore original content based on chart type
        if (index === 0) {
            placeholder.innerHTML = '📈 Interactive Line Chart<br><small>Shows daily/weekly/monthly sales trends<br>Integration: Chart.js, D3.js, or similar charting library</small>';
        } else if (index === 1) {
            placeholder.innerHTML = '🥧 Pie Chart<br><small>Vegetables: 35%<br>Fruits: 28%<br>Grains: 20%<br>Dairy: 12%<br>Spices: 5%</small>';
        } else if (index === 2) {
            placeholder.innerHTML = '📊 Bar Chart<br><small>Monthly new user registrations<br>by role and region</small>';
        } else if (index === 3) {
            placeholder.innerHTML = '📈 Real-time Price Tracking Chart<br><small>Live price updates with historical comparison</small>';
        }
    });
}

// Refresh all data
function refreshData() {
    console.log('Refreshing analytics data...');
    showLoadingEffect();
    
    setTimeout(() => {
        loadAnalyticsData();
        hideLoadingEffect();
        alert('Analytics data refreshed successfully!');
    }, 2000);
}

// Export analytics report
function exportAnalytics() {
    const timeRange = document.getElementById('timeRange').value;
    
    // Create CSV content (simplified for demo)
    const csvContent = `AgriLink Analytics Report - Last ${timeRange} Days
Generated on: ${new Date().toLocaleDateString()}

Key Metrics:
Total Sales,Ksh4,25,680
Total Orders,1,347
Active Users,2,156
Average Order Value,Ksh316

Top Products:
Product,Category,Units Sold,Revenue
Fresh Tomatoes,Vegetables,2456 kg,Ksh98240
Red Apples,Fruits,1890 kg,Ksh226800
Basmati Rice,Grains,1200 kg,Ksh96000
Fresh Milk,Dairy,3400 L,Ksh85000
Sweet Corn,Vegetables,980 kg,Ksh34300

Regional Performance:
Region,Active Users,Total Orders,Revenue
North India,856,2340,Ksh185600
South India,743,1980,Ksh142800
West India,512,1456,Ksh98400
East India,345,890,Ksh67200
`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrilink_analytics_${timeRange}days_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    alert('Analytics report exported successfully!');
}

// Start real-time updates
function startRealTimeUpdates() {
    // Update market prices every 30 seconds (for demo)
    setInterval(() => {
        updateMarketPrices();
    }, 30000);
    
    // Update key metrics every 2 minutes (for demo)
    setInterval(() => {
        updateKeyMetrics();
    }, 120000);
}

// Update market prices with simulated real-time data
function updateMarketPrices() {
    const products = [
        { name: 'Tomatoes', element: null, basePrice: 40 },
        { name: 'Apples', element: null, basePrice: 120 },
        { name: 'Rice', element: null, basePrice: 78 },
        { name: 'Milk', element: null, basePrice: 25 }
    ];
    
    products.forEach(product => {
        // Simulate price fluctuation (±5%)
        const fluctuation = (Math.random() - 0.5) * 0.1;
        const newPrice = Math.round(product.basePrice * (1 + fluctuation));
        
        console.log(`${product.name} price updated to Ksh${newPrice}`);
    });
}

// Utility function to format currency
function formatCurrency(amount) {
    return `Ksh${amount.toLocaleString()}`;
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toLocaleString();
}
