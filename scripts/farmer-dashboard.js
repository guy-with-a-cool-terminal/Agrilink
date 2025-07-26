console.log('Enhanced Farmer dashboard script loaded');

let currentUser = null;
let products = [];
let farmerOrders = [];

// Initialize dashboard
function initializeFarmerDashboard() {
    console.log('Initializing farmer dashboard');
    
    // Check authentication
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'farmer') {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
    loadDashboardData();
    setupEventListeners();
}

// Enhanced setup event listeners with orders tab functionality
function setupEventListeners() {
    // Existing product modal listeners
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeModalBtn = document.getElementById('closeModal');
    const addProductForm = document.getElementById('addProductForm');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => closeModal('addProductModal'));
    }

    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Close modal when clicking outside
    if (addProductModal) {
        addProductModal.addEventListener('click', (e) => {
            if (e.target === addProductModal) {
                addProductModal.classList.remove('active');
            }
        });
    }

    setupTabNavigation();

    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', refreshOrdersData);
    }
}

function setupTabNavigation() {
    const productTab = document.getElementById('productTab');
    const ordersTab = document.getElementById('ordersTab');
    const productContent = document.getElementById('productContent');
    const ordersContent = document.getElementById('ordersContent');

    if (productTab && ordersTab && productContent && ordersContent) {
        productTab.addEventListener('click', () => {
            productTab.classList.add('active');
            ordersTab.classList.remove('active');
            productContent.style.display = 'block';
            ordersContent.style.display = 'none';
        });

        ordersTab.addEventListener('click', () => {
            ordersTab.classList.add('active');
            productTab.classList.remove('active');
            productContent.style.display = 'none';
            ordersContent.style.display = 'block';
        });
    }
}

// Enhanced load dashboard data with orders
async function loadDashboardData() {
    const loadingState = document.getElementById('loadingState');
    const productsContainer = document.getElementById('productsContainer');
    const ordersContainer = document.getElementById('ordersContainer');
    
    try {
        // Show loading state
        if (loadingState) loadingState.style.display = 'block';
        if (productsContainer) productsContainer.style.display = 'none';
        if (ordersContainer) ordersContainer.style.display = 'none';
        
        // Load products first (needed for filtering orders)
        await loadProducts();
        
        // Load farmer orders
        await loadFarmerOrders();
        
        // Load stats with both products and orders data
        await loadFarmerStats();

        // Hide loading state and show content
        if (loadingState) loadingState.style.display = 'none';
        if (productsContainer) productsContainer.style.display = 'block';
        if (ordersContainer) ordersContainer.style.display = 'block';
        
        // Add orders view button after data is loaded
        addOrdersViewButton();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
        if (loadingState) loadingState.style.display = 'none';
    }
}

