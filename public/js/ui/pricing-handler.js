// pricing-handler.js
// Enhanced integration with existing QRMyPro navigation system - ES6 Class Version

import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';

class PricingHandler {
    constructor() {
        this.initialized = false;
        this.maxRetries = 10;
        this.retryInterval = 200;
        this.connectikoAPI = null;
        
        console.log('🚀 PricingHandler class initializing...');
        this.init();
    }
    
    /**
     * Initialize the pricing handler
     */
    init() {
        console.log('🔧 Initializing pricing handler...');
        
        // Handle different DOM states
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            // If DOM already loaded, wait a bit for other scripts
            setTimeout(() => this.setup(), 100);
        }
        
        // Handle back/forward navigation
        window.addEventListener('popstate', () => this.checkForPricingRoutes());
    }
    
    /**
     * Setup the pricing handler after DOM is ready
     */
    setup() {
        const checkNavigationSystem = () => {
            if (typeof window.showPage === 'function') {
                console.log('✅ Main navigation system found, extending it...');
                this.extendNavigationSystem();
                this.setupUpgradeRedirection();
                this.setupPricingButtons();
                this.checkForPricingRoutes();
                this.initialized = true;
                return true;
            }
            return false;
        };
        
        // Try immediate initialization
        if (!checkNavigationSystem()) {
            // If navigation system not ready, wait and retry
            console.log('⏳ Waiting for main navigation system...');
            this.waitForNavigationSystem(checkNavigationSystem);
        }
    }
    
    /**
     * Setup pricing page button handlers
     */
    setupPricingButtons() {
        console.log('🔘 Setting up pricing page button handlers...');
        
        // Use event delegation for pricing page buttons
        $(document).off('click.pricingHandler');
        $(document).on('click.pricingHandler', '.pricing-card .btn-primary', async (e) => {
            e.preventDefault();
            const button = $(e.currentTarget);
            const card = button.closest('.pricing-card');
            
            console.log('💳 Pricing button clicked');
            
            // Check if it's a "Get Started" or "Upgrade Now" button
            if (button.text().includes('Get Started') || button.text().includes('Upgrade Now')) {
                await this.handleSubscriptionUpgrade(card);
            } else if (button.text().includes('Contact Sales')) {
                this.handleContactSales();
            }
        });
        
        console.log('✅ Pricing button handlers setup complete');
    }
    
    /**
     * Handle subscription upgrade - show ConnectikoAPI interface
     */
    async handleSubscriptionUpgrade(card) {
        try {
            console.log('🔄 Processing subscription upgrade...');
            
            // Show loading message
            const button = card.find('.btn-primary');
            const originalText = button.text();
            button.text('Loading...').prop('disabled', true);
            
            // Navigate to ConnectikoAPI page
            if (typeof window.showPage === 'function') {
                window.showPage('connectikoApi');
            }
            
            // Initialize ConnectikoAPI module if not already done
            await this.initializeConnectikoAPI();
            
            // Restore button
            setTimeout(() => {
                button.text(originalText).prop('disabled', false);
            }, 1000);
            
            showSuccessMessage('Welcome to ConnectiKo API! Explore the features below.');
            
        } catch (error) {
            console.error('Error handling subscription upgrade:', error);
            showErrorMessage('Unable to load API interface. Please try again.');
        }
    }
    
    /**
     * Initialize ConnectikoAPI module
     */
    async initializeConnectikoAPI() {
        try {
            // Check if ConnectikoAPI is already loaded
            if (this.connectikoAPI) {
                console.log('📡 ConnectikoAPI already initialized');
                return this.connectikoAPI;
            }
            
            // Check if global instance already exists
            if (window.connectikoAPI) {
                console.log('📡 Using existing global ConnectikoAPI instance');
                this.connectikoAPI = window.connectikoAPI;
                // Initialize if not already done
                if (typeof this.connectikoAPI.initialize === 'function') {
                    await this.connectikoAPI.initialize();
                }
                return this.connectikoAPI;
            }
            
            // Dynamically import ConnectikoAPI singleton instance
            const connectikoAPIModule = await import('../modules/connectiko-api.js');
            
            // Use the default exported singleton instance
            this.connectikoAPI = connectikoAPIModule.default;
            
            // Initialize the module
            if (typeof this.connectikoAPI.initialize === 'function') {
                await this.connectikoAPI.initialize();
            }
            
            console.log('✅ ConnectikoAPI module loaded and initialized');
            return this.connectikoAPI;
            
        } catch (error) {
            console.error('Failed to initialize ConnectikoAPI:', error);
            
            // Fallback: try to use global instance if import fails
            if (window.connectikoAPI) {
                console.warn('⚠️ Using global ConnectikoAPI as fallback');
                this.connectikoAPI = window.connectikoAPI;
                return this.connectikoAPI;
            }
            
            throw error;
        }
    }
    
    /**
     * Handle contact sales
     */
    handleContactSales() {
        // You can implement a contact form modal or redirect to contact page
        showSuccessMessage('Contact sales feature coming soon!');
        console.log('📞 Contact sales clicked');
    }
    
    /**
     * Wait for the main navigation system to load with retry logic
     */
    waitForNavigationSystem(checkFn) {
        let attempts = 0;
        
        const retryInterval = setInterval(() => {
            attempts++;
            if (checkFn() || attempts >= this.maxRetries) {
                clearInterval(retryInterval);
                if (attempts >= this.maxRetries) {
                    console.warn('⚠️ Main navigation system not found, using fallback');
                    this.setupUpgradeRedirection();
                    this.setupPricingButtons();
                    this.checkForPricingRoutes();
                    this.initialized = true;
                }
            }
        }, this.retryInterval);
    }
    
    /**
     * Show pricing page using existing navigation system
     */
    showPricingPage() {
        console.log('📄 Loading pricing page...');
        
        // Hide all pages
        this.hideAllPages();
        
        // Show pricing page
        const pricingPage = document.getElementById('pricingPage');
        if (pricingPage) {
            pricingPage.classList.add('active');
            pricingPage.style.display = 'block';
            console.log('✅ Pricing page displayed');
            
            // Update URL and navigation if functions exist
            this.updateNavigation('pricing');
        } else {
            console.error('❌ Pricing page not found in DOM');
        }
    }
    
    /**
     * Show billing page using existing navigation system
     */
    showBillingPage() {
        console.log('📄 Loading billing page...');
        
        // Hide all pages
        this.hideAllPages();
        
        // Show billing page
        const billingPage = document.getElementById('billingPage');
        if (billingPage) {
            billingPage.classList.add('active');
            billingPage.style.display = 'block';
            console.log('✅ Billing page displayed');
            
            // Update URL and navigation if functions exist
            this.updateNavigation('billing');
        } else {
            console.error('❌ Billing page not found in DOM');
        }
    }
    
    /**
     * Hide all pages - utility method
     */
    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    }
    
    /**
     * Update URL and navigation state
     */
    updateNavigation(page) {
        // Update URL if window.updateURL exists
        if (typeof window.updateURL === 'function') {
            window.updateURL(page);
        }
        
        // Set active nav item if function exists
        if (typeof window.setActiveNavItem === 'function') {
            window.setActiveNavItem(page);
        }
    }
    
    /**
     * Enhanced URL parameter checking with fallback to existing navigation
     */
    checkForPricingRoutes() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        
        console.log('🔍 Checking URL for pricing routes, page:', page);
        
        if (page === 'pricing') {
            this.showPricingPage();
            return true;
        } else if (page === 'billing') {
            this.showBillingPage();
            return true;
        }
        
        return false;
    }
    
    /**
     * Extend the existing showPage function to handle pricing/billing
     */
    extendNavigationSystem() {
        // Store reference to original showPage if it exists
        if (typeof window.showPage === 'function') {
            const originalShowPage = window.showPage;
            
            // Override showPage to handle pricing and billing
            window.showPage = (pageId) => {
                console.log('🔄 Extended showPage called with:', pageId);
                
                if (pageId === 'pricing') {
                    this.showPricingPage();
                    return;
                } else if (pageId === 'billing') {
                    this.showBillingPage();
                    return;
                }
                
                // For all other pages, use the original function
                return originalShowPage.call(this, pageId);
            };
            
            console.log('✅ Navigation system extended for pricing/billing');
        } else {
            console.warn('⚠️ window.showPage not found - pricing pages will use fallback navigation');
        }
    }
    
    /**
     * Override window.open for upgrade/subscription buttons
     */
    setupUpgradeRedirection() {
        const originalOpen = window.open;
        
        window.open = (url, target, features) => {
            console.log('🔗 Intercepting window.open call:', url);
            
            // Handle upgrade button
            if (url === '/upgrade') {
                console.log('🔄 Redirecting upgrade to pricing page...');
                if (typeof window.showPage === 'function') {
                    window.showPage('pricing');
                } else {
                    this.showPricingPage();
                }
                return null;
            }
            
            // Handle subscription management
            if (url === '/subscription') {
                console.log('🔄 Redirecting subscription to billing page...');
                if (typeof window.showPage === 'function') {
                    window.showPage('billing');
                } else {
                    this.showBillingPage();
                }
                return null;
            }
            
            // For other URLs, use the original function
            return originalOpen.call(this, url, target, features);
        };
        
        console.log('✅ Upgrade redirection setup complete');
    }
    
    /**
     * Public method to check if handler is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    
    /**
     * Public method to manually trigger pricing page
     */
    openPricing() {
        if (this.initialized) {
            this.showPricingPage();
        } else {
            console.warn('⚠️ PricingHandler not yet initialized');
        }
    }
    
    /**
     * Public method to manually trigger billing page
     */
    openBilling() {
        if (this.initialized) {
            this.showBillingPage();
        } else {
            console.warn('⚠️ PricingHandler not yet initialized');
        }
    }
    
    /**
     * Public method to get ConnectikoAPI instance
     */
    getConnectikoAPI() {
        return this.connectikoAPI;
    }
}

// Initialize the pricing handler
const pricingHandler = new PricingHandler();

// Export for global access
window.pricingHandler = pricingHandler;

console.log('✅ PricingHandler class loaded and instantiated');
export default pricingHandler;

console.log('✅ PricingHandler class loaded and instantiated');