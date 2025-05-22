// Toast System
class Toast {
  static show(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} animate-in`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Header Scroll Behavior
let lastScroll = window.pageYOffset;
const header = document.querySelector('header');
const scrollThreshold = 50;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Show/hide header based on scroll direction
  if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
    // Scrolling down
    header.classList.add('header-hidden');
    header.classList.remove('header-visible');
  } else {
    // Scrolling up
    header.classList.remove('header-hidden');
    header.classList.add('header-visible');
  }
  
  lastScroll = currentScroll;
}, { passive: true });

// Handle Flashed Messages
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

// Social Link Analytics
document.querySelectorAll('.social-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const platform = e.currentTarget.getAttribute('aria-label');
    console.log(`Social link clicked: ${platform}`);
    // Add analytics tracking here
  });
});

// Add responsive handlers
function handleResize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Content centering and responsive handling
function handleResponsiveLayout() {
    // Update viewport height for mobile
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Center content vertically if content is shorter than viewport
    const content = document.querySelector('.content-wrapper');
    const windowHeight = window.innerHeight;
    const contentHeight = content.offsetHeight;
    
    if (contentHeight < windowHeight) {
        content.style.marginTop = `max(2rem, ${(windowHeight - contentHeight) / 2}px)`;
    } else {
        content.style.marginTop = '2rem';
    }
}

// Initialize responsive features
document.addEventListener('DOMContentLoaded', () => {
    // Handle flashed messages
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
    
    // Handle mobile viewport height
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Handle mobile touch events
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
    
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResponsiveLayout, 100);
    });
});