// Form Popup Display for Public Cards with Custom Questions Support
// Updated version of server/public/js/card-template/formPopup.js

class CardFormPopup {
    constructor(cardId) {
        this.cardId = cardId;
        this.formConfig = null;
        this.isSubmitted = false;
        this.pageLoadTime = Date.now();
        this.hasShown = false;
        
        this.init();
    }

    async init() {
        console.log('🔄 Initializing form popup for card:', this.cardId);
        
        // Load form configuration
        await this.loadFormConfig();
        
        if (this.formConfig && this.hasForm) {
            this.setupTriggers();
            this.createPopupHTML();
        }
    }

    async loadFormConfig() {
        try {
            const response = await fetch(`/api/forms/config/${this.cardId}`);
            const data = await response.json();
            
            if (data.success && data.hasForm) {
                console.log('✅ Form config loaded');
                this.formConfig = data.formConfig;
                this.hasForm = data.hasForm;
                console.log('📋 Custom questions available:', this.formConfig.customQuestions?.length || 0);
            } else {
                console.log('ℹ️ No active form for this card');
            }
        } catch (error) {
            console.error('Failed to load form config:', error);
        }
    }

    setupTriggers() {
        const triggers = this.formConfig.triggers;
        console.log('⚙️ Setting up form triggers:', triggers);

        // Trigger: Show on page load
        if (triggers.showOnLoad && triggers.showOnLoad.enabled) {
            const delay = (triggers.showOnLoad.delaySeconds || 3) * 1000;
            console.log(`⏰ Show on load enabled: ${delay}ms delay`);
            setTimeout(() => {
                this.showForm('on_load');
            }, delay);
        }

        // Trigger: Show on element click
        if (triggers.showOnClick && triggers.showOnClick.enabled) {
            console.log('🖱️ Show on click enabled');
            const elements = triggers.showOnClick.targetElements || ['save_contact'];
            
            elements.forEach(target => {
                let selector = '';
                switch (target) {
                    case 'save_contact':
                        selector = '.save-contact-btn, #saveContactBtn, [data-action="save-contact"]';
                        break;
                    case 'contact_button':
                        selector = '.contact-btn, .phone-btn, .email-btn';
                        break;
                    case 'social_icon':
                        selector = '.social-icon, .social-link';
                        break;
                    case 'any_clickable':
                        selector = 'a, button, .clickable, [onclick]';
                        break;
                    default:
                        selector = `.${target}`;
                }
                
                console.log(`🎯 Setting click trigger for: ${target} (${selector})`);
                
                $(document).on('click', selector, (e) => {
                    console.log(`🖱️ Click detected on:`, e.currentTarget, 'Target type:', target);
                    
                    // Don't show if already shown or submitted
                    if (this.isSubmitted || this.hasShown) {
                        console.log('⏭️ Form already shown or submitted, allowing normal action');
                        return;
                    }
                    
                    // For any_clickable, be more selective about what triggers the form
                    if (target === 'any_clickable') {
                        const $target = $(e.currentTarget);
                        // Skip if it's inside the form popup or is a form-related element
                        if ($target.closest('#formPopupOverlay').length > 0 ||
                            $target.hasClass('form-popup-close') ||
                            $target.hasClass('form-submit-btn')) {
                            return;
                        }
                    }
                    
                    // Prevent default action
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('✨ Showing form via click trigger');
                    this.showForm('on_click');
                    
                    // Store the original action to execute after form submission
                    const $currentTarget = $(e.currentTarget);
                    const originalHref = $currentTarget.attr('href');
                    const originalOnclick = $currentTarget.attr('onclick');
                    
                    if (originalHref) {
                        console.log('💾 Storing original href:', originalHref);
                        $('#formPopupOverlay').data('post-submit-action', originalHref);
                    }
                    
                    if (originalOnclick) {
                        console.log('💾 Storing original onclick:', originalOnclick);
                        $('#formPopupOverlay').data('post-submit-onclick', originalOnclick);
                    }
                });
            });
        }

        // Trigger: Show on exit intent
        if (triggers.showOnExit && triggers.showOnExit.enabled) {
            this.setupExitIntentTrigger();
        }

        // Trigger: Show on scroll
        if (triggers.showOnScroll && triggers.showOnScroll.enabled) {
            this.setupScrollTrigger(triggers.showOnScroll.scrollPercentage || 50);
        }
    }