// FIXED: Enhanced order loading with proper null checks
async function loadFarmerOrders() {
    try {
        console.log('Loading farmer orders...');
        console.log('Current farmer ID:', currentUser.id);
        console.log('Farmer products:', products.map(p => ({ id: p.id, name: p.name, farmer_id: p.farmer_id })));
        
        const response = await apiClient.getOrders();
        console.log('Raw orders response:', response);
        
        // Extract all orders using the improved method
        const allOrders = apiClient.extractArrayData(response) || [];
        console.log('All orders extracted:', allOrders.length);
        
        if (allOrders.length === 0) {
            console.log('No orders found in the system');
            displayFarmerOrdersTable([]);
            return;
        }
        
        // FIXED: Enhanced filtering with proper null/undefined checks
        farmerOrders = allOrders.filter(order => {
            console.log(`\n--- Checking Order #${order.id} ---`);
            console.log('Order data:', {
                id: order.id,
                user_id: order.user_id,
                customer_name: order.customer_name,
                status: order.status,
                items: order.items,
                order_items: order.order_items,
                created_at: order.created_at
            });
            
            // FIXED: Proper null/undefined checks for order items
            let orderItems = order.items || order.order_items || [];
            
            // Additional safety check - ensure orderItems is actually an array
            if (!orderItems || !Array.isArray(orderItems)) {
                console.log('Order has no valid items array:', order.id, 'items:', orderItems);
                return false;
            }
            
            // FIXED: Extra check for empty arrays
            if (orderItems.length === 0) {
                console.log('Order has empty items array:', order.id);
                return false;
            }
            
            console.log(`Order ${order.id} has ${orderItems.length} items:`, orderItems);
            
            // Check if any item in the order belongs to this farmer
            const hasFarmerProduct = orderItems.some(item => {
                // FIXED: Additional null checks for item properties
                if (!item) {
                    console.log('Found null/undefined item in order:', order.id);
                    return false;
                }
                
                console.log('Checking item:', {
                    product_id: item.product_id,
                    name: item.name,
                    item_data: item
                });
                
                // Find the product in farmer's products
                const product = products.find(p => {
                    // Handle both string and number IDs with null checks
                    const matches = (p && item && (
                        (p.id == item.product_id) || 
                        (p.id == item.id) || 
                        (p.name === item.name)
                    ));
                    
                    if (matches) {
                        console.log('Found matching product:', {
                            product_id: p.id,
                            product_name: p.name,
                            farmer_id: p.farmer_id,
                            current_farmer: currentUser.id,
                            belongs_to_farmer: p.farmer_id == currentUser.id
                        });
                    }
                    
                    return matches;
                });
                
                if (product) {
                    const belongsToFarmer = product.farmer_id == currentUser.id;
                    console.log(`Product "${product.name}" belongs to farmer:`, belongsToFarmer);
                    
                    if (belongsToFarmer) {
                        console.log(`✓ Order ${order.id} contains farmer product: ${product.name}`);
                    }
                    
                    return belongsToFarmer;
                }
                
                console.log('No matching product found for item:', item.product_id || item.name);
                return false;
            });
            
            console.log(`Order ${order.id} has farmer products:`, hasFarmerProduct);
            return hasFarmerProduct;
        });
        
        console.log('\n=== FINAL RESULTS ===');
        console.log('Total orders in system:', allOrders.length);
        console.log('Orders with farmer products:', farmerOrders.length);
        console.log('Farmer orders:', farmerOrders.map(o => ({
            id: o.id,
            customer: o.customer_name || o.user?.name,
            status: o.status,
            items_count: (o.items || o.order_items || []).length
        })));
        
        // Display the filtered orders
        displayFarmerOrdersTable(farmerOrders);
        
        // Update order stats
        updateOrderStats();
        
    } catch (error) {
        console.error('Error loading farmer orders:', error);
        showNotification('Failed to load orders', 'error');
        displayFarmerOrdersTable([]); // Show empty state
    }
}

