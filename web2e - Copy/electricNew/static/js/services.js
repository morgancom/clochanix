document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeBtn = document.querySelector('.modal-close-btn');
    const modalPrevBtn = document.querySelector('.modal-prev');
    const modalNextBtn = document.querySelector('.modal-next');
    
    // Close modal handlers
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Close button click
    closeBtn.addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Open modal when clicking service images
    document.querySelectorAll('.service-image').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.getAttribute('data-image') || this.src;
            document.body.style.overflow = 'hidden';
        });
    });

    // Image Modal functionality
    const captionText = document.getElementById('image-caption');
    
    // Update the carousel navigation buttons with better visibility
    const carouselNav = `
        <button class="modal-nav-btn modal-prev" aria-label="Previous image">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="modal-nav-btn modal-next" aria-label="Next image">
            <i class="fas fa-chevron-right"></i>
        </button>
        <button class="modal-close" aria-label="Close modal">
            <i class="fas fa-times"></i>
        </button>
        <div class="modal-counter"></div>
    `;
    modal.insertAdjacentHTML('beforeend', carouselNav);

    const modalCounter = modal.querySelector('.modal-counter');
    let currentImageIndex = 0;
    let currentGalleryImages = [];

    // Get all service images
    const serviceImages = document.querySelectorAll('.service-image');
    
    // Open modal when any service image is clicked
    serviceImages.forEach(img => {
        img.addEventListener('click', function() {
            const gallery = this.closest('.service-images');
            currentGalleryImages = Array.from(gallery.querySelectorAll('.service-image'));
            currentImageIndex = currentGalleryImages.indexOf(this);
            
            updateModalImage();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    function updateModalImage() {
        const currentImg = currentGalleryImages[currentImageIndex];
        
        // Add fade effect
        modalImg.style.opacity = '0';
        setTimeout(() => {
            modalImg.src = currentImg.src || currentImg.getAttribute('data-image');
            modalImg.style.opacity = '1';
            captionText.innerHTML = currentImg.alt;
            
            // Update counter
            modalCounter.textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
        }, 200);

        // Update navigation buttons visibility
        modalPrevBtn.style.display = currentGalleryImages.length > 1 ? 'flex' : 'none';
        modalNextBtn.style.display = currentGalleryImages.length > 1 ? 'flex' : 'none';
    }

    // Modal navigation functions
    function nextModalImage() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        updateModalImage();
    }

    function prevModalImage() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateModalImage();
    }

    // Event listeners for modal navigation
    modalNextBtn.addEventListener('click', nextModalImage);
    modalPrevBtn.addEventListener('click', prevModalImage);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            if (e.key === 'ArrowRight') nextModalImage();
            if (e.key === 'ArrowLeft') prevModalImage();
        }
    });

    // Close when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Add touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    modal.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                prevModalImage();
            } else {
                nextModalImage();
            }
        }
    }

    // Service image galleries
    const serviceGalleries = document.querySelectorAll('.service-images');
    
    serviceGalleries.forEach(gallery => {
        const images = gallery.querySelectorAll('.service-image');
        if (images.length <= 1) return;
        
        // Create navigation elements
        const navHTML = `
            <div class="image-navigation">
                <button class="nav-btn prev-btn">&lt;</button>
                <button class="nav-btn next-btn">&gt;</button>
            </div>
            <div class="image-indicators"></div>
        `;
        gallery.insertAdjacentHTML('beforeend', navHTML);
        
        // Create indicators
        const indicatorsContainer = gallery.querySelector('.image-indicators');
        images.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.dataset.index = index;
            indicatorsContainer.appendChild(indicator);
        });
        
        let currentIndex = 0;
        const indicators = gallery.querySelectorAll('.indicator');
        
        // Show initial image
        images.forEach((img, index) => {
            img.style.display = index === 0 ? 'block' : 'none';
        });
        
        // Navigation functions
        function showImage(index) {
            images.forEach(img => img.style.display = 'none');
            images[index].style.display = 'block';
            
            // Update active indicator
            indicators.forEach(ind => ind.classList.remove('active'));
            indicators[index].classList.add('active');
            
            currentIndex = index;
        }
        
        function nextImage() {
            let newIndex = (currentIndex + 1) % images.length;
            showImage(newIndex);
        }
        
        function prevImage() {
            let newIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(newIndex);
        }
        
        // Event listeners
        gallery.querySelector('.next-btn').addEventListener('click', nextImage);
        gallery.querySelector('.prev-btn').addEventListener('click', prevImage);
        
        // Indicator clicks
        indicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                showImage(parseInt(this.dataset.index));
            });
        });
        
        // Auto-rotate if more than 2 images
        if (images.length > 2) {
            let interval = setInterval(nextImage, 3000);
            
            gallery.addEventListener('mouseenter', () => {
                clearInterval(interval);
            });
            
            gallery.addEventListener('mouseleave', () => {
                interval = setInterval(nextImage, 3000);
            });
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Intersection Observer for scroll animations
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
    
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
});