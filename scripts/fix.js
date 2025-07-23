function displayOrderHistory() {
    const tableBody = document.querySelector('#orderHistoryTable');
    if (!tableBody) return;
    
    // Filter orders for current user
    const userOrders = orders.filter(order =>
        order.user_id == currentUser.id ||
        order.customer_email === currentUser.email
    );
    
    if (userOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-500">
                    No bulk orders found. Place your first order above!
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = userOrders.map(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        const statusClass = getStatusClass(order.status);
        
        // Get product names - handle different data structures
        let productName = 'No products';
        let totalQuantity = 0;
        
        // Check multiple possible data structures
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            // Standard items array
            if (order.items.length === 1) {
                productName = order.items[0].product?.name || order.items[0].name || order.items[0].product_name || 'Unknown Product';
            } else {
                const firstName = order.items[0].product?.name || order.items[0].name || order.items[0].product_name || 'Product';
                productName = `${firstName} + ${order.items.length - 1} more`;
            }
            totalQuantity = order.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        } else if (order.product_name) {
            // Direct product info on order
            productName = order.product_name;
            totalQuantity = parseInt(order.quantity) || 0;
        } else if (order.product?.name) {
            // Product nested in order
            productName = order.product.name;
            totalQuantity = parseInt(order.quantity) || 0;
        } else {
            // Debug: log the order structure to understand what we're working with
            console.log('Order structure for debugging:', {
                id: order.id,
                allKeys: Object.keys(order),
                fullOrder: order,
                items: order.items,
                hasProduct: !!order.product,
                hasProductName: !!order.product_name
            });
        }
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${productName}</td>
                <td>${totalQuantity} units</td>
                <td>Ksh${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>${orderDate}</td>
                <td>
                    <button class="btn-secondary text-sm" onclick="viewOrderDetails(${order.id})">
                        View Details
                    </button>
                    ${['pending', 'confirmed'].includes(order.status) ?
                        `<button class="btn-danger text-sm ml-2" onclick="cancelOrder(${order.id})">Cancel</button>` :
                        ''
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// Get status class for styling
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'confirmed': 'bg-blue-100 text-blue-800',
        'processing': 'bg-blue-100 text-blue-800',
        'shipped': 'bg-green-100 text-green-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

// Add order cancellation function
function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this bulk order?')) return;
    
    apiClient.cancelOrder(orderId)
        .then(() => {
            showNotification('Order cancelled successfully', 'success');
            loadOrderHistory();
            loadRetailerStats();
        })
        .catch(error => {
            console.error('Error cancelling order:', error);
            showNotification('Failed to cancel order', 'error');
        });
}