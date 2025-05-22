document.addEventListener('DOMContentLoaded', function() {
    // Initialize all project galleries
    initProjectGalleries();
    
    // Initialize modal functionality
    initImageModal();
    
    // Add intersection observer for scroll animations
    initScrollAnimations();
});

function initProjectGalleries() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const gallery = card.querySelector('.gallery');
        if (!gallery) return;
        
        const images = gallery.querySelectorAll('.gallery-image');
        if (images.length <= 1) return;
        
        // Create gallery navigation elements
        const galleryHTML = `
            <div class="gallery-navigation">
                <button class="nav-btn prev-btn" aria-label="Previous image">&#10094;</button>
                <button class="nav-btn next-btn" aria-label="Next image">&#10095;</button>
            </div>
            <div class="gallery-indicators"></div>
        `;
        gallery.insertAdjacentHTML('beforeend', galleryHTML);
        
        // Create indicators
        const indicatorsContainer = gallery.querySelector('.gallery-indicators');
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
        
        // Auto-rotate if more than 1 image
        if (images.length > 1) {
            let interval = setInterval(nextImage, 4000);
            
            gallery.addEventListener('mouseenter', () => {
                clearInterval(interval);
            });
            
            gallery.addEventListener('mouseleave', () => {
                interval = setInterval(nextImage, 4000);
            });
        }
    });
}

function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const captionText = document.getElementById('image-caption');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    let currentModalGallery = null;
    let currentModalIndex = 0;
    let allGalleryImages = [];
    
    // Open modal when any gallery image is clicked
    document.querySelectorAll('.gallery-image').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Get all images in this gallery
            const gallery = this.closest('.gallery');
            currentModalGallery = gallery;
            allGalleryImages = Array.from(gallery.querySelectorAll('.gallery-image'));
            currentModalIndex = allGalleryImages.indexOf(this);
            
            updateModalImage();
        });
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Navigation in modal
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    function showPrevImage() {
        if (!currentModalGallery) return;
        currentModalIndex = (currentModalIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
        updateModalImage();
    }
    
    function showNextImage() {
        if (!currentModalGallery) return;
        currentModalIndex = (currentModalIndex + 1) % allGalleryImages.length;
        updateModalImage();
    }
    
    function updateModalImage() {
        const img = allGalleryImages[currentModalIndex];
        modalImg.src = img.src || img.getAttribute('data-modal-image');
        captionText.innerHTML = img.alt;
    }
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });
    
    // Add animation classes
    const style = document.createElement('style');
    style.textContent = `
        .project-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .project-card.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .project-card:nth-child(even).animate {
            transition-delay: 0.2s;
        }
    `;
    document.head.appendChild(style);
}