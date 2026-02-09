/**
 * Mobile Navigation & Menu Handling
 * Responsive menu system for MWCNU website
 */

console.log('navigation.js loading...');

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
} else {
    initNav();
}

function initNav() {
    console.log('=== Navigation Initialization Started ===');
    console.log('DOM Ready. Document state:', document.readyState);
    console.log('Document body:', document.body ? 'Present' : 'Missing');
    console.log('Main header:', document.querySelector('.main-header') ? 'Found' : 'Missing');
    console.log('Main nav:', document.querySelector('.main-nav') ? 'Found' : 'Missing');
    console.log('Hamburger menu:', document.getElementById('hamburgerMenu') ? 'Found' : 'Missing');
    
    console.log('STEP 1: Calling initMobileMenu()');
    initMobileMenu();
    
    console.log('STEP 2: Calling setupDropdowns()');
    setupDropdowns();
    
    console.log('STEP 3: Calling highlightActivePage()');
    highlightActivePage();
    
    console.log('STEP 4: Calling setupLogoClick()');
    setupLogoClick();
    
    console.log('STEP 5: Calling setupSmoothScroll()');
    setupSmoothScroll();
    
    console.log('STEP 6: Calling setupTabFunctionality()');
    setupTabFunctionality();
    
    console.log('STEP 7: Calling setupQRModal()');
    setupQRModal();
    
    console.log('=== Navigation Initialization Complete ===');
}

/**
 * Initialize mobile menu (hamburger)
 */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const mainNav = document.querySelector('.main-nav');

    if (!hamburger || !mainNav) {
        console.warn('Hamburger or mainNav not found');
        return;
    }

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = mainNav.classList.contains('active');
        
        if (isActive) {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            mainNav.classList.add('active');
            hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        console.log('Menu toggled:', !isActive);
    });

    // Close menu when clicking on a nav link
    const navLinks = mainNav.querySelectorAll('a:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-nav') && !e.target.closest('.hamburger-menu')) {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Reset menu on window resize to tablet+
    window.addEventListener('resize', debounce(function() {
        if (window.innerWidth >= 768) {
            mainNav.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250));
}

/**
 * Setup dropdown menus
 */
function setupDropdowns() {
    try {
        console.log('=== Setting up dropdowns ===');
        const dropdowns = document.querySelectorAll('.dropdown');
        console.log('✓ Found ' + dropdowns.length + ' dropdowns');
        
        if (dropdowns.length === 0) {
            console.error('ERROR: No dropdowns found!');
            return;
        }
        
        // Log each dropdown structure
        dropdowns.forEach((dropdown, idx) => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            console.log(`  Dropdown #${idx}:`, {
                toggle: toggle ? toggle.textContent.trim().substring(0, 30) : '❌ NO TOGGLE',
                menu: menu ? `✓ ${menu.children.length} items` : '❌ NO MENU',
                html: dropdown.innerHTML.substring(0, 100)
            });
        });

        dropdowns.forEach((dropdown, index) => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!toggle || !menu) {
                console.error(`❌ Dropdown ${index} invalid - toggle: ${!!toggle}, menu: ${!!menu}`);
                return;
            }

            // Direct click on toggle
            toggle.addEventListener('click', function(e) {
                console.log(`▶ Click on "${toggle.textContent.trim().substring(0, 20)}" - screen width: ${window.innerWidth}`);
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('  → Mobile mode, toggling dropdown');
                    handleDropdownToggle(dropdown, menu);
                } else {
                    console.log('  → Desktop mode, ignoring');
                }
            });
            
            // Click anywhere on dropdown li
            dropdown.addEventListener('click', function(e) {
                const clickedToggle = e.target.closest('.dropdown-toggle');
                if (clickedToggle && window.innerWidth < 768) {
                    console.log('▶ Dropdown click delegation triggered');
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropdownToggle(dropdown, menu);
                }
            });

            // Desktop: hover
            if (window.innerWidth >= 768) {
                dropdown.addEventListener('mouseenter', () => {
                    menu.classList.add('active');
                    dropdown.classList.add('active');
                });

                dropdown.addEventListener('mouseleave', () => {
                    menu.classList.remove('active');
                    dropdown.classList.remove('active');
                });
            }
        });

        // Close all dropdowns when clicking menu items
        const menuLinks = document.querySelectorAll('.dropdown-menu a');
        console.log('✓ Found ' + menuLinks.length + ' menu links');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                console.log('▶ Menu link clicked:', link.textContent.trim());
                
                document.querySelectorAll('.dropdown').forEach(d => {
                    d.classList.remove('active');
                    const m = d.querySelector('.dropdown-menu');
                    if (m) m.classList.remove('active');
                });
                
                if (window.innerWidth < 768) {
                    const mainNav = document.querySelector('.main-nav');
                    const hamburger = document.getElementById('hamburgerMenu');
                    if (mainNav) mainNav.classList.remove('active');
                    if (hamburger) hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        console.log('✓ Dropdowns setup complete');
    } catch (err) {
        console.error('❌ ERROR in setupDropdowns:', err);
    }
}

/**
 * Helper to handle dropdown toggle
 */
function handleDropdownToggle(dropdown, menu) {
    console.log('┌─ Dropdown toggle handler');
    console.log('  Current classList.toggle state:');
    console.log('    dropdown.classList:', Array.from(dropdown.classList));
    console.log('    menu.classList:', Array.from(menu.classList));
    
    // Close other dropdowns
    const others = document.querySelectorAll('.dropdown.active');
    if (others.length > 0) {
        others.forEach(other => {
            if (other !== dropdown) {
                console.log('  Closing sibling dropdown');
                other.classList.remove('active');
                const m = other.querySelector('.dropdown-menu');
                if (m) m.classList.remove('active');
            }
        });
    }
    
    // Toggle current
    const wasActive = dropdown.classList.contains('active');
    console.log('  Will toggle: ' + (wasActive ? 'CLOSE' : 'OPEN'));
    
    dropdown.classList.toggle('active');
    menu.classList.toggle('active');
    
    console.log('  After toggle:');
    console.log('    dropdown.active:', dropdown.classList.contains('active'));
    console.log('    menu.active:', menu.classList.contains('active'));
    console.log('    dropdown.classList:', Array.from(dropdown.classList));
    console.log('    menu.classList:', Array.from(menu.classList));
    console.log('    menu.style.display:', window.getComputedStyle(menu).display);
    console.log('└─ Toggle done');
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