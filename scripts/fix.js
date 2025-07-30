

// Helper function to extract customer name - matching admin.js structure
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

// Helper function to extract customer phone - matching admin.js structure
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

// Helper function to extract order items summary - improved to handle your data structure
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

// Fixed displayDeliveries function - removed distance from table, improved details
function displayDeliveries(deliveriesList) {
    const deliveriesTable = document.getElementById('deliveriesTable');
    if (!deliveriesTable) return;
    
    if (!Array.isArray(deliveriesList) || deliveriesList.length === 0) {
        deliveriesTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
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

// Enhanced delivery select with better information display
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