
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

// Store registration data temporarily during onboarding
let tempRegistrationData = null;

// Handle Registration - Modified to show onboarding
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

    // Store registration data temporarily
    tempRegistrationData = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        password_confirmation,
        role: role
    };

    // Show role-specific onboarding
    showOnboardingStep(role);
}

// Show onboarding step based on role
function showOnboardingStep(role) {
    console.log('Showing onboarding for role:', role);
    
    // Hide registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.style.display = 'none';
    }
    
    // Create and show onboarding modal
    createOnboardingModal(role);
}

// Create onboarding modal based on role
function createOnboardingModal(role) {
    // Remove any existing onboarding modal
    const existingModal = document.getElementById('onboardingModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'onboardingModal';
    modal.className = 'modal active';
    
    let modalContent = '';
    
    switch (role) {
        case 'farmer':
            modalContent = createFarmerOnboarding();
            break;
        case 'retailer':
            modalContent = createRetailerOnboarding();
            break;
        case 'logistics':
            modalContent = createLogisticsOnboarding();
            break;
        case 'consumer':
            // Consumer onboarding is simple - just complete registration
            completeRegistration();
            return;
        default:
            completeRegistration();
            return;
    }
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Set up event listeners for the onboarding form
    setupOnboardingEventListeners(role);
}

// Create farmer onboarding content
function createFarmerOnboarding() {
    return `
        <div class="modal-content max-w-3xl">
            <div class="modal-header">
                <h3>🌾 Complete Your Farmer Profile</h3>
                <p class="text-gray-600 mt-2">Upload at least 5 products to complete registration</p>
            </div>
            <div class="p-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-blue-800">
                        <strong>Welcome to AgriLink!</strong> To complete your farmer registration, you must upload at least 5 products. 
                        If you need assistance or want to discuss terms, you can contact our admin team.
                    </p>
                </div>
                
                <!-- Product Counter -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <span class="font-medium">Products Added: <span id="productCounter">0</span>/5</span>
                        <div class="w-32 h-2 bg-gray-200 rounded-full">
                            <div id="progressBar" class="h-2 bg-green-500 rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-4 mb-6">
                    <button id="uploadProductBtn" class="btn-primary flex-1">
                        📦 Add Products (Required)
                    </button>
                    <button id="contactAdminBtn" class="btn-secondary flex-1">
                        💬 Contact Admin for Help
                    </button>
                </div>
                
                <!-- Product Upload Form -->
                <div id="productUploadForm">
                    <h4 class="text-lg font-semibold mb-4">Add Your Products</h4>
                    <form id="onboardingProductForm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label for="onboardingProductName">Product Name</label>
                                <input type="text" id="onboardingProductName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="onboardingProductCategory">Category</label>
                                <select id="onboardingProductCategory" name="category" required>
                                    <option value="">Select Category</option>
                                    <option value="vegetables">Vegetables</option>
                                    <option value="fruits">Fruits</option>
                                    <option value="grains">Grains</option>
                                    <option value="dairy">Dairy</option>
                                    <option value="spices">Spices</option>
                                    <option value="seafood">SeaFood</option>
                                    <option value="poultry">Poultry</option>
                                    <option value="livestock">Livestock</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="onboardingProductDescription">Description</label>
                            <textarea id="onboardingProductDescription" name="description" rows="3" placeholder="Describe your product..."></textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="form-group">
                                <label for="onboardingProductStock">Stock Quantity</label>
                                <input type="number" id="onboardingProductStock" name="quantity" min="0" required>
                            </div>
                            <div class="form-group">
                                <label for="onboardingProductUnit">Unit</label>
                                <select id="onboardingProductUnit" name="unit" required>
                                    <option value="kg">Kilograms (kg)</option>
                                    <option value="g">Grams (g)</option>
                                    <option value="L">Liters (L)</option>
                                    <option value="pcs">Pieces (pcs)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="onboardingProductPrice">Price per Unit (Ksh)</label>
                                <input type="number" id="onboardingProductPrice" name="price" min="0" step="0.01" required>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <button type="submit" class="btn-secondary flex-1" id="addProductBtn">Add Product</button>
                            <button type="button" class="btn-primary flex-1" id="completeRegistrationBtn" disabled>
                                Complete Registration (Need 5 products)
                            </button>
                        </div>
                    </form>
                    
                    <!-- Added Products List -->
                    <div id="addedProductsList" class="mt-6 hidden">
                        <h5 class="font-medium mb-3">Added Products:</h5>
                        <div id="productsList" class="space-y-2"></div>
                    </div>
                </div>
                
                <!-- Contact Admin Form (initially hidden) -->
                <div id="contactAdminForm" class="hidden">
                    <h4 class="text-lg font-semibold mb-4">Contact Admin for Assistance</h4>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p class="text-sm text-yellow-800">
                            <strong>Note:</strong> This will send an email to our admin team for assistance. 
                            You will still need to upload 5 products to complete registration.
                        </p>
                    </div>
                    <form id="onboardingContactForm">
                        <div class="form-group">
                            <label for="contactMessage">Message to Admin</label>
                            <textarea id="contactMessage" rows="4" required 
                                    placeholder="Please describe what products you want to sell, any assistance you need, or terms you'd like to discuss..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary w-full">Send Email to Admin</button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Create retailer onboarding content
function createRetailerOnboarding() {
    return `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3>🏪 Set Your Retailer Preferences</h3>
                <p class="text-gray-600 mt-2">Configure your buying preferences to get better recommendations</p>
            </div>
            <div class="p-6">
                <form id="onboardingRetailerForm">
                    <div class="form-group">
                        <label for="preferredCategories">Preferred Product Categories</label>
                        <div class="grid grid-cols-2 gap-2 mt-2">
                            <label class="flex items-center">
                                <input type="checkbox" name="categories" value="vegetables" class="mr-2">
                                Vegetables
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="categories" value="fruits" class="mr-2">
                                Fruits
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="categories" value="grains" class="mr-2">
                                Grains
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="categories" value="dairy" class="mr-2">
                                Dairy
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="categories" value="spices" class="mr-2">
                                Spices
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="categories" value="seafood" class="mr-2">
                                SeaFood
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="budgetRange">Typical Budget Range per Order</label>
                        <select id="budgetRange" name="budget_range" required>
                            <option value="">Select Budget Range</option>
                            <option value="5000-10000">Ksh5,000 - Ksh10,000</option>
                            <option value="10000-25000">Ksh10,000 - Ksh25,000</option>
                            <option value="25000-50000">Ksh25,000 - Ksh50,000</option>
                            <option value="50000+">Ksh50,000+</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="orderFrequency">How often do you plan to order?</label>
                        <select id="orderFrequency" name="order_frequency" required>
                            <option value="">Select Frequency</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="as_needed">As Needed</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="businessLocation">Primary Business Location</label>
                        <input type="text" id="businessLocation" name="business_location" required 
                               placeholder="e.g., Nairobi, Kisumu, Mombasa">
                    </div>
                    
                    <button type="submit" class="btn-primary w-full">Save Preferences & Complete Registration</button>
                </form>
            </div>
        </div>
    `;
}

// Create logistics onboarding content
function createLogisticsOnboarding() {
    return `
        <div class="modal-content max-w-2xl">
            <div class="modal-header">
                <h3>🚛 Logistics Provider Setup</h3>
                <p class="text-gray-600 mt-2">Provide your service capacity and verification documents</p>
            </div>
            <div class="p-6">
                <form id="onboardingLogisticsForm">
                    <div class="form-group">
                        <label for="vehicleType">Vehicle Type</label>
                        <select id="vehicleType" name="vehicle_type" required>
                            <option value="">Select Vehicle Type</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="pickup">Pickup Truck</option>
                            <option value="van">Van</option>
                            <option value="truck">Truck</option>
                            <option value="multiple">Multiple Vehicles</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="serviceArea">Service Areas</label>
                        <textarea id="serviceArea" name="service_area" rows="3" required
                                placeholder="List the areas you can deliver to (e.g., Nairobi, Kiambu, Thika)"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="maxCapacity">Maximum Load Capacity (kg)</label>
                            <input type="number" id="maxCapacity" name="max_capacity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="deliveryPrice">Price per km (Ksh)</label>
                            <input type="number" id="deliveryPrice" name="delivery_price" min="1" step="0.50" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="businessLicense">Business/Driver's License Number</label>
                        <input type="text" id="businessLicense" name="license_number" required
                               placeholder="Enter your business license or driver's license number">
                    </div>
                    
                    <div class="form-group">
                        <label for="experience">Years of Experience</label>
                        <select id="experience" name="experience" required>
                            <option value="">Select Experience</option>
                            <option value="0-1">Less than 1 year</option>
                            <option value="1-3">1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="5+">5+ years</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn-primary w-full">Submit Information & Complete Registration</button>
                </form>
            </div>
        </div>
    `;
}

// Setup event listeners for onboarding forms
function setupOnboardingEventListeners(role) {
    switch (role) {
        case 'farmer':
            setupFarmerOnboardingListeners();
            break;
        case 'retailer':
            setupRetailerOnboardingListeners();
            break;
        case 'logistics':
            setupLogisticsOnboardingListeners();
            break;
    }
}

// Setup farmer onboarding listeners
function setupFarmerOnboardingListeners() {
    const uploadProductBtn = document.getElementById('uploadProductBtn');
    const contactAdminBtn = document.getElementById('contactAdminBtn');
    const productUploadForm = document.getElementById('productUploadForm');
    const contactAdminForm = document.getElementById('contactAdminForm');
    const onboardingProductForm = document.getElementById('onboardingProductForm');
    const onboardingContactForm = document.getElementById('onboardingContactForm');

    // Track added products
    let addedProducts = [];
    
    function updateProductCounter() {
        const counter = document.getElementById('productCounter');
        const progressBar = document.getElementById('progressBar');
        const completeBtn = document.getElementById('completeRegistrationBtn');
        
        if (counter) counter.textContent = addedProducts.length;
        if (progressBar) progressBar.style.width = `${(addedProducts.length / 5) * 100}%`;
        
        if (completeBtn) {
            if (addedProducts.length >= 5) {
                completeBtn.disabled = false;
                completeBtn.textContent = 'Complete Registration';
                completeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                completeBtn.disabled = true;
                completeBtn.textContent = `Complete Registration (Need ${5 - addedProducts.length} more)`;
                completeBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    if (uploadProductBtn) {
        uploadProductBtn.addEventListener('click', () => {
            productUploadForm.classList.remove('hidden');
            contactAdminForm.classList.add('hidden');
            uploadProductBtn.classList.add('bg-green-600', 'text-white');
            contactAdminBtn.classList.remove('bg-green-600', 'text-white');
        });
    }

    if (contactAdminBtn) {
        contactAdminBtn.addEventListener('click', () => {
            contactAdminForm.classList.remove('hidden');
            productUploadForm.classList.add('hidden');
            contactAdminBtn.classList.add('bg-green-600', 'text-white');
            uploadProductBtn.classList.remove('bg-green-600', 'text-white');
        });
    }

    if (onboardingProductForm) {
        onboardingProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const addBtn = document.getElementById('addProductBtn');
            const originalText = addBtn.textContent;
            
            try {
                addBtn.textContent = 'Adding...';
                addBtn.disabled = true;
                
                // Get product data
                const formData = new FormData(event.target);
                const productData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    quantity: parseInt(formData.get('quantity')),
                    category: formData.get('category'),
                    unit: formData.get('unit') || 'kg',
                    status: 'active'
                };
                
                // Add to temporary list
                addedProducts.push(productData);
                
                // Update UI
                updateProductCounter();
                displayAddedProducts();
                
                // Clear form
                event.target.reset();
                
                showNotification(`Product added! (${addedProducts.length}/5)`, 'success');
                
            } catch (error) {
                console.error('Error adding product:', error);
                showNotification('Error adding product: ' + error.message, 'error');
            } finally {
                addBtn.textContent = originalText;
                addBtn.disabled = false;
            }
        });
    }

    // Complete registration button
    const completeBtn = document.getElementById('completeRegistrationBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', async () => {
            if (addedProducts.length < 5) {
                showNotification('You need at least 5 products to complete registration', 'error');
                return;
            }
            
            await handleFarmerCompleteRegistration(addedProducts);
        });
    }

    if (onboardingContactForm) {
        onboardingContactForm.addEventListener('submit', handleFarmerContactSubmission);
    }
    
    function displayAddedProducts() {
        const productsList = document.getElementById('productsList');
        const addedProductsList = document.getElementById('addedProductsList');
        
        if (!productsList) return;
        
        if (addedProducts.length > 0) {
            addedProductsList.classList.remove('hidden');
            productsList.innerHTML = addedProducts.map((product, index) => `
                <div class="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                        <strong>${product.name}</strong> - ${product.category}
                        <span class="text-sm text-gray-600">(${product.quantity} ${product.unit} @ Ksh${product.price})</span>
                    </div>
                    <button onclick="removeProduct(${index})" class="text-red-500 hover:text-red-700">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 6-12 12M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            `).join('');
        } else {
            addedProductsList.classList.add('hidden');
        }
    }
    
    // Make remove function globally available for this context
    window.removeProduct = (index) => {
        addedProducts.splice(index, 1);
        updateProductCounter();
        displayAddedProducts();
        showNotification('Product removed', 'info');
    };
    
    // Initialize counter
    updateProductCounter();
}

// Handle farmer product submission during onboarding
async function handleFarmerCompleteRegistration(products) {
    const completeBtn = document.getElementById('completeRegistrationBtn');
    const originalText = completeBtn.textContent;

    try {
        completeBtn.textContent = 'Creating account and adding products...';
        completeBtn.disabled = true;

        // First complete registration
        const registrationResponse = await apiClient.register(tempRegistrationData);
        console.log('Registration completed:', registrationResponse);

        // Store user data
        const userData = {
            ...registrationResponse.user,
            token: registrationResponse.token,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Add all products
        for (const productData of products) {
            await apiClient.createProduct(productData);
        }
        
        console.log(`Added ${products.length} products successfully during onboarding`);

        showNotification(`Account created with ${products.length} products successfully!`, 'success');
        
        // Close modal and redirect
        closeOnboardingModal();
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1500);

    } catch (error) {
        console.error('Error during farmer registration completion:', error);
        showNotification('Error: ' + error.message, 'error');
        
        completeBtn.textContent = originalText;
        completeBtn.disabled = false;
    }
}

// Handle farmer contact submission during onboarding
async function handleFarmerContactSubmission(event) {
    event.preventDefault();
    console.log('Farmer contact submission during onboarding');

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'Sending email...';
        submitBtn.disabled = true;

        // Initialize EmailJS
        emailjs.init("aW3CSorS208n9Sw8R");

        const message = document.getElementById('contactMessage').value;
        
        // Send email using EmailJS
        await emailjs.send("service_byyqwv6", "template_dqe1mac", {
            from_name: tempRegistrationData.name,
            from_email: tempRegistrationData.email,
            phone: tempRegistrationData.phone,
            message: message
        });

        console.log('Email sent successfully to admin');

        showNotification('Email sent to admin successfully! You still need to upload 5 products to complete registration.', 'success');
        
        // Switch back to product upload form
        document.getElementById('contactAdminForm').classList.add('hidden');
        document.getElementById('productUploadForm').classList.remove('hidden');
        document.getElementById('uploadProductBtn').classList.add('bg-green-600', 'text-white');
        document.getElementById('contactAdminBtn').classList.remove('bg-green-600', 'text-white');

    } catch (error) {
        console.error('Error sending email:', error);
        showNotification('Error sending email: ' + error.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Setup retailer onboarding listeners
function setupRetailerOnboardingListeners() {
    const onboardingRetailerForm = document.getElementById('onboardingRetailerForm');
    if (onboardingRetailerForm) {
        onboardingRetailerForm.addEventListener('submit', handleRetailerOnboardingSubmission);
    }
}

// Handle retailer onboarding submission
async function handleRetailerOnboardingSubmission(event) {
    event.preventDefault();
    console.log('Retailer onboarding submission');

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        // Complete registration
        const registrationResponse = await apiClient.register(tempRegistrationData);
        console.log('Registration completed:', registrationResponse);

        // Store user data
        const userData = {
            ...registrationResponse.user,
            token: registrationResponse.token,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Get preferences from form
        const formData = new FormData(event.target);
        const categories = Array.from(event.target.querySelectorAll('input[name="categories"]:checked'))
                               .map(input => input.value);
        
        const preferences = {
            categories: categories,
            budget_range: formData.get('budget_range'),
            order_frequency: formData.get('order_frequency'),
            business_location: formData.get('business_location')
        };

        // Store preferences in localStorage for now (in real app, would save to backend)
        localStorage.setItem('retailerPreferences', JSON.stringify(preferences));
        console.log('Retailer preferences saved:', preferences);

        showNotification('Account created with your preferences!', 'success');
        
        // Close modal and redirect
        closeOnboardingModal();
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1500);

    } catch (error) {
        console.error('Error during retailer onboarding:', error);
        showNotification('Error: ' + error.message, 'error');
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Setup logistics onboarding listeners
function setupLogisticsOnboardingListeners() {
    const onboardingLogisticsForm = document.getElementById('onboardingLogisticsForm');
    if (onboardingLogisticsForm) {
        onboardingLogisticsForm.addEventListener('submit', handleLogisticsOnboardingSubmission);
    }
}

// Handle logistics onboarding submission
async function handleLogisticsOnboardingSubmission(event) {
    event.preventDefault();
    console.log('Logistics onboarding submission');

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        // Complete registration
        const registrationResponse = await apiClient.register(tempRegistrationData);
        console.log('Registration completed:', registrationResponse);

        // Store user data
        const userData = {
            ...registrationResponse.user,
            token: registrationResponse.token,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Get logistics info from form
        const formData = new FormData(event.target);
        const logisticsInfo = {
            vehicle_type: formData.get('vehicle_type'),
            service_area: formData.get('service_area'),
            max_capacity: formData.get('max_capacity'),
            delivery_price: formData.get('delivery_price'),
            license_number: formData.get('license_number'),
            experience: formData.get('experience')
        };

        // Store logistics info in localStorage for now (in real app, would save to backend)
        localStorage.setItem('logisticsInfo', JSON.stringify(logisticsInfo));
        console.log('Logistics info saved:', logisticsInfo);

        showNotification('Account created with your logistics information!', 'success');
        
        // Close modal and redirect
        closeOnboardingModal();
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1500);

    } catch (error) {
        console.error('Error during logistics onboarding:', error);
        showNotification('Error: ' + error.message, 'error');
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Complete registration without onboarding
async function completeRegistration() {
    console.log('Completing registration without onboarding');
    
    if (!tempRegistrationData) {
        showNotification('Registration data not found', 'error');
        return;
    }

    try {
        const response = await apiClient.register(tempRegistrationData);
        console.log('Registration successful:', response);
        
        const userData = {
            ...response.user,
            token: response.token,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('User registered and data stored successfully:', userData);
        
        showNotification('Registration successful! Redirecting to dashboard...', 'success');
        
        closeOnboardingModal();
        setTimeout(() => {
            redirectToDashboard(userData.role);
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed: ' + error.message, 'error');
        
        // Show register form again
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.style.display = 'block';
        }
        closeOnboardingModal();
    }
}

// Close onboarding modal and cleanup
function closeOnboardingModal() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.remove();
    }
    
    // Show register form again if needed
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.style.display = 'block';
    }
    
    // Clear temp data
    tempRegistrationData = null;
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