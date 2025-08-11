let currentUser = null;
let deliveries = [];

// Distance calculation helper (Msambweni as origin)
function calculateDistance(destinationAddress) {
    // Msambweni coordinates (approximate)
    const msambweniLat = -4.4667;
    const msambweniLng = 39.4833;
    const distanceMap = {
        'mombasa': 85,
        'diani': 15,
        'ukunda': 20,
        'kwale': 35,
        'kinango': 45,
        'lunga lunga': 60,
        'hospital': 5, 
        'msambweni': 0,
        'shimoni': 25,
        'ramisi': 40
    };
    
    if (!destinationAddress) return 0;
    
    const address = destinationAddress.toLowerCase();
    
    // Check for specific locations
    for (const [location, distance] of Object.entries(distanceMap)) {
        if (address.includes(location)) {
            return distance;
        }
    }
    
    // Default distance for unknown locations (assume within county)
    return 30;
}

// Initialize dashboard
function initializeLogisticsDashboard() {
    console.log('Initializing logistics dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'logistics') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    loadDashboardData();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    const deliverySelect = document.getElementById('deliverySelect');
    const newStatusSelect = document.getElementById('newStatus');
    const updateStatusForm = document.querySelector('form');

    if (deliverySelect) {
        deliverySelect.addEventListener('change', () => {
            // Auto-populate delivery details when selected
            const selectedDelivery = deliveries.find(d => d.id == deliverySelect.value);
            if (selectedDelivery) {
                updateDeliveryFormDetails(selectedDelivery);
            }
        });
    }

    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', updateDeliveryStatusFromForm);
    }
}

