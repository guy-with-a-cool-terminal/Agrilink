// Retailer Dashboard JavaScript - Enhanced with Product Browsing and Purchase Requests

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Retailer Dashboard initializing...');
    initDashboard();
    loadUserData();
    setMinDate();
    loadOrderHistory();
    loadRetailerStats();
    loadAvailableProducts();
});

// Data storage
let orders = [];
let currentUser = null;
let availableProducts = [];

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
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Retailer';
        document.getElementById('userRole').textContent = userData.role || 'Retailer';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Retailer';
    }
}

// Load retailer-specific statistics (no admin analytics)
async function loadRetailerStats() {
    try {
        const ordersResponse = await apiClient.getOrders();
        const ordersList = apiClient.extractArrayData(ordersResponse);
        
        // Filter orders for current retailer if user_id is available
        const retailerOrders = ordersList.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        const totalOrders = retailerOrders.length;
        const totalSpent = retailerOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        const pendingDeliveries = retailerOrders.filter(order => 
            ['pending', 'processing', 'confirmed', 'shipped', 'in_transit'].includes(order.status)
        ).length;
        
        // Calculate active suppliers based on order diversity
        const supplierProducts = new Set();
        retailerOrders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    supplierProducts.add(item.product_id);
                });
            }
        });
        const activeSuppliers = Math.max(1, Math.ceil(supplierProducts.size / 3)); // Estimate suppliers
        
        // Update stats display with retailer-specific data
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalSpent').textContent = `Ksh${totalSpent.toLocaleString()}`;
        document.getElementById('activeSuppliers').textContent = activeSuppliers;
        document.getElementById('pendingDeliveries').textContent = pendingDeliveries;
        
    } catch (error) {
        console.error('Error loading retailer stats:', error);
        // Fallback values
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalSpent').textContent = 'Ksh0';
        document.getElementById('activeSuppliers').textContent = '0';
        document.getElementById('pendingDeliveries').textContent = '0';
    }
}

