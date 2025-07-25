// Authentication and User Management Module
// Handles user authentication, session management, and role-based navigation

console.log('Auth Manager module loaded successfully');

// Global variable to store API client reference
let apiClient = null;

// Initialize API client when available
function initializeApiClient() {
    if (window.apiClient) {
        apiClient = window.apiClient;
        console.log('API client initialized successfully');
        return true;
    }
    return false;
}

// Wait for API client to be available
function waitForApiClient(callback, maxAttempts = 10) {
    let attempts = 0;
    const checkApiClient = () => {
        if (initializeApiClient()) {
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkApiClient, 100);
        } else {
            console.error('API client failed to load after maximum attempts');
            alert('System initialization failed. Please refresh the page.');
        }
    };
    checkApiClient();
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
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!apiClient) {
        showNotification('System not ready. Please try again.', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
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
        
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed: ' + error.message, 'error');
        
        // Reset button state
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
    const password_confirmation = password;
    const role = document.getElementById('registerRole')?.value;
    
    console.log('Registration details:', { name, email, role });
    
    // Basic validation
    if (!name || !email || !phone || !password || !role) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!apiClient) {
        showNotification('System not ready. Please try again.', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        // Call API
        const response = await apiClient.register({
            name: name,
            email: email,
            phone: phone,
            password: password,
            password_confirmation,
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
        
        showNotification('Registration successful! Redirecting to dashboard...', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed: ' + error.message, 'error');
        
        // Reset button state
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
        showNotification('Invalid role selected: ' + role, 'error');
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
        // Call API to logout if available
        if (apiClient) {
            await apiClient.logout();
            console.log('Server logout successful');
        }
    } catch (error) {
        console.error('Server logout error:', error);
        // Continue with local logout even if server fails
    }
    
    try {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
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

        // Initialize API client for dashboard
        waitForApiClient(() => {
            console.log('Dashboard API client ready');
        });
    }
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.handleLogin = handleLogin;
    window.handleRegister = handleRegister;
    window.logout = logout;
    window.checkAuth = checkAuth;
    window.initDashboard = initDashboard;
    window.waitForApiClient = waitForApiClient;
}

console.log('Auth Manager module setup complete');