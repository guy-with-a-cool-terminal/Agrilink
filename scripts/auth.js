
// Authentication and Navigation Logic for AgriLink Platform

console.log('Auth script loaded successfully');

// Load API configuration
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.src = 'scripts/config.js';
    document.head.appendChild(script);
});

// Show/Hide forms
function showLogin() {
    console.log('Switching to login form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    
    if (loginForm) loginForm.classList.add('active');
    if (registerForm) registerForm.classList.remove('active');
    if (loginTab) loginTab.classList.add('active');
    if (registerTab) registerTab.classList.remove('active');
}

function showRegister() {
    console.log('Switching to register form');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const registerTab = document.getElementById('registerTab');
    const loginTab = document.getElementById('loginTab');
    
    if (registerForm) registerForm.classList.add('active');
    if (loginForm) loginForm.classList.remove('active');
    if (registerTab) registerTab.classList.add('active');
    if (loginTab) loginTab.classList.remove('active');
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    console.log('Login form submitted');
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const role = document.getElementById('loginRole')?.value;
    
    console.log('Login details:', { email, role });
    
    // Basic validation
    if (!email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Call API
        const response = await apiClient.login({
            email: email,
            password: password,
            role: role
        });
        
        console.log('Login successful:', response);
        
        // Store user info with token
        const userData = {
            ...response.user,
            token: response.token,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('User data stored successfully:', userData);
        
        // Redirect based on role
        redirectToDashboard(userData.role);
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
        
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Registration
async function handleRegister(event) {
    event.preventDefault();
    console.log('Register form submitted');
    
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const phone = document.getElementById('registerPhone')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const role = document.getElementById('registerRole')?.value;
    
    console.log('Registration details:', { name, email, role });
    
    // Basic validation
    if (!name || !email || !phone || !password || !role) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        // Call API
        const response = await apiClient.register({
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: role
        });
        
        console.log('Registration successful:', response);
        
        // Store user info with token
        const userData = {
            ...response.user,
            token: response.token,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('User registered and data stored successfully:', userData);
        
        alert('Registration successful! Redirecting to dashboard...');
        
        // Redirect based on role
        redirectToDashboard(userData.role);
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
        
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Redirect to appropriate dashboard
function redirectToDashboard(role) {
    console.log('Redirecting user with role:', role);
    
    const dashboardMap = {
        'farmer': 'farmer-dashboard.html',
        'consumer': 'consumer-dashboard.html',
        'retailer': 'retailer-dashboard.html',
        'logistics': 'logistics-dashboard.html',
        'admin': 'admin-dashboard.html'
    };
    
    const dashboardUrl = dashboardMap[role];
    console.log('Dashboard URL:', dashboardUrl);
    
    if (dashboardUrl) {
        console.log('Redirecting to:', dashboardUrl);
        // Add a small delay to ensure localStorage is saved
        setTimeout(() => {
            window.location.href = dashboardUrl;
        }, 100);
    } else {
        alert('Invalid role selected: ' + role);
        console.error('Invalid role:', role);
    }
}

// Check if user is logged in
function checkAuth() {
    try {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            console.log('No user found, redirecting to login');
            window.location.href = 'index.html';
            return null;
        }
        console.log('User authenticated:', JSON.parse(user));
        return JSON.parse(user);
    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = 'index.html';
        return null;
    }
}

// Logout function
async function logout() {
    console.log('Logging out user');
    try {
        // Call API to logout
        await apiClient.logout();
        console.log('Server logout successful');
    } catch (error) {
        console.error('Server logout error:', error);
        // Continue with local logout even if server fails
    }
    
    try {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = 'index.html';
    }
}

// Initialize dashboard (call this on dashboard pages)
function initDashboard() {
    console.log('Initializing dashboard');
    const user = checkAuth();
    if (user) {
        // Update user info in header
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = user.name || user.email;
            console.log('Updated user name display');
        }
        if (userRoleElement) {
            userRoleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            console.log('Updated user role display');
        }
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing authentication system');
    
    // If we're on a dashboard page, initialize it
    if (window.location.pathname.includes('dashboard')) {
        console.log('Dashboard page detected, initializing dashboard');
        initDashboard();
        return;
    }
    
    // Add event listeners for login/register tabs and forms if they exist
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    console.log('Auth elements found:', {
        loginTab: !!loginTab,
        registerTab: !!registerTab,
        loginForm: !!loginForm,
        registerForm: !!registerForm
    });
    
    // Add tab listeners
    if (loginTab) {
        loginTab.addEventListener('click', showLogin);
        console.log('Login tab listener added');
    }
    if (registerTab) {
        registerTab.addEventListener('click', showRegister);
        console.log('Register tab listener added');
    }
    
    // Add form listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener added');
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form listener added');
    }
    
    console.log('Authentication system initialized successfully');
});

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.checkAuth = checkAuth;
window.initDashboard = initDashboard;

console.log('Auth script setup complete');
