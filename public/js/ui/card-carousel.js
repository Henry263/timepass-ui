// modules/card-carousel.js
// Card Carousel Management for Display Page - Enhanced with Mobile Detection

import { initializeFormBuilder } from '../modules/formBuilder.js';

class CardCarousel {
    constructor() {
        this.currentIndex = 0;
        this.allCards = [
            'default-card',
            'digital-card', 
            'design-card',
            'lead-form'
        ];
        this.cards = [...this.allCards]; // Will be filtered based on device
        this.initialized = false;
        this.isMobileDevice = this.detectMobileDevice();
        this.isTabletOrDesktop = this.detectTabletOrDesktop();
    }

    init() {
        if (this.initialized) return;

        this.setupResponsiveTabs();
        this.setupEventListeners();
        this.setupOrientationDetection();
        this.showCard(0);
        this.initialized = true;
        
        console.log('Card Carousel initialized', {
            isMobile: this.isMobileDevice,
            isTabletOrDesktop: this.isTabletOrDesktop,
            availableTabs: this.cards.length
        });
    }

    /**
     * Detect if device is mobile (phone)
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Check user agent for mobile devices
        const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        // Check for iPad specifically (often behaves more like desktop)
        const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Check screen size (phones typically have smaller screens)
        const hasSmallScreen = window.screen.width <= 768 || window.screen.height <= 768;
        
        // Consider it mobile if it matches mobile UA and has small screen, but exclude iPads
        return (isMobileUA || hasSmallScreen) && !isIPad;
    }

    /**
     * Detect if device is tablet or desktop with adequate screen size
     */
    detectTabletOrDesktop() {
        const screenWidth = window.screen.width;
        const windowWidth = window.innerWidth;
        
        // Check if screen width is adequate for Lead Form functionality
        const hasAdequateWidth = screenWidth >= 900 || windowWidth >= 900;
        
        // Not a phone AND has adequate width
        return !this.isMobileDevice && hasAdequateWidth;
    }

    /**
     * Setup responsive tabs based on device capabilities
     */
    setupResponsiveTabs() {
        if (this.isMobileDevice || !this.isTabletOrDesktop) {
            // Remove lead-form from available cards for mobile devices
            this.cards = this.allCards.filter(card => card !== 'lead-form');
            this.hideLeadFormTab();
            this.showMobileLeadFormMessage();
        } else {
            // Desktop/tablet: show all tabs
            this.cards = [...this.allCards];
            this.showLeadFormTab();
            this.hideMobileLeadFormMessage();
        }
        
        console.log(`Device detection: Mobile=${this.isMobileDevice}, TabletOrDesktop=${this.isTabletOrDesktop}, Cards=${this.cards.length}`);
    }

    /**
     * Hide the Lead Form tab
     */
    hideLeadFormTab() {
        const leadFormTab = document.querySelector('[data-card="lead-form"]');
        if (leadFormTab) {
            leadFormTab.style.display = 'none';
            leadFormTab.classList.remove('active');
        }
    }

    /**
     * Show the Lead Form tab
     */
    showLeadFormTab() {
        const leadFormTab = document.querySelector('[data-card="lead-form"]');
        if (leadFormTab) {
            leadFormTab.style.display = '';
        }
    }

    /**
     * Show mobile-specific message for Lead Form
     */
    showMobileLeadFormMessage() {
        // Check if message container already exists
        let messageContainer = document.getElementById('mobile-leadform-message');
        
        if (!messageContainer) {
            // Create message container
            messageContainer = document.createElement('div');
            messageContainer.id = 'mobile-leadform-message';
            messageContainer.className = 'mobile-leadform-notice';
            messageContainer.innerHTML = `
                <div class="mobile-notice-content">
                    <div class="notice-icon">
                        <i class="fas fa-tablet-alt"></i>
                    </div>
                    <h3>Lead Form Builder</h3>
                    <p>The Lead Form feature is available on tablets and desktop browsers with screen width greater than 900px for optimal experience.</p>
                    <div class="notice-details">
                        <div class="detail-item">
                            <i class="fas fa-desktop"></i>
                            <span>Desktop Browsers</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tablet-alt"></i>
                            <span>Tablet Devices</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-ruler-horizontal"></i>
                            <span>Min. Width: 900px</span>
                        </div>
                    </div>
                    <div class="current-device-info">
                        <small>Current screen: ${window.innerWidth}px × ${window.innerHeight}px</small>
                    </div>
                </div>
            `;

            // Insert after the tab buttons
            const tabContainer = document.querySelector('.card-view-tabs');
            if (tabContainer && tabContainer.parentNode) {
                tabContainer.parentNode.insertBefore(messageContainer, tabContainer.nextSibling);
            }
        }

        messageContainer.style.display = 'block';
    }

