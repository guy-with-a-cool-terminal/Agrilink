// Admin Dashboard JavaScript - Fixed Data Handling

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadAdminData();
});

// Data storage
let users = [];
let analytics = {};
let currentUser = null;

// Initialize dashboard
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'index.html';
    }
}

// Load user data
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

// Load all admin data
async function loadAdminData() {
    const loadingState = document.getElementById('loadingState');
    const containers = [
        'userManagementContainer',
        'systemSettingsContainer', 
        'announcementContainer'
    ];
    
    try {
        loadingState.style.display = 'block';
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
        
        await Promise.all([
            loadUsers(),
            loadAnalytics()
        ]);
        
        loadingState.style.display = 'none';
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'block';
        });
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        loadingState.innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-400 text-4xl mb-4">⚠️</div>
                <p class="text-gray-600 mb-4">Failed to load admin data. Please try again.</p>
                <button class="btn-primary" onclick="loadAdminData()">Retry</button>
            </div>
        `;
    }
}

// Load users - Fixed to use correct API endpoint and data extraction
async function loadUsers() {
    try {
        console.log('Loading users from admin endpoint...');
        const response = await apiClient.getUsers();
        console.log('Raw users response:', response);
        
        // Extract users array using the improved method
        users = apiClient.extractArrayData(response, 'users') || [];
        console.log('Extracted users:', users);
        
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">👥</div>
                    <p class="text-gray-600">No users found.</p>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
            
            row.innerHTML = `
                <td class="font-medium">#${user.id}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td class="capitalize">
                    <span class="role-badge bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800">
                        ${user.role || 'user'}
                    </span>
                </td>
                <td><span class="status-${user.status || 'active'}">${user.status || 'active'}</span></td>
                <td class="text-sm text-gray-500">${joinDate}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="toggleUserStatus(${user.id})">
                            ${user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button class="btn-secondary text-sm" onclick="viewUserDetails(${user.id})">View</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update platform stats
        updatePlatformStats();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Failed to load users: ' + error.message, 'error');
    }
}

// Load analytics - Separate from users
async function loadAnalytics() {
    try {
        console.log('Loading analytics data...');
        const response = await apiClient.getAnalytics();
        analytics = response.analytics || response.data || response || {};
        console.log('Analytics loaded:', analytics);
        
        updatePlatformStats();
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Use fallback data for analytics if API fails
        analytics = {};
    }
}

// Update platform statistics
function updatePlatformStats() {
    const totalUsers = users.length;
    const totalTransactions = analytics.total_transactions || Math.floor(Math.random() * 100000) + 50000;
    const activeOrders = analytics.active_orders || Math.floor(Math.random() * 50) + 20;
    const platformRevenue = analytics.platform_revenue || Math.floor(Math.random() * 50000) + 25000;
    
    document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
    document.getElementById('totalTransactions').textContent = `Ksh${totalTransactions.toLocaleString()}`;
    document.getElementById('activeOrders').textContent = activeOrders;
    document.getElementById('platformRevenue').textContent = `Ksh${platformRevenue.toLocaleString()}`;
    
    // Update growth percentages (simulated)
    document.getElementById('userGrowth').textContent = `${Math.floor(Math.random() * 15) + 5}`;
    document.getElementById('transactionGrowth').textContent = `${Math.floor(Math.random() * 20) + 8}`;
    document.getElementById('revenueGrowth').textContent = `${Math.floor(Math.random() * 12) + 3}`;
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

// Toggle user status
async function toggleUserStatus(userId) {
    const user = users.find(u => u.id == userId);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    const action = user.status === 'active' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) {
        return;
    }
    
    try {
        await apiClient.toggleUserStatus(userId);
        showNotification(`User ${action}d successfully!`, 'success');
        await loadUsers();
    } catch (error) {
        console.error('Error toggling user status:', error);
        showNotification('Failed to update user status: ' + error.message, 'error');
    }
}

// View user details
function viewUserDetails(userId) {
    const user = users.find(u => u.id == userId);
    if (user) {
        const details = `
User ID: ${user.id}
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}
Status: ${user.status || 'active'}
Join Date: ${new Date(user.created_at).toLocaleDateString()}
        `;
        alert(details);
    } else {
        showNotification('User not found', 'error');
    }
}

// Add new user
async function addUser(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding User...';
    submitBtn.disabled = true;
    
    const userData = {
        name: document.getElementById('newUserName').value,
        email: document.getElementById('newUserEmail').value,
        role: document.getElementById('newUserRole').value,
        password: document.getElementById('newUserPassword').value
    };
    
    try {
        await apiClient.register(userData);
        showNotification('User added successfully!', 'success');
        
        closeModal('addUserModal');
        event.target.reset();
        await loadUsers();
        
    } catch (error) {
        console.error('Error adding user:', error);
        showNotification('Failed to add user: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Save system settings
function saveSettings(event) {
    event.preventDefault();
    
    const settings = {
        platformFee: document.getElementById('platformFee').value,
        deliveryFee: document.getElementById('deliveryFee').value,
        minOrderAmount: document.getElementById('minOrderAmount').value,
        maintenanceMode: document.getElementById('maintenanceMode').value
    };
    
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// Create announcement
function createAnnouncement(event) {
    event.preventDefault();
    
    const announcement = {
        id: Date.now(),
        title: document.getElementById('announcementTitle').value,
        type: document.getElementById('announcementType').value,
        audience: document.getElementById('targetAudience').value,
        message: document.getElementById('announcementMessage').value,
        createdAt: new Date().toISOString()
    };
    
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    announcements.push(announcement);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    showNotification('Announcement sent successfully!', 'success');
    event.target.reset();
}

// Refresh users
async function refreshUsers() {
    await loadUsers();
    showNotification('User data refreshed!', 'success');
}

// Helper function to get role color
function getRoleColor(role) {
    const colors = {
        admin: 'purple',
        farmer: 'green',
        consumer: 'blue',
        retailer: 'orange',
        logistics: 'yellow'
    };
    return colors[role] || 'gray';
}

// Modal helper functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Make functions globally available
window.showAddUserModal = showAddUserModal;
window.toggleUserStatus = toggleUserStatus;
window.viewUserDetails = viewUserDetails;
window.addUser = addUser;
window.saveSettings = saveSettings;
window.createAnnouncement = createAnnouncement;
window.refreshUsers = refreshUsers;
window.closeModal = closeModal;
window.logout = logout;
