document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a hash in the URL
    if (window.location.hash === '#service-request-section') {
        const element = document.getElementById('service-request-section');
        if (element) {
            // Add a slight delay to ensure smooth scrolling
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    // Pre-fill form if coming from contact page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('from_contact')) {
        // Pre-fill any data passed from contact page
        const name = urlParams.get('name');
        const email = urlParams.get('email');
        const phone = urlParams.get('phone');
        
        if (name) document.getElementById('full-name').value = name;
        if (email) document.getElementById('email').value = email;
        if (phone) document.getElementById('phone').value = phone;
    }

    // Enhanced service item hover effects
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Form validation and submission
    const serviceForm = document.querySelector('form');
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const serviceType = document.getElementById('service-type');
            const serviceDate = document.getElementById('service-date');
            const isValid = validateForm(serviceType, serviceDate);
            
            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate form submission (replace with actual AJAX call)
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
                    
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'alert alert-success mt-3';
                    successMsg.innerHTML = '<strong>Thank you!</strong> Your service request has been submitted. We will contact you shortly.';
                    this.appendChild(successMsg);
                    
                    // Reset form after 3 seconds
                    setTimeout(() => {
                        this.reset();
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Request Service';
                        successMsg.remove();
                    }, 3000);
                }, 1500);
            }
        });
    }
    
    function validateForm(serviceType, serviceDate) {
        let isValid = true;
        
        // Reset error states
        serviceType.classList.remove('error');
        serviceDate.classList.remove('error');
        
        // Validate service type
        if (!serviceType.value) {
            serviceType.classList.add('error');
            showError(serviceType, 'Please select a service type');
            isValid = false;
        }
        
        // Validate service date
        if (!serviceDate.value) {
            serviceDate.classList.add('error');
            showError(serviceDate, 'Please select a date');
            isValid = false;
        } else {
            const selectedDate = new Date(serviceDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                serviceDate.classList.add('error');
                showError(serviceDate, 'Please select a future date');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function showError(element, message) {
        // Remove existing error message if any
        const existingError = element.nextElementSibling;
        if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }
        
        // Create and display new error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.style.color = 'var(--secondary-color)';
        errorMsg.style.fontSize = '0.8rem';
        errorMsg.style.marginTop = '-1rem';
        errorMsg.style.marginBottom = '1rem';
        errorMsg.textContent = message;
        
        element.parentNode.insertBefore(errorMsg, element.nextSibling);
    }
    
    // Testimonial carousel functionality
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;
    
    if (testimonials.length > 1) {
        // Initially show only the first testimonial
        testimonials.forEach((testimonial, index) => {
            if (index !== 0) {
                testimonial.style.display = 'none';
            }
        });
        
        // Rotate testimonials every 5 seconds
        setInterval(() => {
            testimonials[currentTestimonial].style.display = 'none';
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = 'block';
            
            // Add animation
            testimonials[currentTestimonial].style.animation = 'fadeIn 0.5s ease';
            setTimeout(() => {
                testimonials[currentTestimonial].style.animation = '';
            }, 500);
        }, 5000);
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});