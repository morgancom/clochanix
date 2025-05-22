document.addEventListener('DOMContentLoaded', function() {
    // Back button functionality
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }

    // Enhanced Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const galleryImages = document.querySelectorAll('.image-gallery img');
    
    let currentImageIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    // Open lightbox when image is clicked
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            currentImageIndex = index;
            openLightbox(this.dataset.fullsize || this.src, this.alt);
            updateNavigationButtons();
        });
    });

    // Close lightbox with multiple options
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });

    function openLightbox(src, alt) {
        lightbox.style.display = 'block';
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        document.body.style.overflow = 'hidden';
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            lightbox.classList.add('active');
        });
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxImg.style.transform = 'translate(-50%, -50%) scale(0.95)';
        
        setTimeout(() => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            lightboxImg.src = '';
        }, 300);
    }

    // Add this to handle image loading
    lightboxImg.addEventListener('load', function() {
        this.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    function updateNavigationButtons() {
        if (lightboxPrev && lightboxNext) {
            lightboxPrev.style.display = currentImageIndex === 0 ? 'none' : 'block';
            lightboxNext.style.display = currentImageIndex === galleryImages.length - 1 ? 'none' : 'block';
        }
    }

    // Navigation functions
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            const prevImg = galleryImages[currentImageIndex];
            updateLightboxImage(prevImg);
            updateNavigationButtons();
        }
    }

    function showNextImage() {
        if (currentImageIndex < galleryImages.length - 1) {
            currentImageIndex++;
            const nextImg = galleryImages[currentImageIndex];
            updateLightboxImage(nextImg);
            updateNavigationButtons();
        }
    }

    function updateLightboxImage(img) {
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            lightboxImg.src = img.dataset.fullsize || img.src;
            lightboxImg.alt = img.alt;
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 200);
    }

    // Add corresponding CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .lightbox img {
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 1;
        }

        .lightbox #lightbox-close {
            cursor: pointer;
            position: fixed;
            top: 20px;
            right: 20px;
            color: white;
            font-size: 30px;
            z-index: 1002;
            transition: transform 0.3s ease;
        }

        .lightbox #lightbox-close:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'block') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        }
    });

    // Lazy loading for images
    galleryImages.forEach((img) => {
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        } else {
            // Fallback for browsers that don't support lazy loading
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '200px' });
            
            observer.observe(img);
        }
    });

    // Touch events for mobile swipe
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50; // Minimum swipe distance
        
        if (touchStartX - touchEndX > threshold) {
            // Swipe left - next image
            showNextImage();
        } else if (touchEndX - touchStartX > threshold) {
            // Swipe right - previous image
            showPrevImage();
        }
    }

    // Video optimization
    const video = document.querySelector('video');
    if (video) {
        // Add loading strategy for video
        video.setAttribute('preload', 'metadata');
        
        // Show poster frame if available
        if (!video.poster) {
            video.addEventListener('loadedmetadata', function() {
                this.currentTime = 1;
            });
            
            video.addEventListener('seeked', function() {
                const canvas = document.createElement('canvas');
                canvas.width = this.videoWidth;
                canvas.height = this.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
                this.poster = canvas.toDataURL('image/jpeg');
                this.currentTime = 0;
            });
        }
    }

    // Intersection Observer for scroll animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.project-details, .image-gallery, .video-container, .project-location');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => {
            observer.observe(el);
        });
    };

    // Add animation classes
    const style2 = document.createElement('style');
    style2.textContent = `
        .project-details,
        .image-gallery,
        .video-container,
        .project-location {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .project-details.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .image-gallery.animate {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.2s;
        }
        
        .video-container.animate {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.4s;
        }
        
        .project-location.animate {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 0.6s;
        }
    `;
    document.head.appendChild(style2);

    // Initialize scroll animations
    animateOnScroll();

    // Video player management
    const videos = document.querySelectorAll('video');
    let currentlyPlaying = null;

    videos.forEach(video => {
        // When a video starts playing
        video.addEventListener('play', function() {
            // If there's another video playing
            if (currentlyPlaying && currentlyPlaying !== this) {
                // Pause the other video
                currentlyPlaying.pause();
            }
            // Update currently playing video
            currentlyPlaying = this;
        });

        // When video ends or is paused
        video.addEventListener('ended', function() {
            currentlyPlaying = null;
        });

        video.addEventListener('pause', function() {
            if (currentlyPlaying === this) {
                currentlyPlaying = null;
            }
        });

        // Add loading indicator
        video.addEventListener('waiting', function() {
            this.parentElement.classList.add('loading');
        });

        video.addEventListener('canplay', function() {
            this.parentElement.classList.remove('loading');
        });
    });

    // Optional: Add this CSS for loading indicator
    const videoStyle = document.createElement('style');
    videoStyle.textContent = `
        .video-container.loading::after {
            content: 'Loading...';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
        }
    `;
    document.head.appendChild(videoStyle);
});