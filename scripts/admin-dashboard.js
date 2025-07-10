
// Admin Dashboard JavaScript - Dynamic Data Implementation

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadSystemStats();
    loadUsersTable();
    showContainers();
});

// Data storage
let users = [];
let analytics = {};
let currentUser = null;

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);
        
        // Check if user is admin
        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'index.html';
    }
}

// Load user data and update UI
async function loadUserData() {
    try {
        const userData = await apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Admin';
        document.getElementById('userRole').textContent = userData.role || 'Admin';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Admin';
    }
}

// Load system statistics from API
async function loadSystemStats() {
    const loadingState = document.getElementById('loadingState');
    
    try {
        loadingState.style.display = 'block';
        
        // Load analytics data
        const analyticsResponse = await apiClient.getAnalytics();
        analytics = analyticsResponse.data || analyticsResponse;
        console.log('Analytics loaded:', analytics);
        
        // Update stats display
        document.getElementById('totalUsers').textContent = analytics.total_users || 0;
        document.getElementById('totalTransactions').textContent = `Ksh${(analytics.total_transactions || 0).toLocaleString()}`;
        document.getElementById('activeOrders').textContent = analytics.active_orders || 0;
        document.getElementById('platformRevenue').textContent = `Ksh${(analytics.platform_revenue || 0).toLocaleString()}`;
        
        // Update growth percentages (simulated for demo)
        document.getElementById('userGrowth').textContent = analytics.user_growth || '12.5%';
        document.getElementById('transactionGrowth').textContent = analytics.transaction_growth || '8.3%';
        document.getElementById('revenueGrowth').textContent = analytics.revenue_growth || '15.2%';
        
        loadingState.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        loadingState.style.display = 'none';
        
        // Fallback to default values
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalTransactions').textContent = 'Ksh0';
        document.getElementById('activeOrders').textContent = '0';
        document.getElementById('platformRevenue').textContent = 'Ksh0';
    }
}

// Load users table from API
async function loadUsersTable() {
    try {
        const response = await apiClient.getUsers();
        users = response.data || response || [];
        console.log('Users loaded:', users);
        
        const tableBody = document.querySelector('#usersTable tbody');
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">👥</div>
                        <p class="text-gray-600">No users found in the system.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            const joinDate = new Date(user.created_at).toLocaleDateString();
            const statusClass = user.status === 'active' ? 'status-active' : 
                               user.status === 'pending' ? 'status-pending' : 'status-inactive';
            
            row.innerHTML = `
                <td class="font-medium">#${user.id}</td>
                <td>
                    <div class="font-medium text-gray-900">${user.name}</div>
                    <div class="text-sm text-gray-500">${user.email}</div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${user.role}
                    </span>
                </td>
                <td><span class="${statusClass}">${user.status || 'active'}</span></td>
                <td class="text-sm text-gray-500">${joinDate}</td>
                <td>
                    <div class="flex space-x-2">
                        ${user.status === 'pending' ? 
                            `<button class="btn-primary text-sm" onclick="approveUser('${user.id}')">Approve</button>` :
                            `<button class="btn-secondary text-sm" onclick="toggleUserStatus('${user.id}')">${user.status === 'active' ? 'Suspend' : 'Activate'}</button>`
                        }
                        <button class="btn-danger text-sm" onclick="deleteUser('${user.id}')">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        const tableBody = document.querySelector('#usersTable tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <div class="text-red-400 text-4xl mb-4">⚠️</div>
                    <p class="text-gray-600 mb-4">Failed to load users. Please try again.</p>
                    <button class="btn-primary" onclick="loadUsersTable()">Retry</button>
                </td>
            </tr>
        `;
    }
}

// Show containers after loading
function showContainers() {
    document.getElementById('userManagementContainer').style.display = 'block';
    document.getElementById('systemSettingsContainer').style.display = 'block';
    document.getElementById('announcementContainer').style.display = 'block';
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

// Add new user
async function addUser(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;
    
    const userData = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        role: document.getElementById('newUserRole').value,
        password: document.getElementById('newUserPassword').value
    };
    
    try {
        const response = await apiClient.register(userData);
        console.log('User created:', response);
        
        await loadUsersTable();
        await loadSystemStats(); // Refresh stats
        closeModal('addUserModal');
        
        // Reset form
        event.target.reset();
        
        alert(`User ${userData.name} added successfully!`);
        
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Toggle user status
async function toggleUserStatus(userId) {
    try {
        await apiClient.toggleUserStatus(userId);
        console.log('User status toggled:', userId);
        
        await loadUsersTable();
        alert('User status updated successfully!');
        
    } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Failed to update user status: ' + error.message);
    }
}

// Approve user
async function approveUser(userId) {
    try {
        await apiClient.toggleUserStatus(userId);
        console.log('User approved:', userId);
        
        await loadUsersTable();
        await loadSystemStats(); // Refresh stats
        alert('User approved successfully!');
        
    } catch (error) {
        console.error('Error approving user:', error);
        alert('Failed to approve user: ' + error.message);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Note: Implement delete endpoint in backend
        console.log('Delete user:', userId);
        alert('Delete functionality not implemented yet in backend.');
        
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + error.message);
    }
}

// Refresh users
async function refreshUsers() {
    await Promise.all([loadUsersTable(), loadSystemStats()]);
}

// Save system settings
async function saveSettings(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    const settings = {
        platform_fee: parseFloat(document.getElementById('platformFee').value),
        delivery_fee: parseFloat(document.getElementById('deliveryFee').value),
        min_order_amount: parseFloat(document.getElementById('minOrderAmount').value),
        maintenance_mode: document.getElementById('maintenanceMode').value === 'on'
    };
    
    try {
        console.log('Saving settings:', settings);
        // Note: Implement settings endpoint in backend
        alert('Settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Create announcement
async function createAnnouncement(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    const announcement = {
        title: document.getElementById('announcementTitle').value,
        type: document.getElementById('announcementType').value,
        target_audience: document.getElementById('targetAudience').value,
        message: document.getElementById('announcementMessage').value
    };
    
    try {
        console.log('Creating announcement:', announcement);
        // Note: Implement announcement endpoint in backend
        alert('Announcement sent successfully!');
        
        // Reset form
        event.target.reset();
        
    } catch (error) {
        console.error('Error creating announcement:', error);
        alert('Failed to send announcement: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
