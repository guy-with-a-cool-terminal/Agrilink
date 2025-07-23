
// Authentication and Navigation Logic for AgriLink Platform

console.log('Auth script loaded successfully');

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

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set notification styles based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }

    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m18 6-12 12M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
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

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing authentication system');
    
    // Wait for API client to be available
    waitForApiClient(() => {
        console.log('API client ready for authentication');
        
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
});

// Make functions globally available
window.showLogin = showLogin;
window.showRegister = showRegister;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logout = logout;
window.checkAuth = checkAuth;
window.initDashboard = initDashboard;
window.showNotification = showNotification;

console.log('Auth script setup complete');