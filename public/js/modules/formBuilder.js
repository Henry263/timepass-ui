// Form Builder ES6 Module
// server/public/js/ui/formBuilder.js

import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';
import { showLoadingMessage, hideLoadingMessage } from '../utils/helpers.js';
import MessageBox from './message-box.js'

class FormBuilder {
    constructor() {
        this.currentConfig = null;
        this.activeFields = [];
        this.ctaButtons = [];
        this.isDirty = false;

        // Custom Questions Properties
        this.customQuestions = [];
        this.maxCustomQuestions = 5;
        this.questionsBank = {};
        this.currentIndustry = '';

        // ✨ BEHAVIOR SETTINGS - NEW PROPERTIES ✨
        this.behaviorSettings = {
            allowMultipleShows: true,
            resetAfterClose: true,
            blockAfterSubmit: true
        };

        this.behaviorPresets = {
            recommended: {
                allowMultipleShows: true,
                resetAfterClose: true,
                blockAfterSubmit: true
            },
            once: {
                allowMultipleShows: false,
                resetAfterClose: false,
                blockAfterSubmit: true
            },
            persistent: {
                allowMultipleShows: true,
                resetAfterClose: true,
                blockAfterSubmit: false
            },
            retriggerable: {
                allowMultipleShows: false,
                resetAfterClose: true,
                blockAfterSubmit: true
            }
        };

        this.behaviorPreviewTexts = {
            'true-true-true': '✅ Form shows multiple times until visitor submits. After submission, all clicks work normally. (Recommended)',
            'false-false-true': '📌 Form shows ONCE per page visit and never again. Very non-intrusive.',
            'true-true-false': '⚠️ Form shows EVERY time a trigger fires, even after submission. (Aggressive - may annoy users)',
            'false-true-true': '🔄 Form shows once, but can appear again if visitor closes it and triggers another action.',
            'true-false-true': '🔁 Form shows on every trigger, but closing permanently hides it.',
            'false-false-false': '🔒 Form shows once and is permanently blocked afterward.',
            'true-false-false': '♾️ Form keeps showing continuously without reset.',
            'false-true-false': '🔃 Form shows once per cycle, allowing retriggering after close.'
        };

        console.log('🎨 FormBuilder class instantiated');
    }

    // Initialize method - called when tab becomes active
    init() {
        console.log('🎨 Initializing Form Builder...');
        this.attachEventListeners();

        // ✨ INITIALIZE BEHAVIOR SETTINGS ✨
        this.initBehaviorSettings();

        this.loadFormConfiguration();

        // Initialize custom questions
        this.initCustomQuestions();

        const $input = $('#notificationEmail');

        // Prevent any typing, pasting, or dragging into the input
        $input.on('keydown paste drop', function(e) {
            e.preventDefault();
        });

    }

    attachEventListeners() {
        // Save Configuration
        $('#saveFormConfigBtn').off('click').on('click', () => this.saveConfiguration());

        // Toggle Form Status
        $('#formActiveToggle').off('change').on('change', (e) => this.toggleFormStatus(e.target.checked));

        // Use Branding Colors
        $('#useBrandingColors').off('click').on('click', () => this.applyBrandingColors());

        // Color Pickers
        $('#formPrimaryColor').off('input').on('input', (e) => {
            $('#formPrimaryColorHex').val(e.target.value);
            this.updatePreview();
        });

        $('#formSecondaryColor').off('input').on('input', (e) => {
            $('#formSecondaryColorHex').val(e.target.value);
            this.updatePreview();
        });

        // Form Title/Subtitle Changes
        $('#formTitle, #formSubtitle, #formDescription').off('input').on('input', () => {
            this.updatePreview();
            this.updatePreview();
        });

        // Custom Questions Event Listeners
        $('#industrySelect').off('change').on('change', (e) => this.handleIndustryChange(e.target.value));
        $('#addCustomQuestionBtn').off('click').on('click', () => this.addCustomQuestion());
        
        // Event delegation for dynamic question elements - use form builder container instead of document
        const $formContainer = $('.form-builder-container');
        
        // Clear existing custom questions event handlers
        $formContainer.off('input.customQuestions click.customQuestions');
        
        // Question input events
        $formContainer.on('input.customQuestions', '.question-input', (e) => {
            console.log('Question input triggered:', e.target);
            this.handleQuestionInput(e);
        });
        
        // Suggestion selection
        $formContainer.on('click.customQuestions', '.suggestion-item', (e) => {
            console.log('Suggestion clicked:', e.target);
            this.selectSuggestion(e);
        });
        
        // Delete question button
        $formContainer.on('click.customQuestions', '.btn-delete-question', (e) => {
            console.log('Delete question clicked:', e.target);
            e.preventDefault();
            e.stopPropagation();
            this.deleteCustomQuestion(e);
        });
        
        // Answer type selection
        $formContainer.on('click.customQuestions', '.answer-type-option', (e) => {
            console.log('Answer type clicked:', e.target);
            this.selectAnswerType(e);
        });
        
        // Add option button
        $formContainer.on('click.customQuestions', '.btn-add-option', (e) => {
            console.log('Add option clicked:', e.target);
            this.addAnswerOption(e);
        });
        
        // Remove option button
        $formContainer.on('click.customQuestions', '.btn-remove-option', (e) => {
            console.log('Remove option clicked:', e.target);
            this.removeAnswerOption(e);
        });

        // Option input changes
        $formContainer.on('input.customQuestions', '.option-input', (e) => {
            const questionId = $(e.target).data('question-id');
            const optionIndex = $(e.target).data('option-index');
            const value = $(e.target).val();
            
            const question = this.customQuestions.find(q => q.id === questionId);
            if (question && question.options) {
                question.options[optionIndex] = value;
            }
        });

        // Form Title/Subtitle Changes
        $('#formTitle, #formSubtitle, #formDescription').off('input').on('input', () => {
            this.isDirty = true;
            this.updatePreview();
        });

        // Character Counter
        $('#formDescription').off('input').on('input', (e) => {
            $('#descCharCount').text(e.target.value.length);
        });

        // Trigger Checkboxes
        $('#triggerOnLoad').off('change').on('change', (e) => {
            $('#onLoadConfig').toggle(e.target.checked);
        });

        $('#triggerOnScroll').off('change').on('change', (e) => {
            $('#onScrollConfig').toggle(e.target.checked);
        });

        // Scroll Percentage Slider
        $('#scrollPercentage').off('input').on('input', (e) => {
            $('#scrollPercentageValue').text(e.target.value + '%');
        });

        // Add Field Button
        $('#addFieldBtn').off('click').on('click', () => this.showFieldLibrary());

        // Field Cards Click
        $('.field-card').off('click').on('click', (e) => {
            const fieldType = $(e.currentTarget).data('field-type');
            this.addField(fieldType);
        });

        // Add CTA Button
        $('#addCTAButton').off('click').on('click', () => this.showCTAModal());

        // CTA Modal Actions
        $('#saveCTAButton').off('click').on('click', () => this.saveCTAButton());
        $('#cancelCTAButton, #closeCTAModal').off('click').on('click', () => this.closeCTAModal());

        // Field Config Modal
        $('#saveFieldConfig').off('click').on('click', () => this.saveFieldConfiguration());
        $('#cancelFieldConfig, #closeFieldConfigModal').off('click').on('click', () => this.closeFieldConfigModal());

        // Preview Form Button
        $('#previewFormBtn').off('click').on('click', () => this.showFullPreview());

        // Submissions Filter
        // $('#submissionsStatusFilter').off('change').on('change', (e) => {
        //     this.loadSubmissions(e.target.value);
        // });

        // Export Submissions
        $('#exportSubmissionsBtn').off('click').on('click', () => this.exportSubmissions());

        // Device Preview Toggle
        $('.device-btn').off('click').on('click', (e) => {
            $('.device-btn').removeClass('active');
            $(e.currentTarget).addClass('active');
            const device = $(e.currentTarget).data('device');
            this.switchPreviewDevice(device);
        });

        // Close Submission Modal
        $('#closeSubmissionDetailsBtn, #closeSubmissionModal').off('click').on('click', () => {
            $('#submissionDetailsModal').hide();
        });
    }

    // ============================================
    // ✨ BEHAVIOR SETTINGS METHODS - NEW ✨
    // ============================================

