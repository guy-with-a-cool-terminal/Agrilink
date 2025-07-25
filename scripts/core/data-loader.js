// Data Loading Module
// Handles API data fetching, caching, and data processing

console.log('Data Loader module loaded successfully');

// Data cache
const dataCache = {
    users: [],
    products: [],
    orders: [],
    deliveries: [],
    lastUpdate: null
};

// Cache timeout (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

// Check if cache is valid
function isCacheValid() {
    return dataCache.lastUpdate && (Date.now() - dataCache.lastUpdate) < CACHE_TIMEOUT;
}

// Load all dashboard data
async function loadAllData() {
    if (isCacheValid()) {
        console.log('Using cached data');
        return dataCache;
    }

    console.log('Loading fresh data from API');
    
    try {
        // Load data sequentially to reduce server load
        console.log('Loading users...');
        const usersRes = await apiClient.getUsers().catch(e => ({ error: e, data: [] }));
        dataCache.users = usersRes.error ? [] : apiClient.extractArrayData(usersRes);
        
        await delay(100);
        
        console.log('Loading orders...');
        const ordersRes = await apiClient.getOrders().catch(e => ({ error: e, data: [] }));
        dataCache.orders = ordersRes.error ? [] : apiClient.extractArrayData(ordersRes);
        
        await delay(100);
        
        console.log('Loading products...');
        const productsRes = await apiClient.getProducts().catch(e => ({ error: e, data: [] }));
        dataCache.products = productsRes.error ? [] : apiClient.extractArrayData(productsRes);
        
        await delay(100);
        
        console.log('Loading deliveries...');
        const deliveriesRes = await apiClient.getDeliveries().catch(e => ({ error: e, data: [] }));
        dataCache.deliveries = deliveriesRes.error ? [] : apiClient.extractArrayData(deliveriesRes);

        dataCache.lastUpdate = Date.now();
        console.log('Data loaded successfully:', dataCache);
        
        return dataCache;
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Load specific data type
async function loadDataType(type) {
    try {
        let response;
        switch (type) {
            case 'users':
                response = await apiClient.getUsers();
                break;
            case 'products':
                response = await apiClient.getProducts();
                break;
            case 'orders':
                response = await apiClient.getOrders();
                break;
            case 'deliveries':
                response = await apiClient.getDeliveries();
                break;
            default:
                throw new Error(`Unknown data type: ${type}`);
        }
        
        const data = apiClient.extractArrayData(response);
        dataCache[type] = data;
        dataCache.lastUpdate = Date.now();
        
        return data;
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        throw error;
    }
}

// Get user-specific data
function getUserData(userId) {
    return {
        orders: dataCache.orders.filter(order => 
            order.user_id == userId || order.customer_email === userId
        ),
        products: dataCache.products.filter(product => 
            product.farmer_id == userId || product.user_id == userId
        ),
        deliveries: dataCache.deliveries.filter(delivery => 
            delivery.assigned_to == userId
        )
    };
}

// Filter data by criteria
function filterData(dataType, criteria) {
    const data = dataCache[dataType] || [];
    
    if (!criteria || Object.keys(criteria).length === 0) {
        return data;
    }
    
    return data.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
            if (Array.isArray(value)) {
                return value.includes(item[key]);
            }
            return item[key] === value;
        });
    });
}

// Search data
function searchData(dataType, searchTerm, searchFields = []) {
    const data = dataCache[dataType] || [];
    
    if (!searchTerm) {
        return data;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return data.filter(item => {
        if (searchFields.length === 0) {
            // Search all string fields
            return Object.values(item).some(value => 
                typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)
            );
        } else {
            // Search specific fields
            return searchFields.some(field => {
                const value = item[field];
                return typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm);
            });
        }
    });
}

// Sort data
function sortData(data, sortField, sortDirection = 'asc') {
    return [...data].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle different data types
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}

// Calculate metrics from data
function calculateMetrics(dataType, userId = null) {
    let data = dataCache[dataType] || [];
    
    // Filter by user if specified
    if (userId) {
        const userData = getUserData(userId);
        data = userData[dataType] || [];
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const metrics = {
        total: data.length,
        active: 0,
        monthly: 0,
        today: 0
    };
    
    data.forEach(item => {
        const itemDate = new Date(item.created_at);
        
        // Count active items
        if (item.status === 'active' || item.status === 'confirmed' || item.status === 'delivered') {
            metrics.active++;
        }
        
        // Count monthly items
        if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
            metrics.monthly++;
        }
        
        // Count today's items
        if (itemDate.toDateString() === now.toDateString()) {
            metrics.today++;
        }
    });
    
    return metrics;
}

// Helper method to add delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Clear cache
function clearCache() {
    dataCache.users = [];
    dataCache.products = [];
    dataCache.orders = [];
    dataCache.deliveries = [];
    dataCache.lastUpdate = null;
}

// Refresh specific data type
async function refreshData(dataType) {
    try {
        const data = await loadDataType(dataType);
        console.log(`${dataType} refreshed:`, data.length, 'items');
        return data;
    } catch (error) {
        console.error(`Error refreshing ${dataType}:`, error);
        throw error;
    }
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.dataLoader = {
        loadAllData,
        loadDataType,
        getUserData,
        filterData,
        searchData,
        sortData,
        calculateMetrics,
        clearCache,
        refreshData,
        getCache: () => dataCache
    };
}

console.log('Data Loader module setup complete');