// Load available products for retailers to browse
async function loadAvailableProducts() {
    try {
        const response = await apiClient.getProducts();
        availableProducts = apiClient.extractArrayData(response, 'data') || [];
        console.log('Available products loaded:', availableProducts);
        
        displayProductCatalog();
        updateProductSelect();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display product catalog for retailers
function displayProductCatalog() {
    const catalogContainer = document.getElementById('productCatalog');
    if (!catalogContainer) {
        // Create product catalog section if it doesn't exist
        const catalogSection = document.createElement('div');
        catalogSection.className = 'bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8';
        catalogSection.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Available Products</h3>
            <div id="productCatalog" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Products will be loaded here -->
            </div>
        `;
        
        // Insert after bulk order form
        const bulkOrderForm = document.querySelector('.dashboard-content > div:nth-child(2)');
        if (bulkOrderForm) {
            bulkOrderForm.insertAdjacentElement('afterend', catalogSection);
        }
    }
    
    const catalog = document.getElementById('productCatalog');
    if (!catalog) return;
    
    if (availableProducts.length === 0) {
        catalog.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-gray-400 text-4xl mb-4">📦</div>
                <p class="text-gray-600">No products available at the moment.</p>
            </div>
        `;
        return;
    }
    
    catalog.innerHTML = availableProducts.map(product => `
        <div class="product-card bg-gray-50 rounded-lg p-4">
            <div class="text-center text-3xl mb-2">🥬</div>
            <h4 class="font-semibold mb-1">${product.name || 'Unnamed Product'}</h4>
            <p class="text-sm text-gray-600 mb-2">${product.description || 'No description'}</p>
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-green-600">Ksh${parseFloat(product.price || 0).toFixed(2)}</span>
                <span class="text-sm text-gray-500">Stock: ${product.quantity || 0}</span>
            </div>
            <button class="btn-primary w-full text-sm" onclick="requestProduct('${product.id}', '${product.name}')">
                Request Product
            </button>
        </div>
    `).join('');
}

// Request product for bulk purchase
function requestProduct(productId, productName) {
    const product = availableProducts.find(p => p.id == productId);
    if (!product) return;
    
    // Pre-fill the bulk order form
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('bulkQuantity');
    
    if (productSelect) {
        // Add the product to select if not already there
        const existingOption = Array.from(productSelect.options).find(opt => opt.value === productName.toLowerCase());
        if (!existingOption) {
            const option = document.createElement('option');
            option.value = productName.toLowerCase();
            option.textContent = productName;
            productSelect.appendChild(option);
        }
        productSelect.value = productName.toLowerCase();
    }
    
    if (quantityInput) {
        quantityInput.focus();
    }
    
    // Scroll to bulk order form
    const bulkOrderForm = document.querySelector('form[onsubmit="placeBulkOrder(event)"]');
    if (bulkOrderForm) {
        bulkOrderForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    alert(`Pre-filled form for ${productName}. Please specify quantity and other details.`);
}

// Update product select with available products
function updateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    // Clear existing options except the first one
    productSelect.innerHTML = '<option value="">Select Product</option>';
    
    // Add available products
    availableProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name.toLowerCase();
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
}

// Set minimum date for delivery date input
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// Place bulk order - Enhanced with real product data
async function placeBulkOrder(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;
    
    const productName = document.getElementById('productSelect').value;
    const quantity = parseInt(document.getElementById('bulkQuantity').value);
    const budgetValue = document.getElementById('budgetRange').value;
    
    // Find the actual product from available products
    const selectedProduct = availableProducts.find(p => 
        p.name.toLowerCase() === productName || productName.includes(p.name.toLowerCase())
    );
    
    // Extract budget amount
    let budgetAmount = 0;
    if (budgetValue.includes('-')) {
        const range = budgetValue.split('-');
        budgetAmount = parseInt(range[1].replace(/\D/g, ''));
    } else {
        budgetAmount = parseInt(budgetValue.replace(/\D/g, ''));
    }
    
    try {
        const orderData = {
            type: 'bulk',
            items: [{
                product_id: selectedProduct?.id || null,
                name: productName,
                quantity: quantity,
                unit_price: selectedProduct?.price || (budgetAmount / quantity)
            }],
            delivery_address: 'Bulk delivery address will be provided',
            delivery_date: document.getElementById('deliveryDate').value,
            budget_range: budgetValue,
            special_requirements: document.getElementById('specialRequirements').value,
            total_amount: Math.min(budgetAmount, (selectedProduct?.price || 0) * quantity),
            status: 'pending'
        };
        
        const response = await apiClient.createOrder(orderData);
        console.log('Bulk order created:', response);
        
        alert(`Bulk order placed successfully!\nOrder ID: ${response.id || 'Generated'}\nWe will contact you within 24 hours with supplier details.`);
        
        // Reset form and reload data
        event.target.reset();
        await loadRetailerStats();
        await loadOrderHistory();
        
    } catch (error) {
        console.error('Error placing bulk order:', error);
        alert('Failed to place bulk order: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Schedule delivery
async function scheduleDelivery(event) {
    event.preventDefault();
    
    const orderId = document.getElementById('orderSelect').value;
    const deliveryTime = document.getElementById('deliveryTime').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    
    if (!orderId) {
        alert('Please select an order to schedule delivery');
        return;
    }
    
    try {
        const deliveryData = {
            order_id: orderId,
            delivery_time: deliveryTime,
            delivery_address: deliveryAddress,
            status: 'scheduled'
        };
        
        await apiClient.scheduleDelivery(deliveryData);
        alert('Delivery scheduled successfully!');
        
        event.target.reset();
        await loadOrderHistory();
        
    } catch (error) {
        console.error('Error scheduling delivery:', error);
        alert('Failed to schedule delivery: ' + error.message);
    }
}

// Load order history
async function loadOrderHistory() {
    try {
        const response = await apiClient.getOrders();
        orders = apiClient.extractArrayData(response);
        console.log('Order history loaded:', orders);
        
        // Filter orders for current retailer
        const retailerOrders = orders.filter(order => 
            order.user_id == currentUser.id || 
            order.customer_email === currentUser.email
        );
        
        const tableBody = document.querySelector('#orderHistoryTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (retailerOrders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-600">No orders found. Place your first bulk order to get started!</p>
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        // Update order select dropdown
        const orderSelect = document.getElementById('orderSelect');
        if (orderSelect) {
            orderSelect.innerHTML = '<option value="">Select Order</option>';
            retailerOrders.forEach(order => {
                const option = document.createElement('option');
                option.value = order.id;
                option.textContent = `Order #${order.id} - ${order.items?.[0]?.name || 'Items'}`;
                orderSelect.appendChild(option);
            });
        }
        
        retailerOrders.forEach(order => {
            const row = document.createElement('tr');
            const orderDate = new Date(order.created_at).toLocaleDateString();
            const amount = parseFloat(order.total_amount) || 0;
            const mainItem = order.items?.[0] || {};
            
            row.innerHTML = `
                <td class="font-medium">#${order.id}</td>
                <td>
                    <div class="font-medium">${mainItem.name || 'Mixed Items'}</div>
                    <div class="text-sm text-gray-500">${order.items?.length || 0} items</div>
                </td>
                <td>${mainItem.quantity || 0}</td>
                <td class="font-medium">Ksh${amount.toLocaleString()}</td>
                <td><span class="status-${order.status}">${order.status}</span></td>
                <td class="text-sm text-gray-500">${orderDate}</td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn-secondary text-sm" onclick="viewOrderDetails('${order.id}')">
                            View
                        </button>
                        ${order.status === 'pending' ? 
                            `<button class="btn-primary text-sm" onclick="scheduleOrderDelivery('${order.id}')">Schedule</button>` :
                            ''
                        }
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading order history:', error);
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (order) {
        const items = order.items || [];
        const itemsList = items.map(item => 
            `${item.name || 'Item'} x${item.quantity} @ Ksh${item.unit_price || 0}`
        ).join('\n');
        
        alert(`Order Details:

Order ID: #${order.id}
Status: ${order.status}
Date: ${new Date(order.created_at).toLocaleDateString()}
Amount: Ksh${(parseFloat(order.total_amount) || 0).toLocaleString()}
Delivery: ${order.delivery_date || 'Not scheduled'}

Items:
${itemsList || 'No items listed'}

Special Requirements:
${order.special_requirements || 'None'}`);
    }
}

// Schedule order delivery (from order history)
function scheduleOrderDelivery(orderId) {
    const orderSelect = document.getElementById('orderSelect');
    if (orderSelect) {
        orderSelect.value = orderId;
    }
    
    // Scroll to delivery scheduling form
    const deliveryForm = document.querySelector('form[onsubmit="scheduleDelivery(event)"]');
    if (deliveryForm) {
        deliveryForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Make functions globally available
window.placeBulkOrder = placeBulkOrder;
window.scheduleDelivery = scheduleDelivery;
window.requestProduct = requestProduct;
window.viewOrderDetails = viewOrderDetails;
window.scheduleOrderDelivery = scheduleOrderDelivery;
window.logout = logout;
