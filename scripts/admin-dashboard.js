// Clean Admin Dashboard JavaScript - Simplified and Efficient

// State management
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.data = {
            users: [],
            orders: [],
            products: [],
            deliveries: []
        };
        this.init();
    }

    async init() {
        console.log('Admin Dashboard initializing...');
        
        // Check authentication
        if (!this.checkAuth()) return;
        
        // Load all data
        await this.loadAllData();
        
        // Setup event listeners
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
                this.showNotification('Access denied. Admin privileges required.', 'error');
                window.location.href = 'index.html';
                return false;
            }
            
            // Update UI with user info
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
        try {
            this.showNotification('Loading dashboard data...', 'info');
            
            // Load all data in parallel
            const [usersRes, ordersRes, productsRes, deliveriesRes] = await Promise.all([
                apiClient.getUsers().catch(e => ({ error: e })),
                apiClient.getOrders().catch(e => ({ error: e })),
                apiClient.getProducts().catch(e => ({ error: e })),
                apiClient.getDeliveries().catch(e => ({ error: e }))
            ]);

            // Process responses
            this.data.users = usersRes.error ? [] : apiClient.extractArrayData(usersRes);
            this.data.orders = ordersRes.error ? [] : apiClient.extractArrayData(ordersRes);
            this.data.products = productsRes.error ? [] : apiClient.extractArrayData(productsRes);
            this.data.deliveries = deliveriesRes.error ? [] : apiClient.extractArrayData(deliveriesRes);

            console.log('Data loaded:', this.data);

            // Update all sections
            this.updateAnalytics();
            this.updateUsersTable();
            this.updateOrdersTable();

            this.showNotification('Dashboard loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    updateAnalytics() {
        // Calculate metrics
        const metrics = this.calculateMetrics();
        
        // Update DOM elements
        this.updateElement('totalSales', `Ksh${metrics.totalSales.toLocaleString()}`);
        this.updateElement('totalOrders', metrics.totalOrders.toLocaleString());
        this.updateElement('totalUsers', metrics.totalUsers.toLocaleString());
        this.updateElement('monthlyRevenue', `Ksh${metrics.monthlyRevenue.toLocaleString()}`);
        this.updateElement('pendingOrders', metrics.pendingOrders.toLocaleString());
        this.updateElement('totalProducts', metrics.totalProducts.toLocaleString());

        // Update growth indicators
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
        // Simple growth calculation (can be enhanced)
        const growthRate = 5.2; // Placeholder - calculate from historical data
        const elements = ['orderGrowth', 'userGrowth', 'salesGrowth', 'revenueGrowth'];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.className = 'text-sm font-medium text-green-600';
                element.textContent = `↑ ${growthRate}% from last month`;
            }
        });
    }

    updateUsersTable() {
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;

        if (this.data.users.length === 0) {
            tableBody.innerHTML = this.getEmptyTableRow('users', 6);
            return;
        }

        tableBody.innerHTML = this.data.users.map(user => `
            <tr>
                <td class="font-medium">${user.name || 'N/A'}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${this.getStatusClass(user.status)}">${user.status || 'Active'}</span></td>
                <td class="text-sm text-gray-500">${new Date(user.created_at).toLocaleDateString()}</td>
                <td>${this.getUserActions(user)}</td>
            </tr>
        `).join('');
    }

    updateOrdersTable() {
        const tableBody = document.querySelector('#ordersTable tbody');
        if (!tableBody) return;

        if (this.data.orders.length === 0) {
            tableBody.innerHTML = this.getEmptyTableRow('orders', 6);
            return;
        }

        // Show latest 10 orders
        const recentOrders = this.data.orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        tableBody.innerHTML = recentOrders.map(order => `
            <tr>
                <td class="font-medium">#${order.id}</td>
                <td>${order.user?.name || order.customer_name || 'N/A'}</td>
                <td class="font-medium">Ksh${(parseFloat(order.total_amount) || 0).toLocaleString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="text-sm text-gray-500">${new Date(order.created_at).toLocaleDateString()}</td>
                <td>${this.getOrderActions(order)}</td>
            </tr>
        `).join('');
    }

    // Helper methods for generating HTML
    getEmptyTableRow(type, colspan) {
        const icons = { users: '👥', orders: '📦', products: '📋' };
        const actions = { 
            users: `<button class="btn-primary" onclick="dashboard.showUserModal()">Create First User</button>`,
            orders: `<p class="text-gray-600">No orders found.</p>`,
            products: `<p class="text-gray-600">No products found.</p>`
        };

        return `
            <tr>
                <td colspan="${colspan}" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">${icons[type]}</div>
                    ${actions[type]}
                </td>
            </tr>
        `;
    }

    getStatusClass(status) {
        const isActive = status !== 'inactive' && status !== 'suspended';
        return isActive ? 'status-active' : 'status-inactive';
    }

    getUserActions(user) {
        const isActive = user.status !== 'inactive' && user.status !== 'suspended';
        return `
            <div class="flex space-x-2">
                <button class="btn-secondary text-sm" onclick="dashboard.viewUser('${user.id}')">View</button>
                <button class="btn-secondary text-sm" onclick="dashboard.editUser('${user.id}')">Edit</button>
                <button class="btn-${isActive ? 'danger' : 'primary'} text-sm" 
                        onclick="dashboard.toggleUserStatus('${user.id}', ${isActive})">
                    ${isActive ? 'Suspend' : 'Activate'}
                </button>
                <button class="btn-danger text-sm" onclick="dashboard.deleteUser('${user.id}')">Delete</button>
            </div>
        `;
    }

