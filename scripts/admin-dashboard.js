// Admin Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadSystemStats();
    loadUsersTable();
    loadPromotions();
    
    // Load API configuration
    const script = document.createElement('script');
    script.src = 'scripts/config.js';
    document.head.appendChild(script);
});

// Users data from API
let users = [];
let promotions = [];

// Load system statistics from API
async function loadSystemStats() {
    try {
        const analytics = await apiClient.getAnalytics();
        console.log('Analytics loaded:', analytics);
        
        document.getElementById('totalUsers').textContent = analytics.total_users || 0;
        document.getElementById('totalTransactions').textContent = `Ksh${analytics.total_transactions || 0}`;
        document.getElementById('activeOrders').textContent = analytics.active_orders || 0;
        document.getElementById('platformRevenue').textContent = `Ksh${analytics.platform_revenue || 0}`;
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Fallback to default values
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalTransactions').textContent = 'Ksh0';
        document.getElementById('activeOrders').textContent = '0';
        document.getElementById('platformRevenue').textContent = 'Ksh0';
    }
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

// Add new user
async function addUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;
    
    try {
        const userData = {
            name: name,
            email: email,
            role: role,
            password: password
        };
        
        const response = await apiClient.register(userData);
        console.log('User created:', response);
        
        await loadUsersTable();
        closeModal('addUserModal');
        
        // Reset form
        document.querySelector('#addUserModal form').reset();
        
        alert(`User ${name} added successfully!`);
        
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user: ' + error.message);
    }
}

// Load users table from API
async function loadUsersTable() {
    try {
        const response = await apiClient.getUsers();
        users = response.data || response;
        console.log('Users loaded:', users);
        
        const tableBody = document.querySelector('#usersTable tbody');
        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.setAttribute('data-user-id', user.id);
            row.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status-${user.status}">${user.status}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary" onclick="toggleUserStatus('${user.id}')">${user.status === 'active' ? 'Suspend' : 'Activate'}</button>
                    <button class="btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users: ' + error.message);
    }
}

// Load promotions from API
async function loadPromotions() {
    try {
        const response = await apiClient.getPromotions();
        promotions = response.data || response;
        console.log('Promotions loaded:', promotions);
        
        const promotionsContainer = document.getElementById('promotionsList') || createPromotionsContainer();
        promotionsContainer.innerHTML = '';
        
        if (promotions.length === 0) {
            promotionsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No active promotions</p>';
            return;
        }
        
        promotions.forEach(promotion => {
            const promotionCard = document.createElement('div');
            promotionCard.className = 'promotion-card';
            promotionCard.style.cssText = 'background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
            promotionCard.innerHTML = `
                <h4>${promotion.title}</h4>
                <p>${promotion.description}</p>
                <p><strong>Start:</strong> ${new Date(promotion.start_date).toLocaleDateString()}</p>
                <p><strong>End:</strong> ${new Date(promotion.end_date).toLocaleDateString()}</p>
                <button class="btn-danger" onclick="deletePromotion(${promotion.id})">Delete</button>
            `;
            promotionsContainer.appendChild(promotionCard);
        });
        
    } catch (error) {
        console.error('Error loading promotions:', error);
    }
}

// Create promotions container if it doesn't exist
function createPromotionsContainer() {
    const container = document.createElement('div');
    container.id = 'promotionsList';
    container.style.cssText = 'margin-top: 20px;';
    
    // Find a good place to insert it (after system settings or create a section)
    const settingsSection = document.querySelector('form[onsubmit="saveSettings()"]')?.parentElement;
    if (settingsSection) {
        const promotionsSection = document.createElement('div');
        promotionsSection.innerHTML = '<h3>Active Promotions</h3>';
        promotionsSection.appendChild(container);
        settingsSection.parentNode.insertBefore(promotionsSection, settingsSection.nextSibling);
    }
    
    return container;
}

