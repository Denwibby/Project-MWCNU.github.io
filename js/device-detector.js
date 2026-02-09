/**
 * Device Detector - Deteksi otomatis mobile vs desktop
 * Menambahkan class ke body berdasarkan tipe device
 */

(function() {
    'use strict';

    // Deteksi device berdasarkan user agent dan screen size
    const DeviceDetector = {
        // Cek apakah mobile berdasarkan user agent
        isMobileUA: function() {
            const mobileKeywords = [
                'Android', 'webOS', 'iPhone', 'iPad', 'iPod', 
                'BlackBerry', 'Windows Phone', 'Opera Mini', 
                'IEMobile', 'Mobile', 'mobile'
            ];
            const ua = navigator.userAgent;
            return mobileKeywords.some(keyword => ua.includes(keyword));
        },

        // Cek apakah mobile berdasarkan screen width
        isMobileScreen: function() {
            return window.innerWidth <= 767;
        },

        // Cek apakah tablet
        isTablet: function() {
            const ua = navigator.userAgent;
            const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet|PlayBook/i.test(ua);
            const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
            return isTabletUA || isTabletSize;
        },

        // Cek apakah touch device
        isTouchDevice: function() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        // Get device type
        getDeviceType: function() {
            if (this.isTablet()) {
                return 'tablet';
            } else if (this.isMobileUA() || this.isMobileScreen()) {
                return 'mobile';
            } else {
                return 'desktop';
            }
        },

        // Get orientation
        getOrientation: function() {
            if (window.innerWidth > window.innerHeight) {
                return 'landscape';
            } else {
                return 'portrait';
            }
        },

        // Apply classes to body
        applyDeviceClasses: function() {
            const body = document.body;
            const deviceType = this.getDeviceType();
            const orientation = this.getOrientation();

            // Remove existing classes
            body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
            body.classList.remove('orientation-landscape', 'orientation-portrait');
            body.classList.remove('touch-device', 'no-touch');

            // Add device type class
            body.classList.add(`device-${deviceType}`);

            // Add orientation class
            body.classList.add(`orientation-${orientation}`);

            // Add touch/no-touch class
            if (this.isTouchDevice()) {
                body.classList.add('touch-device');
            } else {
                body.classList.add('no-touch');
            }

            // Set data attribute for CSS queries
            body.setAttribute('data-device', deviceType);
            body.setAttribute('data-orientation', orientation);

            // Log untuk debugging
            console.log(`[DeviceDetector] Device: ${deviceType}, Orientation: ${orientation}, Touch: ${this.isTouchDevice()}`);
        },

        // Initialize
        init: function() {
            // Apply classes on load
            this.applyDeviceClasses();

            // Update on resize
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.applyDeviceClasses();
                }, 250);
            });

            // Update on orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.applyDeviceClasses();
                }, 100);
            });

            console.log('[DeviceDetector] Initialized');
        }
    };

    // Expose to global scope
    window.DeviceDetector = DeviceDetector;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DeviceDetector.init());
    } else {
        DeviceDetector.init();
    }
})();
