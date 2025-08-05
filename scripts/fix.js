async function sendPaymentConfirmationEmail(orderData, orderResponse) {
    try {
        // Use existing EmailJS setup
        emailjs.init("aW3CSorS208n9Sw8R");
        
        const orderDetails = cart.map(item => 
            `${item.name} - ${item.quantity} x Ksh${item.price} = Ksh${(item.quantity * item.price).toFixed(2)}`
        ).join('\n');
        
        await emailjs.send("service_byyqwv6", "template_obw1ma8", {
            order_id: orderResponse.id || 'N/A',
            customer_name: currentUser.name,
            customer_email: currentUser.email,
            customer_phone: orderData.phone,
            delivery_address: orderData.delivery_address,
            payment_method: 'M-Pesa',
            mpesa_confirmation: orderData.mpesa_confirmation,
            mpesa_phone: orderData.mpesa_phone,
            total_amount: orderData.total_amount,
            order_items: orderDetails,
            payment_status: 'Pending Verification'
        });
        
        console.log('Payment confirmation email sent to admin');
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        // Don't show error to user as order was already placed successfully
    }
}