    setupExitIntentTrigger() {
        let hasTriggered = false;
        
        $(document).on('mouseleave', (e) => {
            if (!hasTriggered && e.clientY < 10 && !this.isSubmitted && !this.hasShown) {
                this.showForm('on_exit');
                hasTriggered = true;
            }
        });
    }

    setupScrollTrigger(percentage) {
        let hasTriggered = false;
        
        $(window).on('scroll', () => {
            if (hasTriggered || this.isSubmitted || this.hasShown) return;
            
            const scrollPercent = ($(window).scrollTop() / ($(document).height() - $(window).height())) * 100;
            
            if (scrollPercent >= percentage) {
                this.showForm('on_scroll');
                hasTriggered = true;
            }
        });
    }

    createPopupHTML() {
        const { formTitle, formSubtitle, formDescription, branding, fields, ctaButtons, settings, customQuestions } = this.formConfig;
        
        const popupHTML = `
            <div id="formPopupOverlay" class="form-popup-overlay" style="display: none;">
                <div class="form-popup-container">
                    <button class="form-popup-close" id="closeFormPopup">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="form-popup-header" style="background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);">
                        <h2>${formTitle}</h2>
                        ${formSubtitle ? `<p>${formSubtitle}</p>` : ''}
                    </div>
                    
                    <div class="form-popup-body">
                        ${formDescription ? `<p class="form-description">${formDescription}</p>` : ''}
                        
                        <form id="visitorFormPopup" class="visitor-form">
                            ${this.renderFormFields(fields)}
                            
                            ${this.renderCustomQuestions(customQuestions, branding)}
                            
                            ${ctaButtons && ctaButtons.length > 0 ? this.renderCTAButtons(ctaButtons, branding) : ''}
                            
                            <button type="submit" class="form-submit-btn" style="background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%);">
                                ${settings.submitButtonText || 'Submit'}
                            </button>
                        </form>
                        
                        <div id="formSuccessMessage" class="form-success-message" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <p>${settings.successMessage || 'Thank you for your submission!'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(popupHTML);
        this.attachFormEventListeners();
        this.initPopupRatingStars();
    }

    renderFormFields(fields) {
        let html = '';
        
        fields.filter(f => f.isEnabled).forEach(field => {
            const isRequired = field.isRequired;
            const requiredAttr = isRequired ? 'required' : '';
            const requiredMark = isRequired ? '<span class="required-mark">*</span>' : '';

            html += `<div class="form-field-group">`;
            html += `<label>${field.label}${requiredMark}</label>`;

            switch (field.fieldType) {
                case 'name':
                case 'email':
                case 'phone':
                case 'company':
                case 'job_title':
                case 'website':
                    const inputType = field.fieldType === 'email' ? 'email' : 
                                    field.fieldType === 'phone' ? 'tel' : 'text';
                    html += `<input type="${inputType}" name="${field.fieldType}" class="form-input" placeholder="${field.placeholder || ''}" ${requiredAttr}>`;
                    break;

                case 'notes':
                case 'feedback':
                    html += `<textarea name="${field.fieldType}" class="form-textarea" placeholder="${field.placeholder || ''}" rows="4" ${requiredAttr}></textarea>`;
                    break;

                case 'review_rating':
                    html += `
                        <div class="popup-star-rating" data-rating="0">
                            <span class="popup-star" data-rating="1">★</span>
                            <span class="popup-star" data-rating="2">★</span>
                            <span class="popup-star" data-rating="3">★</span>
                            <span class="popup-star" data-rating="4">★</span>
                            <span class="popup-star" data-rating="5">★</span>
                            <input type="hidden" name="review_rating" value="">
                            <div class="popup-rating-text">Click to rate</div>
                        </div>
                    `;
                    break;

                case 'calendly_link':
                    html += `
                        <a href="${field.placeholder || '#'}" target="_blank" class="calendly-btn">
                            <i class="fas fa-calendar-alt"></i>
                            Schedule a Meeting
                        </a>
                    `;
                    break;

                default:
                    html += `<input type="text" name="${field.fieldType}" class="form-input" placeholder="${field.placeholder || ''}" ${requiredAttr}>`;
                    break;
            }

            html += `</div>`;
        });

        return html;
    }

    // ✨ NEW: Render custom questions
    renderCustomQuestions(customQuestions, branding) {
        if (!customQuestions || customQuestions.length === 0) {
            return '';
        }

        let html = `
            <div class="custom-questions-divider">
                <h4 class="custom-questions-heading" style="color: ${branding.primaryColor};">
                    Additional Questions
                </h4>
            </div>
        `;

        customQuestions.forEach((question, index) => {
            if (!question.question || question.question.trim() === '') return;

            const isRequired = question.isRequired;
            const requiredAttr = isRequired ? 'required' : '';
            const requiredMark = isRequired ? '<span class="required-mark">*</span>' : '';
           
            const fieldName = question.id;
            html += `<div class="form-field-group custom-question-field">`;
            html += `<label>${question.question}${requiredMark}</label>`;

            switch (question.answerType) {
                case 'text':
                    html += `<input type="text" name="${fieldName}" class="form-input" placeholder="Enter your answer..." ${requiredAttr}>`;
                    break;

                case 'textarea':
                    html += `<textarea name="${fieldName}" class="form-textarea" placeholder="Enter detailed response..." rows="3" ${requiredAttr}></textarea>`;
                    break;

                case 'radio':
                    html += `<div class="popup-radio-options">`;
                    (question.options || ['Option 1', 'Option 2']).forEach((option, optionIndex) => {
                        html += `
                            <label class="popup-radio-label">
                                <input type="radio" name="${fieldName}" value="${option}" ${requiredAttr}>
                                <span class="radio-text">${option}</span>
                            </label>
                        `;
                    });
                    html += `</div>`;
                    break;

                case 'checkbox':
                    html += `<div class="popup-checkbox-options">`;
                    (question.options || ['Option 1', 'Option 2']).forEach((option, optionIndex) => {
                        html += `
                            <label class="popup-checkbox-label">
                                <input type="checkbox" name="${fieldName}" value="${option}">
                                <span class="checkbox-text">${option}</span>
                            </label>
                        `;
                    });
                    html += `</div>`;
                    break;

                case 'select':
                    html += `<select name="${fieldName}" class="form-select" ${requiredAttr}>`;
                    html += `<option value="">Select an option...</option>`;
                    (question.options || ['Option 1', 'Option 2']).forEach((option, optionIndex) => {
                        html += `<option value="${option}">${option}</option>`;
                    });
                    html += `</select>`;
                    break;

                case 'rating':
                    html += `
                        <div class="popup-star-rating" data-rating="0">
                            <span class="popup-star" data-rating="1">★</span>
                            <span class="popup-star" data-rating="2">★</span>
                            <span class="popup-star" data-rating="3">★</span>
                            <span class="popup-star" data-rating="4">★</span>
                            <span class="popup-star" data-rating="5">★</span>
                            <input type="hidden" name="${fieldName}" value="">
                            <div class="popup-rating-text">Click to rate</div>
                        </div>
                    `;
                    break;

                default:
                    html += `<input type="text" name="${fieldName}" class="form-input" placeholder="Enter your answer..." ${requiredAttr}>`;
                    break;
            }

            html += `</div>`;
        });

        return html;
    }

    renderCTAButtons(ctaButtons, branding) {
        let html = '<div class="form-cta-buttons">';
        
        ctaButtons.forEach(button => {
            const buttonStyle = button.style === 'primary' ?
                `background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%); color: white; border: none;` :
                button.style === 'secondary' ?
                    `background: ${branding.secondaryColor}; color: white; border: none;` :
                    `background: white; color: ${branding.primaryColor}; border: 2px solid ${branding.primaryColor};`;

            const target = button.openInNewTab ? '_blank' : '_self';
            
            html += `
                <a href="${button.url}" target="${target}" class="form-cta-btn" style="${buttonStyle}">
                    ${button.text}
                </a>
            `;
        });

        html += '</div>';
        return html;
    }

    // ✨ NEW: Initialize rating stars in popup
    initPopupRatingStars() {
        // Handle star hover effects
        $(document).off('mouseenter.popupRating').on('mouseenter.popupRating', '.popup-star', function() {
            const rating = parseInt($(this).data('rating'));
            const $container = $(this).closest('.popup-star-rating');
            
            // Highlight stars up to hovered star
            $container.find('.popup-star').each(function(index) {
                if (index < rating) {
                    $(this).css('color', '#fbbf24'); // Gold color
                } else {
                    $(this).css('color', '#e2e8f0'); // Light gray
                }
            });
        });
        
        // Handle mouse leave - restore selected rating
        $(document).off('mouseleave.popupRating').on('mouseleave.popupRating', '.popup-star-rating', function() {
            const selectedRating = parseInt($(this).data('rating'));
            
            $(this).find('.popup-star').each(function(index) {
                if (index < selectedRating) {
                    $(this).css('color', '#fbbf24'); // Gold color for selected
                } else {
                    $(this).css('color', '#e2e8f0'); // Light gray for unselected
                }
            });
        });
        
        // Handle star click
        $(document).off('click.popupRating').on('click.popupRating', '.popup-star', function() {
            const rating = parseInt($(this).data('rating'));
            const $container = $(this).closest('.popup-star-rating');
            
            // Update container's data-rating attribute
            $container.data('rating', rating);
            $container.attr('data-rating', rating);
            
            // Update hidden input value
            $container.find('input[type="hidden"]').val(rating);
            
            // Update visual state
            $container.find('.popup-star').each(function(index) {
                if (index < rating) {
                    $(this).css('color', '#fbbf24'); // Gold color
                } else {
                    $(this).css('color', '#e2e8f0'); // Light gray
                }
            });
            
            // Update text
            const ratingTexts = {
                1: '⭐ Poor',
                2: '⭐⭐ Fair', 
                3: '⭐⭐⭐ Good',
                4: '⭐⭐⭐⭐ Very Good',
                5: '⭐⭐⭐⭐⭐ Excellent'
            };
            
            $container.find('.popup-rating-text').text(ratingTexts[rating] || 'Click to rate');
            
            console.log('⭐ Rating selected:', rating);
        });
    }

    attachFormEventListeners() {
        // Close popup - handle both button and icon clicks
        $('#closeFormPopup').on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Close button clicked');
            this.hideForm();
        });
        
        // Close when clicking overlay background
        $('#formPopupOverlay').on('click', (e) => {
            if (e.target.id === 'formPopupOverlay') {
                console.log('❌ Overlay clicked, closing form');
                this.hideForm();
            }
        });

        // Prevent closing when clicking inside form
        $('.form-popup-container').on('click', (e) => {
            e.stopPropagation();
        });

        // Form submission
        $('#visitorFormPopup').on('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    showForm(triggerType) {
        if (this.hasShown) return;
        
        this.hasShown = true;
        $('#formPopupOverlay').fadeIn(300);
        $('body').css('overflow', 'hidden');
        
        console.log(`📝 Form shown via: ${triggerType}`);
        
        // Store trigger type for analytics
        $('#formPopupOverlay').data('trigger-type', triggerType);
    }

    hideForm() {
        $('#formPopupOverlay').fadeOut(300);
        $('body').css('overflow', 'auto');
    }

    async submitForm() {
        try {
            const formData = {};
            const triggerType = $('#formPopupOverlay').data('trigger-type') || 'manual';
            
            // Collect standard form data
            $('#visitorFormPopup input, #visitorFormPopup textarea, #visitorFormPopup select').each(function() {
                const name = $(this).attr('name');
                const value = $(this).val();
                
                if (name && value) {
                    formData[name] = value;
                }
            });

            // ✨ Collect custom question checkbox/radio data
            $('#visitorFormPopup input[type="checkbox"]:checked').each(function() {
                const name = $(this).attr('name');
                const value = $(this).val();
                
                if (name && value) {
                    if (formData[name]) {
                        // If already exists, make it an array
                        if (!Array.isArray(formData[name])) {
                            formData[name] = [formData[name]];
                        }
                        formData[name].push(value);
                    } else {
                        formData[name] = value;
                    }
                }
            });

            // ✨ Collect rating data (both standard and custom)
            $('.popup-star-rating').each(function() {
                const rating = parseInt($(this).data('rating'));
                const $hiddenInput = $(this).find('input[type="hidden"]');
                
                if (rating > 0 && $hiddenInput.length) {
                    const name = $hiddenInput.attr('name');
                    if (name) {
                        formData[name] = rating;
                    }
                }
            });

            console.log('📋 Submitting form data:', formData);

            const timeOnPage = Math.floor((Date.now() - this.pageLoadTime) / 1000);

            const response = await fetch(`/api/forms/submit/${this.cardId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    formData: formData,
                    context: {
                        triggerType: triggerType,
                        timeOnPageSeconds: timeOnPage,
                        previousUrl: document.referrer || ''
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                this.isSubmitted = true;
                this.showSuccessMessage(data.message);
                
                // Get stored post-submit actions
                const postActionHref = $('#formPopupOverlay').data('post-submit-action');
                const postActionOnclick = $('#formPopupOverlay').data('post-submit-onclick');
                
                // Auto-close if enabled
                const settings = this.formConfig.settings;
                const autoCloseDelay = (settings.enableAutoClose && settings.autoCloseDelaySeconds) 
                    ? settings.autoCloseDelaySeconds * 1000 
                    : 2000; // Default 2 seconds
                
                setTimeout(() => {
                    this.hideForm();
                    
                    // Execute post-submit actions after form closes
                    if (postActionOnclick) {
                        console.log('🎬 Executing stored onclick:', postActionOnclick);
                        try {
                            // Execute the stored onclick function
                            eval(postActionOnclick);
                        } catch (error) {
                            console.error('Error executing onclick:', error);
                        }
                    } else if (postActionHref) {
                        console.log('🔗 Navigating to stored href:', postActionHref);
                        window.location.href = postActionHref;
                    }
                }, autoCloseDelay);
            } else {
                this.showError(data.message || 'Submission failed. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('An error occurred. Please try again.');
        }
    }

    showSuccessMessage(message) {
        $('#visitorFormPopup').hide();
        $('#formSuccessMessage').show();
    }

    showError(message) {
        // Create or update error message
        let $errorDiv = $('#formErrorMessage');
        if ($errorDiv.length === 0) {
            $errorDiv = $('<div id="formErrorMessage" class="form-error-message"></div>');
            $('#visitorFormPopup').prepend($errorDiv);
        }
        
        $errorDiv.html(`
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `).show();
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            $errorDiv.fadeOut();
        }, 5000);
    }
}

// Auto-initialize when card page loads
$(document).ready(function() {
    // Get cardId from page data
    const cardId = window.location.pathname.split('/').pop();
    
    if (cardId && cardId.length > 5) {
        window.cardFormPopup = new CardFormPopup(cardId);
    }
});