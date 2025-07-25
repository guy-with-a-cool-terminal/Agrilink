// Charts Module
// Handles chart creation, data visualization, and real-time chart updates

console.log('Charts module loaded successfully');

// Chart instances and data
let salesChart = null;
let categoryChart = null;
let userGrowthChart = null;
let priceChart = null;
let realTimeData = {
    sales: [],
    categories: [],
    userGrowth: [],
    prices: []
};

// Initialize dynamic charts with real data
function initializeDynamicCharts() {
    createDynamicSalesChart();
    createDynamicCategoryChart();
    createDynamicUserGrowthChart();
    createDynamicPriceChart();
}

// Create dynamic sales trend chart
function createDynamicSalesChart() {
    const salesContainer = document.querySelector('.chart-container .chart-placeholder');
    if (salesContainer) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 300;
        canvas.style.width = '100%';
        canvas.style.height = '300px';
        
        salesContainer.innerHTML = '';
        salesContainer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const data = realTimeData.sales.length > 0 ? realTimeData.sales : generateDynamicSalesData();
        drawEnhancedLineChart(ctx, canvas.width, canvas.height, data, '#10B981', 'Sales Trend');
    }
}

// Create dynamic category chart with real data
function createDynamicCategoryChart() {
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
        const data = realTimeData.categories.length > 0 ? realTimeData.categories : [
            { label: 'Vegetables', value: 35, color: '#10B981' },
            { label: 'Fruits', value: 28, color: '#F59E0B' },
            { label: 'Grains', value: 20, color: '#8B5CF6' },
            { label: 'Dairy', value: 12, color: '#EF4444' },
            { label: 'Spices', value: 5, color: '#6B7280' }
        ];
        drawEnhancedPieChart(ctx, canvas.width, canvas.height, data);
    }
}

// Create dynamic user growth chart
function createDynamicUserGrowthChart() {
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
        const data = realTimeData.userGrowth.length > 0 ? realTimeData.userGrowth : generateUserGrowthData();
        drawEnhancedBarChart(ctx, canvas.width, canvas.height, data, 'User Growth');
    }
}

// Create dynamic price tracking chart
function createDynamicPriceChart() {
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
        const data = generateDynamicPriceData();
        drawEnhancedLineChart(ctx, canvas.width, canvas.height, data, '#EF4444', 'Price Trends');
    }
}

// Enhanced chart drawing functions
function drawEnhancedLineChart(ctx, width, height, data, color = '#10B981', title = '') {
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding - 30; // Space for title
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw title
    if (title) {
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 25);
    }
    
    // Draw grid
    drawGrid(ctx, padding, padding + 30, chartWidth, chartHeight);
    
    // Draw data line with animation effect
    if (data.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const stepX = chartWidth / (data.length - 1);
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;
        
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = padding + 30 + chartHeight - ((value - minValue) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw gradient fill
        ctx.lineTo(padding + chartWidth, padding + 30 + chartHeight);
        ctx.lineTo(padding, padding + 30 + chartHeight);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, padding + 30, 0, padding + 30 + chartHeight);
        gradient.addColorStop(0, color + '40'); // 25% opacity
        gradient.addColorStop(1, color + '10'); // 6% opacity
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw points
        ctx.fillStyle = color;
        data.forEach((value, index) => {
            const x = padding + index * stepX;
            const y = padding + 30 + chartHeight - ((value - minValue) / range) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

// Draw grid helper
function drawGrid(ctx, x, y, width, height) {
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
        const lineX = x + (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= 5; i++) {
        const lineY = y + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + width, lineY);
        ctx.stroke();
    }
}

// Enhanced pie chart with labels
function drawEnhancedPieChart(ctx, width, height, data) {
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
        
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
        
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.label}`, labelX, labelY);
        ctx.fillText(`${item.value}%`, labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

// Enhanced bar chart
function drawEnhancedBarChart(ctx, width, height, data, title = '') {
    const padding = 50;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding - 30;
    
    ctx.clearRect(0, 0, width, height);
    
    if (title) {
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 25);
    }
    
    if (data.length > 0) {
        const maxValue = Math.max(...data);
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length;
        
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = padding + 30 + chartHeight - barHeight;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#8B5CF6');
            gradient.addColorStop(1, '#3B82F6');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw value on top
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x + barWidth / 2, y - 5);
        });
    }
}

// Data generation functions
function generateDynamicSalesData() {
    const data = [];
    let value = 1000;
    for (let i = 0; i < 12; i++) {
        value += (Math.random() - 0.5) * 200;
        value = Math.max(500, value);
        data.push(Math.round(value));
    }
    return data;
}

function generateUserGrowthData() {
    return Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 50) + 20);
}

function generateDynamicPriceData() {
    const data = [];
    let value = 100;
    for (let i = 0; i < 30; i++) {
        value += (Math.random() - 0.5) * 10;
        value = Math.max(50, Math.min(200, value));
        data.push(Math.round(value));
    }
    return data;
}

// Update charts with new data
function updateCharts(processedData = null) {
    if (processedData) {
        realTimeData.sales = processedData.monthlyData?.sales || realTimeData.sales;
        realTimeData.categories = processedData.categoryData || realTimeData.categories;
        realTimeData.userGrowth = processedData.userGrowthData || realTimeData.userGrowth;
    }
    
    // Re-create charts with new data
    initializeDynamicCharts();
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.chartsModule = {
        initializeDynamicCharts,
        updateCharts,
        createDynamicSalesChart,
        createDynamicCategoryChart,
        createDynamicUserGrowthChart,
        createDynamicPriceChart,
        drawEnhancedLineChart,
        drawEnhancedPieChart,
        drawEnhancedBarChart
    };
}

console.log('Charts module setup complete');