// FIXED: Display farmer orders with proper null checks
function displayFarmerOrdersTable(ordersToShow) {
    const ordersTableBody = document.querySelector('#farmerOrdersTable tbody');
    if (!ordersTableBody) {
        console.error('Orders table body not found - check your HTML structure');
        return;
    }

    ordersTableBody.innerHTML = '';

    if (!Array.isArray(ordersToShow) || ordersToShow.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📋</div>
                    <p class="text-gray-500">No orders found for your products yet.</p>
                    <p class="text-gray-400 text-sm mt-2">Orders will appear here when customers purchase your products.</p>
                    <button onclick="debugOrdersData()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded text-sm">
                        Debug Orders Data
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    // Sort orders by date (newest first)
    const sortedOrders = ordersToShow.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sortedOrders.forEach(order => {
        // FIXED: Proper null checks for order items
        const allOrderItems = order.items || order.order_items || [];
        
        // Safety check
        if (!Array.isArray(allOrderItems)) {
            console.warn(`Order ${order.id} has invalid items:`, allOrderItems);
            return; // Skip this order
        }
        
        // Filter items that belong to this farmer with null checks
        const farmerItems = allOrderItems.filter(item => {
            if (!item) return false; // Skip null/undefined items
            
            const product = products.find(p => 
                p && item && (
                    (p.id == item.product_id) || 
                    (p.id == item.id) || 
                    (p.name === item.name)
                )
            );
            return product && product.farmer_id == currentUser.id;
        });

        console.log(`Order ${order.id} farmer items:`, farmerItems);

        // FIXED: Calculate totals with proper null checks
        const totalQuantity = farmerItems.reduce((sum, item) => {
            if (!item) return sum;
            const qty = parseInt(item.quantity || 0);
            console.log(`Item quantity: ${qty} for ${item.name || 'unknown'}`);
            return sum + qty;
        }, 0);
        
        const totalAmount = farmerItems.reduce((sum, item) => {
            if (!item) return sum;
            const price = parseFloat(item.unit_price || item.price || 0);
            const qty = parseInt(item.quantity || 0);
            const itemTotal = price * qty;
            console.log(`Item total: ${price} x ${qty} = ${itemTotal} for ${item.name || 'unknown'}`);
            return sum + itemTotal;
        }, 0);

        // Get customer information with fallbacks
        const customerName = order.customer_name || 
                           order.user?.name || 
                           order.user_name || 
                           `Customer #${order.user_id || 'Unknown'}`;
        const customerEmail = order.user?.email || order.customer_email || '';
        const customerPhone = order.user?.phone || order.customer_phone || '';

        // Format order date
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="font-mono text-sm">#${order.id}</td>
            <td>
                <div class="text-sm">
                    <div class="font-medium text-gray-900">${customerName}</div>
                    ${customerEmail ? `<div class="text-gray-600 text-xs">${customerEmail}</div>` : ''}
                    ${customerPhone ? `<div class="text-gray-500 text-xs">${customerPhone}</div>` : ''}
                </div>
            </td>
            <td>
                <div class="text-sm space-y-1">
                    ${farmerItems.map(item => {
                        if (!item) return '';
                        const product = products.find(p => 
                            p && (
                                (p.id == item.product_id) || 
                                (p.id == item.id) || 
                                (p.name === item.name)
                            )
                        );
                        const itemPrice = parseFloat(item.unit_price || item.price || 0);
                        return `
                            <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div>
                                    <span class="font-medium">${product?.name || item.name || 'Unknown Product'}</span>
                                    <br><small class="text-gray-500">Ksh${itemPrice.toFixed(2)} each</small>
                                </div>
                                <span class="text-gray-600 font-medium">×${item.quantity || 0}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </td>
            <td class="text-center font-medium">${totalQuantity}</td>
            <td class="font-medium text-green-600">Ksh${totalAmount.toFixed(2)}</td>
            <td>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-${order.status || 'pending'}">
                    ${(order.status || 'pending').replace('_', ' ').toUpperCase()}
                </span>
            </td>
            <td class="text-sm text-gray-600">
                <div>${formattedDate}</div>
                <div class="text-xs text-gray-500">${formattedTime}</div>
            </td>
            <td>
                <div class="flex gap-1">
                    <button class="btn-secondary text-xs px-2 py-1" onclick="viewOrderDetails(${order.id})">
                        View
                    </button>
                    ${['pending', 'confirmed'].includes(order.status) ? `
                    ` : ''}
                </div>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    console.log(`Displayed ${sortedOrders.length} orders in farmer table`);
}

function debugOrdersData() {
    console.log('\n=== DEBUGGING ORDERS DATA ===');
    console.log('Current farmer:', currentUser);
    console.log('Farmer products:', products);
    
    apiClient.getOrders().then(response => {
        console.log('Raw API response:', response);
        const allOrders = apiClient.extractArrayData(response) || [];
        console.log('Extracted orders:', allOrders);
        
        if (allOrders.length > 0) {
            console.log('Sample order structure:', allOrders[0]);
            console.log('Sample order items:', allOrders[0].items || allOrders[0].order_items);
        }
        
        alert(`Debug info logged to console. 
               Found ${allOrders.length} total orders.
               Farmer has ${products.length} products.
               Check browser console for detailed logs.`);
    }).catch(error => {
        console.error('Debug error:', error);
        alert('Error loading orders for debugging: ' + error.message);
    });
}

function updateOrderStats() {
    const totalOrders = farmerOrders.length;
    const pendingOrders = farmerOrders.filter(order => 
        ['pending', 'confirmed', 'processing'].includes(order.status)
    ).length;
    const completedOrders = farmerOrders.filter(order => 
        ['delivered', 'completed'].includes(order.status)
    ).length;
    
    console.log('Order stats:', { totalOrders, pendingOrders, completedOrders });
    
    // Update any stats displays
    const totalOrdersEl = document.getElementById('totalOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');
    const completedOrdersEl = document.getElementById('completedOrders');
    
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
}

// Load products - Keep existing functionality
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await apiClient.getProducts();
        console.log('Products response:', response);
        
        // Use improved data extraction method to handle pagination
        products = apiClient.extractArrayData(response, 'data') || [];
        products = products.filter(p => p.farmer_id == currentUser.id);
        console.log('Extracted farmer products:', products);
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
        displayProducts([]); // Show empty state
    }
}

// FIXED: Enhanced loadFarmerStats with corrected sales logic
async function loadFarmerStats() {
    try {
        console.log('Loading farmer stats with orders data...');
        
        // Calculate farmer-specific metrics from loaded data
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'active').length;
        
        // FIXED: Calculate earnings from orders with corrected logic
        let totalSales = 0;  // Changed from totalEarnings to totalSales for clarity
        let monthlyRevenue = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        console.log(`Calculating for month ${currentMonth + 1}/${currentYear}`);
        console.log('Processing farmer orders:', farmerOrders.length);
        
        farmerOrders.forEach(order => {
            // FIXED: Proper null checks for order and items
            if (!order || (!order.items && !order.order_items)) {
                console.log('Skipping order with no items:', order?.id);
                return;
            }
            
            const allOrderItems = order.items || order.order_items || [];
            
            // Safety check for items array
            if (!Array.isArray(allOrderItems)) {
                console.log('Order has invalid items array:', order.id, allOrderItems);
                return;
            }
            
            // Calculate earnings only from farmer's products in each order
            const farmerItems = allOrderItems.filter(item => {
                if (!item) return false;
                const product = products.find(p => p && p.id == item.product_id);
                return product && product.farmer_id == currentUser.id;
            });
            
            const orderAmount = farmerItems.reduce((sum, item) => {
                if (!item) return sum;
                const price = parseFloat(item.unit_price || item.price || 0);
                const quantity = parseInt(item.quantity || 0);
                return sum + (price * quantity);
            }, 0);
            
            console.log(`Order ${order.id}: Status="${order.status}", Amount=Ksh${orderAmount}`);
            
            // FIXED: Include ALL non-pending orders for total sales
            // This includes confirmed, delivered, completed, paid, processing, etc.
            if (order.status && order.status !== 'pending' && order.status !== 'cancelled' && order.status !== 'rejected') {
                totalSales += orderAmount;
                console.log(`✓ Added Ksh${orderAmount} to total sales (status: ${order.status})`);
            } else {
                console.log(`⚠ Skipped order for total sales (status: ${order.status})`);
            }
            
            // FIXED: Monthly revenue calculation - include ALL orders from current month
            const orderDate = new Date(order.created_at);
            const orderMonth = orderDate.getMonth();
            const orderYear = orderDate.getFullYear();
            
            console.log(`Order date: ${orderDate.toDateString()}, Order month: ${orderMonth + 1}, Current month: ${currentMonth + 1}`);
            
            if (orderMonth === currentMonth && orderYear === currentYear) {
                // Include all non-pending orders for monthly revenue
                if (order.status && order.status !== 'pending' && order.status !== 'cancelled' && order.status !== 'rejected') {
                    monthlyRevenue += orderAmount;
                    console.log(`✓ Added Ksh${orderAmount} to monthly revenue (status: ${order.status})`);
                } else {
                    console.log(`⚠ Skipped order for monthly revenue (status: ${order.status})`);
                }
            }
        });
        
        // FIXED: Calculate order statistics correctly  
        const totalOrders = farmerOrders.length;
        
        // Pending orders: orders that are still being processed
        const pendingOrders = farmerOrders.filter(order => 
            ['pending', 'processing'].includes(order.status)
        ).length;
        
        // Completed orders: orders that are finished/delivered  
        const completedOrders = farmerOrders.filter(order => 
            ['delivered', 'completed', 'fulfilled', 'paid'].includes(order.status)
        ).length;

        console.log('=== FINAL CALCULATIONS ===');
        console.log('Total Products:', totalProducts);
        console.log('Total Sales:', `Ksh${totalSales.toFixed(2)}`);
        console.log('Monthly Revenue:', `Ksh${monthlyRevenue.toFixed(2)}`);
        console.log('Total Orders:', totalOrders);
        console.log('Pending Orders:', pendingOrders);
        console.log('Completed Orders:', completedOrders);

        // Update stats display with accurate farmer data
        updateStatCard('totalProducts', totalProducts);
        updateStatCard('totalSales', `Ksh${totalSales.toFixed(2)}`);  // This should now show correct value
        updateStatCard('pendingOrders', pendingOrders);
        updateStatCard('monthlyRevenue', `Ksh${monthlyRevenue.toFixed(2)}`);  // This should now show correct value
        updateStatCard('totalOrders', totalOrders);
        
        console.log('Farmer stats updated successfully:', {
            totalProducts,
            totalSales,
            pendingOrders,
            monthlyRevenue,
            totalOrders,
            completedOrders
        });
        
    } catch (error) {
        console.error('Error loading farmer stats:', error);
        // Fallback to basic stats from products only
        const totalProducts = products.length;
        
        updateStatCard('totalProducts', totalProducts);
        updateStatCard('totalSales', 'Ksh0.00');
        updateStatCard('pendingOrders', 0);
        updateStatCard('monthlyRevenue', 'Ksh0.00');
        
        showNotification('Using basic statistics - order data unavailable', 'info');
    }
}

// FIXED: View detailed order information with proper null checks
function viewOrderDetails(orderId) {
    const order = farmerOrders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }

    // FIXED: Proper null checks for order items
    const allOrderItems = order.items || order.order_items || [];
    
    if (!Array.isArray(allOrderItems)) {
        showNotification('Order has invalid items data', 'error');
        return;
    }

    // Get farmer-specific items from this order
    const farmerItems = allOrderItems.filter(item => {
        if (!item) return false;
        const product = products.find(p => p && p.id == item.product_id);
        return product && product.farmer_id == currentUser.id;
    });

    const totalAmount = farmerItems.reduce((sum, item) => {
        if (!item) return sum;
        const price = parseFloat(item.unit_price || item.price || 0);
        const quantity = parseInt(item.quantity || 0);
        return sum + (price * quantity);
    }, 0);

    // Create modal with order details
    const modal = document.createElement('div');
    modal.id = 'orderDetailsModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold">Order Details #${order.id}</h3>
                <button onclick="closeModal('orderDetailsModal')" class="text-gray-500 hover:text-gray-700">
                    <span class="text-2xl">&times;</span>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold mb-2">Customer Information</h4>
                    <p><strong>Name:</strong> ${order.customer_name || order.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${order.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${order.user?.phone || 'N/A'}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold mb-2">Order Information</h4>
                    <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                    <p><strong>Total (Your Products):</strong> <span class="font-medium text-green-600">Ksh${totalAmount.toFixed(2)}</span></p>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="font-semibold mb-3">Your Products in this Order</h4>
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 px-3 py-2 text-left">Product</th>
                                <th class="border border-gray-300 px-3 py-2 text-center">Quantity</th>
                                <th class="border border-gray-300 px-3 py-2 text-right">Unit Price</th>
                                <th class="border border-gray-300 px-3 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${farmerItems.map(item => {
                                if (!item) return '';
                                const product = products.find(p => p && p.id == item.product_id);
                                const price = parseFloat(item.unit_price || item.price || 0);
                                const quantity = parseInt(item.quantity || 0);
                                const itemTotal = price * quantity;
                                return `
                                    <tr>
                                        <td class="border border-gray-300 px-3 py-2">${product?.name || item.name || 'Unknown Product'}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-center">${quantity}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-right">Ksh${price.toFixed(2)}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-right font-medium">Ksh${itemTotal.toFixed(2)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="bg-gray-100 font-semibold">
                                <td class="border border-gray-300 px-3 py-2" colspan="3">Total for Your Products:</td>
                                <td class="border border-gray-300 px-3 py-2 text-right text-green-600">Ksh${totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            ${order.delivery_address ? `
            <div class="mb-4 bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">Delivery Address</h4>
                <p>${order.delivery_address}</p>
            </div>
            ` : ''}

            <div class="flex justify-end">
                <button onclick="closeModal('orderDetailsModal')" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// NEW: Refresh orders data
async function refreshOrdersData() {
    try {
        showNotification('Refreshing orders...', 'info');
        await loadFarmerOrders();
        await loadFarmerStats(); // Update stats with new orders data
        showNotification('Orders refreshed successfully!', 'success');
    } catch (error) {
        console.error('Error refreshing orders:', error);
        showNotification('Failed to refresh orders', 'error');
    }
}

// Keep all existing functions unchanged
function displayProducts(productsToShow) {
    const productsTableBody = document.querySelector('#productsTable tbody');
    if (!productsTableBody) return;

    productsTableBody.innerHTML = '';

    if (!Array.isArray(productsToShow) || productsToShow.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-4">📦</div>
                    <p class="text-gray-500">No products found. Add your first product to get started!</p>
                </td>
            </tr>
        `;
        return;
    }

    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">📦</td>
            <td class="font-medium">${product.name || 'Unnamed Product'}</td>
            <td class="capitalize">${product.category || 'N/A'}</td>
            <td>${product.quantity || product.stock || 0}</td>
            <td class="font-medium">Ksh${parseFloat(product.price || 0).toFixed(2)}</td>
            <td><span class="status-${product.status || 'active'}">${(product.status || 'active').replace('_', ' ')}</span></td>
            <td>
                <div class="flex gap-2">
                    <button class="btn-secondary text-sm" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-danger text-sm" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        `;
        productsTableBody.appendChild(row);
    });
}

// Update stat card
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Keep all existing product management functions
async function handleAddProduct(event) {
    event.preventDefault();
    console.log('Adding new product...');

    const formData = new FormData(event.target);
    const productData = {
        name: formData.get('name') || document.getElementById('productName').value,
        description: formData.get('description') || document.getElementById('productDescription').value,
        price: parseFloat(formData.get('price') || document.getElementById('productPrice').value),
        quantity: parseInt(formData.get('quantity') || document.getElementById('productStock').value),
        category: formData.get('category') || document.getElementById('productCategory').value,
        status: 'active'
    };

    console.log('Product data to submit:', productData);

    try {
        const response = await apiClient.createProduct(productData);
        console.log('Product created successfully:', response);
        
        showNotification('Product added successfully!', 'success');
        
        // Close modal and reset form
        closeModal('addProductModal');
        event.target.reset();
        
        // Immediately reload products and stats to show new product
        await loadProducts();
        await loadFarmerStats();
        
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('Failed to add product: ' + error.message, 'error');
    }
}

async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newPrice = prompt('Enter new price:', product.price);
    if (newPrice && !isNaN(newPrice)) {
        try {
            await apiClient.updateProduct(productId, { 
                ...product, 
                price: parseFloat(newPrice) 
            });
            showNotification('Product updated successfully!', 'success');
            await loadProducts();
            await loadFarmerStats();
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Failed to update product: ' + error.message, 'error');
        }
    }
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await apiClient.deleteProduct(productId);
            showNotification('Product deleted successfully!', 'success');
            await loadProducts();
            await loadFarmerStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product: ' + error.message, 'error');
        }
    }
}

// Utility functions
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.remove();
    }
}

// NEW: Add button to header for detailed orders view
function addOrdersViewButton() {
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn && !document.getElementById('viewAllOrdersBtn')) {
        const viewOrdersBtn = document.createElement('button');
        viewOrdersBtn.id = 'viewAllOrdersBtn';
        viewOrdersBtn.className = 'btn-secondary ml-4';
        viewOrdersBtn.textContent = '📋 View All Orders';
        viewOrdersBtn.onclick = showDetailedOrdersView;
        addProductBtn.parentNode.appendChild(viewOrdersBtn);
    }
}

// FIXED: Show detailed orders view in a modal with proper null checks
function showDetailedOrdersView() {
    if (!farmerOrders || farmerOrders.length === 0) {
        showNotification('No orders found for your products', 'info');
        return;
    }

    // Create comprehensive orders modal
    const modal = document.createElement('div');
    modal.id = 'detailedOrdersModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto m-4">
            <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 class="text-xl font-semibold">All Orders for Your Products (${farmerOrders.length} total)</h3>
                <div class="flex gap-2">
                    <button onclick="refreshDetailedOrders()" class="btn-secondary text-sm">🔄 Refresh</button>
                    <button onclick="closeModal('detailedOrdersModal')" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
            </div>
            
            <div class="p-4">
                <!-- Orders Summary Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-blue-600">${farmerOrders.length}</div>
                        <div class="text-sm text-blue-800">Total Orders</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">${farmerOrders.filter(o => ['delivered', 'completed','confirmed'].includes(o.status)).length}</div>
                        <div class="text-sm text-green-800">Completed</div>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-yellow-600">${farmerOrders.filter(o => ['pending', 'processing'].includes(o.status)).length}</div>
                        <div class="text-sm text-yellow-800">Pending</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <div class="text-2xl font-bold text-purple-600">Ksh${calculateTotalEarnings().toFixed(2)}</div>
                        <div class="text-sm text-purple-800">Total Earnings</div>
                    </div>
                </div>

                <!-- Detailed Orders Table -->
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="border border-gray-300 px-3 py-2 text-left">Order ID</th>
                                <th class="border border-gray-300 px-3 py-2 text-left">Customer</th>
                                <th class="border border-gray-300 px-3 py-2 text-left">Your Products</th>
                                <th class="border border-gray-300 px-3 py-2 text-center">Qty</th>
                                <th class="border border-gray-300 px-3 py-2 text-right">Your Earnings</th>
                                <th class="border border-gray-300 px-3 py-2 text-center">Status</th>
                                <th class="border border-gray-300 px-3 py-2 text-center">Date</th>
                                <th class="border border-gray-300 px-3 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${farmerOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(order => {
                                // FIXED: Proper null checks for order items
                                const allOrderItems = order.items || order.order_items || [];
                                if (!Array.isArray(allOrderItems)) return '';
                                
                                const farmerItems = allOrderItems.filter(item => {
                                    if (!item) return false;
                                    const product = products.find(p => p && p.id == item.product_id);
                                    return product && product.farmer_id == currentUser.id;
                                });
                                
                                const totalQuantity = farmerItems.reduce((sum, item) => {
                                    if (!item) return sum;
                                    return sum + parseInt(item.quantity || 0);
                                }, 0);
                                
                                const totalAmount = farmerItems.reduce((sum, item) => {
                                    if (!item) return sum;
                                    const price = parseFloat(item.unit_price || item.price || 0);
                                    const quantity = parseInt(item.quantity || 0);
                                    return sum + (price * quantity);
                                }, 0);
                                
                                const customerName = order.customer_name || order.user?.name || 'Unknown';
                                const customerEmail = order.user?.email || '';
                                
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="border border-gray-300 px-3 py-2 font-mono text-sm">#${order.id}</td>
                                        <td class="border border-gray-300 px-3 py-2">
                                            <div class="text-sm">
                                                <div class="font-medium">${customerName}</div>
                                                ${customerEmail ? `<div class="text-gray-600 text-xs">${customerEmail}</div>` : ''}
                                            </div>
                                        </td>
                                        <td class="border border-gray-300 px-3 py-2">
                                            <div class="space-y-1 max-w-xs">
                                                ${farmerItems.map(item => {
                                                    if (!item) return '';
                                                    const product = products.find(p => p && p.id == item.product_id);
                                                    const price = parseFloat(item.unit_price || item.price || 0);
                                                    return `
                                                        <div class="text-xs bg-gray-50 p-1 rounded">
                                                            <div class="font-medium">${product?.name || item.name || 'Unknown Product'}</div>
                                                            <div class="text-gray-600">${item.quantity || 0} × Ksh${price.toFixed(2)}</div>
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        </td>
                                        <td class="border border-gray-300 px-3 py-2 text-center font-medium">${totalQuantity}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-right font-medium text-green-600">Ksh${totalAmount.toFixed(2)}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-center">
                                            <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full status-${order.status || 'pending'}">
                                                ${(order.status || 'pending').replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td class="border border-gray-300 px-3 py-2 text-center text-sm">
                                            <div>${new Date(order.created_at).toLocaleDateString()}</div>
                                            <div class="text-xs text-gray-500">${new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </td>
                                        <td class="border border-gray-300 px-3 py-2 text-center">
                                            <button onclick="viewOrderDetails(${order.id})" class="btn-secondary text-xs px-2 py-1">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// FIXED: Helper function to calculate total earnings with proper null checks
function calculateTotalEarnings() {
    if (!farmerOrders || !Array.isArray(farmerOrders)) return 0;
    
    return farmerOrders.reduce((total, order) => {
        if (!order || !['confirmed', 'delivered', 'completed', 'paid'].includes(order.status)) {
            return total;
        }
        
        const allOrderItems = order.items || order.order_items || [];
        if (!Array.isArray(allOrderItems)) return total;
        
        const farmerItems = allOrderItems.filter(item => {
            if (!item) return false;
            const product = products.find(p => p && p.id == item.product_id);
            return product && product.farmer_id == currentUser.id;
        });
        
        const orderAmount = farmerItems.reduce((sum, item) => {
            if (!item) return sum;
            const price = parseFloat(item.unit_price || item.price || 0);
            const quantity = parseInt(item.quantity || 0);
            return sum + (price * quantity);
        }, 0);
        
        return total + orderAmount;
    }, 0);
}

// NEW: Refresh orders in detailed view
async function refreshDetailedOrders() {
    try {
        showNotification('Refreshing orders...', 'info');
        await loadProducts(); // Refresh products first
        await loadFarmerOrders(); // This will reload orders
        await loadFarmerStats(); // Update stats
        closeModal('detailedOrdersModal');
        showDetailedOrdersView(); // Reopen with fresh data
        showNotification('Orders refreshed successfully!', 'success');
    } catch (error) {
        console.error('Error refreshing orders:', error);
        showNotification('Failed to refresh orders', 'error');
    }
}

// Make functions globally available
window.showAddProductModal = showAddProductModal;
window.closeModal = closeModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewOrderDetails = viewOrderDetails;
window.refreshOrdersData = refreshOrdersData;
window.showDetailedOrdersView = showDetailedOrdersView;
window.refreshDetailedOrders = refreshDetailedOrders;
window.debugOrdersData = debugOrdersData;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFarmerDashboard);

console.log('Enhanced Farmer dashboard script setup complete');