    initBehaviorSettings() {
        console.log('🎨 Initializing behavior settings');

        // Get DOM elements
        this.behaviorElements = {
            allowMultiple: document.getElementById('allowMultipleShows'),
            resetAfter: document.getElementById('resetAfterClose'),
            blockAfter: document.getElementById('blockAfterSubmit'),
            preset: document.getElementById('behaviorPreset'),
            preview: document.getElementById('behaviorPreviewText')
        };

        // Check if elements exist
        if (!this.behaviorElements.allowMultiple) {
            console.warn('⚠️ Behavior settings elements not found in DOM');
            return;
        }

        // Load saved settings from localStorage
        this.loadBehaviorSettings();

        // Attach event listeners
        this.attachBehaviorListeners();

        // Update preview
        this.updateBehaviorPreview();

        console.log('✅ Behavior settings initialized');
    }

    attachBehaviorListeners() {
        // Toggle change handlers
        if (this.behaviorElements.allowMultiple) {
            $(this.behaviorElements.allowMultiple).off('change').on('change', (e) => {
                this.behaviorSettings.allowMultipleShows = e.target.checked;
                this.handleBehaviorChange();
            });
        }

        if (this.behaviorElements.resetAfter) {
            $(this.behaviorElements.resetAfter).off('change').on('change', (e) => {
                this.behaviorSettings.resetAfterClose = e.target.checked;
                this.handleBehaviorChange();
            });
        }

        if (this.behaviorElements.blockAfter) {
            $(this.behaviorElements.blockAfter).off('change').on('change', (e) => {
                this.behaviorSettings.blockAfterSubmit = e.target.checked;
                this.handleBehaviorChange();
            });
        }

        // Preset selector handler
        if (this.behaviorElements.preset) {
            $(this.behaviorElements.preset).off('change').on('change', (e) => {
                this.applyBehaviorPreset(e.target.value);
            });
        }
    }

    handleBehaviorChange() {
        this.updateBehaviorPreview();
        this.detectBehaviorPreset();
        this.saveBehaviorSettings();
        this.isDirty = true;

        console.log('⚙️ Behavior settings changed:', this.behaviorSettings);
    }

    applyBehaviorPreset(presetName) {
        if (presetName === 'custom') return;

        const preset = this.behaviorPresets[presetName];
        if (!preset) {
            console.warn('⚠️ Unknown behavior preset:', presetName);
            return;
        }

        console.log('🎯 Applying behavior preset:', presetName);

        // Update settings
        this.behaviorSettings = { ...preset };

        // Update UI
        this.updateBehaviorCheckboxes();
        this.updateBehaviorPreview();
        this.saveBehaviorSettings();
        this.isDirty = true;
    }

    detectBehaviorPreset() {
        const key = `${this.behaviorSettings.allowMultipleShows}-${this.behaviorSettings.resetAfterClose}-${this.behaviorSettings.blockAfterSubmit}`;

        // Check if current settings match any preset
        for (const [name, preset] of Object.entries(this.behaviorPresets)) {
            const presetKey = `${preset.allowMultipleShows}-${preset.resetAfterClose}-${preset.blockAfterSubmit}`;
            if (key === presetKey) {
                if (this.behaviorElements.preset) {
                    $(this.behaviorElements.preset).val(name);
                }
                return;
            }
        }

        // No match - set to custom
        if (this.behaviorElements.preset) {
            $(this.behaviorElements.preset).val('custom');
        }
    }

    updateBehaviorCheckboxes() {
        if (this.behaviorElements.allowMultiple) {
            this.behaviorElements.allowMultiple.checked = this.behaviorSettings.allowMultipleShows;
        }
        if (this.behaviorElements.resetAfter) {
            this.behaviorElements.resetAfter.checked = this.behaviorSettings.resetAfterClose;
        }
        if (this.behaviorElements.blockAfter) {
            this.behaviorElements.blockAfter.checked = this.behaviorSettings.blockAfterSubmit;
        }
    }

    updateBehaviorPreview() {
        if (!this.behaviorElements.preview) return;

        const key = `${this.behaviorSettings.allowMultipleShows}-${this.behaviorSettings.resetAfterClose}-${this.behaviorSettings.blockAfterSubmit}`;
        const text = this.behaviorPreviewTexts[key] || '⚙️ Custom configuration active.';

        $(this.behaviorElements.preview).text(text);
    }

    saveBehaviorSettings() {
        try {
            localStorage.setItem('formBehaviorSettings', JSON.stringify(this.behaviorSettings));
            console.log('💾 Behavior settings saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save behavior settings:', error);
        }
    }

