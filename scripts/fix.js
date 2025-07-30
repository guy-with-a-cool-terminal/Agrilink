// FIXED: Proper order structure that matches API expectations
const orderData = {
    // FIXED: Use items array (not order_items) - matching API expectations
    items: [{
        product_id: parseInt(orderDetails.selectedProduct.id),
        product_name: orderDetails.selectedProduct.name,
        name: orderDetails.selectedProduct.name,
        quantity: parseInt(orderDetails.quantity),
        unit_price: parseFloat(orderDetails.selectedProduct.price),
        total_price: parseInt(orderDetails.quantity) * parseFloat(orderDetails.selectedProduct.price)
    }],
    
    delivery_address: orderDetails.deliveryAddress.trim(),
    
    // Additional order details
    customer_name: currentUser.name || 'Retailer Customer',
    customer_email: currentUser.email,
    // FIXED: Use 'phone' instead of 'customer_phone'
    phone: orderDetails.mpesaPhone || currentUser.phone || '254700000000',
    
    delivery_date: orderDetails.deliveryDate,
    payment_method: orderDetails.paymentMethod,
    total_amount: orderDetails.totalAmount,
    
    // Put budget and requirements in notes
    notes: `Bulk order for retail - Budget Range: ${orderDetails.budgetRange}${orderDetails.specialRequirements ? '. Special Requirements: ' + orderDetails.specialRequirements : ''}`,
    
    // Order metadata
    order_type: 'bulk_order',
    status: 'pending'
};