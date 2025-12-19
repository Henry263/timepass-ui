// /**
//  * Phone Screen Carousel - Home Page
//  * Rotates through multiple card design screenshots every 2 seconds
//  * File: phone-carousel.js
//  */

// (function() {
//     'use strict';

//     // Configuration
//     const CAROUSEL_CONFIG = {
//         interval: 2000, // 2 seconds
//         transitionDuration: 500, // 0.5 seconds (matches CSS transition)
//         images: [
//             '../image/sample-design-branding-1.png',
//             '../image/sample-design-branding-2.png',
//             '../image/sample-design-branding-3.png',
//             '../image/sample-design-branding-4.png'
//         ]
//     };

//     let currentIndex = 0;
//     let carouselInterval = null;
//     let phoneScreens = [];

//     /**
//      * Initialize the phone carousel
//      */
//     function initPhoneCarousel() {
//         const phoneFrame = document.querySelector('.phone-frame');
        
//         if (!phoneFrame) {
//             console.warn('Phone frame not found. Carousel not initialized.');
//             return;
//         }

//         // Clear existing content
//         phoneFrame.innerHTML = '';

//         // Create img elements for each card design
//         CAROUSEL_CONFIG.images.forEach((imageSrc, index) => {
//             const img = document.createElement('img');
//             img.src = imageSrc;
//             img.alt = `Digital Card Design ${index + 1}`;
//             img.className = 'phone-screen';
            
//             // Set first image as active
//             if (index === 0) {
//                 img.classList.add('active');
//             }

//             phoneFrame.appendChild(img);
//             phoneScreens.push(img);
//         });

//         // Add QR float icon
//         // const qrFloat = document.createElement('div');
//         // qrFloat.className = 'qr-float';
//         // qrFloat.innerHTML = '<i class="fas fa-qrcode"></i>';
//         // phoneFrame.appendChild(qrFloat);

//         // Start the carousel
//         startCarousel();

//         console.log('Phone screen carousel initialized with', phoneScreens.length, 'images');
//     }

//     /**
//      * Show next screen in carousel
//      */
//     function showNextScreen() {
//         // Remove active class from current screen
//         phoneScreens[currentIndex].classList.remove('active');

//         // Move to next index (loop back to 0 after last image)
//         currentIndex = (currentIndex + 1) % phoneScreens.length;

//         // Add active class to new current screen
//         phoneScreens[currentIndex].classList.add('active');
//     }

//     /**
//      * Start the carousel rotation
//      */
//     function startCarousel() {
//         if (carouselInterval) {
//             clearInterval(carouselInterval);
//         }

//         carouselInterval = setInterval(showNextScreen, CAROUSEL_CONFIG.interval);
//     }

//     /**
//      * Stop the carousel rotation
//      */
//     function stopCarousel() {
//         if (carouselInterval) {
//             clearInterval(carouselInterval);
//             carouselInterval = null;
//         }
//     }

//     /**
//      * Reset carousel to first image
//      */
//     function resetCarousel() {
//         stopCarousel();
        
//         // Remove active class from all
//         phoneScreens.forEach(screen => screen.classList.remove('active'));
        
//         // Set first as active
//         currentIndex = 0;
//         if (phoneScreens.length > 0) {
//             phoneScreens[0].classList.add('active');
//         }
        
//         startCarousel();
//     }

//     /**
//      * Handle page visibility change
//      * Pause carousel when page is hidden, resume when visible
//      */
//     function handleVisibilityChange() {
//         if (document.hidden) {
//             stopCarousel();
//         } else {
//             startCarousel();
//         }
//     }

//     /**
//      * Clean up carousel on page unload
//      */
//     function cleanup() {
//         stopCarousel();
//         phoneScreens = [];
//         currentIndex = 0;
//     }

//     // Initialize when DOM is ready
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', initPhoneCarousel);
//     } else {
//         // DOM already loaded
//         initPhoneCarousel();
//     }

//     // Handle page visibility changes
//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     // Cleanup on page unload
//     window.addEventListener('beforeunload', cleanup);

//     // Export functions for external control (if needed)
//     window.PhoneCarousel = {
//         start: startCarousel,
//         stop: stopCarousel,
//         reset: resetCarousel,
//         next: showNextScreen,
//         getCurrentIndex: () => currentIndex,
//         getTotalImages: () => phoneScreens.length
//     };

// })();

/**
 * Phone Screen Carousel Module
 * Rotates through multiple card design screenshots every 2 seconds
 * File: modules/phone-carousel.js
 */


//             '../image/sample-design-branding-1.png',
//             '../image/sample-design-branding-2.png',
//             '../image/sample-design-branding-3.png',
//             '../image/sample-design-branding-4.png'

