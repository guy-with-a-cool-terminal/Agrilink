// UI Management Module
// Handles form switching, notifications, modals, and other UI interactions

console.log('UI Manager module loaded successfully');

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

// Modal management functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Update element helper
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Create modal helper
function createModal(id, title, content) {
    // Remove existing modal if it exists
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m18 6-12 12M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

// Loading state management
function showLoadingState(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <span class="ml-3 text-gray-600">Loading...</span>
            </div>
        `;
    }
}

function hideLoadingState(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'none';
    }
}

// Table helpers
function getEmptyTableRow(type, colspan) {
    const icons = { users: '👥', orders: '📦', products: '📋', deliveries: '🚚' };
    const messages = { 
        users: 'No users found.',
        orders: 'No orders found.',
        products: 'No products found.',
        deliveries: 'No deliveries found.'
    };

    return `
        <tr>
            <td colspan="${colspan}" class="text-center py-8">
                <div class="text-gray-400 text-4xl mb-4">${icons[type] || '📄'}</div>
                <p class="text-gray-600">${messages[type] || 'No data found.'}</p>
            </td>
        </tr>
    `;
}

// Status styling helpers
function getStatusClass(status) {
    const statusClasses = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'suspended': 'status-inactive',
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
}

// Form validation helpers
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        } else {
            field.classList.remove('border-red-500');
        }
    });
    
    return isValid;
}

// Initialize UI event listeners
function initializeUIEventListeners() {
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
        loginForm.addEventListener('submit', window.handleLogin);
        console.log('Login form listener added');
    }
    if (registerForm) {
        registerForm.addEventListener('submit', window.handleRegister);
        console.log('Register form listener added');
    }
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.showLogin = showLogin;
    window.showRegister = showRegister;
    window.showNotification = showNotification;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.updateElement = updateElement;
    window.createModal = createModal;
    window.showLoadingState = showLoadingState;
    window.hideLoadingState = hideLoadingState;
    window.getEmptyTableRow = getEmptyTableRow;
    window.getStatusClass = getStatusClass;
    window.validateForm = validateForm;
    window.initializeUIEventListeners = initializeUIEventListeners;
}

console.log('UI Manager module setup complete');