    /**
     * Hide mobile-specific message for Lead Form
     */
    hideMobileLeadFormMessage() {
        const messageContainer = document.getElementById('mobile-leadform-message');
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }

    /**
     * Check if current environment supports Lead Form
     */
    supportsLeadForm() {
        return this.isTabletOrDesktop && !this.isMobileDevice;
    }

    setupEventListeners() {


        $(document).on('click', '[data-action="close-leadform-modal"]', (e) => {
            e.preventDefault();
            $('.lead-form-unsupported-modal').remove();
        });

        // ✅ ADD: Close modal when clicking backdrop
        $(document).on('click', '.lead-form-unsupported-modal .modal-backdrop', (e) => {
            $('.lead-form-unsupported-modal').remove();
        });

        // ✅ ADD: Close modal with Escape key
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape' && document.querySelector('.lead-form-unsupported-modal')) {
                $('.lead-form-unsupported-modal').remove();
            }
        });
        // Tab buttons
        const tabs = document.querySelectorAll('.card-tab');
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                const cardType = tab.dataset.card;
                
                // Check if trying to access lead-form on unsupported device
                if (cardType === 'lead-form' && !this.supportsLeadForm()) {
                    this.showLeadFormUnsupportedMessage();
                    return;
                }
                
                // Find the index in the filtered cards array
                const cardIndex = this.cards.indexOf(cardType);
                if (cardIndex !== -1) {
                    this.showCard(cardIndex);
                }
            });
        });

        // Carousel navigation buttons
        const leftNav = document.querySelector('.carousel-nav-left');
        const rightNav = document.querySelector('.carousel-nav-right');

        if (leftNav) {
            leftNav.addEventListener('click', () => {
                this.navigateLeft();
            });
        }

        if (rightNav) {
            rightNav.addEventListener('click', () => {
                this.navigateRight();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('displayPage').classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    this.navigateLeft();
                } else if (e.key === 'ArrowRight') {
                    this.navigateRight();
                }
            }
        });

        // Touch swipe support
        this.setupTouchSwipe();

        // Window resize handler for responsive behavior
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));
    }

    /**
     * Handle window resize for responsive behavior
     */
    handleWindowResize() {
        const wasTabletOrDesktop = this.isTabletOrDesktop;
        this.isTabletOrDesktop = this.detectTabletOrDesktop();
        
        // If support status changed, update tabs
        if (wasTabletOrDesktop !== this.isTabletOrDesktop) {
            console.log('Device support changed, updating tabs...');
            this.setupResponsiveTabs();
            
            // If currently on lead-form tab and it's now unsupported, switch to first tab
            if (this.getCurrentCard() === 'lead-form' && !this.supportsLeadForm()) {
                this.showCard(0);
            }
        }
    }

    /**
     * Show unsupported device message for Lead Form
     */

    showLeadFormUnsupportedMessage() {
    // Remove any existing modals first
    document.querySelectorAll('.lead-form-unsupported-modal').forEach(modal => modal.remove());
    
    const modalHTML = `
            <div class="lead-form-unsupported-modal" data-modal="leadform-unsupported">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-icon">📱➡️💻</div>
                    <h3>Desktop/Tablet Required</h3>
                    <p>Lead Form Builder requires a desktop browser or tablet with minimum width of 900px for optimal experience.</p>
                    <div class="modal-actions">
                        <button class="btn-primary close-modal" data-action="close-leadform-modal">
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // showLeadFormUnsupportedMessage() {
    //     // Create or update modal/notification
    //     const notification = `
    //         <div class="lead-form-unsupported-modal" style="
    //             position: fixed;
    //             top: 0;
    //             left: 0;
    //             width: 100%;
    //             height: 100%;
    //             background: rgba(0,0,0,0.8);
    //             display: flex;
    //             align-items: center;
    //             justify-content: center;
    //             z-index: 10000;
    //         ">
    //             <div style="
    //                 background: white;
    //                 padding: 30px;
    //                 border-radius: 12px;
    //                 text-align: center;
    //                 max-width: 400px;
    //                 margin: 20px;
    //                 box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    //             ">
    //                 <div style="font-size: 48px; margin-bottom: 20px;">📱➡️💻</div>
    //                 <h3 style="margin-bottom: 15px; color: #333;">Desktop/Tablet Required</h3>
    //                 <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">
    //                     Lead Form Builder requires a desktop browser or tablet with minimum width of 900px for optimal experience.
    //                 </p>
    //                 <button onclick="this.parentElement.parentElement.remove()" style="
    //                     background: #007bff;
    //                     color: white;
    //                     border: none;
    //                     padding: 10px 20px;
    //                     border-radius: 6px;
    //                     cursor: pointer;
    //                     font-size: 16px;
    //                 ">Got it</button>
    //             </div>
    //         </div>
    //     `;
        
    //     document.body.insertAdjacentHTML('beforeend', notification);
    // }

    setupTouchSwipe() {
        const wrapper = document.querySelector('.card-carousel-wrapper');
        if (!wrapper) return;
    
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartElement = null;
    
        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartElement = e.target;
        }, { passive: true });
    
        wrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            
            // List of elements/classes to ignore for swipe gestures
            const ignoreSelectors = [
                '.slider-area',
                'input[type="range"]',
                '.qr-opacity-slider',
                '#sizeSlider'
            ];
            
            // Check if touch started on any ignored element
            const shouldIgnore = touchStartElement && ignoreSelectors.some(selector => 
                touchStartElement.closest(selector) || touchStartElement.matches(selector)
            );
            
            // Only handle swipe if it didn't start on an ignored element
            if (!shouldIgnore) {
                this.handleSwipe(touchStartX, touchEndX);
            }
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const difference = startX - endX;

        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                // Swipe left - go to next
                this.navigateRight();
            } else {
                // Swipe right - go to previous
                this.navigateLeft();
            }
        }
    }

    showCard(index) {
        if (index < 0 || index >= this.cards.length) return;

        this.currentIndex = index;
        const currentCard = this.cards[index];

        // Update tabs - only show active state for available tabs
        const tabs = document.querySelectorAll('.card-tab');
        tabs.forEach(tab => {
            const cardType = tab.dataset.card;
            if (cardType === currentCard && this.cards.includes(cardType)) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update carousel cards
        const carouselCards = document.querySelectorAll('.carousel-card');
        carouselCards.forEach(card => {
            const cardId = card.id.replace('-view', '');
            if (cardId === currentCard) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Check orientation if switching to online profile view
        if (currentCard === 'online-profile') {
            this.checkOrientation();
        }

        // Initialize form builder when shown (only on supported devices)
        if (currentCard === 'lead-form' && this.supportsLeadForm()) {
            console.log('📝 Form Builder tab shown - initializing...');
            try {
                initializeFormBuilder();
            } catch (error) {
                console.error('❌ Failed to initialize form builder:', error);
            }
        }

        // Update navigation button states
        this.updateNavigationButtons();

        console.log(`Switched to card: ${currentCard} (index: ${index})`);
    }

    navigateLeft() {
        if (this.currentIndex > 0) {
            this.showCard(this.currentIndex - 1);
        } else {
            // Wrap around to last card
            this.showCard(this.cards.length - 1);
        }
    }

    navigateRight() {
        if (this.currentIndex < this.cards.length - 1) {
            this.showCard(this.currentIndex + 1);
        } else {
            // Wrap around to first card
            this.showCard(0);
        }
    }

    updateNavigationButtons() {
        const leftNav = document.querySelector('.carousel-nav-left');
        const rightNav = document.querySelector('.carousel-nav-right');

        // Always enable buttons for wrapping behavior
        if (leftNav) leftNav.style.opacity = '1';
        if (rightNav) rightNav.style.opacity = '1';
    }

    goToCard(cardName) {
        // Check if card is available on current device
        if (!this.cards.includes(cardName)) {
            console.warn(`Card "${cardName}" not available on this device`);
            if (cardName === 'lead-form') {
                this.showLeadFormUnsupportedMessage();
            }
            return false;
        }

        const index = this.cards.indexOf(cardName);
        if (index !== -1) {
            this.showCard(index);
            return true;
        }
        return false;
    }

    getCurrentCard() {
        return this.cards[this.currentIndex];
    }

    /**
     * Get device information for debugging
     */
    getDeviceInfo() {
        return {
            isMobile: this.isMobileDevice,
            isTabletOrDesktop: this.isTabletOrDesktop,
            supportsLeadForm: this.supportsLeadForm(),
            screenSize: `${window.screen.width}x${window.screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent,
            availableCards: this.cards,
            currentCard: this.getCurrentCard()
        };
    }

    setupOrientationDetection() {
        // Check orientation on page load
        this.checkOrientation();
    
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
    
        // Also listen to resize events
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
    }
    
    checkOrientation() {
        // Check if it's a mobile device by checking the smaller dimension
        // This works for both portrait and landscape orientations
        const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
        const isMobile = smallerDimension <= 768;
        
        if (!isMobile) {
            this.hideOrientationWarning();
            return;
        }

        // Check if online profile view is active
        const onlineProfileView = document.getElementById('online-profile-view');
        if (!onlineProfileView || !onlineProfileView.classList.contains('active')) {
            return;
        }

        // Check orientation
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape) {
            this.showOrientationWarning();
        } else {
            this.hideOrientationWarning();
        }
    }
    
    showOrientationWarning() {
        const warning = document.getElementById('landscapeWarning');
        const content = document.getElementById('user-facing-dc-card');
        const title = document.querySelector('#online-profile-view .carousel-card-title');
        
        if (warning) warning.style.display = 'flex';
        if (content) content.style.display = 'none';
        if (title) title.style.display = 'none';
    }
    
    hideOrientationWarning() {
        const warning = document.getElementById('landscapeWarning');
        const content = document.getElementById('user-facing-dc-card');
        const title = document.querySelector('#online-profile-view .carousel-card-title');
        
        if (warning) warning.style.display = 'none';
        if (content) content.style.display = '';
        if (title) title.style.display = '';
    }

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Keep existing functions for backward compatibility
const child = document.getElementById('card-view-tabs-buttons');
const parent = document.getElementById('displayPage');

export function updateFixedWidth() {
    if (document.getElementById('displayPage').classList.contains('active')) {
        const rect = parent.getBoundingClientRect();
        child.style.left = rect.left + 'px';
        child.style.width = rect.width + 'px';
        $("#card-view-tabs-buttons").show();
    }
}

function getMobileOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let returnvar = false;
    if (/android/i.test(userAgent)) {
        returnvar = true;
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        returnvar = true;
    }
    return returnvar;
}

// Debounce function to limit resize/scroll calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedUpdateWidth = debounce(function() {
    updateFixedWidth();
}, 150);

document.addEventListener("DOMContentLoaded", async function () {
    setTimeout(() => {
        updateFixedWidth();
    }, 1000);
});

$(document).ready(function () {
    setTimeout(() => {
        updateFixedWidth();
    }, 500);
});

// Use debounced version for resize/orientation
$(window).on("orientationchange resize", optimizedUpdateWidth);

// For scroll events, use passive listeners for better performance
window.addEventListener('scroll', updateFixedWidth, { passive: true });
window.addEventListener('resize', updateFixedWidth);

// Add this to prevent scroll restoration on page navigation
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

/* ============================================
   ADDITIONAL OPTIMIZATIONS
   ============================================ */

// Optimize touch events for mobile
function optimizeMobileTouch() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Prevent double-tap zoom on specific elements
        const preventDoubleTap = (element) => {
            let lastTap = 0;
            element.addEventListener('touchend', function(e) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 500 && tapLength > 0) {
                    e.preventDefault();
                }
                lastTap = currentTime;
            }, { passive: false });
        };
        
        // Apply to buttons and tabs
        document.querySelectorAll('.card-tab, .btn, button').forEach(preventDoubleTap);
    }
}

// Call optimization on page load
$(document).ready(optimizeMobileTouch);

/* ============================================
   FIX FOR iOS SAFARI SCROLL BOUNCE
   ============================================ */

function preventScrollBounce() {
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        const element = e.target;
        const currentY = e.touches[0].pageY;
        
        // Only prevent if not in a scrollable container
        if (!element.closest('.modal-body, .mobile-menu, .card-view-tabs')) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            
            // Prevent overscroll at top
            if (scrollTop === 0 && currentY > startY) {
                e.preventDefault();
            }
            
            // Prevent overscroll at bottom
            if (scrollTop + clientHeight >= scrollHeight && currentY < startY) {
                e.preventDefault();
            }
        }
    }, { passive: false });
}

// Apply scroll bounce prevention
if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // preventScrollBounce();
}

/* ============================================
   SMOOTH SCROLL TO TOP FOR CARD CAROUSEL
   ============================================ */

// Add this function to smoothly scroll to top when needed
function smoothScrollToTop(offset = 0) {
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
    } else {
        // Fallback for browsers that don't support smooth scroll
        window.scrollTo(0, offset);
    }
}

/* ============================================
   VIEWPORT HEIGHT FIX FOR MOBILE BROWSERS
   ============================================ */

function setMobileViewportHeight() {
    // Fix for mobile browsers where 100vh includes the address bar
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set on load and resize
window.addEventListener('load', setMobileViewportHeight);

// Create and export singleton instance
const cardCarousel = new CardCarousel();

// Make it globally accessible with enhanced API
window.cardCarousel = cardCarousel;

// Enhanced global API for debugging and testing
window.cardCarouselInfo = () => cardCarousel.getDeviceInfo();

export default cardCarousel;

// // modules/card-carousel.js
// // Card Carousel Management for Display Page
// //  'online-profile',

// import { initializeFormBuilder } from '../modules/formBuilder.js';

// class CardCarousel {
//     constructor() {
//         this.currentIndex = 0;
//         this.cards = [
//             'default-card',
//             'digital-card',
//             'design-card',
//             'lead-form'
//         ];
//         this.initialized = false;
//     }

//     init() {
//         if (this.initialized) return;

//         this.setupEventListeners();
//         this.setupOrientationDetection();
//         this.showCard(0);
//         this.initialized = true;
//         // console.log('Card Carousel initialized');
//     }

//     setupEventListeners() {
//         // Tab buttons
//         const tabs = document.querySelectorAll('.card-tab');
//         tabs.forEach((tab, index) => {
//             tab.addEventListener('click', () => {
//                 this.showCard(index);
//             });
//         });

//         // Carousel navigation buttons
//         const leftNav = document.querySelector('.carousel-nav-left');
//         const rightNav = document.querySelector('.carousel-nav-right');

//         if (leftNav) {
//             leftNav.addEventListener('click', () => {
//                 this.navigateLeft();
//             });
//         }

//         if (rightNav) {
//             rightNav.addEventListener('click', () => {
//                 this.navigateRight();
//             });
//         }

//         // Keyboard navigation
//         document.addEventListener('keydown', (e) => {
//             if (document.getElementById('displayPage').classList.contains('active')) {
//                 if (e.key === 'ArrowLeft') {
//                     this.navigateLeft();
//                 } else if (e.key === 'ArrowRight') {
//                     this.navigateRight();
//                 }
//             }
//         });

//         // Touch swipe support
//         this.setupTouchSwipe();
//     }


//     setupTouchSwipe() {
//         const wrapper = document.querySelector('.card-carousel-wrapper');
//         if (!wrapper) return;
    
//         let touchStartX = 0;
//         let touchEndX = 0;
//         let touchStartElement = null;
    
//         wrapper.addEventListener('touchstart', (e) => {
//             touchStartX = e.changedTouches[0].screenX;
//             touchStartElement = e.target;
//         }, { passive: true });
    
//         wrapper.addEventListener('touchend', (e) => {
//             touchEndX = e.changedTouches[0].screenX;
            
//             // List of elements/classes to ignore for swipe gestures
//             const ignoreSelectors = [
//                 '.slider-area',
//                 'input[type="range"]',
//                 '.qr-opacity-slider',
//                 '#sizeSlider'
//             ];
            
//             // Check if touch started on any ignored element
//             const shouldIgnore = touchStartElement && ignoreSelectors.some(selector => 
//                 touchStartElement.closest(selector) || touchStartElement.matches(selector)
//             );
            
//             // Only handle swipe if it didn't start on an ignored element
//             if (!shouldIgnore) {
//                 this.handleSwipe(touchStartX, touchEndX);
//             }
//         }, { passive: true });
//     }

//     handleSwipe(startX, endX) {
//         const swipeThreshold = 50;
//         const difference = startX - endX;

//         if (Math.abs(difference) > swipeThreshold) {
//             if (difference > 0) {
//                 // Swipe left - go to next
//                 this.navigateRight();
//             } else {
//                 // Swipe right - go to previous
//                 this.navigateLeft();
//             }
//         }
//     }

//     showCard(index) {
//         if (index < 0 || index >= this.cards.length) return;

//         this.currentIndex = index;

//         // Update tabs
//         const tabs = document.querySelectorAll('.card-tab');
//         tabs.forEach((tab, i) => {
//             if (i === index) {
//                 tab.classList.add('active');
//             } else {
//                 tab.classList.remove('active');
//             }
//         });

//         // Update carousel cards
//         const carouselCards = document.querySelectorAll('.carousel-card');
//         carouselCards.forEach((card, i) => {
//             if (i === index) {
//                 card.classList.add('active');
//             } else {
//                 card.classList.remove('active');
//             }
//         });
//         // Check orientation if switching to online profile view
//         if (this.cards[index] === 'online-profile') {
//             this.checkOrientation(); // ← NEW
//         }

//         // ✅ ADD THIS: Initialize form builder when shown
//         if (this.cards[index] === 'lead-form') {
//             console.log('📝 Form Builder tab shown - initializing...');
//             try {
//                 initializeFormBuilder();  // ✅ This now works because we imported it!
//             } catch (error) {
//                 console.error('❌ Failed to initialize form builder:', error);
//             }
//         }

//         // Update navigation button states
//         this.updateNavigationButtons();
//     }

//     navigateLeft() {
//         if (this.currentIndex > 0) {
//             this.showCard(this.currentIndex - 1);
//         } else {
//             // Wrap around to last card
//             this.showCard(this.cards.length - 1);
//         }
//     }

//     navigateRight() {
//         if (this.currentIndex < this.cards.length - 1) {
//             this.showCard(this.currentIndex + 1);
//         } else {
//             // Wrap around to first card
//             this.showCard(0);
//         }
//     }

//     updateNavigationButtons() {
//         const leftNav = document.querySelector('.carousel-nav-left');
//         const rightNav = document.querySelector('.carousel-nav-right');

//         // Always enable buttons for wrapping behavior
//         if (leftNav) leftNav.style.opacity = '1';
//         if (rightNav) rightNav.style.opacity = '1';

//         // Optional: Disable wrapping by uncommenting below
//         /*
//         if (leftNav) {
//             leftNav.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
//             leftNav.style.cursor = this.currentIndex === 0 ? 'not-allowed' : 'pointer';
//         }
//         if (rightNav) {
//             rightNav.style.opacity = this.currentIndex === this.cards.length - 1 ? '0.5' : '1';
//             rightNav.style.cursor = this.currentIndex === this.cards.length - 1 ? 'not-allowed' : 'pointer';
//         }
//         */
//     }

//     goToCard(cardName) {
//         const index = this.cards.indexOf(cardName);
//         if (index !== -1) {
//             this.showCard(index);
//         }
//     }

//     getCurrentCard() {
//         return this.cards[this.currentIndex];
//     }
//     setupOrientationDetection() {
//         // Check orientation on page load
//         this.checkOrientation();
    
//         // Listen for orientation changes
//         window.addEventListener('orientationchange', () => {
//             setTimeout(() => {
//                 this.checkOrientation();
//             }, 100);
//         });
    
//         // Also listen to resize events
//         window.addEventListener('resize', () => {
//             this.checkOrientation();
//         });
//     }
    
//     checkOrientation() {
//         // Check if it's a mobile device by checking the smaller dimension
//         // This works for both portrait and landscape orientations
//         const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
//         const isMobile = smallerDimension <= 768;
        
//         if (!isMobile) {
//             this.hideOrientationWarning();
//             return;
//         }

//         // Check if online profile view is active
//         const onlineProfileView = document.getElementById('online-profile-view');
//         if (!onlineProfileView || !onlineProfileView.classList.contains('active')) {
//             return;
//         }

//         // Check orientation
//         const isLandscape = window.innerWidth > window.innerHeight;
        
//         if (isLandscape) {
//             this.showOrientationWarning();
//         } else {
//             this.hideOrientationWarning();
//         }
//     }
    
//     showOrientationWarning() {
//         const warning = document.getElementById('landscapeWarning');
//         const content = document.getElementById('user-facing-dc-card');
//         const title = document.querySelector('#online-profile-view .carousel-card-title');
        
//         if (warning) warning.style.display = 'flex';
//         if (content) content.style.display = 'none';
//         if (title) title.style.display = 'none';
//     }
    
//     hideOrientationWarning() {
//         const warning = document.getElementById('landscapeWarning');
//         const content = document.getElementById('user-facing-dc-card');
//         const title = document.querySelector('#online-profile-view .carousel-card-title');
        
//         if (warning) warning.style.display = 'none';
//         if (content) content.style.display = '';
//         if (title) title.style.display = '';
//     }
    
// }

// const child = document.getElementById('card-view-tabs-buttons');
// const parent = document.getElementById('displayPage');
// // $("#card-view-tabs-buttons").hide();
// export function updateFixedWidth() {
//     if (document.getElementById('displayPage').classList.contains('active')) {
//         // console.log("inside the code: ", parent.getBoundingClientRect() );
//         const rect = parent.getBoundingClientRect();
//         child.style.left = rect.left + 'px';
//         child.style.width = rect.width + 'px';
//         $("#card-view-tabs-buttons").show();
//     }
  
// }

// function getMobileOS() {
//     const userAgent = navigator.userAgent || navigator.vendor || window.opera;
//     let returnvar = false;
//     if (/android/i.test(userAgent)) {
//         returnvar = true;
//     }
//     if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
//         returnvar = true;
//     }
//     return returnvar;
//   }
// // Call on every page load
// // $(document).ready(function() {
// //     updateFixedWidth();
// // });


// // Debounce function to limit resize/scroll calls
// function debounce(func, wait) {
//     let timeout;
//     return function executedFunction(...args) {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// }

// const optimizedUpdateWidth = debounce(function() {
//     updateFixedWidth();
// }, 150); // Wait 150ms after resize/orientation change


// document.addEventListener("DOMContentLoaded", async function () {
    
//     setTimeout(() => {
//         updateFixedWidth();
//     }, 1000);
// });

// $(document).ready(function () {
//     // window.scrollBy({
//     //     top: 20,      // scroll down 20px
//     //     left: 0,
//     //     behavior: 'smooth' // smooth scrolling
//     //   });
//       setTimeout(() => {
//         updateFixedWidth();
//     }, 500);
// });

// // Use debounced version for resize/orientation
// $(window).on("orientationchange resize", optimizedUpdateWidth);

// // For scroll events, use passive listeners for better performance
// window.addEventListener('scroll', updateFixedWidth, { passive: true });
// window.addEventListener('resize', updateFixedWidth);
// // window.addEventListener('scroll', updateFixedWidth);
// // Add this to prevent scroll restoration on page navigation

// if ('scrollRestoration' in history) {
//     history.scrollRestoration = 'manual';
// }


// /* ============================================
//    ADDITIONAL OPTIMIZATIONS
//    ============================================ */

// // Optimize touch events for mobile
// function optimizeMobileTouch() {
//     const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
//     if (isMobile) {
//         // Prevent double-tap zoom on specific elements
//         const preventDoubleTap = (element) => {
//             let lastTap = 0;
//             element.addEventListener('touchend', function(e) {
//                 const currentTime = new Date().getTime();
//                 const tapLength = currentTime - lastTap;
//                 if (tapLength < 500 && tapLength > 0) {
//                     e.preventDefault();
//                 }
//                 lastTap = currentTime;
//             }, { passive: false });
//         };
        
//         // Apply to buttons and tabs
//         document.querySelectorAll('.card-tab, .btn, button').forEach(preventDoubleTap);
//     }
// }

// // Call optimization on page load
// $(document).ready(optimizeMobileTouch);

// /* ============================================
//    FIX FOR iOS SAFARI SCROLL BOUNCE
//    ============================================ */

//    function preventScrollBounce() {
//     let startY = 0;
    
//     document.addEventListener('touchstart', function(e) {
//         startY = e.touches[0].pageY;
//     }, { passive: true });
    
//     document.addEventListener('touchmove', function(e) {
//         const element = e.target;
//         const currentY = e.touches[0].pageY;
        
//         // Only prevent if not in a scrollable container
//         if (!element.closest('.modal-body, .mobile-menu, .card-view-tabs')) {
//             const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//             const scrollHeight = document.documentElement.scrollHeight;
//             const clientHeight = document.documentElement.clientHeight;
            
//             // Prevent overscroll at top
//             if (scrollTop === 0 && currentY > startY) {
//                 e.preventDefault();
//             }
            
//             // Prevent overscroll at bottom
//             if (scrollTop + clientHeight >= scrollHeight && currentY < startY) {
//                 e.preventDefault();
//             }
//         }
//     }, { passive: false });
// }

// // Apply scroll bounce prevention
// if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
//     // preventScrollBounce();
// }


// /* ============================================
//    SMOOTH SCROLL TO TOP FOR CARD CAROUSEL
//    ============================================ */

// // Add this function to smoothly scroll to top when needed
// function smoothScrollToTop(offset = 0) {
//     if ('scrollBehavior' in document.documentElement.style) {
//         window.scrollTo({
//             top: offset,
//             behavior: 'smooth'
//         });
//     } else {
//         // Fallback for browsers that don't support smooth scroll
//         window.scrollTo(0, offset);
//     }
// }


// // $(window).on("orientationchange resize", function() {
// //     // console.log("mobile or");
// //     window.scrollBy({
// //         top: 20,      // scroll down 20px
// //         left: 0,
// //         behavior: 'smooth' // smooth scrolling
// //       });
// //       setTimeout(() => {
// //         updateFixedWidth();
// //     }, 500);
// //     // updateFixedWidth()
// //   });



// // Use this instead of window.scrollBy when you need to adjust scroll position
// // Example: smoothScrollToTop(50); // Scroll to 50px from top

// /* ============================================
//    VIEWPORT HEIGHT FIX FOR MOBILE BROWSERS
//    ============================================ */

//    function setMobileViewportHeight() {
//     // Fix for mobile browsers where 100vh includes the address bar
//     const vh = window.innerHeight * 0.01;
//     document.documentElement.style.setProperty('--vh', `${vh}px`);
// }

// // Set on load and resize
// window.addEventListener('load', setMobileViewportHeight);
// // window.addEventListener('resize', debounce(setMobileViewportHeight, 150));


// // Create and export singleton instance
// const cardCarousel = new CardCarousel();

// // Make it globally accessible
// window.cardCarousel = cardCarousel;

// export default cardCarousel;