class PhoneCarousel {
    constructor(config = {}) {
        // Configuration
        this.config = {
            interval: config.interval || 2000, // 2 seconds
            transitionDuration: config.transitionDuration || 500, // 0.5 seconds
            images: config.images || [
                '../image/sample-design-branding-1.png',
                '../image/sample-design-branding-4.png',
                '../image/sample-design-branding-2.png',
                '../image/sample-design-branding-3.png'
            ],
            selector: config.selector || '.phone-frame'
        };

        this.currentIndex = 0;
        this.carouselInterval = null;
        this.phoneScreens = [];
        this.phoneFrame = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the phone carousel
     */
    init() {
        // Prevent double initialization
        if (this.isInitialized) {
            console.warn('PhoneCarousel: Already initialized');
            return;
        }

        this.phoneFrame = document.querySelector(this.config.selector);
        
        if (!this.phoneFrame) {
            console.warn(`PhoneCarousel: Element "${this.config.selector}" not found`);
            return;
        }

        // Clear existing content
        this.phoneFrame.innerHTML = '';

        // Create img elements for each card design
        this.config.images.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `Digital Card Design ${index + 1}`;
            img.className = 'phone-screen';
            
            // Set first image as active
            if (index === 0) {
                img.classList.add('active');
            }

            this.phoneFrame.appendChild(img);
            this.phoneScreens.push(img);
        });

        // // Add QR float icon
        // const qrFloat = document.createElement('div');
        // qrFloat.className = 'qr-float';
        // qrFloat.innerHTML = '<i class="fas fa-qrcode"></i>';
        // this.phoneFrame.appendChild(qrFloat);

        // Setup event listeners
        this.setupEventListeners();

        // Start the carousel
        this.start();

        this.isInitialized = true;
        console.log('✅ PhoneCarousel initialized with', this.phoneScreens.length, 'images');
    }

    /**
     * Show next screen in carousel
     */
    showNext() {
        if (this.phoneScreens.length === 0) return;

        // Remove active class from current screen
        this.phoneScreens[this.currentIndex].classList.remove('active');

        // Move to next index (loop back to 0 after last image)
        this.currentIndex = (this.currentIndex + 1) % this.phoneScreens.length;

        // Add active class to new current screen
        this.phoneScreens[this.currentIndex].classList.add('active');
    }

    /**
     * Show previous screen in carousel
     */
    showPrevious() {
        if (this.phoneScreens.length === 0) return;

        // Remove active class from current screen
        this.phoneScreens[this.currentIndex].classList.remove('active');

        // Move to previous index (loop to end if at beginning)
        this.currentIndex = this.currentIndex === 0 
            ? this.phoneScreens.length - 1 
            : this.currentIndex - 1;

        // Add active class to new current screen
        this.phoneScreens[this.currentIndex].classList.add('active');
    }

    /**
     * Go to specific image index
     */
    goToIndex(index) {
        if (index < 0 || index >= this.phoneScreens.length) {
            console.warn('PhoneCarousel: Invalid index', index);
            return;
        }

        if (this.phoneScreens.length === 0) return;

        // Remove active class from current screen
        this.phoneScreens[this.currentIndex].classList.remove('active');

        // Set new index
        this.currentIndex = index;

        // Add active class to new current screen
        this.phoneScreens[this.currentIndex].classList.add('active');
    }

    /**
     * Start the carousel rotation
     */
    start() {
        if (this.carouselInterval) {
            this.stop();
        }

        this.carouselInterval = setInterval(() => {
            this.showNext();
        }, this.config.interval);

        console.log('PhoneCarousel: Started');
    }

    /**
     * Stop the carousel rotation
     */
    stop() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
            this.carouselInterval = null;
            console.log('PhoneCarousel: Stopped');
        }
    }

    /**
     * Reset carousel to first image
     */
    reset() {
        this.stop();
        
        // Remove active class from all
        this.phoneScreens.forEach(screen => screen.classList.remove('active'));
        
        // Set first as active
        this.currentIndex = 0;
        if (this.phoneScreens.length > 0) {
            this.phoneScreens[0].classList.add('active');
        }
        
        this.start();
        console.log('PhoneCarousel: Reset to first image');
    }

    /**
     * Update carousel configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Restart with new config if already running
        if (this.carouselInterval) {
            this.stop();
            this.start();
        }
        
        console.log('PhoneCarousel: Config updated', this.config);
    }

    /**
     * Setup event listeners for page visibility and cleanup
     */
    setupEventListeners() {
        // Handle page visibility change
        // Pause carousel when page is hidden, resume when visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
    }

    /**
     * Destroy carousel and cleanup
     */
    destroy() {
        this.stop();
        
        // Remove all event listeners if needed
        // (note: visibilitychange and beforeunload listeners remain as they're document/window level)
        
        this.phoneScreens = [];
        this.currentIndex = 0;
        this.phoneFrame = null;
        this.isInitialized = false;
        
        console.log('PhoneCarousel: Destroyed');
    }

    /**
     * Get current state
     */
    getState() {
        return {
            currentIndex: this.currentIndex,
            totalImages: this.phoneScreens.length,
            isRunning: this.carouselInterval !== null,
            isInitialized: this.isInitialized,
            config: { ...this.config }
        };
    }
}

// Create singleton instance
const phoneCarousel = new PhoneCarousel();

// Export for ES6 modules
export default phoneCarousel;

// Also export the class for custom instances
export { PhoneCarousel };

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.PhoneCarousel = phoneCarousel;
}