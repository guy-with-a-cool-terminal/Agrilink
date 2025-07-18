// API Client for AgriLink Application
// Handles all API communication with proper error handling and token management

class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('authToken');
        
        // Set up default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        
        if (this.token) {
            this.defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        }
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
        delete this.defaultHeaders['Authorization'];
    }

    // Generic method to make API requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            console.log(`Making ${config.method || 'GET'} request to:`, url);
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            console.log('API Response:', { status: response.status, data });

            if (!response.ok) {
                const error = new Error(data.message || data.error || `HTTP ${response.status}`);
                error.status = response.status;
                error.response = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Please check your connection and try again.');
            }
            
            // Handle authentication errors
            if (error.status === 401) {
                this.removeToken();
                window.location.href = 'index.html';
                return;
            }
            
            throw error;
        }
    }

    // Helper method to extract array data from various response formats
    extractArrayData(response) {
        if (Array.isArray(response)) {
            return response;
        }
        
        if (response && typeof response === 'object') {
            // Check common array property names
            const arrayProperties = ['data', 'items', 'results', 'users', 'products', 'orders'];
            
            for (const prop of arrayProperties) {
                if (Array.isArray(response[prop])) {
                    return response[prop];
                }
            }
            
            // If response has pagination structure
            if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }
        }
        
        console.warn('Could not extract array from response:', response);
        return [];
    }

    // Authentication
    async register(userData) {
        return this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        const result = await this.makeRequest('/logout', { method: 'POST' });
        this.removeToken();
        return result;
    }

    async getUser() {
        return this.makeRequest('/user');
    }

    // Users
    async getUsers() {
        return this.makeRequest('/admin/users');
    }

    async createUser(userData) {
        return this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return this.makeRequest(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async updateUserStatus(userId, status) {
        return this.makeRequest(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteUser(userId) {
        return this.makeRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Products
    async getProducts() {
        return this.makeRequest('/products');
    }

    async getProduct(productId) {
        return this.makeRequest(`/products/${productId}`);
    }

    async createProduct(productData) {
        return this.makeRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(productId, productData) {
        return this.makeRequest(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(productId) {
        return this.makeRequest(`/products/${productId}`, {
            method: 'DELETE'
        });
    }

    // Orders
    async getOrders() {
        return this.makeRequest('/orders');
    }

    async getOrder(orderId) {
        return this.makeRequest(`/orders/${orderId}`);
    }

    async createOrder(orderData) {
        return this.makeRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrder(orderId, updateData) {
        return this.makeRequest(`/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async cancelOrder(orderId) {
        return this.makeRequest(`/orders/${orderId}/cancel`, {
            method: 'POST'
        });
    }

    // Deliveries
    async getDeliveries() {
        return this.makeRequest('/deliveries');
    }

    async trackDelivery(trackingNumber) {
        return this.makeRequest(`/deliveries/track/${trackingNumber}`);
    }

    async assignDelivery(deliveryId, assignmentData) {
        return this.makeRequest(`/deliveries/${deliveryId}/assign`, {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });
    }

    async updateDeliveryStatus(deliveryId, statusData) {
        return this.makeRequest(`/deliveries/${deliveryId}/status`, {
            method: 'POST',
            body: JSON.stringify(statusData)
        });
    }

    // Promotions
    async getPromotions() {
        return this.makeRequest('/promotions');
    }

    async getPromotion(promotionId) {
        return this.makeRequest(`/promotions/${promotionId}`);
    }

    async createPromotion(promotionData) {
        return this.makeRequest('/promotions', {
            method: 'POST',
            body: JSON.stringify(promotionData)
        });
    }

    async updatePromotion(promotionId, promotionData) {
        return this.makeRequest(`/promotions/${promotionId}`, {
            method: 'PUT',
            body: JSON.stringify(promotionData)
        });
    }

    async deletePromotion(promotionId) {
        return this.makeRequest(`/promotions/${promotionId}`, {
            method: 'DELETE'
        });
    }

    async calculateDiscount(discountData) {
        return this.makeRequest('/promotions/calculate-discount', {
            method: 'POST',
            body: JSON.stringify(discountData)
        });
    }

    // Analytics
    async getAnalytics() {
        return this.makeRequest('/admin/analytics');
    }

    // Maintenance Mode
    async getMaintenanceStatus() {
        return this.makeRequest('/admin/maintenance/status');
    }

    async enableMaintenanceMode() {
        return this.makeRequest('/admin/maintenance/enable', {
            method: 'POST'
        });
    }

    async disableMaintenanceMode() {
        return this.makeRequest('/admin/maintenance/disable', {
            method: 'POST'
        });
    }

    // Payment processing
    async processPayment(paymentData) {
        return this.makeRequest('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Inventory management
    async updateInventory(productId, inventoryData) {
        return this.makeRequest(`/products/${productId}/inventory`, {
            method: 'PUT',
            body: JSON.stringify(inventoryData)
        });
    }
}

// Create and export a global instance
const apiClient = new ApiClient();

// Make it available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.apiClient = apiClient;
}

// For module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiClient;
}
