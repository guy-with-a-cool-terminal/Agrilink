// Handle farmer contact submission during onboarding
async function handleFarmerContactSubmission(event) {
    event.preventDefault();
    console.log('Farmer contact submission during onboarding');

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'Sending email...';
        submitBtn.disabled = true;

        // Initialize EmailJS (replace with your actual Public Key)
        emailjs.init("YOUR_PUBLIC_KEY");

        const message = document.getElementById('contactMessage').value;
        
        // Send email using EmailJS
        await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
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