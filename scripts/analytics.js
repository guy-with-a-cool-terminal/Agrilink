
// Analytics Dashboard JavaScript

// Initialize analytics
document.addEventListener('DOMContentLoaded', function() {
    loadAnalyticsData();
    startRealTimeUpdates();
});

// Load analytics data
function loadAnalyticsData() {
    // In a real app, this would fetch data from backend API
    updateKeyMetrics();
    updateCharts();
}

// Update key metrics
function updateKeyMetrics() {
    // Simulate real-time data updates
    const metrics = {
        totalSales: generateRandomValue(400000, 450000),
        totalOrders: generateRandomValue(1300, 1400),
        activeUsers: generateRandomValue(2100, 2200),
        avgOrderValue: generateRandomValue(300, 350)
    };
    
    document.getElementById('totalSales').textContent = `₹${metrics.totalSales.toLocaleString()}`;
    document.getElementById('totalOrders').textContent = metrics.totalOrders.toLocaleString();
    document.getElementById('activeUsers').textContent = metrics.activeUsers.toLocaleString();
    document.getElementById('avgOrderValue').textContent = `₹${metrics.avgOrderValue}`;
}

// Generate random value within range (for demo purposes)
function generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Update charts based on time range
function updateCharts() {
    const timeRange = document.getElementById('timeRange').value;
    console.log(`Updating charts for ${timeRange} days`);
    
    // In a real app, this would:
    // 1. Fetch data from backend based on time range
    // 2. Update all chart visualizations
    // 3. Refresh table data
    
    // For demo, we'll just show a loading effect
    showLoadingEffect();
    
    setTimeout(() => {
        hideLoadingEffect();
        alert(`Charts updated for the last ${timeRange} days!`);
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
Total Sales,₹4,25,680
Total Orders,1,347
Active Users,2,156
Average Order Value,₹316

Top Products:
Product,Category,Units Sold,Revenue
Fresh Tomatoes,Vegetables,2456 kg,₹98240
Red Apples,Fruits,1890 kg,₹226800
Basmati Rice,Grains,1200 kg,₹96000
Fresh Milk,Dairy,3400 L,₹85000
Sweet Corn,Vegetables,980 kg,₹34300

Regional Performance:
Region,Active Users,Total Orders,Revenue
North India,856,2340,₹185600
South India,743,1980,₹142800
West India,512,1456,₹98400
East India,345,890,₹67200
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
        const fluctuation = (Math.random() - 0.5) * 0.1; // -5% to +5%
        const newPrice = Math.round(product.basePrice * (1 + fluctuation));
        
        // In a real app, you would update the DOM elements showing prices
        console.log(`${product.name} price updated to ₹${newPrice}`);
    });
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Utility function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}
