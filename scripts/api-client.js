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
            PRODUCT_INVENTORY: (id) => `/products/${id}/inventory`,
            
            // Orders
            ORDERS: '/orders',
            ORDER: (id) => `/orders/${id}`,
            ORDER_CANCEL: (id) => `/orders/${id}/cancel`,
            
            // Deliveries
            DELIVERIES: '/deliveries',
            DELIVERY: (id) => `/deliveries/${id}`,
            DELIVERY_ASSIGN: (id) => `/deliveries/${id}/assign`,
            DELIVERY_STATUS: (id) => `/deliveries/${id}/status`,
            DELIVERY_TRACK: (tracking) => `/deliveries/track/${tracking}`,
            
            // Admin
            ADMIN_USERS: '/admin/users',
            ADMIN_USER: (id) => `/admin/users/${id}`,
            ADMIN_USER_STATUS: (id) => `/admin/users/${id}/status`,
            ADMIN_ANALYTICS: '/admin/analytics',
            
            // Promotions
            PROMOTIONS: '/promotions',
            PROMOTION: (id) => `/promotions/${id}`
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

    // 5. Orders: { orders: { data: [...] } } or { orders: [...] }
    if (response?.orders?.data && Array.isArray(response.orders.data)) {
        return response.orders.data;
    }
    if (Array.isArray(response?.orders)) {
        return response.orders;
    }

    // 6. Users: { users: { data: [...] } } or { users: [...] }
    if (response?.users?.data && Array.isArray(response.users.data)) {
        return response.users.data;
    }
    if (Array.isArray(response?.users)) {
        return response.users;
    }

    // 7. Deliveries: { deliveries: { data: [...] } } or { deliveries: [...] }
    if (response?.deliveries?.data && Array.isArray(response.deliveries.data)) {
        return response.deliveries.data;
    }
    if (Array.isArray(response?.deliveries)) {
        return response.deliveries;
    }

    // 8. Direct key-based array
    if (response && Array.isArray(response[key])) {
        return response[key];
    }

    // 9. Fallback: top-level key holding paginated data
    if (response?.[key]?.data && Array.isArray(response[key].data)) {
        return response[key].data;
    }

    console.warn('Expected array data but received:', response);
    return [];
}

 // Authentication
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

    async logout() {
        const result = await this.request(this.endpoints.LOGOUT, { method: 'POST' });
        this.removeToken();
        return result;
    }

    async getUser() {
        return this.request(this.endpoints.USER);
    }

    async updateUser(userId, userData) {
        console.log('Updating user with data:', userData);
        return this.request(this.endpoints.ADMIN_USER(userId), {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async updateUserStatus(userId, status) {
        return this.request(this.endpoints.ADMIN_USER_STATUS(userId), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteUser(userId) {
        return this.request(this.endpoints.ADMIN_USER(userId), {
            method: 'DELETE'
        });
    }

    // Products
    async getProducts() {
        return this.request(this.endpoints.PRODUCTS);
    }

    async getProduct(productId) {
        return this.request(this.endpoints.PRODUCT(productId));
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

    // Orders
    async getOrders() {
        return this.request(this.endpoints.ORDERS);
    }

    async getOrder(orderId) {
        return this.request(this.endpoints.ORDER(orderId));
    }

    async createOrder(orderData) {
        try {
            console.log('Creating order with data:', orderData);
            const response = await this.request(this.endpoints.ORDERS, {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            console.log('Order created successfully:', response);
            return response;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async updateOrder(orderId, orderData) {
        return this.request(this.endpoints.ORDER(orderId), {
            method: 'PUT',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrderStatus(id, status) {
        return this.request(this.endpoints.ORDER(id), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async cancelOrder(orderId) {
        return this.request(this.endpoints.ORDER_CANCEL(orderId), {
            method: 'POST'
        });
    }

    // Deliveries
    async getDeliveries() {
        return this.request(this.endpoints.DELIVERIES);
    }

    async updateDeliveryStatus(id, statusData) {
        return this.request(this.endpoints.DELIVERY_STATUS(id), {
            method: 'POST',
            body: JSON.stringify(statusData)
        });
    }

    async updateDelivery(id, deliveryData) {
        return this.request(this.endpoints.DELIVERY(id), {
            method: 'PUT',
            body: JSON.stringify(deliveryData)
        });
    }

    async trackDelivery(trackingNumber) {
        return this.request(this.endpoints.DELIVERY_TRACK);
    }

    async assignDelivery(deliveryId, assignmentData) {
        return this.request(this.endpoints.DELIVERY_ASSIGN(deliveryId), {
            method: 'POST',
            body: JSON.stringify(assignmentData)
        });
    }

    // Promotions
    async getPromotions() {
        return this.request(this.endpoints.PROMOTIONS);
    }

    async getPromotion(promotionId) {
        return this.request(this.endpoints.PROMOTION(promotionId));
    }

    async createPromotion(promotionData) {
        return this.request(this.endpoints.PROMOTIONS, {
            method: 'POST',
            body: JSON.stringify(promotionData)
        });
    }

    async updatePromotion(promotionId, promotionData) {
        return this.request(this.endpoints.PROMOTION(promotionId), {
            method: 'PUT',
            body: JSON.stringify(promotionData)
        });
    }

    async deletePromotion(promotionId) {
        return this.request(this.endpoints.PROMOTION(promotionId), {
            method: 'DELETE'
        });
    }

    async calculateDiscount(discountData) {
        return this.request(this.endpoints.PROMOTIONS_CALCULATE_DISCOUNT, {
            method: 'POST',
            body: JSON.stringify(discountData)
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
        return this.request(this.endpoints.ADMIN_USER_STATUS(userId), {
            method: 'PUT'
        });
    }

    async createUser(userData) {
        return this.request(this.endpoints.ADMIN_USERS, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Maintenance Mode
    async getMaintenanceStatus() {
        return this.request(this.endpoints.MAINTENANCE_STATUS);
    }

    async enableMaintenanceMode() {
        return this.request(this.endpoints.MAINTENANCE_ENABLE, {
            method: 'POST'
        });
    }

    async disableMaintenanceMode() {
        return this.request(this.endpoints.MAINTENANCE_DISABLE, {
            method: 'POST'
        });
    }

    // Payment processing
    async processPayment(paymentData) {
        return this.request(this.endpoints.PAYMENTS_PROCESS, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Inventory management
    async updateInventory(productId, inventoryData) {
        return this.request(this.endpoints.PRODUCT_INVENTORY(productId), {
            method: 'PUT',
            body: JSON.stringify(inventoryData)
        });
    }
}

if (typeof window.apiClient === 'undefined') {
    window.apiClient = new ApiClient();
}