// Create promotion
async function createPromotion(event) {
    event.preventDefault();
    
    const title = document.getElementById('promotionTitle')?.value;
    const description = document.getElementById('promotionDescription')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    
    if (!title || !description || !startDate || !endDate) {
        alert('Please fill in all promotion fields');
        return;
    }
    
    try {
        const promotionData = {
            title: title,
            description: description,
            start_date: startDate,
            end_date: endDate
        };
        
        const response = await apiClient.createPromotion(promotionData);
        console.log('Promotion created:', response);
        
        await loadPromotions();
        alert('Promotion created successfully!');
        
        // Reset form if it exists
        event.target.reset();
        
    } catch (error) {
        console.error('Error creating promotion:', error);
        alert('Failed to create promotion: ' + error.message);
    }
}

// Delete promotion
async function deletePromotion(promotionId) {
    if (confirm('Are you sure you want to delete this promotion?')) {
        try {
            await apiClient.deletePromotion(promotionId);
            console.log('Promotion deleted:', promotionId);
            
            await loadPromotions();
            alert('Promotion deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting promotion:', error);
            alert('Failed to delete promotion: ' + error.message);
        }
    }
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        // Pre-fill form with user data
        document.getElementById('newUserName').value = user.name;
        document.getElementById('newUserEmail').value = user.email;
        document.getElementById('newUserRole').value = user.role;
        
        showAddUserModal();
        
        // Change form submission to update instead of add
        const form = document.querySelector('#addUserModal form');
        form.onsubmit = function(event) {
            event.preventDefault();
            updateUser(userId);
        };
    }
}

// Update user
function updateUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.name = document.getElementById('newUserName').value;
        user.email = document.getElementById('newUserEmail').value;
        user.role = document.getElementById('newUserRole').value;
        
        loadUsersTable();
        closeModal('addUserModal');
        
        // Reset form submission back to add
        const form = document.querySelector('#addUserModal form');
        form.onsubmit = addUser;
        
        alert('User updated successfully!');
    }
}

// Toggle user status (activate/suspend)
async function toggleUserStatus(userId) {
    try {
        const response = await apiClient.toggleUserStatus(userId);
        console.log('User status toggled:', response);
        
        await loadUsersTable();
        alert('User status updated successfully!');
        
    } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Failed to update user status: ' + error.message);
    }
}

// Delete user (note: this would typically be a soft delete in production)
async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
            // Note: Implement deleteUser endpoint in backend if needed
            console.log('Delete user:', userId);
            alert('Delete user functionality not implemented in backend yet.');
            
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user: ' + error.message);
        }
    }
}

// Export users
function exportUsers() {
    if (users.length === 0) {
        alert('No users to export');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Email,Role,Status,Join Date\n"
        + users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.status},${new Date(u.created_at).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// View all transactions
function viewAllTransactions() {
    alert('Opening detailed transaction view...\n\nIn a real application, this would navigate to a comprehensive transaction management page.');
}

// Create announcement
function createAnnouncement(event) {
    event.preventDefault();
    
    const title = document.getElementById('announcementTitle').value;
    const type = document.getElementById('announcementType').value;
    const audience = document.getElementById('targetAudience').value;
    const message = document.getElementById('announcementMessage').value;
    
    const announcement = {
        id: 'ANN' + Date.now(),
        title: title,
        type: type,
        audience: audience,
        message: message,
        createdDate: new Date().toISOString(),
        createdBy: 'Admin'
    };
    
    // Save announcement (in real app, this would go to backend)
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    announcements.push(announcement);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    alert('Announcement sent successfully!');
    
    // Reset form
    event.target.reset();
}

// Save system settings
function saveSettings() {
    const settings = {
        platformFee: document.getElementById('platformFee').value,
        deliveryFee: document.getElementById('deliveryFee').value,
        minOrderAmount: document.getElementById('minOrderAmount').value,
        maintenanceMode: document.getElementById('maintenanceMode').value
    };
    
    // Save settings (in real app, this would go to backend)
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    
    alert('System settings saved successfully!');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Load settings on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedSettings = JSON.parse(localStorage.getItem('systemSettings'));
    if (savedSettings) {
        document.getElementById('platformFee').value = savedSettings.platformFee || 5;
        document.getElementById('deliveryFee').value = savedSettings.deliveryFee || 50;
        document.getElementById('minOrderAmount').value = savedSettings.minOrderAmount || 100;
        document.getElementById('maintenanceMode').value = savedSettings.maintenanceMode || 'off';
    }
});