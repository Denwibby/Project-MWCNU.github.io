// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer untuk animasi saat scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe semua section
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    observer.observe(section);
});

// Sticky Header - Trigger pada scroll 60px
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 60) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Active navigation link
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(currentPage) || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

updateActiveNav();

// Ripple effect untuk button
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
}

document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', createRipple);
});

// ========================================
// DEVICE DETECTION INTEGRATION
// ========================================

// Fungsi untuk menyesuaikan perilaku berdasarkan device
function initDeviceSpecificFeatures() {
    const body = document.body;
    
    // Cek apakah device detector sudah aktif
    if (!body.hasAttribute('data-device')) {
        console.log('[Main] Waiting for DeviceDetector...');
        setTimeout(initDeviceSpecificFeatures, 100);
        return;
    }
    
    const deviceType = body.getAttribute('data-device');
    const isTouch = body.classList.contains('touch-device');
    
    console.log(`[Main] Device features initialized for: ${deviceType}`);
    
    // Mobile-specific: Disable complex animations untuk performa lebih baik
    if (deviceType === 'mobile') {
        // Simplify animations on mobile
        document.querySelectorAll('section').forEach(section => {
            section.style.animation = 'none';
            section.style.opacity = '1';
        });
    }
    
    // Desktop-specific: Enhanced hover effects
    if (deviceType === 'desktop') {
        // Enable smooth scroll untuk anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
        
        // Re-enable animations untuk desktop
        document.querySelectorAll('section').forEach((section, index) => {
            section.style.opacity = '0';
            section.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    // Tablet-specific: Hybrid behavior
    if (deviceType === 'tablet') {
        // Moderate animations
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '1';
        });
    }
}

// Initialize device features setelah DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeviceSpecificFeatures);
} else {
    initDeviceSpecificFeatures();
}

// Update features saat device berubah (resize/rotate)
window.addEventListener('devicechange', function(e) {
    console.log('[Main] Device changed, reinitializing features...');
    initDeviceSpecificFeatures();
});
