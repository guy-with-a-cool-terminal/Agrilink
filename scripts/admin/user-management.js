
// Admin User Management Module
class UserManagement {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.users = [];
    }

    // Load users from API
    async loadUsers() {
        try {
            const response = await this.apiClient.getUsers();
            this.users = this.apiClient.extractArrayData(response);
            console.log('Users loaded:', this.users);
            
            this.displayUsersTable();
            
        } catch (error) {
            console.error('Error loading users:', error);
            this.showUsersError();
        }
    }

    // Display users in table with enhanced actions
    displayUsersTable() {
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">👥</div>
                    <p class="text-gray-600 mb-4">No users found.</p>
                    <button class="btn-primary" onclick="userManager.showCreateUserModal()">Create First User</button>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            const joinDate = new Date(user.created_at).toLocaleDateString();
            const isActive = user.status !== 'inactive' && user.status !== 'suspended';
            
            row.innerHTML = `
                <td class="font-medium">${user.name || 'N/A'}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${user.role}</span>
                </td>
                <td>
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="text-sm text-gray-500">${joinDate}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="userManager.viewUserDetails('${user.id}')">
                            View
                        </button>
                        <button class="btn-secondary text-sm" onclick="userManager.editUser('${user.id}')">
                            Edit
                        </button>
                        <button class="btn-${isActive ? 'danger' : 'primary'} text-sm" 
                                onclick="userManager.toggleUserStatus('${user.id}', ${isActive})">
                            ${isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <button class="btn-danger text-sm" onclick="userManager.deleteUser('${user.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Show create user modal
    showCreateUserModal() {
        const modalHtml = `
            <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Create New User</h3>
                    <form id="createUserForm">
                        <div class="form-group mb-4">
                            <label for="userName">Name</label>
                            <input type="text" id="newUserName" required class="w-full p-2 border rounded">
                        </div>
                        <div class="form-group mb-4">
                            <label for="userEmail">Email</label>
                            <input type="email" id="newUserEmail" required class="w-full p-2 border rounded">
                        </div>
                        <div class="form-group mb-4">
                            <label for="userRole">Role</label>
                            <select id="newUserRole" required class="w-full p-2 border rounded">
                                <option value="">Select Role</option>
                                <option value="farmer">Farmer</option>
                                <option value="consumer">Consumer</option>
                                <option value="retailer">Retailer</option>
                                <option value="logistics">Logistics</option>
                            </select>
                        </div>
                        <div class="form-group mb-4">
                            <label for="userPhone">Phone</label>
                            <input type="tel" id="newUserPhone" class="w-full p-2 border rounded">
                        </div>
                        <div class="flex space-x-2">
                            <button type="submit" class="btn-primary flex-1">Create User</button>
                            <button type="button" onclick="userManager.closeUserModal()" class="btn-secondary flex-1">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('newUserName').value,
                email: document.getElementById('newUserEmail').value,
                role: document.getElementById('newUserRole').value,
                phone: document.getElementById('newUserPhone').value,
                password: 'DefaultPassword123!',
                password_confirmation: 'DefaultPassword123!',
                status: 'active'
            };
            
            try {
                console.log('Sending userData:', userData);
                await this.apiClient.createUser(userData);
                this.showNotification('User created successfully!', 'success');
                this.closeUserModal();
                await this.loadUsers();
                if (window.analytics) await window.analytics.loadRealTimeAnalytics();
            } catch (error) {
                console.error('Error creating user:', error);
                this.showNotification('Failed to create user: ' + error.message, 'error');
            }
        });
    }

    // Edit user modal
    editUser(userId) {
        const user = this.users.find(u => u.id == userId);
        if (!user) {
            this.showNotification('User not found', 'error');
            return;
        }
        
        const modalHtml = `
            <div id="userModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Edit User</h3>
                    <form id="editUserForm">
                        <div class="form-group mb-4">
                            <label for="userName">Name</label>
                            <input type="text" id="userName" required class="w-full p-2 border rounded" value="${user.name || ''}">
                        </div>
                        <div class="form-group mb-4">
                            <label for="userEmail">Email</label>
                            <input type="email" id="userEmail" required class="w-full p-2 border rounded" value="${user.email}">
                        </div>
                        <div class="form-group mb-4">
                            <label for="userRole">Role</label>
                            <select id="userRole" required class="w-full p-2 border rounded">
                                <option value="farmer" ${user.role === 'farmer' ? 'selected' : ''}>Farmer</option>
                                <option value="consumer" ${user.role === 'consumer' ? 'selected' : ''}>Consumer</option>
                                <option value="retailer" ${user.role === 'retailer' ? 'selected' : ''}>Retailer</option>
                                <option value="logistics" ${user.role === 'logistics' ? 'selected' : ''}>Logistics</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="form-group mb-4">
                            <label for="userPhone">Phone</label>
                            <input type="tel" id="userPhone" class="w-full p-2 border rounded" value="${user.phone || ''}">
                        </div>
                        <div class="form-group mb-4">
                            <label for="userStatus">Status</label>
                            <select id="userStatus" required class="w-full p-2 border rounded">
                                <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            </select>
                        </div>
                        <div class="flex space-x-2">
                            <button type="submit" class="btn-primary flex-1">Update User</button>
                            <button type="button" onclick="userManager.closeUserModal()" class="btn-secondary flex-1">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                role: document.getElementById('userRole').value,
                phone: document.getElementById('userPhone').value,
                status: document.getElementById('userStatus').value
            };
            
            try {
                await this.apiClient.updateUser(userId, userData);
                this.showNotification('User updated successfully!', 'success');
                this.closeUserModal();
                await this.loadUsers();
            } catch (error) {
                console.error('Error updating user:', error);
                this.showNotification('Failed to update user: ' + error.message, 'error');
            }
        });
    }

    // Close user modal
    closeUserModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.remove();
        }
    }

    // View user details
    viewUserDetails(userId) {
        const user = this.users.find(u => u.id == userId);
        if (user) {
            const orders = window.orderManager ? window.orderManager.orders : [];
            const userOrders = orders.filter(o => o.user_id == userId);
            const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
            
            alert(`User Details:
            
Name: ${user.name || 'N/A'}
Email: ${user.email}
Role: ${user.role}
Status: ${user.status || 'Active'}
Joined: ${new Date(user.created_at).toLocaleDateString()}
Total Orders: ${userOrders.length}
Total Spent: Ksh${totalSpent.toLocaleString()}
Phone: ${user.phone || 'N/A'}
Location: ${user.location || 'N/A'}`);
        }
    }

    // Toggle user status with proper API integration
    async toggleUserStatus(userId, isCurrentlyActive) {
        const action = isCurrentlyActive ? 'suspend' : 'activate';
        const newStatus = isCurrentlyActive ? 'suspended' : 'active';
        
        if (!confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }
        
        try {
            await this.apiClient.updateUserStatus(userId, newStatus);
            this.showNotification(`User ${action}d successfully.`, 'success');
            await this.loadUsers();
            if (window.analytics) await window.analytics.loadRealTimeAnalytics();
        } catch (error) {
            console.error('Error toggling user status:', error);
            this.showNotification('Failed to update user status: ' + error.message, 'error');
        }
    }

    // Delete user with confirmation
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            await this.apiClient.deleteUser(userId);
            this.showNotification('User deleted successfully.', 'success');
            await this.loadUsers();
            if (window.analytics) await window.analytics.loadRealTimeAnalytics();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Failed to delete user: ' + error.message, 'error');
        }
    }

    // Display error message when loading users fails
    showUsersError() {
        const tableBody = document.querySelector('#usersTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="text-red-400 text-4xl mb-4">⚠️</div>
                        <p class="text-gray-600 mb-4">Failed to load users. Please try again.</p>
                        <button class="btn-primary" onclick="userManager.loadUsers()">Retry</button>
                    </td>
                </tr>
            `;
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Export for use in other modules
window.UserManagement = UserManagement;
