/**
 * Digital Card Customization Module - SIMPLIFIED VERSION
 * Handles color picker and gradient presets for wallet card
 * No colorPreference flag - automatically detects preset vs custom based on colors
 */

import { api } from "../core/api-client.js";
import { getUserProfile } from "../core/auth.js";
import { showSuccessMessage, showErrorMessage } from "../ui/notifications.js";
import MessageBox from '../modules/message-box.js'

// Gradient presets configuration with names
const gradients = {
    'purple-blue': { 
        start: '#667eea', 
        end: '#764ba2',
        name: 'Purple Blue'
    },
    'ocean': { 
        start: '#2E3192', 
        end: '#1BFFFF',
        name: 'Ocean'
    },
    'sunset': { 
        start: '#ff6b6b', 
        end: '#feca57',
        name: 'Sunset'
    },
    'forest': { 
        start: '#134E5E', 
        end: '#71B280',
        name: 'Forest'
    },
    'royal': { 
        start: '#141E30', 
        end: '#243B55',
        name: 'Royal'
    },
    'rose': { 
        start: '#f857a6', 
        end: '#ff5858',
        name: 'Rose'
    },
    'mint': { 
        start: '#00b09b', 
        end: '#96c93d',
        name: 'Mint'
    },
    'lavender': { 
        start: '#8E2DE2', 
        end: '#4A00E0',
        name: 'Lavender'
    },
    'peach': { 
        start: '#ED4264', 
        end: '#FFEDBC',
        name: 'Peach'
    },
    'cosmic': { 
        start: '#C33764', 
        end: '#1D2671',
        name: 'Cosmic'
    },
    'emerald': {
        start: '#11998e',
        end: '#38ef7d',
        name: 'Emerald'
    },
    'fire': {
        start: '#f12711',
        end: '#f5af19',
        name: 'Fire'
    },
    'blush': {
        start: '#eb3349',
        end: '#f45c43',
        name: 'Blush'
    },
    'midnight': {
        start: '#2c3e50',
        end: '#3498db',
        name: 'Midnight'
    },
    'aqua': {
        start: '#00d2ff',
        end: '#3a7bd5',
        name: 'Aqua'
    }
};

// Current selected gradient
let currentGradient = {
    start: '#667eea',
    end: '#764ba2'
};

// Initialization flag
let initialized = false;

/**
 * Initialize the customization functionality
 */
async function init() {
    if (initialized) {
        // console.log('Digital Card Customization: Already initialized');
        return;
    }

    // console.log('Digital Card Customization: Initializing...');
    
    // Load saved preferences and WAIT for it to complete
    await loadSavedPreferences();
    
    // Setup event listeners
    setupGradientPresets();
    setupCustomColorToggle();
    setupColorPickers();
    setupApplyButton();
    setupSaveBrandingButton();
    
    initialized = true;
    // console.log('Digital Card Customization: Initialized');
}

/**
 * Load saved preferences from API
 * SIMPLIFIED: No colorPreference flag - automatically detect preset vs custom
 */
async function loadSavedPreferences() {
    try {
        const response = await api.getBranding();
        // console.log("Saved gradient from API: ", response);
        
        if (response.success && response.data) {
            // Load and normalize colors to lowercase
            currentGradient.start = (response.data.gradientStart || '#667eea').toLowerCase();
            currentGradient.end = (response.data.gradientEnd || '#764ba2').toLowerCase();
            
            // console.log("Loaded currentGradient: ", currentGradient);
            
            // Try to find matching preset (case-insensitive)
            let foundMatch = false;
            for (const [key, gradient] of Object.entries(gradients)) {
                if (gradient.start.toLowerCase() === currentGradient.start.toLowerCase() && 
                    gradient.end.toLowerCase() === currentGradient.end.toLowerCase()) {
                    
                    // Match found - show preset as active
                    $('.gradient-preset').removeClass('active');
                    $(`.gradient-preset[data-gradient="${key}"]`).addClass('active');
                    
                    // Hide custom color picker
                    $('#use-custom-colors').prop('checked', false);
                    $('#color-pickers-section').hide();
                    
                    foundMatch = true;
                    // console.log(`Matched preset: ${key} (${gradient.name})`);
                    break;
                }
            }
            
            // No match found - must be custom colors
            if (!foundMatch) {
                // console.log("No preset match found - showing custom colors");
                
                // Show custom color picker
                $('#use-custom-colors').prop('checked', true);
                $('#color-pickers-section').show();
                
                // Remove active from all presets
                $('.gradient-preset').removeClass('active');
            }
            
            updateColorInputs(currentGradient.start, currentGradient.end);
            applyGradientToCard(currentGradient.start, currentGradient.end);
        }
    } catch (error) {
        console.error('Error loading saved preferences:', error);
        // Use default gradient if loading fails
        applyGradientToCard(currentGradient.start, currentGradient.end);
    }
}