    loadBehaviorSettings() {
        try {
            const saved = localStorage.getItem('formBehaviorSettings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.behaviorSettings = { ...this.behaviorSettings, ...parsedSettings };
                this.updateBehaviorCheckboxes();
                console.log('📂 Behavior settings loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to load behavior settings:', error);
        }
    }

    getBehaviorSettings() {
        return { ...this.behaviorSettings };
    }

    loadBehaviorFromConfig(formConfig) {
        if (!formConfig || !formConfig.settings) {
            console.warn('⚠️ No settings in config for behavior loading');
            return;
        }

        const { allowMultipleShows, resetAfterClose, blockAfterSubmit } = formConfig.settings;

        // Update only if values are defined
        if (typeof allowMultipleShows !== 'undefined') {
            this.behaviorSettings.allowMultipleShows = allowMultipleShows;
        }
        if (typeof resetAfterClose !== 'undefined') {
            this.behaviorSettings.resetAfterClose = resetAfterClose;
        }
        if (typeof blockAfterSubmit !== 'undefined') {
            this.behaviorSettings.blockAfterSubmit = blockAfterSubmit;
        }

        // Update UI
        this.updateBehaviorCheckboxes();
        this.updateBehaviorPreview();
        this.detectBehaviorPreset();

        console.log('📥 Behavior settings loaded from server config');
    }

    resetBehaviorSettings() {
        this.behaviorSettings = {
            allowMultipleShows: true,
            resetAfterClose: true,
            blockAfterSubmit: true
        };

        this.updateBehaviorCheckboxes();
        this.updateBehaviorPreview();
        this.detectBehaviorPreset();
        this.saveBehaviorSettings();

        console.log('🔄 Behavior settings reset to defaults');
    }

    // ============================================
    // LOAD & SAVE CONFIGURATION
    // ============================================

    async loadFormConfiguration() {
        try {
            const response = await fetch('/api/forms/config', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.currentConfig = data.formConfig;
                this.populateFormBuilder(data.formConfig);

                // ✨ LOAD BEHAVIOR SETTINGS FROM CONFIG ✨
                this.loadBehaviorFromConfig(data.formConfig);

                // await this.loadSubmissions();
                this.updateformid(data.formConfig);
                this.setupCopyFormIDButton()
            }
        } catch (error) {
            console.error('Load form config error:', error);
            showErrorMessage('Failed to load form configuration');
        }
    }

    populateFormBuilder(config) {
        // Basic Info
        $('#formTitle').val(config.formTitle || 'Get In Touch');
        $('#formSubtitle').val(config.formSubtitle || '');
        $('#formDescription').val(config.formDescription || '');
        $('#descCharCount').text((config.formDescription || '').length);

        // Branding Colors
        $('#formPrimaryColor').val(config.branding?.primaryColor || '#1e7133');
        $('#formPrimaryColorHex').val(config.branding?.primaryColor || '#1e7133');
        $('#formSecondaryColor').val(config.branding?.secondaryColor || '#808b2d');
        $('#formSecondaryColorHex').val(config.branding?.secondaryColor || '#808b2d');

        // Fields
        this.activeFields = config.fields || [];
        this.renderActiveFields();

        // CTA Buttons
        this.ctaButtons = config.ctaButtons || [];
        this.renderCTAButtons();

        // Triggers
        if (config.triggers) {
            $('#triggerOnLoad').prop('checked', config.triggers.showOnLoad?.enabled || false);
            $('#onLoadDelay').val(config.triggers.showOnLoad?.delaySeconds || 3);
            $('#onLoadConfig').toggle(config.triggers.showOnLoad?.enabled || false);

            $('#triggerOnClick').prop('checked', config.triggers.showOnClick?.enabled || false);

            // ✅ Populate targetElements checkboxes in onClickConfig
            if (config.triggers.showOnClick?.targetElements) {
                // First, uncheck all checkboxes
                $('#onClickConfig input[type="checkbox"]').prop('checked', false);

                // Then check the ones that are in targetElements array
                config.triggers.showOnClick.targetElements.forEach(target => {
                    $(`#onClickConfig input[type="checkbox"][value="${target}"]`).prop('checked', true);
                });
            }

            $('#triggerOnExit').prop('checked', config.triggers.showOnExit?.enabled || false);

            $('#triggerOnScroll').prop('checked', config.triggers.showOnScroll?.enabled || false);
            $('#scrollPercentage').val(config.triggers.showOnScroll?.scrollPercentage || 50);
            $('#scrollPercentageValue').text((config.triggers.showOnScroll?.scrollPercentage || 50) + '%');
            $('#onScrollConfig').toggle(config.triggers.showOnScroll?.enabled || false);
        }

        // Settings
        if (config.settings) {
            $('#submitButtonText').val(config.settings.submitButtonText || 'Submit');
            $('#successMessage').val(config.settings.successMessage || 'Thank you for your submission!');
            $('#enableAutoClose').prop('checked', config.settings.enableAutoClose !== false);
            $('#autoCloseDelay').val(config.settings.autoCloseDelaySeconds || 3);
            $('#allowMultipleSubmissions').prop('checked', config.settings.allowMultipleSubmissions || false);
            $('#enableNotifications').prop('checked', config.settings.enableNotifications || false);
            $('#notificationEmail').val(config.settings.notificationEmail || '');
        }

        // Form Status
        $('#formActiveToggle').prop('checked', config.isActive !== false);
        $('#formStatusText').text(config.isActive !== false ?
            'Form is currently active' : 'Form is currently inactive');


        if (config.customQuestions) {
            this.customQuestions = [...config.customQuestions];
            this.renderCustomQuestions();
        }
        
        // Load selected industry
        if (config.selectedIndustry) {
            this.currentIndustry = config.selectedIndustry;
            $('#industrySelect').val(config.selectedIndustry);
        }
        
        // Update custom questions UI
        this.updateCustomQuestionsCount();
        this.toggleAddQuestionButton();

        this.updatePreview();
        this.updateFieldCardStates();
    }

    async saveConfiguration() {
        try {
            const formConfig = this.buildConfigObject();

            console.log('Saving custom questions:', formConfig.customQuestions);
            console.log('Selected industry:', formConfig.selectedIndustry);
            console.log('Full form config:', formConfig);

            const response = await fetch('/api/forms/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formConfig)
            });

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Form configuration saved successfully!');
                this.currentConfig = data.formConfig;
                this.isDirty = false;
            } else {
                showErrorMessage(data.message || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Save config error:', error);
            showErrorMessage('Failed to save form configuration');
        }
    }

    buildConfigObject() {
        const triggers = {
            showOnLoad: {
                enabled: $('#triggerOnLoad').is(':checked'),
                delaySeconds: parseInt($('#onLoadDelay').val()) || 3
            },
            showOnClick: {
                enabled: $('#triggerOnClick').is(':checked'),
                targetElements: []
            },
            showOnExit: {
                enabled: $('#triggerOnExit').is(':checked')
            },
            showOnScroll: {
                enabled: $('#triggerOnScroll').is(':checked'),
                scrollPercentage: parseInt($('#scrollPercentage').val()) || 50
            }
        };

        $('#onClickConfig input[type="checkbox"]:checked').each(function () {
            triggers.showOnClick.targetElements.push($(this).val());
        });

        return {
            formTitle: $('#formTitle').val(),
            formSubtitle: $('#formSubtitle').val(),
            formDescription: $('#formDescription').val(),
            branding: {
                primaryColor: $('#formPrimaryColor').val(),
                secondaryColor: $('#formSecondaryColor').val()
            },
            fields: this.activeFields,
            ctaButtons: this.ctaButtons,
            triggers: triggers,
            settings: {
                submitButtonText: $('#submitButtonText').val(),
                successMessage: $('#successMessage').val(),
                enableAutoClose: $('#enableAutoClose').is(':checked'),
                autoCloseDelaySeconds: parseInt($('#autoCloseDelay').val()) || 3,
                allowMultipleSubmissions: $('#allowMultipleSubmissions').is(':checked'),
                enableNotifications: $('#enableNotifications').is(':checked'),
                notificationEmail: $('#notificationEmail').val(),

                // ✨ INCLUDE BEHAVIOR SETTINGS ✨
                ...this.getBehaviorSettings()
            },
            customQuestions: this.customQuestions || [],
            selectedIndustry: this.currentIndustry || ''
        };
    }

    async toggleFormStatus(isActive) {
        try {
            const response = await fetch('/api/forms/config/toggle', {
                method: 'PUT',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                $('#formStatusText').text(data.isActive ? 'Form is currently active' : 'Form is currently inactive');
                showSuccessMessage(`Form ${data.isActive ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (error) {
            console.error('Toggle form error:', error);
            showErrorMessage('Failed to toggle form status');
        }
    }

    // ============================================
    // FIELD MANAGEMENT
    // ============================================

    addField(fieldType) {
        const fieldDefinitions = {
            name: { icon: 'fa-user', label: 'Full Name', placeholder: 'Enter your name' },
            email: { icon: 'fa-envelope', label: 'Email Address', placeholder: 'your@email.com' },
            phone: { icon: 'fa-phone', label: 'Phone Number', placeholder: '+1 (555) 123-4567' },
            company: { icon: 'fa-building', label: 'Company', placeholder: 'Company name' },
            job_title: { icon: 'fa-briefcase', label: 'Job Title', placeholder: 'Your position' },
            website: { icon: 'fa-globe', label: 'Website', placeholder: 'https://example.com' },
            notes: { icon: 'fa-sticky-note', label: 'Message', placeholder: 'Your message...' },
            feedback: { icon: 'fa-comment', label: 'Feedback', placeholder: 'Share your feedback' },
            review_rating: { icon: 'fa-star', label: 'Rating', placeholder: 'Rate your experience' },
            question: { icon: 'fa-question-circle', label: 'Question', placeholder: 'Ask a question' },
            calendly_link: { icon: 'fa-calendar-alt', label: 'Schedule Meeting', placeholder: 'Calendly URL' }
        };

        const def = fieldDefinitions[fieldType];

        // Check if field type already exists (prevent duplicates)
        const existingField = this.activeFields.find(field => field.fieldType === fieldType);

        if (existingField) {
            showErrorMessage(`${def.label} field already exists in the form. You can only add one ${def.label} field.`);
            return;
        }

        const newField = {
            fieldType: fieldType,
            label: def.label,
            placeholder: def.placeholder,
            isRequired: false,
            isEnabled: true,
            order: this.activeFields.length
        };

        this.activeFields.push(newField);
        this.renderActiveFields();
        this.updatePreview();
        this.updateFieldCardStates();
        this.isDirty = true;

        showSuccessMessage(`${def.label} field added`);
    }

    renderActiveFields() {
        const container = $('#fieldsDropzone');

        if (this.activeFields.length === 0) {
            container.html(`
                <div class="empty-state">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Click on a field above to add it to your form</p>
                </div>
            `);
            $('#activeFieldCount').text('(0 fields)');
            return;
        }

        const iconMap = {
            name: 'fa-user', email: 'fa-envelope', phone: 'fa-phone',
            company: 'fa-building', job_title: 'fa-briefcase', website: 'fa-globe',
            notes: 'fa-sticky-note', feedback: 'fa-comment', review_rating: 'fa-star',
            question: 'fa-question-circle', calendly_link: 'fa-calendar-alt'
        };

        let html = '';
        this.activeFields.forEach((field, index) => {
            html += `
                <div class="active-field-item" data-index="${index}">
                    <div class="field-item-left">
                        <i class="fas fa-grip-vertical field-drag-handle"></i>
                        <i class="fas ${iconMap[field.fieldType]} field-item-icon"></i>
                        <div class="field-item-info">
                            <div class="field-item-label">${field.label}</div>
                            <div class="field-item-type">${field.fieldType.replace('_', ' ')}</div>
                        </div>
                    </div>
                    <div class="field-item-badges">
                        <span class="field-badge ${field.isRequired ? 'required' : 'optional'}">
                            ${field.isRequired ? 'Required' : 'Optional'}
                        </span>
                    </div>
                    <div class="field-item-actions">
                        <button class="field-action-btn edit-field" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="field-action-btn delete delete-field" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.html(html);
        $('#activeFieldCount').text(`(${this.activeFields.length} fields)`);

        $('.edit-field').off('click').on('click', (e) => {
            const index = $(e.currentTarget).data('index');
            this.editField(index);
        });

        $('.delete-field').off('click').on('click', (e) => {
            const index = $(e.currentTarget).data('index');
            this.deleteField(index);
        });
    }

    editField(index) {
        const field = this.activeFields[index];

        $('#configFieldType').val(field.fieldType);
        $('#configFieldLabel').val(field.label);
        $('#configFieldPlaceholder').val(field.placeholder || '');
        $('#configFieldRequired').prop('checked', field.isRequired);
        $('#configFieldEnabled').prop('checked', field.isEnabled);

        $('#fieldConfigModal').data('edit-index', index);
        $('#fieldConfigModal').show();
    }

    saveFieldConfiguration() {
        const index = $('#fieldConfigModal').data('edit-index');

        if (index !== undefined && this.activeFields[index]) {
            this.activeFields[index].label = $('#configFieldLabel').val();
            this.activeFields[index].placeholder = $('#configFieldPlaceholder').val();
            this.activeFields[index].isRequired = $('#configFieldRequired').is(':checked');
            this.activeFields[index].isEnabled = $('#configFieldEnabled').is(':checked');

            this.renderActiveFields();
            this.updatePreview();
            this.isDirty = true;

            showSuccessMessage('Field updated successfully');
        }

        this.closeFieldConfigModal();
    }

    closeFieldConfigModal() {
        $('#fieldConfigModal').hide();
        $('#fieldConfigModal').removeData('edit-index');
    }

    deleteField(index) {
        if (confirm('Are you sure you want to remove this field?')) {
            this.activeFields.splice(index, 1);
            this.renderActiveFields();
            this.updatePreview();
            this.updateFieldCardStates();
            this.isDirty = true;
            showSuccessMessage('Field removed');
            MessageBox.show('Field removed')
        }
    }

    updateFieldCardStates() {
        $('.field-card').removeClass('added');
        this.activeFields.forEach(field => {
            $(`.field-card[data-field-type="${field.fieldType}"]`).addClass('added');
        });
    }

    // ============================================
    // CTA BUTTONS MANAGEMENT
    // ============================================

    showCTAModal() {
        $('#ctaButtonModal').show();
        $('#ctaButtonText').val('');
        $('#ctaButtonUrl').val('');
        $('#ctaButtonStyle').val('primary');
        $('#ctaButtonModal').removeData('edit-index');
    }

    closeCTAModal() {
        $('#ctaButtonModal').hide();
    }

    saveCTAButton() {
        try {
            const text = $('#ctaButtonText').val();
            const link = $('#ctaButtonUrl').val();
            const style = $('#ctaButtonStyle').val();

            if (!text || !link) {
                showErrorMessage('Please fill in all CTA button fields');
                this.closeCTAModal();
                MessageBox.show('Please fill in all CTA button fields')
                return;
            }

            const editIndex = $('#ctaButtonModal').data('edit-index');

            if (editIndex !== undefined) {
                this.ctaButtons[editIndex] = { text, link, style };
            } else {
                this.ctaButtons.push({ text, link, style });
            }

            this.renderCTAButtons();
            this.updatePreview();
            this.isDirty = true;
            this.closeCTAModal();
            showSuccessMessage('CTA button saved');
            MessageBox.show('CTA button saved');
            $("#saveFormConfigBtn").trigger("click");
        } catch (error) {
            MessageBox.error('We are solving this. Error while Adding button:', 'Hang Tight');
        }


    }

    renderCTAButtons() {
        const container = $('#ctaButtonsList');

        if (this.ctaButtons.length === 0) {
            container.html('<p class="empty-cta-text">No CTA buttons added yet</p>');
            return;
        }

        let html = '';
        this.ctaButtons.forEach((button, index) => {
            html += `
                <div class="cta-button-item">
                    <div class="cta-button-preview ${button.style}">
                        ${button.text}
                    </div>
                    <div class="cta-button-actions">
                        <button class="field-action-btn edit-cta" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="field-action-btn delete delete-cta" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.html(html);

        $('.edit-cta').off('click').on('click', (e) => {
            const index = $(e.currentTarget).data('index');
            this.editCTAButton(index);
        });

        $('.delete-cta').off('click').on('click', (e) => {
            const index = $(e.currentTarget).data('index');
            this.deleteCTAButton(index);
        });
    }

    editCTAButton(index) {
        console.log("this.ctaButtons: ", this.ctaButtons);
        const button = this.ctaButtons[index];
        console.log("each buton: ", button);
        $('#ctaButtonText').val(button.text);
        $('#ctaButtonUrl').val(button.url);
        $('#ctaButtonStyle').val(button.style);
        $('#ctaButtonModal').data('edit-index', index);
        $('#ctaButtonModal').show();
    }

    async deleteCTAButton(index) {
        try {
            // if (confirm('Are you sure you want to remove this CTA button?')) {
            // this.ctaButtons.splice(index, 1);
            // this.renderCTAButtons();
            // this.updatePreview();
            // this.isDirty = true;
            // showSuccessMessage('CTA button removed');
            // }

            const result = await MessageBox.show(
                `<p>Are you sure you want to remove this CTA button?.</p>`,
                {
                    type: 'warning',
                    title: 'Deleting CTA Button',
                    closable: true,
                    closeOnOverlay: false,
                    buttons: [
                        { text: 'Cancel', style: 'secondary', value: false },
                        { text: 'Delete Button', style: 'primary', value: true, icon: 'fas fa-trash-can' }
                    ]
                }
            );


            // ✅ NEW: Handle both Cancel and Create Account buttons
            if (result === false) {
                // User clicked Cancel - clear everything and go to QRCode tab
                console.log("False condition")

            } else if (result === true) {
                console.log("True condiiton");
                this.ctaButtons.splice(index, 1);
                this.renderCTAButtons();
                this.updatePreview();
                this.isDirty = true;
                showSuccessMessage('CTA button removed');
                MessageBox.success("CTA Button Removed.", 'CTA Removal Update')
                $("#saveFormConfigBtn").trigger("click");
            }
        } catch (error) {
            console.log("Error while deleting CTA on form.");
            MessageBox.error("Error While removing the CTA.", `Error`);
        }

    }

    // ============================================
    // PREVIEW & DISPLAY
    // ============================================

    // updatePreview() {
    //     const primaryColor = $('#formPrimaryColor').val();
    //     const secondaryColor = $('#formSecondaryColor').val();
    //     const formTitle = $('#formTitle').val() || 'Get In Touch';
    //     const formSubtitle = $('#formSubtitle').val();

    //     let previewHtml = `
    //         <div class="form-preview-header" style="margin-bottom: 20px;">
    //             <h2 style="color: ${primaryColor}; margin: 0 0 8px 0; font-size: 1.8rem;">${formTitle}</h2>
    //             ${formSubtitle ? `<p style="color: #718096; margin: 0;">${formSubtitle}</p>` : ''}
    //         </div>
    //         <div class="form-preview-fields">
    //     `;

    //     this.activeFields.forEach(field => {
    //         if (field.isEnabled) {
    //             previewHtml += `
    //                 <div class="preview-field-group" style="margin-bottom: 15px;">
    //                     <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2d3748;">
    //                         ${field.label}
    //                         ${field.isRequired ? '<span style="color: #e53e3e;">*</span>' : ''}
    //                     </label>
    //                     ${field.fieldType === 'notes' || field.fieldType === 'feedback' ?
    //                     `<textarea style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="${field.placeholder || ''}" rows="3"></textarea>` :
    //                     field.fieldType === 'review_rating' ?
    //                         `<div style="font-size: 24px; color: #fbbf24;">★★★★★</div>` :
    //                         `<input type="text" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="${field.placeholder || ''}">`
    //                 }
    //                 </div>
    //             `;
    //         }
    //     });

    //     previewHtml += `</div>`;

    //     if (this.ctaButtons.length > 0) {
    //         previewHtml += `<div class="preview-cta-buttons" style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">`;
    //         this.ctaButtons.forEach(button => {
    //             const buttonStyle = button.style === 'primary' ?
    //                 `background: ${primaryColor}; color: white; border: none;` :
    //                 button.style === 'secondary' ?
    //                     `background: ${secondaryColor}; color: white; border: none;` :
    //                     `background: white; color: ${primaryColor}; border: 2px solid ${primaryColor};`;

    //             previewHtml += `
    //                 <button style="${buttonStyle} padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">
    //                     ${button.text}
    //                 </button>
    //             `;
    //         });
    //         previewHtml += `</div>`;
    //     }

    //     const submitText = $('#submitButtonText').val() || 'Submit';
    //     previewHtml += `
    //         <button style="width: 100%; margin-top: 20px; background: ${primaryColor}; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer;">
    //             ${submitText}
    //         </button>
    //     `;

    //     $('#formPreviewContainer').html(previewHtml);
    // }

    // showFullPreview() {
    //     console.log("Calling the preview");
    //     this.updatePreview();
    //     const previewContent = $('#formPreviewContainer').html();
    //     console.log("previewContent: ", previewContent);

    //     // Create modal if it doesn't exist
    //     if ($('#fullPreviewModal').length === 0) {
    //         const modalHtml = `
    //             <div id="fullPreviewModal" class="modal" style="display: none;">
    //                 <div class="modal-content modal-preview-fullscreen">
    //                     <div class="modal-header">
    //                         <h3>
    //                             <i class="fas fa-eye"></i>
    //                             Form Preview
    //                         </h3>
    //                         <button class="modal-close" id="closeFullPreviewModal">
    //                             <i class="fas fa-times"></i>
    //                         </button>
    //                     </div>
    //                     <div class="modal-body modal-preview-body">
    //                         <div class="preview-device-selector">
    //                             <button class="device-btn preview-device-toggle active" data-preview-device="desktop">
    //                                 <i class="fas fa-desktop"></i> Desktop
    //                             </button>
    //                             <button class="device-btn preview-device-toggle" data-preview-device="mobile">
    //                                 <i class="fas fa-mobile-alt"></i> Mobile
    //                             </button>
    //                         </div>
    //                         <div id="fullPreviewContent" class="full-preview-wrapper">
    //                             <!-- Preview content will be rendered here -->
    //                         </div>
    //                     </div>
    //                     <div class="modal-footer">
    //                         <button class="btn-secondary" id="closeFullPreview">
    //                             <i class="fas fa-arrow-left"></i> Back to Editor
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         `;
    //         $('body').append(modalHtml);
    //     }

    //     $('#fullPreviewContent').html(`
    //         <div class="preview-container desktop-preview">
    //             ${previewContent}
    //         </div>
    //     `);
    //     $('#fullPreviewModal').show();

    //     $('.preview-device-toggle').off('click').on('click', (e) => {
    //         $('.preview-device-toggle').removeClass('active');
    //         $(e.currentTarget).addClass('active');
    //         const device = $(e.currentTarget).data('preview-device');

    //         if (device === 'mobile') {
    //             $('.preview-container').removeClass('desktop-preview').addClass('mobile-preview');
    //         } else {
    //             $('.preview-container').removeClass('mobile-preview').addClass('desktop-preview');
    //         }
    //     });

    //     $('#closeFullPreviewModal, #closeFullPreview').off('click').on('click', () => {
    //         $('#fullPreviewModal').hide();
    //     });
    // }


   // ============================================
    // PREVIEW & DISPLAY
    // ============================================

    updatePreview() {
        const primaryColor = $('#formPrimaryColor').val();
        const secondaryColor = $('#formSecondaryColor').val();
        const formTitle = $('#formTitle').val() || 'Get In Touch';
        const formSubtitle = $('#formSubtitle').val();

        let previewHtml = `
            <div class="form-preview-header" style="margin-bottom: 20px;">
                <h2 style="color: ${primaryColor}; margin: 0 0 8px 0; font-size: 1.8rem;">${formTitle}</h2>
                ${formSubtitle ? `<p style="color: #718096; margin: 0;">${formSubtitle}</p>` : ''}
            </div>
            <div class="form-preview-fields">
        `;

        // Render standard fields
        this.activeFields.forEach(field => {
            if (field.isEnabled) {
                previewHtml += `
                    <div class="preview-field-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2d3748;">
                            ${field.label}
                            ${field.isRequired ? '<span style="color: #e53e3e;">*</span>' : ''}
                        </label>
                        ${field.fieldType === 'notes' || field.fieldType === 'feedback' ?
                        `<textarea style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="${field.placeholder || ''}" rows="3"></textarea>` :
                        field.fieldType === 'review_rating' ?
                            `<div class="preview-rating-stars" data-rating="0">
                                <span class="preview-star" data-rating="1" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="2" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="3" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="4" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="5" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <div style="margin-top: 8px; font-size: 14px; color: #718096;">
                                    <span class="rating-text">Click to rate</span>
                                </div>
                            </div>` :
                            `<input type="text" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="${field.placeholder || ''}">`
                    }
                    </div>
                `;
            }
        });

        // ✨ RENDER CUSTOM QUESTIONS ✨
        if (this.customQuestions && this.customQuestions.length > 0) {
            previewHtml += `
                <div class="preview-custom-questions-divider" style="margin: 25px 0 20px 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <h4 style="color: ${primaryColor}; margin: 0 0 15px 0; font-size: 1.1rem; font-weight: 600;">Additional Questions</h4>
                </div>
            `;

            this.customQuestions.forEach((question, index) => {
                if (question.question && question.question.trim() !== '') {
                    let fieldHtml = '';

                    switch (question.answerType) {
                        case 'text':
                            fieldHtml = `<input type="text" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="Enter your answer...">`;
                            break;

                        case 'textarea':
                            fieldHtml = `<textarea style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="Enter detailed response..." rows="3"></textarea>`;
                            break;

                        case 'radio':
                            fieldHtml = `<div class="preview-radio-options" style="margin-top: 8px;">`;
                            (question.options || ['Option 1', 'Option 2']).forEach((option, optionIndex) => {
                                fieldHtml += `
                                    <label style="display: block; margin-bottom: 8px; cursor: pointer; color: #4a5568;">
                                        <input type="radio" name="custom_${question.id}" value="${option}" style="margin-right: 8px;">
                                        ${option}
                                    </label>
                                `;
                            });
                            fieldHtml += `</div>`;
                            break;

                        case 'checkbox':
                            fieldHtml = `<div class="preview-checkbox-options" style="margin-top: 8px;">`;
                            (question.options || ['Option 1', 'Option 2']).forEach((option, optionIndex) => {
                                fieldHtml += `
                                    <label style="display: block; margin-bottom: 8px; cursor: pointer; color: #4a5568;">
                                        <input type="checkbox" name="custom_${question.id}" value="${option}" style="margin-right: 8px;">
                                        ${option}
                                    </label>
                                `;
                            });
                            fieldHtml += `</div>`;
                            break;

                        case 'select':
                            fieldHtml = `<select style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; color: #4a5568;">`;
                            fieldHtml += `<option value="">Select an option...</option>`;
                            (question.options || ['Option 1', 'Option 2']).forEach((option, optionIndex) => {
                                fieldHtml += `<option value="${option}">${option}</option>`;
                            });
                            fieldHtml += `</select>`;
                            break;

                        case 'rating':
                            fieldHtml = `<div class="preview-rating-stars" data-rating="0">
                                <span class="preview-star" data-rating="1" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="2" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="3" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="4" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <span class="preview-star" data-rating="5" style="font-size: 28px; color: #e2e8f0; cursor: pointer; transition: color 0.2s ease;">★</span>
                                <div style="margin-top: 8px; font-size: 14px; color: #718096;">
                                    <span class="rating-text">Click to rate</span>
                                </div>
                            </div>`;
                            break;

                        default:
                            fieldHtml = `<input type="text" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px;" placeholder="Enter your answer...">`;
                    }

                    previewHtml += `
                        <div class="preview-field-group preview-custom-question" style="margin-bottom: 15px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #2d3748;">
                                ${question.question}
                                ${question.isRequired ? '<span style="color: #e53e3e;">*</span>' : ''}
                                <span style="font-size: 12px; color: #718096; font-weight: normal; margin-left: 8px;">(Custom Question)</span>
                            </label>
                            ${fieldHtml}
                        </div>
                    `;
                }
            });
        }

        previewHtml += `</div>`;

        // Render CTA buttons
        if (this.ctaButtons.length > 0) {
            previewHtml += `<div class="preview-cta-buttons" style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">`;
            this.ctaButtons.forEach(button => {
                const buttonStyle = button.style === 'primary' ?
                    `background: ${primaryColor}; color: white; border: none;` :
                    button.style === 'secondary' ?
                        `background: ${secondaryColor}; color: white; border: none;` :
                        `background: white; color: ${primaryColor}; border: 2px solid ${primaryColor};`;

                previewHtml += `
                    <button style="${buttonStyle} padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">
                        ${button.text}
                    </button>
                `;
            });
            previewHtml += `</div>`;
        }

        // Render submit button
        const submitText = $('#submitButtonText').val() || 'Submit';
        previewHtml += `
            <button style="width: 100%; margin-top: 20px; background: ${primaryColor}; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: 600; font-size: 1rem; cursor: pointer;">
                ${submitText}
            </button>
        `;

        $('#formPreviewContainer').html(previewHtml);
    }


    showFullPreview() {
        console.log("🎬 Calling the preview");
        console.log("📋 Custom questions to show in preview:", this.customQuestions);
        
        // Ensure custom questions are updated in preview
        this.updatePreview();
        
        const previewContent = $('#formPreviewContainer').html();
        console.log("📱 Preview content length:", previewContent.length);
        
        // Check if custom questions are in the preview content
        if (this.customQuestions && this.customQuestions.length > 0) {
            console.log(`✅ Custom questions should be visible: ${this.customQuestions.length} questions`);
            this.customQuestions.forEach((q, index) => {
                console.log(`  ${index + 1}. ${q.question} (${q.answerType})`);
            });
        } else {
            console.log("ℹ️ No custom questions to show in preview");
        }

        // Create modal if it doesn't exist
        if ($('#fullPreviewModal').length === 0) {
            const modalHtml = `
                <div id="fullPreviewModal" class="modal" style="display: none;">
                    <div class="modal-content modal-preview-fullscreen">
                        <div class="modal-header">
                            <h3>
                                <i class="fas fa-eye"></i>
                                Form Preview
                            </h3>
                            <button class="modal-close" id="closeFullPreviewModal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body modal-preview-body">
                            <div class="preview-device-selector">
                                <button class="device-btn preview-device-toggle active" data-preview-device="desktop">
                                    <i class="fas fa-desktop"></i> Desktop
                                </button>
                                <button class="device-btn preview-device-toggle" data-preview-device="mobile">
                                    <i class="fas fa-mobile-alt"></i> Mobile
                                </button>
                            </div>
                            <div id="fullPreviewContent" class="full-preview-wrapper">
                                <!-- Preview content will be rendered here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" id="closeFullPreview">
                                <i class="fas fa-arrow-left"></i> Back to Editor
                            </button>
                        </div>
                    </div>
                </div>
            `;
            $('body').append(modalHtml);
        }

        // Insert the preview content
        $('#fullPreviewContent').html(`
            <div class="preview-container desktop-preview">
                ${previewContent}
            </div>
        `);
        
        $('#fullPreviewModal').show();

        // Re-bind device toggle events
        $('.preview-device-toggle').off('click').on('click', (e) => {
            $('.preview-device-toggle').removeClass('active');
            $(e.currentTarget).addClass('active');
            const device = $(e.currentTarget).data('preview-device');

            console.log('📱 Switching to device:', device);

            if (device === 'mobile') {
                $('.preview-container').removeClass('desktop-preview').addClass('mobile-preview');
            } else {
                $('.preview-container').removeClass('mobile-preview').addClass('desktop-preview');
            }
        });

        // Re-bind close events
        $('#closeFullPreviewModal, #closeFullPreview').off('click').on('click', () => {
            console.log('❌ Closing preview modal');
            $('#fullPreviewModal').hide();
        });
        
        // ✨ ADD INTERACTIVE RATING STARS FUNCTIONALITY
        this.initPreviewRatingStars();
        
        console.log("✅ Preview modal displayed successfully");
    }
    
    // ✨ NEW METHOD: Initialize interactive rating stars in preview
    initPreviewRatingStars() {
        // Handle star hover effects
        $(document).off('mouseenter.previewRating').on('mouseenter.previewRating', '.preview-star', function() {
            const rating = parseInt($(this).data('rating'));
            const $container = $(this).closest('.preview-rating-stars');
            
            // Highlight stars up to hovered star
            $container.find('.preview-star').each(function(index) {
                if (index < rating) {
                    $(this).css('color', '#fbbf24'); // Gold color
                } else {
                    $(this).css('color', '#e2e8f0'); // Light gray
                }
            });
        });
        
        // Handle mouse leave - restore selected rating
        $(document).off('mouseleave.previewRating').on('mouseleave.previewRating', '.preview-rating-stars', function() {
            const selectedRating = parseInt($(this).data('rating'));
            
            $(this).find('.preview-star').each(function(index) {
                if (index < selectedRating) {
                    $(this).css('color', '#fbbf24'); // Gold color for selected
                } else {
                    $(this).css('color', '#e2e8f0'); // Light gray for unselected
                }
            });
        });
        
        // Handle star click
        $(document).off('click.previewRating').on('click.previewRating', '.preview-star', function() {
            const rating = parseInt($(this).data('rating'));
            const $container = $(this).closest('.preview-rating-stars');
            
            // Update container's data-rating attribute
            $container.data('rating', rating);
            $container.attr('data-rating', rating);
            
            // Update visual state
            $container.find('.preview-star').each(function(index) {
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
            
            $container.find('.rating-text').text(ratingTexts[rating] || 'Click to rate');
            
            console.log('⭐ Rating selected:', rating);
        });
    }


    switchPreviewDevice(device) {
        if (device === 'mobile') {
            $('.preview-container').removeClass('desktop-preview').addClass('mobile-preview');
        } else {
            $('.preview-container').removeClass('mobile-preview').addClass('desktop-preview');
        }
    }

    /**
     * Apply branding colors from provided data (used by event listener)
     * @param {Object} brandingData - { gradientStart, gradientEnd }
     */
    applyBrandingColorsFromData(brandingData) {
        try {
            const { gradientStart, gradientEnd } = brandingData;

            // Apply colors to primary color picker
            $('#formPrimaryColor').val(gradientStart || '#667eea');
            $('#formPrimaryColorHex').val(gradientStart || '#667eea');

            // Apply colors to secondary color picker
            $('#formSecondaryColor').val(gradientEnd || '#764ba2');
            $('#formSecondaryColorHex').val(gradientEnd || '#764ba2');

            // Update the preview
            this.updatePreview();

            // Mark as dirty
            this.isDirty = true;

            // Show notification
            showSuccessMessage('✨ Branding colors auto-applied from saved preferences');

            console.log('✅ FormBuilder: Branding colors auto-applied');
        } catch (error) {
            console.error('Error applying branding colors from data:', error);
        }
    }


    // version 3
    async applyBrandingColors() {
        // This would get colors from the card's branding
        // For now, placeholder implementation
        try {
            // Import API client
            const { api } = await import('../core/api-client.js');

            // Fetch branding preferences from the API
            const response = await api.getBranding();

            if (response.success && response.data) {
                const { gradientStart, gradientEnd } = response.data;

                // Apply colors to the primary color picker
                $('#formPrimaryColor').val(gradientStart || '#667eea');
                $('#formPrimaryColorHex').val(gradientStart || '#667eea');

                // Apply colors to the secondary color picker
                $('#formSecondaryColor').val(gradientEnd || '#764ba2');
                $('#formSecondaryColorHex').val(gradientEnd || '#764ba2');

                // Update the preview to show the new colors
                this.updatePreview();

                // Mark as dirty so user knows to save
                this.isDirty = true;

                showSuccessMessage('Branding colors applied successfully');
            } else {
                // If no branding is set, use default colors
                $('#formPrimaryColor').val('#667eea');
                $('#formPrimaryColorHex').val('#667eea');
                $('#formSecondaryColor').val('#764ba2');
                $('#formSecondaryColorHex').val('#764ba2');

                this.updatePreview();

                showSuccessMessage('Default colors applied');
            }
        } catch (error) {
            console.error('Error applying branding colors:', error);
            showErrorMessage('Failed to load branding colors. Using defaults.');

            // Fallback to defaults on error
            $('#formPrimaryColor').val('#667eea');
            $('#formPrimaryColorHex').val('#667eea');
            $('#formSecondaryColor').val('#764ba2');
            $('#formSecondaryColorHex').val('#764ba2');

            this.updatePreview();
        }
        showSuccessMessage('Branding colors applied');
    }


    // ============================================
    // SUBMISSIONS MANAGEMENT
    // ============================================

    // async loadSubmissions(status = 'all') {
    //     try {
    //         const response = await fetch(`/api/forms/submissions?status=${status}`, {
    //             method: 'GET',
    //             credentials: 'include'
    //         });

    //         const data = await response.json();

    //         if (data.success) {
    //             this.renderSubmissionsTable(data.submissions);
    //         }
    //     } catch (error) {
    //         console.error('Load submissions error:', error);
    //     }
    // }

    renderSubmissionsTable(submissions) {
        const container = $('#submissionsTableContainer');

        if (!submissions || submissions.length === 0) {
            container.html('<p class="empty-state-text">No submissions yet</p>');
            return;
        }

        let tableHtml = `
            <table class="submissions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        submissions.forEach(submission => {
            const submittedData = submission.submittedData || {};
            const name = submittedData.get ? submittedData.get('name') : submittedData.name || 'N/A';
            const email = submittedData.get ? submittedData.get('email') : submittedData.email || 'N/A';
            const date = new Date(submission.submittedAt).toLocaleDateString();

            tableHtml += `
                <tr>
                    <td>${date}</td>
                    <td>${name}</td>
                    <td>${email}</td>
                    <td><span class="submission-status-badge ${submission.status}">${submission.status}</span></td>
                    <td><button class="field-action-btn view-submission" data-id="${submission._id}"><i class="fas fa-eye"></i></button></td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.html(tableHtml);

        // $('.view-submission').off('click').on('click', (e) => {
        //     const id = $(e.currentTarget).data('id');
        //     this.viewSubmission(id);
        // });
    }

    // async viewSubmission(submissionId) {
    //     try {
    //         const response = await fetch(`/api/forms/submissions/${submissionId}`, {
    //             method: 'GET',
    //             credentials: 'include'
    //         });
    //         const data = await response.json();
    //         if (data.success) {
    //             this.showSubmissionDetails(data.submission);
    //         }
    //     } catch (error) {
    //         console.error('View submission error:', error);
    //         showErrorMessage('Failed to load submission details');
    //     }
    // }

    showSubmissionDetails(submission) {
        const submittedData = submission.submittedData || {};

        let detailsHtml = `
            <div class="submission-details">
                <div class="submission-meta">
                    <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="submission-status-badge ${submission.status}">${submission.status}</span></p>
                    ${submission.visitorInfo?.location ? `<p><strong>Location:</strong> ${submission.visitorInfo.location.city}, ${submission.visitorInfo.location.country}</p>` : ''}
                    ${submission.visitorInfo?.device ? `<p><strong>Device:</strong> ${submission.visitorInfo.device}</p>` : ''}
                </div>
                <div class="submission-data">
                    <h4>Submitted Information</h4>
        `;

        for (const [key, value] of Object.entries(submittedData)) {
            if (typeof value !== 'function') {
                detailsHtml += `<p><strong>${key}:</strong> ${value}</p>`;
            }
        }

        detailsHtml += `</div></div>`;

        $('#submissionDetailsContent').html(detailsHtml);
        $('#submissionDetailsModal').show();
    }

    async exportSubmissions() {
        try {
            const response = await fetch('/api/forms/submissions?status=all', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();

            if (!data.success || !data.submissions || data.submissions.length === 0) {
                showErrorMessage('No submissions to export');
                return;
            }

            let csv = 'Date,Name,Email,Phone,Status,Location\n';

            data.submissions.forEach(sub => {
                const data = sub.submittedData || {};
                const row = [
                    new Date(sub.submittedAt).toLocaleDateString(),
                    data.get ? data.get('name') : data.name || '',
                    data.get ? data.get('email') : data.email || '',
                    data.get ? data.get('phone') : data.phone || '',
                    sub.status,
                    sub.visitorInfo?.location?.city || ''
                ];
                csv += row.map(v => `"${v}"`).join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form-submissions-${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            showErrorMessage('Failed to export submissions');
        }
    }

    updateformid(leadformdata) {
        if (leadformdata && $(".leadform-id-div").length > 0) {
            $(".leadform-id-div").empty();
            $(".leadform-id-div").append(`<span class="leadform-page-idtitle">Lead Form ID: </span>
                <span class="lead_formid">${leadformdata._id}</span>
                <span class="copy-form-id" id="copy-form-id"><i class="fas fa-copy"></i></span>`);
        }
    }

    setupCopyFormIDButton() {
    const copyButtons = document.querySelectorAll('[id^="copy-form-id"]');

    copyButtons.forEach(copyBtn => {
        // Prevent duplicate bindings
        copyBtn.replaceWith(copyBtn.cloneNode(true));
    });

    // Re-select cloned buttons
    const freshButtons = document.querySelectorAll('[id^="copy-form-id"]');

    freshButtons.forEach(copyBtn => {
        copyBtn.addEventListener('click', async () => {
            try {
                // Find the form ID inside the same container
                const container = copyBtn.closest('.leadform-id-div');
                const idSpan = container?.querySelector('.lead_formid');

                if (!idSpan) return;

                const formId = idSpan.textContent.trim();

                await navigator.clipboard.writeText(formId);

                // Visual feedback
                const icon = copyBtn.querySelector('i');
                const originalClass = icon.className;

                icon.className = 'fas fa-check';
                copyBtn.style.color = '#28a745';

                showSuccessMessage('Lead Form ID copied!');

                setTimeout(() => {
                    icon.className = originalClass;
                    copyBtn.style.color = '';
                }, 1500);

            } catch (err) {
                console.error('Copy failed:', err);
            }
        });
    });
}

    /**
     * Form builder Questions
     */
    // Custom Questions Methods
    initCustomQuestions() {
        console.log("Questions loading");
        // Load questions bank
        this.loadQuestionsBank();
        // Initialize empty questions array if not set
        if (!this.customQuestions) {
            this.customQuestions = [];
        }
        // Initialize UI
        this.updateCustomQuestionsCount();
        this.toggleAddQuestionButton();
        
        // Load existing custom questions if any
        this.loadExistingCustomQuestions();

         // Test questions bank loading
        console.log('Questions bank loaded:', Object.keys(this.questionsBank).length, 'industries');
        
        // Verify elements exist
        const $section = $('#customQuestionsSection');
        const $industrySelect = $('#industrySelect');
        const $addBtn = $('#addCustomQuestionBtn');
        
        console.log('Custom questions section exists:', $section.length > 0);
        console.log('Industry select exists:', $industrySelect.length > 0);
        console.log('Add button exists:', $addBtn.length > 0);
    }

    loadQuestionsBank() {
        // Questions bank will be loaded from global window object
        if (window.QUESTIONS_BANK) {
            console.log("Question bank: ", window.QUESTIONS_BANK);
            this.questionsBank = window.QUESTIONS_BANK;
        } else {
            console.log('Questions bank not loaded');
            this.questionsBank = {};
        }
    }

     loadExistingCustomQuestions() {
        // This method is now handled by populateFormBuilder
        // Only load if customQuestions is empty and currentConfig exists
        if ((!this.customQuestions || this.customQuestions.length === 0) && 
            this.currentConfig && this.currentConfig.customQuestions) {
            this.customQuestions = [...this.currentConfig.customQuestions];
            this.renderCustomQuestions();
            
            if (this.currentConfig.selectedIndustry) {
                this.currentIndustry = this.currentConfig.selectedIndustry;
                $('#industrySelect').val(this.currentConfig.selectedIndustry);
            }
        }
    }

    handleIndustryChange(industry) {
        this.currentIndustry = industry;
        console.log('Industry selected:', industry);
        
        // Mark form as dirty if industry changed
        this.isDirty = true;
        
        // Clear any open suggestions
        $('.question-suggestions').hide();
        
        // Show feedback about available questions
        if (industry && this.questionsBank[industry]) {
            const questionCount = this.questionsBank[industry].length;
            console.log(`Industry ${industry} has ${questionCount} suggested questions available`);
            
            // Could add a visual indicator here if desired
            // showSuccessMessage(`${questionCount} suggested questions available for ${industry}`);
        }
    }

    addCustomQuestion() {
        if (this.customQuestions.length >= this.maxCustomQuestions) {
            showErrorMessage(`Maximum ${this.maxCustomQuestions} custom questions allowed`);
            return;
        }

        const questionId = `custom_${Date.now()}`;
        const newQuestion = {
            id: questionId,
            question: '',
            answerType: 'text',
            options: [],
            isRequired: false
        };

        this.customQuestions.push(newQuestion);
        this.renderCustomQuestions();
        this.updateCustomQuestionsCount();
        this.toggleAddQuestionButton();
        
        // Focus on the new question input
        setTimeout(() => {
            $(`#question-input-${questionId}`).focus();
        }, 100);
    }

    renderCustomQuestions() {
        console.log("Render questions");
        const container = $('#customQuestionsList');
        container.empty();

        this.customQuestions.forEach((question, index) => {
            const questionHtml = this.generateCustomQuestionHtml(question, index);
            container.append(questionHtml);
        });
        // ✨ UPDATE PREVIEW AFTER RENDERING QUESTIONS ✨
        this.updatePreview();
    }

    generateCustomQuestionHtml(question, index) {
        const answerTypes = window.ANSWER_FIELD_TYPES || {
            text: { label: "Short Text", icon: "fas fa-font" },
            textarea: { label: "Long Text", icon: "fas fa-align-left" },
            radio: { label: "Multiple Choice", icon: "fas fa-dot-circle" },
            checkbox: { label: "Checkboxes", icon: "fas fa-check-square" },
            select: { label: "Dropdown", icon: "fas fa-chevron-down" }
        };

        return `
            <div class="custom-question-item new-question" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-actions">
                        <button class="btn-question-action btn-delete-question" title="Delete Question">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="question-input-group">
                    <div class="question-input-container">
                        <textarea 
                            class="question-input" 
                            id="question-input-${question.id}"
                            placeholder="Type your question or start typing for suggestions..."
                            rows="2"
                        >${question.question}</textarea>
                        <div class="question-suggestions" id="suggestions-${question.id}" style="display: none;">
                            <!-- Suggestions will be populated here -->
                        </div>
                    </div>
                </div>

                <div class="answer-type-group">
                    <label class="answer-type-label">Answer Type:</label>
                    <div class="answer-type-grid">
                        ${Object.entries(answerTypes).map(([type, config]) => `
                            <div class="answer-type-option ${question.answerType === type ? 'selected' : ''}" 
                                 data-type="${type}" data-question-id="${question.id}">
                                <i class="${config.icon}"></i>
                                <span>${config.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${this.generateOptionsConfig(question)}
            </div>
        `;
    }

    generateOptionsConfig(question) {
        if (!['radio', 'checkbox', 'select'].includes(question.answerType)) {
            return '';
        }

        const options = question.options || ['Option 1', 'Option 2'];
        
        return `
            <div class="options-config">
                <label class="answer-type-label">Options:</label>
                <div class="options-list" id="options-${question.id}">
                    ${options.map((option, index) => `
                        <div class="option-item">
                            <input type="text" class="option-input" value="${option}" 
                                   data-option-index="${index}" data-question-id="${question.id}">
                            ${options.length > 2 ? `
                                <button class="btn-remove-option" data-option-index="${index}" data-question-id="${question.id}">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-option" data-question-id="${question.id}">
                    <i class="fas fa-plus"></i> Add Option
                </button>
            </div>
        `;
    }

    handleQuestionInput(e) {
        console.log('handleQuestionInput called', e.target);
        const $input = $(e.target);
        const questionId = $input.attr('id').replace('question-input-', '');
        const value = $input.val();
        
        console.log('Question ID:', questionId, 'Value:', value);
        
        // Update question in array
        const question = this.customQuestions.find(q => q.id === questionId);
        if (question) {
            question.question = value;
            console.log('Updated question:', question);
            
            // Mark form as dirty
            this.isDirty = true;
            // ✨ UPDATE PREVIEW WHEN QUESTION TEXT CHANGES ✨
            this.updatePreview();
        } else {
            console.error('Question not found:', questionId);
        }

        // Show suggestions if typing and industry is selected
        if (value.length >= 2 && this.currentIndustry) {
            console.log('Showing suggestions for industry:', this.currentIndustry);
            this.showQuestionSuggestions(questionId, value);
        } else {
            this.hideSuggestions(questionId);
        }
    }

     // Debug method to check if everything is working
    debugCustomQuestions() {
        console.log('=== Custom Questions Debug ===');
        console.log('Current questions:', this.customQuestions);
        console.log('Current industry:', this.currentIndustry);
        console.log('Questions bank:', this.questionsBank);
        console.log('Form container exists:', $('.form-builder-container').length);
        console.log('Question inputs exist:', $('.question-input').length);
        console.log('Answer type options exist:', $('.answer-type-option').length);
        
        // Test event binding
        console.log('Testing click on first answer type option...');
        $('.answer-type-option').first().trigger('click');
    }

    showQuestionSuggestions(questionId, searchText) {
        const suggestionsContainer = $(`#suggestions-${questionId}`);
        const questions = this.questionsBank[this.currentIndustry] || [];
        
        if (questions.length === 0) {
            this.hideSuggestions(questionId);
            return;
        }

        const matches = questions.filter(q => 
            q.toLowerCase().includes(searchText.toLowerCase())
        );

        if (matches.length === 0) {
            this.hideSuggestions(questionId);
            return;
        }

        const suggestionsHtml = matches.slice(0, 8).map(question => {
            const highlighted = this.highlightMatch(question, searchText);
            return `<div class="suggestion-item" data-question-id="${questionId}" data-question="${question}">${highlighted}</div>`;
        }).join('');

        suggestionsContainer.html(suggestionsHtml).show();
    }

    highlightMatch(text, search) {
        const regex = new RegExp(`(${search})`, 'gi');
        return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
    }

    hideSuggestions(questionId) {
        $(`#suggestions-${questionId}`).hide();
    }

    selectSuggestion(e) {
        const $item = $(e.target).closest('.suggestion-item');
        const questionId = $item.data('question-id');
        const questionText = $item.data('question');
        
        // Update input and question data
        $(`#question-input-${questionId}`).val(questionText);
        
        const question = this.customQuestions.find(q => q.id === questionId);
        if (question) {
            question.question = questionText;
        }

        // Hide suggestions
        this.hideSuggestions(questionId);
    }

    selectAnswerType(e) {
        const $option = $(e.target).closest('.answer-type-option');
        const type = $option.data('type');
        const questionId = $option.data('question-id');
        
        console.log('Selecting answer type:', type, 'for question:', questionId);
        
        // Update UI
        $option.siblings('.answer-type-option').removeClass('selected');
        $option.addClass('selected');
        
        // Update question data
        const question = this.customQuestions.find(q => q.id === questionId);
        if (question) {
            question.answerType = type;
            
            // Initialize options for option-based types
            if (['radio', 'checkbox', 'select'].includes(type) && (!question.options || question.options.length === 0)) {
                question.options = ['Option 1', 'Option 2'];
            }
            
            // Mark form as dirty
            this.isDirty = true;
            
            console.log('Updated question with answer type:', question);
        }

        // Re-render the question to show/hide options config
        this.renderCustomQuestions();
    }

    addAnswerOption(e) {
        const $btn = $(e.target).closest('.btn-add-option');
        const questionId = $btn.data('question-id');
        
        const question = this.customQuestions.find(q => q.id === questionId);
        if (question && question.options) {
            question.options.push(`Option ${question.options.length + 1}`);
            this.renderCustomQuestions();
        }
    }

    removeAnswerOption(e) {
        const $btn = $(e.target).closest('.btn-remove-option');
        const questionId = $btn.data('question-id');
        const optionIndex = $btn.data('option-index');
        
        const question = this.customQuestions.find(q => q.id === questionId);
        if (question && question.options && question.options.length > 2) {
            question.options.splice(optionIndex, 1);
            this.renderCustomQuestions();
        }
    }

    deleteCustomQuestion(e) {
        const $btn = $(e.target).closest('.btn-delete-question');
        const $questionItem = $btn.closest('.custom-question-item');
        const questionId = $questionItem.data('question-id');
        
        // Remove from array
        this.customQuestions = this.customQuestions.filter(q => q.id !== questionId);
        
        // Remove from DOM with animation
        $questionItem.fadeOut(300, () => {
            $questionItem.remove();
            this.renderCustomQuestions(); // Re-render to update numbers
        });
        
        this.updateCustomQuestionsCount();
        this.toggleAddQuestionButton();

        // ✨ UPDATE PREVIEW AFTER DELETION ✨
        this.updatePreview();
    }

    updateCustomQuestionsCount() {
        $('#customQuestionsCount').text(`(${this.customQuestions.length}/${this.maxCustomQuestions})`);
    }

    toggleAddQuestionButton() {
        const $btn = $('#addCustomQuestionBtn');
        if (this.customQuestions.length >= this.maxCustomQuestions) {
            $btn.prop('disabled', true).text(`Maximum ${this.maxCustomQuestions} questions reached`);
        } else {
            $btn.prop('disabled', false).html('<i class="fas fa-plus"></i> Add Custom Question');
        }
    }

    // Test method for verifying events work
    testCustomQuestionsEvents() {
        console.log('🧪 Testing Custom Questions Events...');
        
        // Test if elements exist
        const $questionInput = $('.question-input').first();
        const $answerType = $('.answer-type-option').first();
        const $deleteBtn = $('.btn-delete-question').first();
        
        console.log('Question input found:', $questionInput.length);
        console.log('Answer type found:', $answerType.length);
        console.log('Delete button found:', $deleteBtn.length);
        
        // Test event binding by manually triggering
        if ($questionInput.length) {
            console.log('Testing question input...');
            $questionInput.val('test').trigger('input');
        }
        
        if ($answerType.length) {
            console.log('Testing answer type selection...');
            $answerType.trigger('click');
        }
        
        // Also test if we can access the FormBuilder instance
        console.log('FormBuilder instance:', this);
        console.log('Custom questions array:', this.customQuestions);
    }

    // Update the save configuration method to include custom questions
    getFormConfiguration() {
        const config = {
            // ... existing configuration properties
            customQuestions: this.customQuestions
        };
        return config;
    }


    // TEsting purpose:
    
}

// Create singleton instance
let formBuilderInstance = null;

// Export initialization function
export function initializeFormBuilder() {
    console.log('🚀 initializeFormBuilder() called');
;
    if (!formBuilderInstance) {
        console.log('🎨 Creating new FormBuilder instance');
        formBuilderInstance = new FormBuilder();
        formBuilderInstance.applyBrandingColorsFromDataSilent

        // testCustomQuestionsEvents()
        //FormBuilder.testCustomQuestionsEvents();
        // Expose debug method for testing
        window.debugFormBuilder = () => {
            if (formBuilderInstance && formBuilderInstance.debugCustomQuestions) {
                formBuilderInstance.debugCustomQuestions();
            } else {
                console.log('FormBuilder instance not available or debug method not found');
            }
        };
    }

    console.log('🎨 Calling FormBuilder.init()');
    formBuilderInstance.init();
}

// Export the class as well
export { FormBuilder };