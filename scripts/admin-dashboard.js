
// Admin Dashboard JavaScript

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    loadSystemStats();
});

// Sample users data
let users = [
    {
        id: 'U001',
        name: 'John Farmer',
        email: 'john@farm.com',
        role: 'farmer',
        status: 'active',
        joinDate: '2024-01-01'
    },
    {
        id: 'U002',
        name: 'Jane Consumer',
        email: 'jane@email.com',
        role: 'consumer',
        status: 'pending',
        joinDate: '2024-01-05'
    }
];

// Load system statistics
function loadSystemStats() {
    // In a real app, these would come from backend API
    document.getElementById('totalUsers').textContent = users.length + 1246; // Adding base count
    document.getElementById('totalTransactions').textContent = '₹2,45,680';
    document.getElementById('activeOrders').textContent = '67';
    document.getElementById('platformRevenue').textContent = '₹12,284';
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

// Add new user
function addUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;
    const password = document.getElementById('newUserPassword').value;
    
    const newUser = {
        id: 'U' + (users.length + 1).toString().padStart(3, '0'),
        name: name,
        email: email,
        role: role,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    loadUsersTable();
    closeModal('addUserModal');
    
    // Reset form
    document.querySelector('#addUserModal form').reset();
    
    alert(`User ${name} added successfully!`);
}

// Load users table
function loadUsersTable() {
    const tableBody = document.querySelector('#usersTable tbody');
    // Clear existing rows except sample data
    
    users.forEach(user => {
        const existingRow = document.querySelector(`tr[data-user-id="${user.id}"]`);
        if (!existingRow) {
            const row = document.createElement('tr');
            row.setAttribute('data-user-id', user.id);
            row.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status-${user.status}">${user.status}</span></td>
                <td>${user.joinDate}</td>
                <td>
                    ${user.status === 'pending' ? 
                        `<button class="btn-primary" onclick="approveUser('${user.id}')">Approve</button>` :
                        `<button class="btn-secondary" onclick="editUser('${user.id}')">Edit</button>`
                    }
                    <button class="btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                    ${user.status === 'active' ? 
                        `<button class="btn-secondary" onclick="suspendUser('${user.id}')">Suspend</button>` : ''
                    }
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
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

// Approve user
function approveUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = 'active';
        loadUsersTable();
        alert(`User ${user.name} approved successfully!`);
    }
}

// Suspend user
function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        const user = users.find(u => u.id === userId);
        if (user) {
            user.status = 'suspended';
            loadUsersTable();
            alert(`User ${user.name} suspended successfully!`);
        }
    }
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        users = users.filter(u => u.id !== userId);
        loadUsersTable();
        alert('User deleted successfully!');
    }
}

// Export users
function exportUsers() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Name,Email,Role,Status,Join Date\n"
        + users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.status},${u.joinDate}`).join("\n");
    
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
    
    loadUsersTable();
});
