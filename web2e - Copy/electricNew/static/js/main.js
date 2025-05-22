document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    
    // Create overlay for menu
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    let isMenuOpen = false;

    // Toggle Menu Function
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Toggle button icon
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        
        // Toggle menu and overlay
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('show');
        overlay.classList.toggle('show');
        
        // Toggle body scroll
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Close Menu Function
    function closeMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('show');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Event Listeners
    mobileMenuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    // Close menu on window resize (if resized to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMenu();
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Show/hide menu button on scroll for larger screens
    let lastScroll = 0;
    const scrollThreshold = 100;
    const headerHeight = document.querySelector('header')?.offsetHeight || 200;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // For larger screens
        if (window.innerWidth > 768) {
            if (currentScroll > headerHeight) {
                mobileMenuBtn.classList.add('sticky');
                mobileMenuBtn.classList.add('visible');
            } else {
                mobileMenuBtn.classList.remove('sticky');
                mobileMenuBtn.classList.remove('visible');
            }

            if (currentScroll > lastScroll && isMenuOpen) {
                closeMenu();
            }
        }

        lastScroll = currentScroll;
    }, { passive: true });
});

// Large Menu Overlay functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const menuOverlay = document.querySelector('.large-menu-overlay');
    const closeOverlay = document.querySelector('.close-overlay');
    
    function toggleMenu() {
        menuOverlay.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : '';
    }

    // Show menu on click
    mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
    });

    // Close menu when clicking close button
    closeOverlay?.addEventListener('click', toggleMenu);

    // Close menu when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Close menu when clicking outside
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) {
            toggleMenu();
        }
    });

    // Show menu on scroll up for larger screens
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (window.innerWidth > 768) {
            if (currentScroll < lastScroll) {
                mobileMenuBtn.classList.add('visible');
            } else {
                mobileMenuBtn.classList.remove('visible');
                menuOverlay.classList.remove('active');
            }
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
});