/**
 * Save preferences to API
 * SIMPLIFIED: Only save colors, no colorPreference flag
 */
async function savePreferences(currentGradient) {
    try {
        const preferences = {
            gradientStart: currentGradient.start,
            gradientEnd: currentGradient.end
            // No useCustom flag needed!
        };
        
        // console.log("Saving preferences: ", preferences);
        
        const result = await api.saveBranding(null, preferences);
        const resultformlead = await api.saveBrandingforForm(null, preferences);
        
        if (result.success) {
            MessageBox.success('Branding preferences saved successfully');
        } else {
            showErrorMessage('Failed to save branding preferences: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving preferences:', error);
        showErrorMessage('Error saving preferences');
    }
}


/**
 * Setup gradient preset click handlers
 */
function setupGradientPresets() {
    // Use event delegation to handle dynamically loaded content
    $(document).off('click', '.gradient-preset').on('click', '.gradient-preset', function() {
        const gradientName = $(this).data('gradient');
        
        if (!gradientName || !gradients[gradientName]) {
            console.warn('Invalid gradient:', gradientName);
            return;
        }
        
        // Remove active class from all presets
        $('.gradient-preset').removeClass('active');
        
        // Add active class to clicked preset
        $(this).addClass('active');
        
        // Get gradient colors
        const gradient = gradients[gradientName];
        currentGradient = { start: gradient.start, end: gradient.end };
        
        // Update color inputs
        updateColorInputs(gradient.start, gradient.end);
        
        // Apply gradient to card
        applyGradientToCard(gradient.start, gradient.end);
        
        // Uncheck custom colors and hide picker
        $('#use-custom-colors').prop('checked', false);
        $('#color-pickers-section').hide();
        
        // console.log(`Applied gradient: ${gradientName}`, gradient);
    });
}

/**
 * Setup custom color checkbox toggle
 */
function setupCustomColorToggle() {
    $(document).off('change', '#use-custom-colors').on('change', '#use-custom-colors', function() {
        const isChecked = $(this).is(':checked');
        
        if (isChecked) {
            $('#color-pickers-section').slideDown(300);
            $('.gradient-preset').removeClass('active');
        } else {
            $('#color-pickers-section').slideUp(300);
            // Reapply last colors
            applyGradientToCard(currentGradient.start, currentGradient.end);
        }
    });
}

/**
 * Setup color picker input handlers
 */
function setupColorPickers() {
    // Color input changes
    $(document).off('input', '#card-color-start').on('input', '#card-color-start', function() {
        const color = $(this).val();
        $('#card-color-start-text').val(color.toUpperCase());
    });

    $(document).off('input', '#card-color-end').on('input', '#card-color-end', function() {
        const color = $(this).val();
        $('#card-color-end-text').val(color.toUpperCase());
    });

    // Text input changes
    $(document).off('input', '#card-color-start-text').on('input', '#card-color-start-text', function() {
        let value = $(this).val();
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        if (isValidHexColor(value)) {
            $('#card-color-start').val(value);
        }
    });

    $(document).off('input', '#card-color-end-text').on('input', '#card-color-end-text', function() {
        let value = $(this).val();
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        if (isValidHexColor(value)) {
            $('#card-color-end').val(value);
        }
    });
}

/**
 * Setup apply colors button
 */
function setupApplyButton() {
    $(document).off('click', '#apply-custom-colors').on('click', '#apply-custom-colors', function() {
        const startColor = $('#card-color-start').val();
        const endColor = $('#card-color-end').val();
        
        currentGradient = { start: startColor, end: endColor };
        
        applyGradientToCard(startColor, endColor);

        // Show success feedback
        const $btn = $(this);
        const originalText = $btn.html();
        $btn.html('<i class="fas fa-check"></i> Applied!');
        
        setTimeout(() => {
            $btn.html(originalText);
        }, 2000);
        
        // console.log('Applied custom colors:', { startColor, endColor });
    });
}

/**
 * Setup save branding button
 */
function setupSaveBrandingButton() {
    console.log("Inside init setupSaveBrandingButton");
    $(document).off('click', '#save-branding-btn').on('click', '#save-branding-btn', async function() {
        console.log("inside when on click");
        const $btn = $(this);
        const originalText = $btn.html();
        
        // Disable button and show loading
        $btn.prop('disabled', true);
        $btn.html('<i class="fas fa-spinner fa-spin"></i> Saving...');
        
        try {
           
             // Step 1: Save preferences
             console.log('💾 Saving branding...');
             await savePreferences(currentGradient);

            // Show success
            $btn.html('<i class="fas fa-check"></i> Saved!');
            
            setTimeout(() => {
                $btn.html(originalText);
                $btn.prop('disabled', false);
            }, 2000);
            
        } catch (error) {
            console.error('Error saving branding:', error);
            
            // Show error
            $btn.html('<i class="fas fa-times"></i> Failed');
            
            setTimeout(() => {
                $btn.html(originalText);
                $btn.prop('disabled', false);
            }, 2000);
        }
    });
}

/**
 * Update color input values
 */
function updateColorInputs(startColor, endColor) {
    $('#card-color-start').val(startColor);
    $('#card-color-start-text').val(startColor.toUpperCase());
    $('#card-color-end').val(endColor);
    $('#card-color-end-text').val(endColor.toUpperCase());
}

/**
 * Apply gradient to wallet card
 */
function applyGradientToCard(startColor, endColor) {
    const gradient = `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`;
    
    // Apply to card header - use setTimeout to ensure element exists
    const applyGradient = () => {
        const $header = $('.wallet-card-header-section');
        
        const $onlineProfileHeader = $('.userprofile-dynamic-html').find('.profile-header');
        const $onlineProfileIcons = $('.userprofile-dynamic-html').find('.contact-icon');
        const $onlineSocialIcons = $('.userprofile-dynamic-html').find('a.card-icon-design');
        // console.log("Gradient color: ", gradient)
        if ($header.length > 0) {
            $header.css('background', gradient);
        } else {
            console.warn('Wallet card header not found in DOM');
        }

        if ($onlineProfileHeader.length > 0) {
            $onlineProfileHeader.css('background', gradient);
        } else {
            console.warn('onlineProfileHeader header not found in DOM');
        }

        if ($onlineProfileIcons.length > 0) {
            $onlineProfileIcons.css('background', gradient);
        } else {
            console.warn('onlineProfileIcons  not found in DOM');
        }

        if ($onlineSocialIcons.length > 0) {
            $onlineSocialIcons.css('background', gradient);
        } else {
            console.warn('onlineSocialIcons  not found in DOM');
        }
    };
    
    // Try immediately and also after a short delay
    applyGradient();
    setTimeout(applyGradient, 100);
    setTimeout(applyGradient, 500);
}

/**
 * Validate hex color format
 */
function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Get current gradient
 */
function getCurrentGradient() {
    return currentGradient;
}

/**
 * Reset to default gradient
 */
async function resetToDefault() {
    try {
        // Reset to default values
        currentGradient = { start: '#667eea', end: '#764ba2' };
        updateColorInputs(currentGradient.start, currentGradient.end);
        applyGradientToCard(currentGradient.start, currentGradient.end);
        
        $('.gradient-preset').removeClass('active');
        $('.gradient-preset[data-gradient="purple-blue"]').addClass('active');
        
        $('#use-custom-colors').prop('checked', false);
        $('#color-pickers-section').hide();
        
        // Call API to reset branding
        const response = await api.resetBranding();
        
        if (response.success) {
            MessageBox.success('Branding reset successfully');
        } else {
            showErrorMessage('Failed to reset branding: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error resetting branding:', error);
        showErrorMessage('Error resetting branding');
    }
}

/**
 * Apply gradient when digital card is loaded
 * Call this after card HTML is inserted into DOM
 */
function applyToLoadedCard() {
    // console.log('Applying saved gradient to loaded card...');
    applyGradientToCard(currentGradient.start, currentGradient.end);
}

/**
 * Generate the branding UI HTML
 * @returns {string} HTML string for the color customization UI
 */
function generateBrandingUI() {
    // console.log("Get brandingUI called.");
    let gradientOptionsHtml = '';
    
    // Generate gradient preset buttons (case-insensitive comparison)
    for (const [key, gradient] of Object.entries(gradients)) {
        const gradientStyle = `background: linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%);`;
        const isActive = (currentGradient.start.toLowerCase() === gradient.start.toLowerCase() && 
                         currentGradient.end.toLowerCase() === gradient.end.toLowerCase()) ? 'active' : '';
        
        gradientOptionsHtml += `
            <div class="gradient-preset ${isActive}" 
                 data-gradient="${key}"
                 style="${gradientStyle}"
                 title="${gradient.name}">
            </div>
        `;
    }
    
    return `
        <div class="digital-card-customization">
            <div class="customization-section">
                <h3 class="customization-title">
                    <i class="fas fa-palette"></i>
                    Card Branding Colors
                </h3>
                
                <!-- Gradient Presets -->
                <div class="gradient-presets">
                    <label class="preset-label">Choose a color scheme:</label>
                    <div class="gradient-options">
                        ${gradientOptionsHtml}
                    </div>
                </div>
               
               
                <!-- Custom Colors Section -->
                <div class="custom-color-section">
                    <label class="custom-color-label">
                        <input type="checkbox" id="use-custom-colors" class="custom-color-checkbox">
                        <span>Use custom colors</span>
                    </label>
                    
                    <div id="color-pickers-section" class="color-pickers" style="display: none;">
                        <div class="color-picker-group">
                            <span class="brand-label-color">Start Color</span>
                            <div class="color-input-wrapper">
                                <input type="color" id="card-color-start" class="card-color-input" value="${currentGradient.start}">
                                <input type="text" id="card-color-start-text" class="color-text-input" value="${currentGradient.start.toUpperCase()}" placeholder="#667EEA">
                            </div>
                        </div>
                        
                        <div class="color-picker-group">
                            <span class="brand-label-color">End Color</span>
                            <div class="color-input-wrapper">
                                <input type="color" id="card-color-end" class="card-color-input" value="${currentGradient.end}">
                                <input type="text" id="card-color-end-text" class="color-text-input" value="${currentGradient.end.toUpperCase()}" placeholder="#764BA2">
                            </div>
                        </div>
                        
                        <button id="apply-custom-colors" class="btn-apply-colors">
                            <i class="fas fa-check"></i>
                            Apply Custom Colors
                        </button>
                    </div>
                </div>
            </div>
            <div class="save-branding-btn-div">
                <button class="profile-card-buttons" id="save-branding-btn">
                    <i class="fa-regular fa-save"></i>
                    Save Branding
                </button>
            </div>
        </div>
    `;
}

/**
 * Insert branding UI into a container
 * @param {string|HTMLElement} container - CSS selector or DOM element
 */
async function insertBrandingUI(container) {
    const $container = typeof container === 'string' ? $(container) : $(container);
    
    if ($container.length === 0) {
        console.warn('Container not found for branding UI');
        return false;
    }
    
    // Generate and insert the HTML
    const html = generateBrandingUI();
    $container.html(html);
    
    // Initialize after inserting (and WAIT for it)
    if (!initialized) {
        await init();
    }
    
    // console.log('Branding UI inserted into container');
    return true;
}

// Export the module
const DigitalCardCustomization = {
    init,
    getCurrentGradient,
    resetToDefault,
    applyGradientToCard,
    applyToLoadedCard,
    generateBrandingUI,
    insertBrandingUI,
    savePreferences
};

export default DigitalCardCustomization;


//
//db.getCollection("profiles").updateMany(
//  { cardBranding: { $exists: false } },  // Condition
//  { 
//    $set: { 
//      cardBranding: {
//        gradientStart: "#667eea",
//        gradientEnd: "#764ba2",
//        updatedAt: new Date()           // current ISODate
//      }
//    }
//  }
//);