/**
 * Mobile Navigation & Menu Handling
 * Responsive menu system for MWCNU website
 */

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}

function initNav() {
    initMobileMenu();
    setupDropdowns();
    highlightActivePage();
    setupLogoClick();
    setupSmoothScroll();
    setupTabFunctionality();
    setupQRModal();
}

/**
 * Initialize mobile menu (hamburger)
 */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const mainNav = document.querySelector('.main-nav');

    if (!hamburger || !mainNav) {
        return;
    }

    // Create backdrop if not exists
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-backdrop';
        document.body.appendChild(backdrop);
    }

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const isActive = mainNav.classList.contains('active');

        if (isActive) {
            closeMobileMenu(mainNav, hamburger, backdrop);
        } else {
            openMobileMenu(mainNav, hamburger, backdrop);
        }
    });

    // Close on backdrop click
    backdrop.addEventListener('click', function() {
        closeMobileMenu(mainNav, hamburger, backdrop);
    });

    // Close menu when clicking on a nav link
    const navLinks = mainNav.querySelectorAll('a:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu(mainNav, hamburger, backdrop);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-nav') && !e.target.closest('.hamburger-menu')) {
            closeMobileMenu(mainNav, hamburger, backdrop);
        }
    });

    // Reset menu on window resize to tablet+
    window.addEventListener('resize', debounce(function() {
        if (window.innerWidth >= 768) {
            closeMobileMenu(mainNav, hamburger, backdrop);
        }
    }, 250));
}

/**
 * Open mobile menu
 */
function openMobileMenu(mainNav, hamburger, backdrop) {
    mainNav.classList.add('active');
    hamburger.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close mobile menu
 */
function closeMobileMenu(mainNav, hamburger, backdrop) {
    mainNav.classList.remove('active');
    hamburger.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Setup dropdown menus
 */
function setupDropdowns() {
    try {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        if (dropdowns.length === 0) {
            return;
        }

        const closeAllDropdowns = () => {
            document.querySelectorAll('.dropdown').forEach(d => {
                d.classList.remove('active');
            });
        };

        dropdowns.forEach((dropdown) => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!toggle || !menu) {
                return;
            }

            // Click on toggle (mobile + desktop)
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleDropdownToggle(dropdown);
            });

            // Close when cursor leaves the dropdown area (desktop)
            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth >= 768) {
                    dropdown.classList.remove('active');
                }
            });
        });

        // Close all dropdowns when clicking menu items
        const menuLinks = document.querySelectorAll('.dropdown-menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                closeAllDropdowns();
                
                if (window.innerWidth < 768) {
                    const mainNav = document.querySelector('.main-nav');
                    const hamburger = document.getElementById('hamburgerMenu');
                    const backdrop = document.querySelector('.nav-backdrop');
                    closeMobileMenu(mainNav, hamburger, backdrop);
                }
            });
        });

        // Close dropdowns on any pointer down outside menu/toggle (desktop)
        document.addEventListener('pointerdown', (e) => {
            if (window.innerWidth < 768) return;

            const isMenu = e.target.closest('.dropdown-menu');
            const isToggle = e.target.closest('.dropdown-toggle');
            if (!isMenu && !isToggle) {
                closeAllDropdowns();
            }
        }, true);

        // Close dropdowns when clicking outside (desktop + mobile)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                closeAllDropdowns();
            }
        });

        // Close dropdowns with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });
    } catch (err) {
        // Handle error silently
    }
}

/**
 * Helper to handle dropdown toggle
 */
function handleDropdownToggle(dropdown) {
    // Close other dropdowns
    const others = document.querySelectorAll('.dropdown.active');
    others.forEach(other => {
        if (other !== dropdown) {
            other.classList.remove('active');
        }
    });
    
    // Toggle current
    dropdown.classList.toggle('active');
}

/**
 * Logo click to go home
 */
function setupLogoClick() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            const path = window.location.pathname;
            const homeUrl = path.includes('pages/') ? '../index.html' : 'index.html';
            window.location.href = homeUrl;
        });
    }
}

/**
 * Smooth scroll for anchor links
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Highlight active page
 */
function highlightActivePage() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-list a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href === 'index.html' && currentPath.endsWith('/'))) {
            link.classList.add('active');
        }
    });
}

/**
 * Tab functionality
 */
function setupTabFunctionality() {
    const buttons = document.querySelectorAll('.tab-button');
    if (buttons.length === 0) return;

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const content = document.getElementById(tabId);
            if (content) content.classList.add('active');
        });
    });
}

/**
 * QR Code modal
 */
function setupQRModal() {
    document.addEventListener('click', function(e) {
        const btn = e.target.closest?.('.open-qr-modal');
        if (btn) {
            const jenjang = btn.dataset.jenjang || 'tk';
            const modal = document.querySelector('.qr-modal');
            if (!modal) return;

            const img = modal.querySelector('#qrImage');
            const title = modal.querySelector('h3');
            const qrData = `pendaftaran.html?jenjang=${encodeURIComponent(jenjang)}`;
            const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

            if (img) img.src = qrSrc;
            if (title) title.textContent = 'Scan QR Code - ' + (jenjang || '').toUpperCase();

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            return;
        }

        if (e.target.matches?.('.qr-modal-close') || e.target.matches?.('.qr-modal-overlay')) {
            const modal = document.querySelector('.qr-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                const img = modal.querySelector('#qrImage');
                if (img) img.src = '';
            }
        }
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
