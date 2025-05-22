document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletter-email').value;
            const tips = document.querySelector('input[name="tips"]').checked;
            const offers = document.querySelector('input[name="offers"]').checked;
            
            try {
                // Show loading state
                const submitBtn = this.querySelector('button');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                submitBtn.disabled = true;

                // Simulate API call (replace with actual API endpoint)
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'newsletter-success';
                successMsg.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    Thank you for subscribing! Check your email to confirm.
                `;
                this.appendChild(successMsg);

                // Reset form
                this.reset();
                setTimeout(() => successMsg.remove(), 5000);

            } catch (error) {
                console.error('Newsletter subscription error:', error);
                alert('Sorry, there was an error. Please try again.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
