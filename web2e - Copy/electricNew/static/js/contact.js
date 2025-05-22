document.addEventListener('DOMContentLoaded', function() {
    // Initialize form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize testimonial slider
    initTestimonialSlider();
    
    // Add scroll animations
    initScrollAnimations();
    
    // Add click-to-call functionality
    initClickToCall();
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = '<div class="loading-spinner"></div>';
    
    // Disable submit button and show loading
    submitButton.disabled = true;
    submitButton.insertAdjacentElement('afterend', loadingElement);
    loadingElement.style.display = 'block';
    
    // Simulate form submission (replace with actual AJAX call)
    setTimeout(() => {
        // Remove loading
        loadingElement.style.display = 'none';
        submitButton.disabled = false;
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you! Your message has been sent successfully.';
        form.appendChild(successMessage);
        successMessage.style.display = 'block';
        
        // Reset form
        form.reset();
        
        // Hide message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }, 1500);
}

function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length <= 1) return;
    
    let currentIndex = 0;
    
    // Show first testimonial
    testimonials.forEach((testimonial, index) => {
        testimonial.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
        testimonials[currentIndex].style.display = 'none';
        currentIndex = (currentIndex + 1) % testimonials.length;
        testimonials[currentIndex].style.display = 'block';
        
        // Add animation
        testimonials[currentIndex].style.animation = 'fadeIn 0.5s ease';
    }, 5000);
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe profile cards
    document.querySelectorAll('.profile-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) observer.observe(contactForm);
    
    // Observe testimonials
    document.querySelectorAll('.testimonial').forEach(testimonial => {
        observer.observe(testimonial);
    });
}

function initClickToCall() {
    // Add click event to all phone numbers
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // You could add analytics tracking here
            console.log('Call initiated to: ' + this.getAttribute('href').replace('tel:', ''));
        });
    });
    
    // Add click event to all email links
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // You could add analytics tracking here
            console.log('Email initiated to: ' + this.getAttribute('href').replace('mailto:', ''));
        });
    });
    
    // Add click event to all WhatsApp links
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // You could add analytics tracking here
            console.log('WhatsApp initiated to: ' + this.getAttribute('href').replace('https://wa.me/', ''));
        });
    });
}

// Add animation classes
const style = document.createElement('style');
style.textContent = `
    .profile-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .profile-card.animate {
        opacity: 1;
        transform: translateY(0);
    }
    
    .contact-form {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
    }
    
    .contact-form.animate {
        opacity: 1;
        transform: translateY(0);
    }
    
    .testimonial {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
    }
    
    .testimonial.animate {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);