// Update form with delivery details
function updateDeliveryFormDetails(delivery) {
    const locationInput = document.getElementById('location');
    if (locationInput && delivery.delivery_address) {
        locationInput.value = delivery.delivery_address;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        await loadDeliveries();
        await loadLogisticsStats();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

async function loadDeliveries() {
    try {
        // Get deliveries using the same method as admin
        const deliveriesResponse = await apiClient.getDeliveries();
        const allDeliveries = apiClient.extractArrayData(deliveriesResponse) || [];
        
        // Filter deliveries assigned to current user or unassigned ones
        const relevantDeliveries = allDeliveries.filter(delivery => 
            !delivery.assigned_to || delivery.assigned_to == currentUser.id
        );
        
        console.log('Found relevant deliveries:', relevantDeliveries.length);
        
        // Get all orders to match with deliveries
        let allOrders = [];
        try {
            const ordersResponse = await apiClient.getOrders();
            allOrders = apiClient.extractArrayData(ordersResponse) || [];
            console.log('Loaded orders for matching:', allOrders.length);
        } catch (error) {
            console.warn('Could not load orders:', error);
        }
        
        // Get all users to match customer information
        let allUsers = [];
        try {
            const usersResponse = await apiClient.getUsers();
            allUsers = apiClient.extractArrayData(usersResponse) || [];
            console.log('Loaded users for customer info:', allUsers.length);
        } catch (error) {
            console.warn('Could not load users:', error);
        }
        
        // Enhanced deliveries with proper order data and customer information
        const enhancedDeliveries = relevantDeliveries.map(delivery => {
            try {
                // Find matching order (same logic as admin)
                const matchingOrder = allOrders.find(order => 
                    parseInt(order.id) === parseInt(delivery.order_id)
                );
                
                if (matchingOrder) {
                    delivery.order = matchingOrder;
                    console.log(`Matched delivery ${delivery.id} with order ${matchingOrder.id}`);
                    
                    // Find customer user information
                    if (matchingOrder.user_id) {
                        const customerUser = allUsers.find(user => 
                            parseInt(user.id) === parseInt(matchingOrder.user_id)
                        );
                        if (customerUser) {
                            matchingOrder.user = customerUser;
                        }
                    }
                } else {
                    console.warn(`No matching order found for delivery ${delivery.id} with order_id ${delivery.order_id}`);
                }
                
                // Calculate distance from Msambweni to destination (keep for internal use)
                const distance = calculateDistance(delivery.delivery_address);
                delivery.calculated_distance = distance;
                
                // Extract and enhance customer information using the matched data
                delivery.customer_name = extractCustomerName(delivery);
                delivery.customer_phone = extractCustomerPhone(delivery);
                delivery.order_items_summary = extractOrderItemsSummary(delivery);
                
                return delivery;
            } catch (error) {
                console.warn('Error enhancing delivery:', delivery.id, error);
                // Return delivery with fallback data
                delivery.customer_name = 'Unknown Customer';
                delivery.customer_phone = '';
                delivery.order_items_summary = 'Product details unavailable';
                return delivery;
            }
        });
        
        // Store deliveries globally for map access
        deliveries = enhancedDeliveries;
        
        console.log('Enhanced deliveries ready:', enhancedDeliveries);
        
        displayDeliveries(enhancedDeliveries);
        updateDeliverySelect(enhancedDeliveries);
        
        // Refresh map if it exists
        if (typeof refreshDeliveryMap === 'function') {
            refreshDeliveryMap();
        }
        
    } catch (error) {
        console.error('Error loading deliveries:', error);
        displayDeliveries([]);
    }
}

// Helper function to extract customer name from various sources
function extractCustomerName(delivery) {
    // Priority 1: Direct delivery customer info
    if (delivery.customer_name) return delivery.customer_name;
    
    // Priority 2: Order user information (like in admin.js)
    if (delivery.order?.user?.name) return delivery.order.user.name;
    
    // Priority 3: Order customer name fields
    if (delivery.order?.customer_name) return delivery.order.customer_name;
    
    // Priority 4: Other order fields
    if (delivery.order?.billing_name) return delivery.order.billing_name;
    if (delivery.order?.shipping_name) return delivery.order.shipping_name;
    
    // Priority 5: Email as fallback (like admin does)
    if (delivery.order?.user?.email) return delivery.order.user.email;
    if (delivery.order?.customer_email) return delivery.order.customer_email;
    if (delivery.customer_email) return delivery.customer_email;
    
    return `Customer #${delivery.order_id || delivery.id}`;
}

// Helper function to extract customer phone 
function extractCustomerPhone(delivery) {
    // Priority 1: Direct delivery customer info
    if (delivery.customer_phone) return delivery.customer_phone;
    
    // Priority 2: Order user information
    if (delivery.order?.user?.phone) return delivery.order.user.phone;
    
    // Priority 3: Order phone fields
    if (delivery.order?.phone) return delivery.order.phone;
    if (delivery.order?.customer_phone) return delivery.order.customer_phone;
    if (delivery.order?.billing_phone) return delivery.order.billing_phone;
    if (delivery.order?.shipping_phone) return delivery.order.shipping_phone;
    
    return '';
}

// Helper function to extract order items summary
function extractOrderItemsSummary(delivery) {
    let orderItems = [];
    
    // Log what we're working with for debugging
    console.log('Extracting items for delivery:', delivery.id, 'Order:', delivery.order);
    
    // Try different possible structures for order items (matching admin patterns)
    if (delivery.order?.order_items && Array.isArray(delivery.order.order_items)) {
        orderItems = delivery.order.order_items;
        console.log('Found order_items:', orderItems.length);
    } else if (delivery.order?.items && Array.isArray(delivery.order.items)) {
        orderItems = delivery.order.items;
        console.log('Found items:', orderItems.length);
    } else if (delivery.order?.products && Array.isArray(delivery.order.products)) {
        orderItems = delivery.order.products;
        console.log('Found products:', orderItems.length);
    } else if (delivery.order?.line_items && Array.isArray(delivery.order.line_items)) {
        orderItems = delivery.order.line_items;
        console.log('Found line_items:', orderItems.length);
    }
    
    // If no items found in arrays, try single product fields
    if (orderItems.length === 0) {
        // Try to get product name from delivery itself
        if (delivery.product_name) {
            return delivery.product_name;
        }
        if (delivery.item_name) {
            return delivery.item_name;
        }
        // Try single product from order
        if (delivery.order?.product_name) {
            return delivery.order.product_name;
        }
        if (delivery.order?.item_name) {
            return delivery.order.item_name;
        }
        // If order exists but no items, show generic message
        if (delivery.order) {
            return `Order #${delivery.order.id} - Items loading...`;
        }
        return 'Product details unavailable';
    }
    
    // Create meaningful summary of items
    const itemNames = orderItems.map(item => {
        // Try multiple possible name fields
        const name = item.product_name || 
                    item.name || 
                    item.title || 
                    item.item_name || 
                    item.product?.name ||
                    item.product?.title ||
                    `Item #${item.id || 'Unknown'}`;
        
        const quantity = parseInt(item.quantity) || 1;
        return quantity > 1 ? `${name} (×${quantity})` : name;
    });
    
    if (itemNames.length <= 2) {
        return itemNames.join(', ');
    } else {
        return `${itemNames[0]}, ${itemNames[1]} + ${itemNames.length - 2} more`;
    }
}

// Display deliveries in table with proper order/customer details
function displayDeliveries(deliveriesList) {
    const deliveriesTable = document.getElementById('deliveriesTable');
    if (!deliveriesTable) return;
    
    if (!Array.isArray(deliveriesList) || deliveriesList.length === 0) {
        deliveriesTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <p class="text-gray-500">No deliveries assigned</p>
                </td>
            </tr>
        `;
        return;
    }
    
    deliveriesTable.innerHTML = deliveriesList.map(delivery => {
        const isCompleted = delivery.status === 'delivered';
        const isInTransit = delivery.status === 'in_transit';
        
        // Get meaningful order details
        const orderDetails = delivery.order_items_summary || 'Product details loading...';
        
        // Get customer information
        const customerName = delivery.customer_name || 'Customer';
        const customerPhone = delivery.customer_phone;
        
        return `
            <tr>
                <td class="font-mono">#${delivery.id}</td>
                <td>
                    <div class="text-sm">
                        <div class="font-medium">Order #${delivery.order_id || delivery.id}</div>
                        <div class="text-gray-600">${orderDetails}</div>
                    </div>
                </td>
                <td>
                    <div class="text-sm">
                        <div class="font-medium">${customerName}</div>
                        ${customerPhone ? `<div class="text-gray-600">${customerPhone}</div>` : ''}
                    </div>
                </td>
                <td class="text-sm">${delivery.delivery_address || 'Address not specified'}</td>
                <td>
                    <span class="status-badge status-${delivery.status || 'pending'}">${(delivery.status || 'pending').replace('_', ' ')}</span>
                </td>
                <td>
                    <span class="priority-badge priority-${delivery.priority || 'medium'}">${delivery.priority || 'medium'}</span>
                </td>
                <td class="text-center">
                    ${delivery.order ? ReviewUtils.getReviewButtonForOrder(delivery.order, currentUser) : 'N/A'}
                </td>
                <td>
                    <div class="flex gap-2">
                        ${!isCompleted ? 
                            `<button class="btn-secondary text-sm ${isInTransit ? 'opacity-50' : ''}" 
                                    onclick="updateDeliveryStatusQuick('${delivery.id}', 'in_transit')"
                                    ${isInTransit ? 'disabled' : ''}>
                                ${isInTransit ? 'In Transit' : 'Start'}
                            </button>
                            <button class="btn-primary text-sm" 
                                    onclick="updateDeliveryStatusQuick('${delivery.id}', 'delivered')">
                                Complete
                            </button>` :
                            `<span class="text-green-600 text-sm font-medium">✓ Completed</span>`
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load logistics-specific statistics with distance calculations
async function loadLogisticsStats() {
    try {
        // Use the already loaded deliveries data
        const deliveriesList = deliveries;

        // Calculate statistics
        const activeDeliveries = deliveriesList.filter(delivery => 
            !['delivered', 'cancelled'].includes(delivery.status)
        ).length;
        
        const completedToday = deliveriesList.filter(delivery => {
            if (delivery.status !== 'delivered') return false;
            const deliveredDate = new Date(delivery.updated_at).toLocaleDateString();
            const todayDate = new Date().toLocaleDateString();
            return deliveredDate === todayDate;
        }).length;
        
        // Calculate total distance from completed deliveries
        const totalDistance = deliveriesList
            .filter(delivery => delivery.status === 'delivered')
            .reduce((sum, delivery) => sum + (delivery.calculated_distance || 0), 0);
        
        const totalDeliveries = deliveriesList.length;
        const completedDeliveries = deliveriesList.filter(delivery => delivery.status === 'delivered').length;
        const efficiency = totalDeliveries > 0 ? 
            ((completedDeliveries / totalDeliveries) * 100).toFixed(1) + '%' : '0%';

        // Update stat cards
        updateStatCard('activeDeliveries', activeDeliveries);
        updateStatCard('completedToday', completedToday);
        updateStatCard('totalDistance', `${totalDistance} km`);
        updateStatCard('efficiency', efficiency);

    } catch (error) {
        console.error('Error loading logistics stats:', error);
        // Fallback values
        updateStatCard('activeDeliveries', 'N/A');
        updateStatCard('completedToday', 'N/A');
        updateStatCard('totalDistance', 'N/A');
        updateStatCard('efficiency', 'N/A');
    }
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Quick update delivery status with proper validation and distance recording
async function updateDeliveryStatusQuick(deliveryId, newStatus) {
    console.log('Quick updating delivery status:', deliveryId, newStatus);
    
    if (!deliveryId || !newStatus) {
        showNotification('Invalid delivery ID or status', 'warning');
        return;
    }

    // Find the delivery to get current status and distance
    const delivery = deliveries.find(d => d.id == deliveryId);
    if (!delivery) {
        showNotification('Delivery not found', 'error');
        return;
    }

    // Prevent multiple actions on completed deliveries
    if (delivery.status === 'delivered') {
        showNotification('This delivery is already completed', 'warning');
        return;
    }

    // Prevent starting if already in transit
    if (newStatus === 'in_transit' && delivery.status === 'in_transit') {
        showNotification('Delivery is already in transit', 'warning');
        return;
    }

    try {
        const updateData = {
            status: newStatus,
            location: delivery.delivery_address || '',
            notes: `Status updated to ${newStatus} via quick action`
        };

        // If completing delivery, record the distance
        if (newStatus === 'delivered') {
            updateData.distance_km = delivery.calculated_distance || 0;
            updateData.notes = `Delivery completed. Distance travelled: ${delivery.calculated_distance || 0} km from Msambweni.`;
        }

        const response = await apiClient.updateDelivery(deliveryId, updateData);

        console.log('Delivery status updated:', response);
        
        if (newStatus === 'delivered') {
            showNotification(`Delivery #${deliveryId} completed! Distance recorded: ${delivery.calculated_distance || 0} km`, 'success');
        } else {
            showNotification(`Delivery #${deliveryId} status updated to ${newStatus.replace('_', ' ')}!`, 'success');
        }
        
        // Refresh data
        await loadDeliveries();
        await loadLogisticsStats();
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        
        // Handle specific error cases
        if (error.message.includes('invalid')) {
            showNotification('Invalid status. Please use: pending, in_transit, delivered, or cancelled', 'error');
        } else {
            showNotification('Failed to update delivery status', 'error');
        }
    }
}

// Update delivery status from form with proper status validation
async function updateDeliveryStatusFromForm(event) {
    event.preventDefault();

    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const statusNotes = document.getElementById('statusNotes').value;

    if (!deliveryId || !newStatus) {
        showNotification('Please select delivery and new status', 'warning');
        return;
    }

    // Validate status values (common valid statuses)
    const validStatuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'failed'];
    if (!validStatuses.includes(newStatus)) {
        showNotification(`Invalid status. Valid options: ${validStatuses.join(', ')}`, 'error');
        return;
    }

    const delivery = deliveries.find(d => d.id == deliveryId);
    if (!delivery) {
        showNotification('Selected delivery not found', 'error');
        return;
    }

    // Prevent actions on completed deliveries
    if (delivery.status === 'delivered') {
        showNotification('Cannot modify completed deliveries', 'warning');
        return;
    }

    try {
        const updateData = {
            status: newStatus,
            location: location || delivery.delivery_address || '',
            notes: statusNotes || `Status updated to ${newStatus}`
        };

        // If completing delivery, record the distance
        if (newStatus === 'delivered') {
            updateData.distance_km = delivery.calculated_distance || 0;
            if (!statusNotes) {
                updateData.notes = `Delivery completed. Distance travelled: ${delivery.calculated_distance || 0} km from Msambweni.`;
            }
        }

        const response = await apiClient.updateDelivery(deliveryId, updateData);

        console.log('Delivery status updated:', response);
        showNotification('Delivery status updated successfully!', 'success');
        
        // Clear form
        document.getElementById('deliverySelect').value = '';
        document.getElementById('newStatus').value = '';
        document.getElementById('location').value = '';
        document.getElementById('statusNotes').value = '';
        
        // Refresh data
        await loadDeliveries();
        await loadLogisticsStats();
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        
        if (error.message.includes('invalid')) {
            showNotification(`Invalid status. Please use one of: ${validStatuses.join(', ')}`, 'error');
        } else {
            showNotification('Failed to update delivery status: ' + error.message, 'error');
        }
    }
}

// Populate delivery select with better information
function updateDeliverySelect(deliveriesList) {
    const deliverySelect = document.getElementById('deliverySelect');
    if (!deliverySelect) return;

    deliverySelect.innerHTML = '<option value="">Select Delivery</option>';

    // Only show non-completed deliveries in the select
    const activeDeliveries = deliveriesList.filter(delivery => delivery.status !== 'delivered');

    activeDeliveries.forEach(delivery => {
        const option = document.createElement('option');
        option.value = delivery.id;
        
        const customerName = delivery.customer_name || 'Customer';
        const orderDetails = delivery.order_items_summary || 'Items loading...';
        
        option.textContent = `#${delivery.id} - ${customerName} - ${orderDetails} - ${delivery.status.replace('_', ' ')}`;
        deliverySelect.appendChild(option);
    });
}

// Refresh deliveries
function refreshDeliveries() {
    loadDeliveries();
    loadLogisticsStats();
}

// Update delivery location (called from map)
function updateDeliveryLocation(deliveryId) {
    const delivery = deliveries.find(d => d.id == deliveryId);
    if (!delivery) {
        showNotification('Delivery not found', 'error');
        return;
    }

    if (delivery.status === 'delivered') {
        showNotification('Cannot update location for completed delivery', 'warning');
        return;
    }

    const newLocation = prompt('Enter new location for delivery #' + deliveryId + ':', delivery.delivery_address || '');
    if (newLocation && newLocation !== delivery.delivery_address) {
        updateDeliveryStatusQuick(deliveryId, 'in_transit').then(() => {
            console.log('Location updated for delivery:', deliveryId, newLocation);
        });
    }
}
// Alternative API call methods if the standard ones don't work
async function tryAlternativeOrderFetch(orderId) {
    const alternativeMethods = [
        () => apiClient.getOrderById(orderId),
        () => apiClient.fetchOrder(orderId),
        () => apiClient.getOrderDetails(orderId),
        () => apiClient.orders.get(orderId),
        () => fetch(`/api/orders/${orderId}`).then(r => r.json())
    ];
    
    for (const method of alternativeMethods) {
        try {
            const result = await method();
            if (result) return result;
        } catch (error) {
            console.warn('Alternative order fetch method failed:', error);
        }
    }
    
    throw new Error('All order fetch methods failed');
}

// Make functions globally available
window.updateDeliveryStatusQuick = updateDeliveryStatusQuick;
window.updateDeliveryStatusFromForm = updateDeliveryStatusFromForm;
window.updateDeliveryLocation = updateDeliveryLocation;
window.refreshDeliveries = refreshDeliveries;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLogisticsDashboard);

console.log('Logistics dashboard script setup complete');