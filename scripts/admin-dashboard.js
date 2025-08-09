class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.maintenanceMode = false;
        this.data = {
            users: [],
            orders: [],
            products: [],
            deliveries: []
        };
        // Add request tracking to prevent race conditions
        this.pendingRequests = new Set();
        this.isLoadingData = false;
        this.init();
    }

    async init() {
        console.log('Admin Dashboard initializing...');
        
        if (!this.checkAuth()) return;
        await this.checkMaintenanceStatus();
        await this.loadAllData();
        this.setupEventListeners();
        
        // Initialize review manager
        this.reviewManager = new AdminReviewManager();
        await this.reviewManager.init();
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
        // Prevent multiple simultaneous data loading
        if (this.isLoadingData) {
            console.log('Data loading already in progress, skipping...');
            return;
        }

        this.isLoadingData = true;
        
        try {
            this.showNotification('Loading dashboard data...', 'info');
            
            // Load data sequentially instead of all at once to reduce server load
            console.log('Loading users...');
            const usersRes = await apiClient.getUsers().catch(e => ({ error: e, data: [] }));
            this.data.users = usersRes.error ? [] : apiClient.extractArrayData(usersRes);
            
            // Add small delay to prevent overwhelming local server
            await this.delay(100);
            
            console.log('Loading orders...');
            const ordersRes = await apiClient.getOrders().catch(e => ({ error: e, data: [] }));
            this.data.orders = ordersRes.error ? [] : apiClient.extractArrayData(ordersRes);
            
            await this.delay(100);
            
            console.log('Loading products...');
            const productsRes = await apiClient.getProducts().catch(e => ({ error: e, data: [] }));
            this.data.products = productsRes.error ? [] : apiClient.extractArrayData(productsRes);
            
            await this.delay(100);
            
            console.log('Loading deliveries...');
            const deliveriesRes = await apiClient.getDeliveries().catch(e => ({ error: e, data: [] }));
            this.data.deliveries = deliveriesRes.error ? [] : apiClient.extractArrayData(deliveriesRes);

            console.log('Data loaded:', this.data);

            this.updateAnalytics();
            this.updateUsersTable();
            this.updateOrdersTable();
            this.updateProductAnalytics();
            
            // Load reviews if manager is initialized
            if (this.reviewManager) {
                await this.reviewManager.loadReviews();
            }

            this.showNotification('Dashboard loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        } finally {
            this.isLoadingData = false;
        }
    }

    // Helper method to add delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    // Product analytics functionality
    updateProductAnalytics() {
        const totalProducts = this.data.products.length;
        const lowStockProducts = this.data.products.filter(p => (p.quantity || 0) < 10).length;
        const outOfStockProducts = this.data.products.filter(p => (p.quantity || 0) === 0).length;
        const activeProducts = this.data.products.filter(p => p.status === 'active').length;
        
        // Update product metrics in the analytics section
        const productMetrics = document.getElementById('productMetrics');
        if (productMetrics) {
            productMetrics.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-blue-800">Total Products</h4>
                        <p class="text-2xl font-bold text-blue-600">${totalProducts}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-green-800">Active Products</h4>
                        <p class="text-2xl font-bold text-green-600">${activeProducts}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-yellow-800">Low Stock</h4>
                        <p class="text-2xl font-bold text-yellow-600">${lowStockProducts}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-red-800">Out of Stock</h4>
                        <p class="text-2xl font-bold text-red-600">${outOfStockProducts}</p>
                    </div>
                </div>
            `;
        }
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

    // FIXED: assignDelivery with race condition prevention
    async assignDelivery(orderId) {
        const requestKey = `delivery-assign-${orderId}`;
        
        // Prevent multiple simultaneous requests for the same order
        if (this.pendingRequests.has(requestKey)) {
            this.showNotification(`Assignment already in progress for Order #${orderId}...`, 'warning');
            return;
        }

        this.pendingRequests.add(requestKey);

        try {
            // Fresh server-side check instead of relying on potentially stale local cache
            console.log('Checking for existing deliveries...');
            const serverDeliveriesRes = await apiClient.getDeliveries();
            const serverDeliveries = apiClient.extractArrayData(serverDeliveriesRes);
            
            const existingDelivery = serverDeliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
            if (existingDelivery) {
                this.showNotification(`Order #${orderId} already has a delivery assigned`, 'warning');
                return;
            }

            // Get logistics users from current data (no need to refetch)
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
                        <button type="submit" class="btn-primary flex-1" id="assignDeliveryBtn">Assign Delivery</button>
                        <button type="button" onclick="dashboard.closeModal('assignDeliveryModal')" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            `);

            document.getElementById('assignDeliveryForm').onsubmit = async (e) => {
                e.preventDefault();
                
                const submitBtn = document.getElementById('assignDeliveryBtn');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Assigning...';

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
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }

                if (!deliveryData.delivery_address) {
                    this.showNotification('Please enter delivery address', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }

                try {
                    // Final check before creating delivery
                    console.log('Final check before creating delivery...');
                    const finalCheckRes = await apiClient.getDeliveries();
                    const finalCheckDeliveries = apiClient.extractArrayData(finalCheckRes);
                    const finalExistingDelivery = finalCheckDeliveries.find(d => parseInt(d.order_id) === parseInt(orderId));
                    
                    if (finalExistingDelivery) {
                        this.showNotification(`Order #${orderId} already has a delivery assigned (detected just before creation)`, 'warning');
                        this.closeModal('assignDeliveryModal');
                        // Only refresh deliveries data instead of all data
                        await this.refreshDeliveriesOnly();
                        return;
                    }

                    console.log('Creating delivery...');
                    const response = await apiClient.createDelivery(deliveryData);
                    this.showNotification('Delivery assigned successfully!', 'success');
                    this.closeModal('assignDeliveryModal');
                    // Only refresh deliveries and orders data instead of everything
                    await this.refreshDeliveriesAndOrders();
                } catch (error) {
                    console.error('Error assigning delivery:', error);
                    this.showNotification('Failed to assign delivery: ' + (error.message || 'Unknown error'), 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            };

        } catch (error) {
            console.error('Error in assignDelivery:', error);
            this.showNotification('Failed to load assignment data: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            // Always remove the request lock
            this.pendingRequests.delete(requestKey);
        }
    }

    // Optimized refresh methods to reduce server load
    async refreshDeliveriesOnly() {
        try {
            console.log('Refreshing deliveries data only...');
            const deliveriesRes = await apiClient.getDeliveries();
            this.data.deliveries = apiClient.extractArrayData(deliveriesRes);
            this.updateOrdersTable(); // Update orders table to reflect delivery changes
        } catch (error) {
            console.error('Error refreshing deliveries:', error);
        }
    }

    async refreshDeliveriesAndOrders() {
        try {
            console.log('Refreshing deliveries and orders...');
            const deliveriesRes = await apiClient.getDeliveries();
            this.data.deliveries = apiClient.extractArrayData(deliveriesRes);
            
            await this.delay(100); // Small delay to prevent server overload
            
            const ordersRes = await apiClient.getOrders();
            this.data.orders = apiClient.extractArrayData(ordersRes);
            
            this.updateOrdersTable();
            this.updateAnalytics();
        } catch (error) {
            console.error('Error refreshing deliveries and orders:', error);
        }
    }
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
                await this.refreshDeliveriesAndOrders(); // Optimized refresh
            } catch (error) {
                console.error('Error updating delivery status:', error);
                this.showNotification('Failed to update delivery status: ' + error.message, 'error');
            }
        };
    }

    async showUserModal(user = null) {
    const isEdit = !!user;
    const title = isEdit ? 'Edit User' : 'Create New User';
    
    const modal = this.createModal('userModal', title, `
        <form id="userForm">
            <div class="form-group mb-4">
                <label class="block text-sm font-medium mb-1">Name</label>
                <input type="text" id="userName" name="name" required class="w-full p-2 border rounded" 
                       value="${user?.name || ''}" placeholder="Enter full name">
            </div>
            <div class="form-group mb-4">
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" id="userEmail" name="email" required class="w-full p-2 border rounded" 
                       value="${user?.email || ''}" placeholder="Enter email address">
            </div>
            <div class="form-group mb-4">
                <label class="block text-sm font-medium mb-1">Role</label>
                <select id="userRole" name="role" required class="w-full p-2 border rounded">
                    <option value="">Select a role</option>
                    ${this.getRoleOptions(user?.role)}
                </select>
            </div>
            <div class="form-group mb-4">
                <label class="block text-sm font-medium mb-1">Phone</label>
                <input type="tel" id="userPhone" name="phone" class="w-full p-2 border rounded" 
                       value="${user?.phone || ''}" placeholder="Enter phone number">
            </div>
            ${isEdit ? `
            <div class="form-group mb-4">
                <label class="block text-sm font-medium mb-1">Status</label>
                <select id="userStatus" name="status" class="w-full p-2 border rounded">
                    ${this.getStatusOptions(user?.status)}
                </select>
            </div>` : ''}
            <div class="flex space-x-2">
                <button type="submit" class="btn-primary flex-1" id="submitBtn">
                    ${isEdit ? 'Update' : 'Create'} User
                </button>
                <button type="button" onclick="dashboard.closeModal('userModal')" class="btn-secondary flex-1">
                    Cancel
                </button>
            </div>
        </form>
    `);

    // Wait for modal to be fully rendered in DOM before attaching event handler
    setTimeout(() => {
        const form = document.getElementById('userForm');
        if (form) {
            form.onsubmit = (e) => this.handleUserSubmit(e, user);
        }
    }, 100);
}

    async handleUserSubmit(e, user) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Disable submit button to prevent multiple submissions
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        // Use FormData to reliably capture form values
        const form = e.target;
        const formData = new FormData(form);
        
        // Extract values from FormData
        const userData = {
            name: formData.get('name')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            role: formData.get('role') || '',
            phone: formData.get('phone')?.trim() || ''
        };

        // Alternative method: Direct DOM element access with null checks
        const nameField = document.getElementById('userName');
        const emailField = document.getElementById('userEmail');
        const roleField = document.getElementById('userRole');
        const phoneField = document.getElementById('userPhone');
        
        // Fallback to direct DOM access if FormData is empty
        if (!userData.name && nameField) {
            userData.name = nameField.value?.trim() || '';
        }
        if (!userData.email && emailField) {
            userData.email = emailField.value?.trim() || '';
        }
        if (!userData.role && roleField) {
            userData.role = roleField.value || '';
        }
        if (!userData.phone && phoneField) {
            userData.phone = phoneField.value?.trim() || '';
        }

        console.log('Form data captured:', userData); // Debug log

        // Validate required fields
        const validationErrors = [];
        
        if (!userData.name) {
            validationErrors.push('Name is required');
        }
        
        if (!userData.email) {
            validationErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            validationErrors.push('Please enter a valid email address');
        }
        
        if (!userData.role) {
            validationErrors.push('Role is required');
        }

        if (validationErrors.length > 0) {
            this.showNotification(validationErrors.join(', '), 'error');
            return;
        }

        // Add additional fields for user creation/update
        if (user) {
            // Editing existing user
            const statusField = document.getElementById('userStatus');
            userData.status = statusField ? statusField.value : 'active';
        } else {
            // Creating new user
            userData.password = 'DefaultPassword123!';
            userData.password_confirmation = 'DefaultPassword123!';
            userData.status = 'active';
        }

        console.log('Submitting user data to API:', userData); // Debug log

        // Submit to API
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
        
        // Extract meaningful error message
        let errorMessage = 'Failed to save user';
        if (error.message) {
            errorMessage += ': ' + error.message;
        }
        
        this.showNotification(errorMessage, 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
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
                // Only refresh orders and deliveries instead of all data
                await this.refreshDeliveriesAndOrders();
            } catch (error) {
                console.error('Error updating order status:', error);
                this.showNotification('Failed to update order status: ' + error.message, 'error');
            }
        };
    }

    // Maintenance mode functionality
    async checkMaintenanceStatus() {
        try {
            const status = await apiClient.getMaintenanceStatus();
            this.maintenanceMode = !!status.maintenance;
            this.updateMaintenanceButton();
        } catch (error) {
            console.error('Could not fetch maintenance status:', error);
        }
    }

    async toggleMaintenanceMode() {
        try {
            const action = this.maintenanceMode ? 'disable' : 'enable';
            if (action === 'enable') {
                await apiClient.enableMaintenanceMode();
                this.showNotification('Maintenance mode enabled.', 'info');
            } else {
                await apiClient.disableMaintenanceMode();
                this.showNotification('Maintenance mode disabled.', 'success');
            }

            this.maintenanceMode = !this.maintenanceMode;
            this.updateMaintenanceButton();
        } catch (error) {
            console.error('Error toggling maintenance mode:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    updateMaintenanceButton() {
        const btn = document.getElementById('maintenanceToggle');
        if (!btn) return;
        btn.textContent = this.maintenanceMode ? '🔧 Disable Maintenance' : '🔧 Enable Maintenance';
        btn.className = this.maintenanceMode ? 'btn-primary' : 'btn-secondary';
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
    return roles.map(role => {
        const isSelected = role === selectedRole ? 'selected' : '';
        const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
        return `<option value="${role}" ${isSelected}>${capitalizedRole}</option>`;
    }).join('');
}

    getStatusOptions(selectedStatus = 'active') {
    const statuses = ['active', 'inactive', 'suspended'];
    return statuses.map(status => {
        const isSelected = status === selectedStatus ? 'selected' : '';
        const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return `<option value="${status}" ${isSelected}>${capitalizedStatus}</option>`;
    }).join('');
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
            refreshBtn.onclick = () => this.refreshData();
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }

        // Maintenance toggle button
        const maintenanceBtn = document.getElementById('maintenanceToggle');
        if (maintenanceBtn) {
            maintenanceBtn.onclick = () => this.toggleMaintenanceMode();
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    async refreshData() {
        // Prevent multiple simultaneous refresh operations
        if (this.isLoadingData) {
            this.showNotification('Refresh already in progress...', 'warning');
            return;
        }
        
        try {
            await this.loadAllData();
            this.showNotification('System Data refreshed with latest information!', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Failed to refresh System Data!', 'error');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new AdminDashboard();
});

// Make methods globally available for onclick handlers
window.dashboard = null;

// Global function wrappers for onclick handlers that need to be accessible from HTML
window.toggleMaintenanceMode = function() {
    if (window.dashboard) {
        window.dashboard.toggleMaintenanceMode();
    }
};

window.refreshData = function() {
    if (window.dashboard) {
        window.dashboard.refreshData();
    }
};

window.logout = function() {
    if (window.dashboard) {
        window.dashboard.logout();
    }
};

// AdminReviewManager class for comprehensive review management
class AdminReviewManager {
    constructor() {
        this.reviews = [];
        this.currentFilter = '';
    }

    async init() {
        console.log('AdminReviewManager initializing...');
        await this.loadReviews();
    }

    async loadReviews() {
        try {
            console.log('Loading reviews for admin dashboard...');
            const response = await apiClient.getReviews();
            this.reviews = apiClient.extractArrayData(response) || [];
            console.log('Reviews loaded:', this.reviews);
            this.updateReviewsTable();
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.showNotification('Failed to load reviews', 'error');
        }
    }

    updateReviewsTable() {
        const tableBody = document.querySelector('#reviewsTable tbody');
        if (!tableBody) return;

        let filteredReviews = this.reviews;
        if (this.currentFilter) {
            filteredReviews = this.reviews.filter(review => 
                review.status === this.currentFilter
            );
        }

        if (filteredReviews.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">📝</div>
                        <p class="text-gray-600">No reviews found</p>
                    </td>
                </tr>
            `;
            return;
        }

        const sortedReviews = filteredReviews
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 50); // Limit to 50 most recent

        tableBody.innerHTML = sortedReviews.map(review => `
            <tr>
                <td class="font-medium">#${review.id}</td>
                <td>#${review.order_id}</td>
                <td>${review.reviewer?.name || 'N/A'}</td>
                <td>${review.reviewee?.name || 'N/A'}</td>
                <td>
                    <div class="flex items-center">
                        <span class="text-lg">${ReviewUtils.getStarDisplay(review.rating)}</span>
                        <span class="ml-2 text-sm text-gray-600">(${review.rating}/5)</span>
                    </div>
                </td>
                <td>${ReviewUtils.getStatusBadge(review.status)}</td>
                <td class="text-sm text-gray-500">${ReviewUtils.formatReviewDate(review.created_at)}</td>
                <td>${this.getReviewActions(review)}</td>
            </tr>
        `).join('');
    }

    getReviewActions(review) {
        const actions = [`<button class="btn-secondary text-sm" onclick="AdminReviewManager.viewReview('${review.id}')">View</button>`];
        
        if (review.status === 'pending') {
            actions.push(`<button class="btn-primary text-sm" onclick="AdminReviewManager.approveReview('${review.id}')">Approve</button>`);
            actions.push(`<button class="btn-danger text-sm" onclick="AdminReviewManager.rejectReview('${review.id}')">Reject</button>`);
        } else if (review.status === 'flagged') {
            actions.push(`<button class="btn-primary text-sm" onclick="AdminReviewManager.approveReview('${review.id}')">Approve</button>`);
            actions.push(`<button class="btn-danger text-sm" onclick="AdminReviewManager.deleteReview('${review.id}')">Delete</button>`);
        } else if (review.status === 'approved') {
            actions.push(`<button class="btn-warning text-sm" onclick="AdminReviewManager.flagReview('${review.id}')">Flag</button>`);
        }
        
        return `<div class="flex space-x-1">${actions.join(' ')}</div>`;
    }

    static async viewReview(reviewId) {
        const manager = window.dashboard?.reviewManager;
        if (!manager) return;
        
        const review = manager.reviews.find(r => r.id == reviewId);
        if (!review) return;

        const modal = document.createElement('div');
        modal.id = 'viewReviewModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
                <h3 class="text-lg font-semibold mb-4">Review Details</h3>
                <div class="space-y-4">
                    <div>
                        <label class="text-sm font-medium text-gray-700">Review ID:</label>
                        <p class="text-sm">#${review.id}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">Order ID:</label>
                        <p class="text-sm">#${review.order_id}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-700">Reviewer:</label>
                            <p class="text-sm">${review.reviewer?.name || 'N/A'} (${review.reviewer?.role || 'N/A'})</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700">Reviewee:</label>
                            <p class="text-sm">${review.reviewee?.name || 'N/A'} (${review.reviewee?.role || 'N/A'})</p>
                        </div>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">Rating:</label>
                        <p class="text-lg">${ReviewUtils.getStarDisplay(review.rating)} (${review.rating}/5)</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">Status:</label>
                        <p class="text-sm">${ReviewUtils.getStatusBadge(review.status)}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">Date:</label>
                        <p class="text-sm">${ReviewUtils.formatReviewDate(review.created_at)}</p>
                    </div>
                    ${review.comment ? `
                        <div>
                            <label class="text-sm font-medium text-gray-700">Comment:</label>
                            <p class="text-sm bg-gray-50 p-3 rounded">${review.comment}</p>
                        </div>
                    ` : ''}
                    ${review.admin_notes ? `
                        <div>
                            <label class="text-sm font-medium text-gray-700">Admin Notes:</label>
                            <p class="text-sm bg-yellow-50 p-3 rounded">${review.admin_notes}</p>
                        </div>
                    ` : ''}
                    <div class="flex space-x-2 mt-6">
                        <button class="btn-secondary flex-1" onclick="AdminReviewManager.closeModal('viewReviewModal')">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    static async approveReview(reviewId) {
        const manager = window.dashboard?.reviewManager;
        if (!manager) return;
        
        try {
            await apiClient.updateReview(reviewId, { 
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: JSON.parse(localStorage.getItem('currentUser')).id
            });
            
            manager.showNotification('Review approved successfully', 'success');
            await manager.loadReviews();
        } catch (error) {
            console.error('Error approving review:', error);
            manager.showNotification('Failed to approve review', 'error');
        }
    }

    static async rejectReview(reviewId) {
        const manager = window.dashboard?.reviewManager;
        if (!manager) return;
        
        const notes = prompt('Enter reason for rejection (optional):');
        
        try {
            await apiClient.updateReview(reviewId, { 
                status: 'rejected',
                admin_notes: notes || null
            });
            
            manager.showNotification('Review rejected successfully', 'success');
            await manager.loadReviews();
        } catch (error) {
            console.error('Error rejecting review:', error);
            manager.showNotification('Failed to reject review', 'error');
        }
    }

    static async flagReview(reviewId) {
        const manager = window.dashboard?.reviewManager;
        if (!manager) return;
        
        const reason = prompt('Enter reason for flagging this review:');
        if (!reason) return;
        
        try {
            await apiClient.updateReview(reviewId, { 
                status: 'flagged',
                admin_notes: reason
            });
            
            manager.showNotification('Review flagged successfully', 'success');
            await manager.loadReviews();
        } catch (error) {
            console.error('Error flagging review:', error);
            manager.showNotification('Failed to flag review', 'error');
        }
    }

    static async deleteReview(reviewId) {
        const manager = window.dashboard?.reviewManager;
        if (!manager) return;
        
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }
        
        try {
            await apiClient.deleteReview(reviewId);
            manager.showNotification('Review deleted successfully', 'success');
            await manager.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            manager.showNotification('Failed to delete review', 'error');
        }
    }

    static filterReviews(status) {
        const manager = window.dashboard?.reviewManager;
        if (!manager) return;
        
        manager.currentFilter = status;
        manager.updateReviewsTable();
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    showNotification(message, type) {
        if (window.dashboard) {
            window.dashboard.showNotification(message, type);
        }
    }
}

// Make AdminReviewManager globally available
window.AdminReviewManager = AdminReviewManager;

// Add the missing showCreateUserModal function
window.showCreateUserModal = function() {
    if (window.dashboard) {
        window.dashboard.showUserModal();
    }
};