// js/modules/social-category-manager.js
// Social Links Category Manager Module
// Handles expand/collapse functionality for categorized social links

/**
 * Social Links Category Manager
 * Handles expand/collapse functionality for categorized social links
 */
export class SocialCategoryManager {
    constructor() {
        this.initialized = false;
        this.categoryHeaders = [];
    }

    /**
     * Initialize the category manager
     */
    init() {
        if (this.initialized) {
            console.warn('SocialCategoryManager already initialized');
            return;
        }

        console.log('🔗 Initializing Social Category Manager...');
        
        this.setupEventListeners();
        this.setInitialState();
        this.initialized = true;
        
        console.log('✅ Social Category Manager initialized');
    }

    /**
     * Check if social links container exists
     */
    isAvailable() {
        return document.querySelector('.social-links-profile') !== null;
    }

    /**
     * Set up event listeners for category headers
     */
    setupEventListeners() {
        // Get all category headers
        this.categoryHeaders = document.querySelectorAll('.social-category-header');
        
        if (this.categoryHeaders.length === 0) {
            console.warn('No social category headers found');
            return;
        }

        this.categoryHeaders.forEach(header => {
            // Store bound functions for later removal
            header._clickHandler = (e) => {
                e.preventDefault();
                this.toggleCategory(header);
            };

            header._keydownHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCategory(header);
                }
            };

            // Add event listeners
            header.addEventListener('click', header._clickHandler);
            header.addEventListener('keydown', header._keydownHandler);
        });

        console.log(`Set up event listeners for ${this.categoryHeaders.length} categories`);
    }

    /**
     * Set initial state for all categories (all expanded by default)
     */
    setInitialState() {
        this.categoryHeaders.forEach(header => {
            const category = header.dataset.category;
            const content = header.nextElementSibling;
            
            if (!content) {
                console.warn(`No content found for category: ${category}`);
                return;
            }
            
            // Set accessibility attributes
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'true');
            header.setAttribute('aria-controls', `category-content-${category}`);
            
            // Set content attributes
            content.setAttribute('id', `category-content-${category}`);
            content.setAttribute('role', 'region');
            content.setAttribute('aria-labelledby', `category-header-${category}`);
            
            // Set header ID
            header.setAttribute('id', `category-header-${category}`);
        });
    }

    /**
     * Toggle a specific category's expand/collapse state
     * @param {HTMLElement} header - The category header element
     */
    toggleCategory(header) {
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.category-chevron i');
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        if (!content || !chevron) {
            console.warn('Missing content or chevron for category toggle');
            return;
        }
        
        if (isExpanded) {
            this.collapseCategory(header, content, chevron);
        } else {
            this.expandCategory(header, content, chevron);
        }
    }

    /**
     * Collapse a category
     * @param {HTMLElement} header - The category header
     * @param {HTMLElement} content - The category content
     * @param {HTMLElement} chevron - The chevron icon
     */
    collapseCategory(header, content, chevron) {
        // Update header state
        header.classList.add('collapsed');
        header.setAttribute('aria-expanded', 'false');
        
        // Add collapsing animation class
        content.classList.add('collapsing');
        
        // Start collapse animation
        setTimeout(() => {
            content.classList.add('collapsed');
            chevron.style.transform = 'rotate(-90deg)';
        }, 10);
        
        // Clean up animation class
        setTimeout(() => {
            content.classList.remove('collapsing');
        }, 300);
        
        // Fire custom event
        this.fireCustomEvent('categoryCollapsed', {
            category: header.dataset.category,
            header: header,
            content: content
        });

        console.log(`Collapsed category: ${header.dataset.category}`);
    }

    /**
     * Expand a category
     * @param {HTMLElement} header - The category header
     * @param {HTMLElement} content - The category content
     * @param {HTMLElement} chevron - The chevron icon
     */
    expandCategory(header, content, chevron) {
        // Update header state
        header.classList.remove('collapsed');
        header.setAttribute('aria-expanded', 'true');
        
        // Add expanding animation class
        content.classList.add('expanding');
        
        // Start expand animation
        setTimeout(() => {
            content.classList.remove('collapsed');
            chevron.style.transform = 'rotate(0deg)';
        }, 10);
        
        // Clean up animation class
        setTimeout(() => {
            content.classList.remove('expanding');
        }, 300);
        
        // Fire custom event
        this.fireCustomEvent('categoryExpanded', {
            category: header.dataset.category,
            header: header,
            content: content
        });

        console.log(`Expanded category: ${header.dataset.category}`);
    }

    /**
     * Collapse all categories
     */
    collapseAll() {
        console.log('Collapsing all social categories...');
        this.categoryHeaders.forEach(header => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                this.toggleCategory(header);
            }
        });
    }

    /**
     * Expand all categories
     */
    expandAll() {
        console.log('Expanding all social categories...');
        this.categoryHeaders.forEach(header => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            if (!isExpanded) {
                this.toggleCategory(header);
            }
        });
    }

    /**
     * Get the state of all categories
     * @returns {Object} Object with category states
     */
    getCategoriesState() {
        const state = {};
        
        this.categoryHeaders.forEach(header => {
            const category = header.dataset.category;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            state[category] = {
                expanded: isExpanded,
                category: category
            };
        });
        
        return state;
    }

    /**
     * Set the state of categories
     * @param {Object} state - Object with category states
     */
    setCategoriesState(state) {
        Object.keys(state).forEach(category => {
            const header = document.querySelector(`[data-category="${category}"]`);
            if (header) {
                const currentExpanded = header.getAttribute('aria-expanded') === 'true';
                const shouldBeExpanded = state[category].expanded;
                
                if (currentExpanded !== shouldBeExpanded) {
                    this.toggleCategory(header);
                }
            }
        });
    }

    /**
     * Save categories state to localStorage
     */
    saveState() {
        try {
            const state = this.getCategoriesState();
            localStorage.setItem('socialCategoriesState', JSON.stringify(state));
            console.log('Social categories state saved');
        } catch (error) {
            console.error('Failed to save social categories state:', error);
        }
    }

    /**
     * Load categories state from localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('socialCategoriesState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.setCategoriesState(state);
                console.log('Social categories state loaded');
                return true;
            } catch (error) {
                console.warn('Failed to load social categories state:', error);
            }
        }
        return false;
    }

    /**
     * Fire custom event
     * @param {string} eventName - Name of the event
     * @param {Object} detail - Event detail data
     */
    fireCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * Add event listeners for custom events
     */
    onCategoryExpanded(callback) {
        document.addEventListener('categoryExpanded', callback);
        return this; // For chaining
    }

    onCategoryCollapsed(callback) {
        document.addEventListener('categoryCollapsed', callback);
        return this; // For chaining
    }

    /**
     * Get category statistics
     */
    getStats() {
        const totalCategories = this.categoryHeaders.length;
        let expandedCategories = 0;
        let collapsedCategories = 0;

        this.categoryHeaders.forEach(header => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                expandedCategories++;
            } else {
                collapsedCategories++;
            }
        });

        return {
            total: totalCategories,
            expanded: expandedCategories,
            collapsed: collapsedCategories,
            initialized: this.initialized
        };
    }

    /**
     * Destroy the manager and clean up event listeners
     */
    destroy() {
        console.log('🧹 Destroying Social Category Manager...');
        
        // Remove event listeners
        this.categoryHeaders.forEach(header => {
            if (header._clickHandler) {
                header.removeEventListener('click', header._clickHandler);
                delete header._clickHandler;
            }
            if (header._keydownHandler) {
                header.removeEventListener('keydown', header._keydownHandler);
                delete header._keydownHandler;
            }
        });

        // Reset state
        this.categoryHeaders = [];
        this.initialized = false;
        
        console.log('✅ Social Category Manager destroyed');
    }

    /**
     * Reinitialize if needed (useful for SPA navigation)
     */
    reinitialize() {
        if (this.initialized) {
            this.destroy();
        }
        this.init();
    }
}

// Export as default
export default SocialCategoryManager;