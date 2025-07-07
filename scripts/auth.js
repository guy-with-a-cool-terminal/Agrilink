
// Authentication and Navigation Logic

// Show/Hide forms
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    
    // Store user info (in real app, this would be handled by backend)
    const userData = {
        email: email,
        role: role,
        name: 'User', // This would come from backend
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Redirect based on role
    redirectToDashboard(role);
}

// Handle Registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    // Store user info (in real app, this would be handled by backend)
    const userData = {
        name: name,
        email: email,
        phone: phone,
        role: role,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    alert('Registration successful! Redirecting to dashboard...');
    
    // Redirect based on role
    redirectToDashboard(role);
}

// Redirect to appropriate dashboard
function redirectToDashboard(role) {
    const dashboardMap = {
        'farmer': 'farmer-dashboard.html',
        'consumer': 'consumer-dashboard.html',
        'retailer': 'retailer-dashboard.html',
        'logistics': 'logistics-dashboard.html',
        'admin': 'admin-dashboard.html'
    };
    
    const dashboardUrl = dashboardMap[role];
    if (dashboardUrl) {
        window.location.href = dashboardUrl;
    } else {
        alert('Invalid role selected');
    }
}

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(user);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize dashboard (call this on dashboard pages)
function initDashboard() {
    const user = checkAuth();
    if (user) {
        // Update user info in header
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) userNameElement.textContent = user.name || user.email;
        if (userRoleElement) userRoleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // If we're on a dashboard page, initialize it
    if (window.location.pathname.includes('dashboard')) {
        initDashboard();
    }
    
    // Add event listeners for login/register tabs and forms if they exist
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    if (loginTab) {
        loginTab.addEventListener('click', showLogin);
    }
    if (registerTab) {
        registerTab.addEventListener('click', showRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});
