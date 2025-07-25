// Admin Users Management Module
// Handles user CRUD operations, status management, and user table display

console.log('Admin Users module loaded successfully');

// Users management functionality for AdminDashboard
const AdminUsers = {
    // Update users table
    updateUsersTable() {
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;

        if (dashboard.data.users.length === 0) {
            tableBody.innerHTML = getEmptyTableRow('users', 6);
            return;
        }

        tableBody.innerHTML = dashboard.data.users.map(user => `
            <tr>
                <td class="font-medium">${user.name || 'N/A'}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${this.getStatusClass(user.status)}">${user.status || 'Active'}</span></td>
                <td class="text-sm text-gray-500">${new Date(user.created_at).toLocaleDateString()}</td>
                <td>${this.getUserActions(user)}</td>
            </tr>
        `).join('');
    },

    getStatusClass(status) {
        const isActive = status !== 'inactive' && status !== 'suspended';
        return isActive ? 'status-active' : 'status-inactive';
    },

    getUserActions(user) {
        const isActive = user.status !== 'inactive' && user.status !== 'suspended';
        return `
            <div class="flex space-x-2">
                <button class="btn-secondary text-sm" onclick="AdminUsers.viewUser('${user.id}')">View</button>
                <button class="btn-secondary text-sm" onclick="AdminUsers.editUser('${user.id}')">Edit</button>
                <button class="btn-${isActive ? 'danger' : 'primary'} text-sm" 
                        onclick="AdminUsers.toggleUserStatus('${user.id}', ${isActive})">
                    ${isActive ? 'Suspend' : 'Activate'}
                </button>
                <button class="btn-danger text-sm" onclick="AdminUsers.deleteUser('${user.id}')">Delete</button>
            </div>
        `;
    },

    // View user details
    async viewUser(userId) {
        const user = dashboard.data.users.find(u => u.id == userId);
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }

        const modal = createModal('userViewModal', 'User Details', `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <p class="mt-1 text-sm text-gray-900">${user.name || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${user.email}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Role</label>
                        <p class="mt-1 text-sm text-gray-900">${user.role}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <p class="mt-1 text-sm text-gray-900">${user.status || 'Active'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Phone</label>
                        <p class="mt-1 text-sm text-gray-900">${user.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Joined</label>
                        <p class="mt-1 text-sm text-gray-900">${new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button class="btn-secondary" onclick="this.closest('.fixed').remove()">Close</button>
                    <button class="btn-primary" onclick="AdminUsers.editUser('${user.id}'); this.closest('.fixed').remove();">Edit User</button>
                </div>
            </div>
        `);
    },

    // Edit user
    async editUser(userId) {
        const user = dashboard.data.users.find(u => u.id == userId);
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }

        const modal = createModal('userEditModal', 'Edit User', `
            <form id="editUserForm">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="editUserName">Name</label>
                        <input type="text" id="editUserName" value="${user.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserEmail">Email</label>
                        <input type="email" id="editUserEmail" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserRole">Role</label>
                        <select id="editUserRole" required>
                            <option value="farmer" ${user.role === 'farmer' ? 'selected' : ''}>Farmer</option>
                            <option value="consumer" ${user.role === 'consumer' ? 'selected' : ''}>Consumer</option>
                            <option value="retailer" ${user.role === 'retailer' ? 'selected' : ''}>Retailer</option>
                            <option value="logistics" ${user.role === 'logistics' ? 'selected' : ''}>Logistics</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editUserPhone">Phone</label>
                        <input type="tel" id="editUserPhone" value="${user.phone || ''}">
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Update User</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('editUserForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('editUserName').value,
                email: document.getElementById('editUserEmail').value,
                role: document.getElementById('editUserRole').value,
                phone: document.getElementById('editUserPhone').value
            };

            try {
                await apiClient.updateUser(userId, userData);
                showNotification('User updated successfully!', 'success');
                modal.remove();
                await dashboard.loadAllData();
            } catch (error) {
                console.error('Error updating user:', error);
                showNotification('Failed to update user: ' + error.message, 'error');
            }
        });
    },

    // Toggle user status
    async toggleUserStatus(userId, isCurrentlyActive) {
        const newStatus = isCurrentlyActive ? 'suspended' : 'active';
        const action = isCurrentlyActive ? 'suspend' : 'activate';
        
        if (!confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            await apiClient.updateUserStatus(userId, newStatus);
            showNotification(`User ${action}d successfully!`, 'success');
            await dashboard.loadAllData();
        } catch (error) {
            console.error('Error updating user status:', error);
            showNotification(`Failed to ${action} user: ` + error.message, 'error');
        }
    },

    // Delete user
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await apiClient.deleteUser(userId);
            showNotification('User deleted successfully!', 'success');
            await dashboard.loadAllData();
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Failed to delete user: ' + error.message, 'error');
        }
    },

    // Show user creation modal
    showUserModal() {
        const modal = createModal('createUserModal', 'Create New User', `
            <form id="createUserForm">
                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="newUserName">Name</label>
                        <input type="text" id="newUserName" required>
                    </div>
                    <div class="form-group">
                        <label for="newUserEmail">Email</label>
                        <input type="email" id="newUserEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="newUserRole">Role</label>
                        <select id="newUserRole" required>
                            <option value="">Select Role</option>
                            <option value="farmer">Farmer</option>
                            <option value="consumer">Consumer</option>
                            <option value="retailer">Retailer</option>
                            <option value="logistics">Logistics</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="newUserPhone">Phone</label>
                        <input type="tel" id="newUserPhone">
                    </div>
                    <div class="form-group col-span-2">
                        <label for="newUserPassword">Password</label>
                        <input type="password" id="newUserPassword" required>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                    <button type="button" class="btn-secondary" onclick="this.closest('.fixed').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Create User</button>
                </div>
            </form>
        `);

        // Add form submit handler
        const form = document.getElementById('createUserForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                name: document.getElementById('newUserName').value,
                email: document.getElementById('newUserEmail').value,
                role: document.getElementById('newUserRole').value,
                phone: document.getElementById('newUserPhone').value,
                password: document.getElementById('newUserPassword').value,
                password_confirmation: document.getElementById('newUserPassword').value
            };

            try {
                await apiClient.register(userData);
                showNotification('User created successfully!', 'success');
                modal.remove();
                await dashboard.loadAllData();
            } catch (error) {
                console.error('Error creating user:', error);
                showNotification('Failed to create user: ' + error.message, 'error');
            }
        });
    }
};

// Extend AdminDashboard prototype
if (typeof window !== 'undefined' && window.AdminDashboard) {
    Object.assign(window.AdminDashboard.prototype, {
        updateUsersTable: AdminUsers.updateUsersTable,
        showUserModal: AdminUsers.showUserModal
    });
    
    // Make AdminUsers methods globally available
    window.AdminUsers = AdminUsers;
    window.viewUser = AdminUsers.viewUser;
    window.editUser = AdminUsers.editUser;
    window.toggleUserStatus = AdminUsers.toggleUserStatus;
    window.deleteUser = AdminUsers.deleteUser;
}

console.log('Admin Users module setup complete');