getOrderActions(order) {
    // Check if delivery exists for this order
    const hasDelivery = this.data.deliveries.some(d => parseInt(d.order_id) === parseInt(order.id));
    
    return `
        <div class="flex space-x-2">
            <button class="btn-secondary text-sm" onclick="dashboard.viewOrder('${order.id}')">View</button>
            ${hasDelivery ? 
                `<button class="btn-warning text-sm" onclick="dashboard.manageDelivery('${order.id}')">Manage Delivery</button>` :
                order.status === 'confirmed' ? 
                    `<button class="btn-primary text-sm" onclick="dashboard.assignOrder('${order.id}')">Assign Delivery</button>` :
                    `<button class="btn-primary text-sm" onclick="dashboard.updateOrderStatus('${order.id}')">Update Status</button>`
            }
        </div>
    `;
}

async manageDelivery(orderId) {
    try {
        // Find the delivery for this order
        const delivery = this.data.deliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
        if (delivery) {
            await this.updateExistingDelivery(delivery);
        } else {
            // Fallback to assign if no delivery found locally
            await this.assignOrder(orderId);
        }
    } catch (error) {
        console.error('Error managing delivery:', error);
        this.showNotification('Failed to manage delivery', 'error');
    }
}

    // User Management Methods
    async showUserModal(user = null) {
        const isEdit = !!user;
        const title = isEdit ? 'Edit User' : 'Create New User';
        
        const modal = this.createModal('userModal', title, `
            <form id="userForm">
                <div class="form-group mb-4">
                    <label>Name</label>
                    <input type="text" id="userName" required class="w-full p-2 border rounded" 
                           value="${user?.name || ''}">
                </div>
                <div class="form-group mb-4">
                    <label>Email</label>
                    <input type="email" id="userEmail" required class="w-full p-2 border rounded" 
                           value="${user?.email || ''}">
                </div>
                <div class="form-group mb-4">
                    <label>Role</label>
                    <select id="userRole" required class="w-full p-2 border rounded">
                        ${this.getRoleOptions(user?.role)}
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label>Phone</label>
                    <input type="tel" id="userPhone" class="w-full p-2 border rounded" 
                           value="${user?.phone || ''}">
                </div>
                ${isEdit ? `
                <div class="form-group mb-4">
                    <label>Status</label>
                    <select id="userStatus" class="w-full p-2 border rounded">
                        ${this.getStatusOptions(user?.status)}
                    </select>
                </div>` : ''}
                <div class="flex space-x-2">
                    <button type="submit" class="btn-primary flex-1">${isEdit ? 'Update' : 'Create'} User</button>
                    <button type="button" onclick="dashboard.closeModal('userModal')" class="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        `);

        // Handle form submission
        document.getElementById('userForm').onsubmit = (e) => this.handleUserSubmit(e, user);
    }

    async handleUserSubmit(e, user) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            phone: document.getElementById('userPhone').value
        };

        if (user) {
            userData.status = document.getElementById('userStatus').value;
        } else {
            userData.password = 'DefaultPassword123!';
            userData.password_confirmation = 'DefaultPassword123!';
            userData.status = 'active';
        }

        try {
            if (user) {
                await apiClient.updateUser(user.id, userData);
                this.showNotification('User updated successfully!', 'success');
            } else {
                await apiClient.createUser(userData);
                this.showNotification('User created successfully!', 'success');
            }
            
            this.closeModal('userModal');
            await this.loadAllData();
        } catch (error) {
            console.error('Error saving user:', error);
            this.showNotification('Failed to save user: ' + error.message, 'error');
        }
    }

    async toggleUserStatus(userId, isCurrentlyActive) {
        const action = isCurrentlyActive ? 'suspend' : 'activate';
        const newStatus = isCurrentlyActive ? 'suspended' : 'active';
        
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        
        try {
            await apiClient.updateUserStatus(userId, newStatus);
            this.showNotification(`User ${action}d successfully.`, 'success');
            await this.loadAllData();
        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showNotification('Failed to update user status: ' + error.message, 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            await apiClient.deleteUser(userId);
            this.showNotification('User deleted successfully.', 'success');
            await this.loadAllData();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Failed to delete user: ' + error.message, 'error');
        }
    }

    viewUser(userId) {
        const user = this.data.users.find(u => u.id == userId);
        if (!user) return;

        const userOrders = this.data.orders.filter(o => o.user_id == userId);
        const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        
        alert(`User Details:
        
Name: ${user.name || 'N/A'}
Email: ${user.email}
Role: ${user.role}
Status: ${user.status || 'Active'}
Joined: ${new Date(user.created_at).toLocaleDateString()}
Total Orders: ${userOrders.length}
Total Spent: Ksh${totalSpent.toLocaleString()}
Phone: ${user.phone || 'N/A'}`);
    }

    editUser(userId) {
        const user = this.data.users.find(u => u.id == userId);
        if (user) {
            this.showUserModal(user);
        }
    }

    // Order Management Methods
    viewOrder(orderId) {
        const order = this.data.orders.find(o => o.id == orderId);
        if (!order) return;

        const orderDate = new Date(order.created_at).toLocaleDateString();
        const itemsCount = order.items?.length || 0;
        
        alert(`Order Details:

Order ID: #${order.id}
Customer: ${order.user?.name || order.customer_name || 'N/A'}
Status: ${order.status}
Total Amount: Ksh${parseFloat(order.total_amount || 0).toLocaleString()}
Order Date: ${orderDate}
Items: ${itemsCount}
Delivery Address: ${order.delivery_address || 'Not provided'}`);
    }

    async updateOrderStatus(orderId) {
        const order = this.data.orders.find(o => o.id == orderId);
        if (!order) return;

        const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        const currentStatus = order.status;
        
        const modal = this.createModal('orderStatusModal', 'Update Order Status', `
            <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">Order #${order.id} - ${order.user?.name || 'Customer'}</p>
                <p class="text-sm text-gray-600 mb-4">Current Status: <span class="font-medium">${currentStatus}</span></p>
            </div>
            <form id="orderStatusForm">
                <div class="form-group mb-4">
                    <label>New Status</label>
                    <select id="newOrderStatus" required class="w-full p-2 border rounded">
                        ${statusOptions.map(status => 
                            `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="btn-primary flex-1">Update Status</button>
                    <button type="button" onclick="dashboard.closeModal('orderStatusModal')" class="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        `);

        document.getElementById('orderStatusForm').onsubmit = async (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('newOrderStatus').value;
            
            try {
                await apiClient.updateOrderStatus(orderId, newStatus);
                this.showNotification(`Order status updated to ${newStatus}`, 'success');
                this.closeModal('orderStatusModal');
                await this.loadAllData();
            } catch (error) {
                console.error('Error updating order status:', error);
                this.showNotification('Failed to update order status: ' + error.message, 'error');
            }
        };
    }

    async assignOrder(orderId) {
        try {
            // Check for existing delivery
            const existingDelivery = this.data.deliveries.find(d => d.order_id == orderId);
            if (existingDelivery) {
                alert(`Order #${orderId} already has a delivery assigned (ID: #${existingDelivery.id})`);
                return;
            }

            // Get logistics users
            const logisticsUsers = this.data.users.filter(u => u.role === 'logistics');
            if (logisticsUsers.length === 0) {
                this.showNotification('No logistics users available', 'error');
                return;
            }

            const order = this.data.orders.find(o => o.id == orderId);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const defaultDate = tomorrow.toISOString().slice(0, 16);

            const modal = this.createModal('assignOrderModal', 'Assign Order to Logistics', `
                <div class="mb-4">
                    <p class="text-sm text-gray-600">Order #${order.id} - Ksh${parseFloat(order.total_amount || 0).toLocaleString()}</p>
                </div>
                <form id="assignOrderForm">
                    <div class="form-group mb-4">
                        <label>Logistics User</label>
                        <select id="logisticsUser" required class="w-full p-2 border rounded">
                            <option value="">Choose Logistics User</option>
                            ${logisticsUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label>Scheduled Date & Time</label>
                        <input type="datetime-local" id="scheduledDate" required class="w-full p-2 border rounded" 
                               value="${defaultDate}" min="${new Date().toISOString().slice(0, 16)}">
                    </div>
                    <div class="form-group mb-4">
                        <label>Priority</label>
                        <select id="priority" class="w-full p-2 border rounded">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label>Delivery Address</label>
                        <textarea id="deliveryAddress" required class="w-full p-2 border rounded" rows="3">${order.delivery_address || ''}</textarea>
                    </div>
                    <div class="form-group mb-4">
                        <label>Notes (optional)</label>
                        <textarea id="deliveryNotes" class="w-full p-2 border rounded" rows="2"></textarea>
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Assign Order</button>
                        <button type="button" onclick="dashboard.closeModal('assignOrderModal')" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            `);

            document.getElementById('assignOrderForm').onsubmit = async (e) => {
                e.preventDefault();
                
                const deliveryData = {
                    order_id: parseInt(orderId),
                    assigned_to: parseInt(document.getElementById('logisticsUser').value),
                    scheduled_date: new Date(document.getElementById('scheduledDate').value).toISOString(),
                    delivery_address: document.getElementById('deliveryAddress').value.trim(),
                    priority: document.getElementById('priority').value,
                    delivery_notes: document.getElementById('deliveryNotes').value.trim() || null
                };

                try {
                    await apiClient.createDelivery(deliveryData);
                    this.showNotification('Order assigned successfully!', 'success');
                    this.closeModal('assignOrderModal');
                    await this.loadAllData();
                } catch (error) {
                    console.error('Error assigning order:', error);
                    this.showNotification('Failed to assign order: ' + error.message, 'error');
                }
            };

        } catch (error) {
            console.error('Error in assignOrder:', error);
            this.showNotification('Failed to load assignment data', 'error');
        }
    }

    // Utility Methods
    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">${title}</h3>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.remove();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    getRoleOptions(selectedRole = '') {
        const roles = ['farmer', 'consumer', 'retailer', 'logistics', 'admin'];
        return roles.map(role => 
            `<option value="${role}" ${role === selectedRole ? 'selected' : ''}>${role.charAt(0).toUpperCase() + role.slice(1)}</option>`
        ).join('');
    }

    getStatusOptions(selectedStatus = 'active') {
        const statuses = ['active', 'inactive', 'suspended'];
        return statuses.map(status => 
            `<option value="${status}" ${status === selectedStatus ? 'selected' : ''}>${status.charAt(0).toUpperCase() + status.slice(1)}</option>`
        ).join('');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${colors[type] || colors.info}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.loadAllData();
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // Refresh data method
    async refreshData() {
        await this.loadAllData();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new AdminDashboard();
});

// Make methods globally available for onclick handlers
window.dashboard = null;