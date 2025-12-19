/**
 * MESSAGE BOX MODULE
 * A comprehensive, reusable message box system
 * 
 * Features:
 * - Multiple types: success, error, warning, info, confirm, prompt
 * - Customizable buttons and callbacks
 * - Promise-based API
 * - Auto-dismiss options
 * - Loading states
 * - Input prompts
 * - Mobile responsive
 * 
 * Usage Examples:
 * 
 * // Simple alert
 * MessageBox.show('Hello World!');
 * 
 * // Success message
 * MessageBox.success('Operation completed successfully!');
 * 
 * // Confirmation dialog
 * const result = await MessageBox.confirm('Are you sure?', 'This action cannot be undone');
 * if (result) { // user clicked OK }
 * 
 * // Prompt for input
 * const name = await MessageBox.prompt('Enter your name', 'Please provide your full name');
 * 
 * // Custom options
 * MessageBox.show('Custom Message', {
 *     type: 'info',
 *     title: 'Custom Title',
 *     buttons: [
 *         { text: 'Cancel', style: 'secondary' },
 *         { text: 'Confirm', style: 'primary', onClick: () => console.log('Confirmed') }
 *     ]
 * });
 */

const MessageBox = (function() {
    'use strict';

    // Private variables
    let overlay = null;
    let messageBox = null;
    let currentResolve = null;
    let autoHideTimeout = null;

    // Default configuration
    const defaults = {
        type: 'info',           // success, error, warning, info, confirm
        title: '',              // Auto-generated based on type if not provided
        closable: true,         // Show close button
        closeOnOverlay: true,   // Close when clicking overlay
        autoHide: 0,            // Auto-hide after X milliseconds (0 = disabled)
        buttons: null,          // Custom buttons array
        icon: null,             // Custom icon (FontAwesome class)
        onShow: null,           // Callback when shown
        onHide: null,           // Callback when hidden
        className: ''           // Additional CSS class
    };

    // Icon mapping
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        confirm: 'fas fa-question-circle'
    };

    // Default titles
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        confirm: 'Confirm Action'
    };

    /**
     * Initialize the message box structure
     */
    function init() {
        if (overlay) return; // Already initialized

        // Create overlay
        overlay = document.createElement('div');
        overlay.className = 'message-box-overlay';
        overlay.innerHTML = `
            <div class="message-box">
                <div class="message-box-header">
                    <div class="message-box-icon">
                        <i></i>
                    </div>
                    <h3 class="message-box-title"></h3>
                    <button class="message-box-close" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="message-box-body">
                    <div class="message-box-content"></div>
                </div>
                <div class="message-box-footer"></div>
            </div>
        `;

        document.body.appendChild(overlay);
        messageBox = overlay.querySelector('.message-box');

        // Event listeners
        overlay.addEventListener('click', handleOverlayClick);
        overlay.querySelector('.message-box-close').addEventListener('click', () => hide(false));

        // Prevent clicks inside message box from closing overlay
        messageBox.addEventListener('click', (e) => e.stopPropagation());
    }

    /**
     * Handle overlay click
     */
    function handleOverlayClick() {
        const closeOnOverlay = messageBox.dataset.closeOnOverlay === 'true';
        if (closeOnOverlay) {
            hide(false);
        }
    }

    /**
     * Show message box
     * @param {string} message - Message to display
     * @param {Object} options - Configuration options
     * @returns {Promise} - Resolves with button click result
     */
    function show(message, options = {}) {
        init();

        return new Promise((resolve) => {
            currentResolve = resolve;

            // Merge options with defaults
            const config = { ...defaults, ...options };

            // Set type and title
            const type = config.type;
            const title = config.title || titles[type] || 'Message';
            const icon = config.icon || icons[type] || icons.info;

            // Update UI
            messageBox.className = 'message-box';
            if (config.className) {
                messageBox.classList.add(config.className);
            }

            // Set icon
            const iconElement = overlay.querySelector('.message-box-icon');
            iconElement.className = `message-box-icon ${type}`;
            iconElement.querySelector('i').className = icon;

            // Set title
            overlay.querySelector('.message-box-title').textContent = title;

            // Set message content
            const contentElement = overlay.querySelector('.message-box-content');
            if (typeof message === 'string') {
                contentElement.innerHTML = `<p>${message}</p>`;
            } else {
                contentElement.innerHTML = '';
                contentElement.appendChild(message);
            }

            // Set close button visibility
            const closeButton = overlay.querySelector('.message-box-close');
            closeButton.style.display = config.closable ? 'flex' : 'none';

            // Store closeOnOverlay setting
            messageBox.dataset.closeOnOverlay = config.closeOnOverlay;

            // Create buttons
            createButtons(config);

            // Show overlay
            document.body.classList.add('message-box-open');
            overlay.classList.add('active');

            // Call onShow callback
            if (typeof config.onShow === 'function') {
                config.onShow();
            }

            // Auto-hide if configured
            if (config.autoHide > 0) {
                clearTimeout(autoHideTimeout);
                autoHideTimeout = setTimeout(() => {
                    hide(null);
                }, config.autoHide);
            }
        });
    }

    /**
     * Create buttons based on configuration
     */
    function createButtons(config) {
        const footer = overlay.querySelector('.message-box-footer');
        footer.innerHTML = '';

        let buttons = config.buttons;

        // Default buttons based on type
        if (!buttons) {
            if (config.type === 'confirm') {
                buttons = [
                    { text: 'Cancel', style: 'secondary', value: false },
                    { text: 'OK', style: 'primary', value: true }
                ];
            } else {
                buttons = [
                    { text: 'OK', style: 'primary', value: true }
                ];
            }
        }

        // Create button elements
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `message-box-btn message-box-btn-${btn.style || 'primary'}`;
            button.textContent = btn.text;

            if (btn.icon) {
                const icon = document.createElement('i');
                icon.className = btn.icon;
                button.insertBefore(icon, button.firstChild);
            }

            button.addEventListener('click', async () => {
                // If button has custom onClick, call it
                if (typeof btn.onClick === 'function') {
                    const result = await btn.onClick();
                    // If onClick returns false, don't close
                    if (result === false) return;
                }

                // Close with button value
                hide(btn.value !== undefined ? btn.value : true);
            });

            footer.appendChild(button);
        });
    }

    /**
     * Hide message box
     * @param {*} result - Result to resolve promise with
     */
    function hide(result) {
        clearTimeout(autoHideTimeout);

        overlay.classList.remove('active');
        document.body.classList.remove('message-box-open');

        // Get config for callback
        const config = messageBox.dataset;

        // Call onHide callback
        if (typeof config.onHide === 'function') {
            config.onHide();
        }

        // Resolve promise
        if (currentResolve) {
            currentResolve(result);
            currentResolve = null;
        }
    }

    /**
     * Show success message
     */
    function success(message, title = null) {
        return show(message, { type: 'success', title: title || 'Success' });
    }

    /**
     * Show error message
     */
    function error(message, title = null) {
        return show(message, { type: 'error', title: title || 'Error' });
    }

    /**
     * Show warning message
     */
    function warning(message, title = null) {
        return show(message, { type: 'warning', title: title || 'Warning' });
    }

    /**
     * Show info message
     */
    function info(message, title = null) {
        return show(message, { type: 'info', title: title || 'Information' });
    }

    /**
     * Show confirmation dialog
     * @param {string} message - Message to display
     * @param {string} title - Dialog title
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>} - true if confirmed, false if cancelled
     */
    function confirm(message, title = 'Confirm Action', options = {}) {
        return show(message, {
            type: 'confirm',
            title: title,
            closable: true,
            closeOnOverlay: false,
            buttons: options.buttons || [
                { text: options.cancelText || 'Cancel', style: 'secondary', value: false },
                { text: options.confirmText || 'OK', style: options.confirmStyle || 'primary', value: true }
            ],
            ...options
        });
    }

    /**
     * Show prompt dialog for user input
     * @param {string} message - Message to display
     * @param {string} title - Dialog title
     * @param {Object} options - Additional options
     * @returns {Promise<string|null>} - User input or null if cancelled
     */
    function prompt(message, title = 'Enter Value', options = {}) {
        const inputId = 'message-box-input-' + Date.now();
        const placeholder = options.placeholder || '';
        const defaultValue = options.defaultValue || '';
        const inputType = options.inputType || 'text';

        const content = `
            <p>${message}</p>
            <div class="message-box-input-wrapper">
                <input 
                    type="${inputType}" 
                    id="${inputId}" 
                    class="message-box-input" 
                    placeholder="${placeholder}"
                    value="${defaultValue}"
                >
            </div>
        `;

        return new Promise((resolve) => {
            show(content, {
                type: 'info',
                title: title,
                closable: true,
                closeOnOverlay: false,
                buttons: [
                    { text: 'Cancel', style: 'secondary', onClick: () => { resolve(null); return true; } },
                    { 
                        text: 'OK', 
                        style: 'primary', 
                        onClick: () => {
                            const input = document.getElementById(inputId);
                            const value = input ? input.value.trim() : '';
                            
                            // Validate if required
                            if (options.required && !value) {
                                input.focus();
                                messageBox.classList.add('shake');
                                setTimeout(() => messageBox.classList.remove('shake'), 500);
                                return false; // Don't close
                            }

                            resolve(value);
                            return true;
                        }
                    }
                ],
                onShow: () => {
                    // Focus input after modal is shown
                    setTimeout(() => {
                        const input = document.getElementById(inputId);
                        if (input) {
                            input.focus();
                            input.select();
                        }
                    }, 100);
                },
                ...options
            });
        });
    }

    /**
     * Show loading dialog
     * @param {string} message - Loading message
     * @param {string} title - Dialog title
     * @returns {Object} - Object with hide() method
     */
    function loading(message = 'Please wait...', title = 'Loading') {
        const content = `
            <div style="text-align: center;">
                <div class="message-box-loading" style="margin: 0 auto 1rem;"></div>
                <p>${message}</p>
            </div>
        `;

        show(content, {
            type: 'info',
            title: title,
            closable: false,
            closeOnOverlay: false,
            buttons: []
        });

        return {
            hide: () => hide(null),
            updateMessage: (newMessage) => {
                const content = overlay.querySelector('.message-box-content p');
                if (content) content.textContent = newMessage;
            }
        };
    }

    /**
     * Check if message box is currently visible
     */
    function isVisible() {
        return overlay && overlay.classList.contains('active');
    }

    /**
     * Destroy message box
     */
    function destroy() {
        if (overlay) {
            hide(null);
            document.body.removeChild(overlay);
            overlay = null;
            messageBox = null;
        }
    }

    // Public API
    return {
        show,
        hide,
        success,
        error,
        warning,
        info,
        confirm,
        prompt,
        loading,
        isVisible,
        destroy
    };
})();

// Export for module systems
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = MessageBox;
// }

// // Export for ES6 modules
// if (typeof exports !== 'undefined') {
//     exports.MessageBox = MessageBox;
// }

export default MessageBox;
