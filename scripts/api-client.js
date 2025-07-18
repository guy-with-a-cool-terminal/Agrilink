
// Centralized API Client - Single source of truth
class ApiClient {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000/api';
        this.endpoints = {
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
            ADMIN_ANALYTICS: '/admin/analytics',
            
            // Promotions
            PROMOTIONS: '/promotions'
        };
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
            console.log(`API Request: ${config.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`API Response:`, data);
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Helper method to extract array data from nested responses, including pagination
    extractArrayData(response, key = 'data') {
    // 1. Direct array response
    if (Array.isArray(response)) {
        return response;
    }

    // 2. Laravel pagination: { data: [...] }
    if (response?.data && Array.isArray(response.data)) {
        return response.data;
    }

    // 3. Nested Laravel-style: { data: { items: [...] } }
    if (response?.data?.items && Array.isArray(response.data.items)) {
        return response.data.items;
    }

    // 4. Products: { products: { data: [...] } }
    if (response?.products?.data && Array.isArray(response.products.data)) {
        return response.products.data;
    }

    // 5. Users: { users: { data: [...] } }
    if (response?.users?.data && Array.isArray(response.users.data)) {
        return response.users.data;
    }

    // 6. Direct key-based array
    if (response && Array.isArray(response[key])) {
        return response[key];
    }

    // 7. Fallback: top-level key holding paginated data
    if (response?.[key]?.data && Array.isArray(response[key].data)) {
        return response[key].data;
    }

    console.warn('Expected array data but received:', response);
    return [];
}



    // Authentication methods
    async login(credentials) {
        return this.request(this.endpoints.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
            auth: false
        });
    }

    async register(userData) {
        return this.request(this.endpoints.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });
    }

    async getUser() {
        return this.request(this.endpoints.USER);
    }

    // Products methods
    async getProducts() {
        return this.request(this.endpoints.PRODUCTS);
    }

    async createProduct(productData) {
        return this.request(this.endpoints.PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(this.endpoints.PRODUCT(id), {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(this.endpoints.PRODUCT(id), {
            method: 'DELETE'
        });
    }

    // Orders methods
    async getOrders() {
        return this.request(this.endpoints.ORDERS);
    }

    async createOrder(orderData) {
        return this.request(this.endpoints.ORDERS, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrderStatus(id, status) {
        return this.request(this.endpoints.ORDER_STATUS(id), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Deliveries methods
    async getDeliveries() {
        return this.request(this.endpoints.DELIVERIES);
    }

    async updateDeliveryStatus(id, statusData) {
        return this.request(this.endpoints.DELIVERY_STATUS(id), {
            method: 'PUT',
            body: JSON.stringify(statusData)
        });
    }

    // Analytics methods
    async getAnalytics() {
        return this.request(this.endpoints.ADMIN_ANALYTICS);
    }

    // Admin methods - Fixed to use correct endpoint
    async getUsers() {
        return this.request(this.endpoints.ADMIN_USERS);
    }

    async toggleUserStatus(userId) {
        return this.request(`${this.endpoints.ADMIN_USERS}/${userId}/status`, {
            method: 'PUT'
        });
    }
}

// Prevent redeclaration by checking if already exists
if (typeof window.apiClient === 'undefined') {
    window.apiClient = new ApiClient();
}
