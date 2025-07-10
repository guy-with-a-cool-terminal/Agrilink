// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS: {
        // Authentication
        LOGIN: '/login',
        REGISTER: '/register',
        LOGOUT: '/logout',
        USER: '/user',
        
        // Products
        PRODUCTS: '/products',
        PRODUCT: (id) => `/products/${id}`,
        
        // Orders
        ORDERS: '/orders',
        ORDER: (id) => `/orders/${id}`,
        ORDER_STATUS: (id) => `/orders/${id}/status`,
        
        // Deliveries
        DELIVERIES: '/deliveries',
        DELIVERY: (id) => `/deliveries/${id}`,
        DELIVERY_STATUS: (id) => `/deliveries/${id}/status`,
        
        // Admin
        ADMIN_USERS: '/admin/users',
        ADMIN_USER_TOGGLE: (id) => `/admin/users/${id}/toggle-status`,
        ADMIN_ANALYTICS: '/admin/analytics',
        
        // Promotions
        PROMOTIONS: '/promotions',
        PROMOTION: (id) => `/promotions/${id}`
    }
};

// API Helper Functions
class ApiClient {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    getAuthToken() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user).token : null;
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.auth !== false)
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(credentials) {
        return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
            auth: false
        });
    }

    async register(userData) {
        return this.request(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
    }

    async logout() {
        return this.request(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST'
        });
    }

    async getUser() {
        return this.request(API_CONFIG.ENDPOINTS.USER);
    }

    // Products methods
    async getProducts() {
        return this.request(API_CONFIG.ENDPOINTS.PRODUCTS);
    }

    async createProduct(productData) {
        return this.request(API_CONFIG.ENDPOINTS.PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(API_CONFIG.ENDPOINTS.PRODUCT(id), {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(API_CONFIG.ENDPOINTS.PRODUCT(id), {
            method: 'DELETE'
        });
    }

    // Orders methods
    async getOrders() {
        return this.request(API_CONFIG.ENDPOINTS.ORDERS);
    }

    async createOrder(orderData) {
        return this.request(API_CONFIG.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrderStatus(id, status) {
        return this.request(API_CONFIG.ENDPOINTS.ORDER_STATUS(id), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Deliveries methods
    async getDeliveries() {
        return this.request(API_CONFIG.ENDPOINTS.DELIVERIES);
    }

    async createDelivery(deliveryData) {
        return this.request(API_CONFIG.ENDPOINTS.DELIVERIES, {
            method: 'POST',
            body: JSON.stringify(deliveryData)
        });
    }

    async updateDeliveryStatus(id, statusData) {
        return this.request(API_CONFIG.ENDPOINTS.DELIVERY_STATUS(id), {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }

    // Admin methods
    async getUsers() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_USERS);
    }

    async toggleUserStatus(id) {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_USER_TOGGLE(id), {
            method: 'POST'
        });
    }

    async getAnalytics() {
        return this.request(API_CONFIG.ENDPOINTS.ADMIN_ANALYTICS);
    }

    // Promotions methods
    async getPromotions() {
        return this.request(API_CONFIG.ENDPOINTS.PROMOTIONS);
    }

    async createPromotion(promotionData) {
        return this.request(API_CONFIG.ENDPOINTS.PROMOTIONS, {
            method: 'POST',
            body: JSON.stringify(promotionData)
        });
    }

    async updatePromotion(id, promotionData) {
        return this.request(API_CONFIG.ENDPOINTS.PROMOTION(id), {
            method: 'PUT',
            body: JSON.stringify(promotionData)
        });
    }

    async deletePromotion(id) {
        return this.request(API_CONFIG.ENDPOINTS.PROMOTION(id), {
            method: 'DELETE'
        });
    }
}

// Global API client instance
const apiClient = new ApiClient();

// Make available globally
window.apiClient = apiClient;
window.API_CONFIG = API_CONFIG;