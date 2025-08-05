// Add payment-specific data
if (paymentMethod === 'mpesa') {
    const confirmationCode = document.getElementById('mpesaConfirmation')?.value;
    const mpesaPhone = document.getElementById('mpesaPhone')?.value;
    
    if (!confirmationCode || !mpesaPhone) {
        throw new Error('Please enter M-Pesa confirmation code and phone number');
    }
    
    orderData.mpesa_confirmation = confirmationCode;
    orderData.mpesa_phone = mpesaPhone;
    orderData.payment_details = `M-Pesa Confirmation: ${confirmationCode}`;
}

const response = await apiClient.createOrder(orderData);

// Handle different payment methods
if (paymentMethod === 'mpesa') {
    showNotification('Order placed successfully! Payment confirmation sent to admin for verification.', 'success');
    
    // Send email to admin with payment details
    await sendPaymentConfirmationEmail(orderData, response);
} else if (paymentMethod === 'cod') {
    showNotification('Order placed successfully! You will pay on delivery.', 'success');
}