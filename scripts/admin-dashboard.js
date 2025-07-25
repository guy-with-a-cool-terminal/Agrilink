// Updated Admin Dashboard JavaScript - Better Order/Delivery Flow

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
        
        if (!this.checkAuth()) return;
        await this.loadAllData();
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
            
            const [usersRes, ordersRes, productsRes, deliveriesRes] = await Promise.all([
                apiClient.getUsers().catch(e => ({ error: e })),
                apiClient.getOrders().catch(e => ({ error: e })),
                apiClient.getProducts().catch(e => ({ error: e })),
                apiClient.getDeliveries().catch(e => ({ error: e }))
            ]);

            this.data.users = usersRes.error ? [] : apiClient.extractArrayData(usersRes);
            this.data.orders = ordersRes.error ? [] : apiClient.extractArrayData(ordersRes);
            this.data.products = productsRes.error ? [] : apiClient.extractArrayData(productsRes);
            this.data.deliveries = deliveriesRes.error ? [] : apiClient.extractArrayData(deliveriesRes);

            console.log('Data loaded:', this.data);

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
        const metrics = this.calculateMetrics();
        
        this.updateElement('totalSales', `Ksh${metrics.totalSales.toLocaleString()}`);
        this.updateElement('totalOrders', metrics.totalOrders.toLocaleString());
        this.updateElement('totalUsers', metrics.totalUsers.toLocaleString());
        this.updateElement('monthlyRevenue', `Ksh${metrics.monthlyRevenue.toLocaleString()}`);
        this.updateElement('pendingOrders', metrics.pendingOrders.toLocaleString());
        this.updateElement('totalProducts', metrics.totalProducts.toLocaleString());

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
        const growthRate = 5.2;
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

    // IMPROVED ORDER ACTIONS - Better logic for delivery management
    getOrderActions(order) {
        const hasDelivery = this.data.deliveries.some(d => parseInt(d.order_id) === parseInt(order.id));
        const orderStatus = order.status;
        
        let actions = `<button class="btn-secondary text-sm" onclick="dashboard.viewOrder('${order.id}')">View</button>`;
        
        if (hasDelivery) {
            // Order has delivery - show management option
            actions += ` <button class="btn-success text-sm" onclick="dashboard.manageDelivery('${order.id}')">Manage Delivery</button>`;
        } else {
            // No delivery exists
            if (orderStatus === 'pending') {
                actions += ` <button class="btn-warning text-sm" onclick="dashboard.updateOrderStatus('${order.id}')">Confirm Order</button>`;
            } else if (orderStatus === 'confirmed') {
                actions += ` <button class="btn-primary text-sm" onclick="dashboard.assignDelivery('${order.id}')">Assign Delivery</button>`;
            } else {
                actions += ` <button class="btn-secondary text-sm" onclick="dashboard.updateOrderStatus('${order.id}')">Update Status</button>`;
            }
        }
        
        return `<div class="flex space-x-2">${actions}</div>`;
    }

    // RENAMED METHOD: assignOrder -> assignDelivery (clearer naming)
    async assignDelivery(orderId) {
        try {
            // Double-check no delivery exists
            const existingDelivery = this.data.deliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
            if (existingDelivery) {
                this.showNotification(`Order #${orderId} already has a delivery assigned`, 'warning');
                return;
            }

            // Get logistics users
            const logisticsUsers = this.data.users.filter(u => u.role === 'logistics');
            if (logisticsUsers.length === 0) {
                this.showNotification('No logistics users available. Please create logistics users first.', 'error');
                return;
            }

            const order = this.data.orders.find(o => o.id == orderId);
            if (!order) {
                this.showNotification('Order not found', 'error');
                return;
            }

            // Ensure order is confirmed before assignment
            if (order.status === 'pending') {
                const confirmFirst = confirm('Order is still pending. Confirm order first before assigning delivery?');
                if (confirmFirst) {
                    await this.confirmOrderFirst(order);
                } else {
                    return;
                }
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const defaultDate = tomorrow.toISOString().slice(0, 16);

            const modal = this.createModal('assignDeliveryModal', 'Assign Delivery to Logistics', `
                <div class="mb-4 p-3 bg-gray-50 rounded">
                    <p class="text-sm text-gray-700"><strong>Order #${order.id}</strong></p>
                    <p class="text-sm text-gray-600">Customer: ${order.user?.name || 'N/A'}</p>
                    <p class="text-sm text-gray-600">Amount: Ksh${parseFloat(order.total_amount || 0).toLocaleString()}</p>
                    <p class="text-sm text-gray-600">Status: ${order.status}</p>
                </div>
                <form id="assignDeliveryForm">
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Assign to Logistics User</label>
                        <select id="logisticsUser" required class="w-full p-2 border rounded">
                            <option value="">Choose Logistics User</option>
                            ${logisticsUsers.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Scheduled Date & Time</label>
                        <input type="datetime-local" id="scheduledDate" required class="w-full p-2 border rounded" 
                               value="${defaultDate}" min="${new Date().toISOString().slice(0, 16)}">
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Priority</label>
                        <select id="priority" class="w-full p-2 border rounded">
                            <option value="low">Low Priority</option>
                            <option value="medium" selected>Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Delivery Address</label>
                        <textarea id="deliveryAddress" required class="w-full p-2 border rounded" rows="3" 
                                  placeholder="Enter complete delivery address">${order.delivery_address || ''}</textarea>
                    </div>
                    <div class="form-group mb-4">
                        <label class="block text-sm font-medium mb-1">Delivery Notes (optional)</label>
                        <textarea id="deliveryNotes" class="w-full p-2 border rounded" rows="2" 
                                  placeholder="Special instructions, contact info, etc."></textarea>
                    </div>
                    <div class="flex space-x-2">
                        <button type="submit" class="btn-primary flex-1">Assign Delivery</button>
                        <button type="button" onclick="dashboard.closeModal('assignDeliveryModal')" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            `);

            document.getElementById('assignDeliveryForm').onsubmit = async (e) => {
                e.preventDefault();
                
                const deliveryData = {
                    order_id: parseInt(orderId),
                    assigned_to: parseInt(document.getElementById('logisticsUser').value),
                    scheduled_date: new Date(document.getElementById('scheduledDate').value).toISOString(),
                    delivery_address: document.getElementById('deliveryAddress').value.trim(),
                    priority: document.getElementById('priority').value,
                    delivery_notes: document.getElementById('deliveryNotes').value.trim() || null
                };

                // Validate required fields
                if (!deliveryData.assigned_to) {
                    this.showNotification('Please select a logistics user', 'error');
                    return;
                }

                if (!deliveryData.delivery_address) {
                    this.showNotification('Please enter delivery address', 'error');
                    return;
                }

                try {
                    const response = await apiClient.createDelivery(deliveryData);
                    this.showNotification('Delivery assigned successfully!', 'success');
                    this.closeModal('assignDeliveryModal');
                    await this.loadAllData(); // Refresh data
                } catch (error) {
                    console.error('Error assigning delivery:', error);
                    this.showNotification('Failed to assign delivery: ' + (error.message || 'Unknown error'), 'error');
                }
            };

        } catch (error) {
            console.error('Error in assignDelivery:', error);
            this.showNotification('Failed to load assignment data', 'error');
        }
    }

    // Helper method to confirm order before delivery assignment
    async confirmOrderFirst(order) {
        try {
            await apiClient.updateOrderStatus(order.id, 'confirmed');
            order.status = 'confirmed'; // Update local data
            this.showNotification('Order confirmed successfully', 'success');
        } catch (error) {
            console.error('Error confirming order:', error);
            this.showNotification('Failed to confirm order', 'error');
            throw error;
        }
    }

    async manageDelivery(orderId) {
        try {
            const delivery = this.data.deliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
            if (!delivery) {
                this.showNotification('Delivery not found', 'error');
                return;
            }

            const order = this.data.orders.find(o => o.id == orderId);
            const assignedUser = this.data.users.find(u => u.id == delivery.assigned_to);

            const modal = this.createModal('manageDeliveryModal', 'Manage Delivery', `
                <div class="mb-4 p-3 bg-gray-50 rounded">
                    <p class="text-sm text-gray-700"><strong>Delivery #${delivery.id}</strong></p>
                    <p class="text-sm text-gray-600">Order: #${order?.id}</p>
                    <p class="text-sm text-gray-600">Assigned to: ${assignedUser?.name || 'Unassigned'}</p>
                    <p class="text-sm text-gray-600">Status: ${delivery.status}</p>
                    <p class="text-sm text-gray-600">Tracking: ${delivery.tracking_number || 'N/A'}</p>
                </div>
                <div class="space-y-3">
                    <button class="btn-primary w-full" onclick="dashboard.viewDeliveryDetails('${delivery.id}')">
                        View Full Details
                    </button>
                    <button class="btn-warning w-full" onclick="dashboard.updateDeliveryStatus('${delivery.id}')">
                        Update Status
                    </button>
                    <button class="btn-secondary w-full" onclick="dashboard.reassignDelivery('${delivery.id}')">
                        Reassign to Different User
                    </button>
                    <button class="btn-secondary w-full" onclick="dashboard.closeModal('manageDeliveryModal')">
                        Close
                    </button>
                </div>
            `);

        } catch (error) {
            console.error('Error managing delivery:', error);
            this.showNotification('Failed to load delivery management', 'error');
        }
    }

    // Additional delivery management methods
    viewDeliveryDetails(deliveryId) {
        const delivery = this.data.deliveries.find(d => d.id == deliveryId);
        if (!delivery) return;

        const order = this.data.orders.find(o => o.id == delivery.order_id);
        const assignedUser = this.data.users.find(u => u.id == delivery.assigned_to);
        
        alert(`Delivery Details:

Delivery ID: #${delivery.id}
Tracking Number: ${delivery.tracking_number || 'N/A'}
Order ID: #${order?.id}
Customer: ${order?.user?.name || 'N/A'}
Assigned to: ${assignedUser?.name || 'Unassigned'}
Status: ${delivery.status}
Priority: ${delivery.priority}
Scheduled Date: ${new Date(delivery.scheduled_date).toLocaleString()}
Delivery Address: ${delivery.delivery_address}
Notes: ${delivery.delivery_notes || 'None'}`);
    }

    async updateDeliveryStatus(deliveryId) {
        const delivery = this.data.deliveries.find(d => d.id == deliveryId);
        if (!delivery) return;

        const statusOptions = ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'];
        
        const modal = this.createModal('updateDeliveryStatusModal', 'Update Delivery Status', `
            <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">Delivery #${delivery.id}</p>
                <p class="text-sm text-gray-600 mb-4">Current Status: <span class="font-medium">${delivery.status}</span></p>
            </div>
            <form id="updateDeliveryStatusForm">
                <div class="form-group mb-4">
                    <label>New Status</label>
                    <select id="newDeliveryStatus" required class="w-full p-2 border rounded">
                        ${statusOptions.map(status => 
                            `<option value="${status}" ${status === delivery.status ? 'selected' : ''}>${status.replace('_', ' ').toUpperCase()}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label>Notes (optional)</label>
                    <textarea id="statusNotes" class="w-full p-2 border rounded" rows="2" 
                              placeholder="Add notes about this status update"></textarea>
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="btn-primary flex-1">Update Status</button>
                    <button type="button" onclick="dashboard.closeModal('updateDeliveryStatusModal')" class="btn-secondary flex-1">Cancel</button>
                </div>
            </form>
        `);

        document.getElementById('updateDeliveryStatusForm').onsubmit = async (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('newDeliveryStatus').value;
            const notes = document.getElementById('statusNotes').value;
            
            try {
                await apiClient.updateDeliveryStatus(deliveryId, { 
                    status: newStatus, 
                    notes: notes 
                });
                this.showNotification(`Delivery status updated to ${newStatus}`, 'success');
                this.closeModal('updateDeliveryStatusModal');
                this.closeModal('manageDeliveryModal');
                await this.loadAllData();
            } catch (error) {
                console.error('Error updating delivery status:', error);
                this.showNotification('Failed to update delivery status: ' + error.message, 'error');
            }
        };
    }

    // Keep existing methods for user management, order viewing, etc.
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

    viewOrder(orderId) {
        const order = this.data.orders.find(o => o.id == orderId);
        if (!order) return;

        const orderDate = new Date(order.created_at).toLocaleDateString();
        const itemsCount = order.items?.length || 0;
        const hasDelivery = this.data.deliveries.some(d => d.order_id == orderId);
        
        alert(`Order Details:

Order ID: #${order.id}
Customer: ${order.user?.name || order.customer_name || 'N/A'}
Status: ${order.status}
Total Amount: Ksh${parseFloat(order.total_amount || 0).toLocaleString()}
Order Date: ${orderDate}
Items: ${itemsCount}
Delivery Address: ${order.delivery_address || 'Not provided'}
Has Delivery: ${hasDelivery ? 'Yes' : 'No'}`);
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

    // Utility Methods
    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
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