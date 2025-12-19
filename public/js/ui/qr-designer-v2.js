/**
 * QR DESIGNER V2 - ELEGANT UI
 * Inspired by qr-code-styling.com
 */
import { showSuccessMessage, showErrorMessage } from "./notifications.js";
import { getCurrentUser, getUserProfile, logout } from '../core/auth.js';
import { loadCustomCards, updateDisplayPage } from '../modules/display.js'
import MessageBox from '../modules/message-box.js';



const QRDesignerV2 = (function () {
    'use strict';
    const activeQRBlob = {
        QRBlob: ''
    }
    const state = {
        name: '',
        url: '',
        description: '',
        dotsStyle: 'rounded',
        cornerSquareStyle: 'extra-rounded',
        cornerDotStyle: 'dot',
        colorPrimary: '#000000',
        colorSecondary: '#ffffff',

        colorPrimaryOpacity: 100,
        colorSecondaryOpacity: 100,
        logoType: 'none',
        socialIcon: null,
        avatarFile: null,
        avatarDataUrl: null,
        currentQRDataUrl: null,
        isGenerating: false,
        currentStep: 1,// Track current expanded step,
        colorPrimaryDot: '#000000',
        colorPrimaryCornerSquare: '#000000'
    };

    let generateTimeout = null;
    let elements = {};


    const dotsStyles = [
        { value: 'rounded', label: 'Rounded', icon: '<div class="dot-preview rounded-dots"><span></span><span></span><span></span></div>' },
        { value: 'dots', label: 'Dots', icon: '<div class="dot-preview circle-dots"><span></span><span></span><span></span></div>' },
        { value: 'classy', label: 'Classy', icon: '<div class="dot-preview diamond-dots"><span></span><span></span><span></span></div>' },
        { value: 'classy-rounded', label: 'Classy Rounded', icon: '<div class="dot-preview classy-rounded-dots"><span></span><span></span><span></span></div>' },
        { value: 'square', label: 'Square', icon: '<div class="dot-preview square-dots"><span></span><span></span><span></span></div>' }
    ];

    const cornerSquareStyles = [
        { value: 'extra-rounded', label: 'Extra Rounded' },
        { value: 'dot', label: 'Dot' },
        { value: 'square', label: 'Square' }
    ];

    const cornerDotStyles = [
        { value: 'dot', label: 'Dot' },
        { value: 'square', label: 'Square' }
    ];

    const colorPresets = [
        { primary: '#000000', secondary: '#ffffff', name: 'Classic' },
        { primary: '#4285f4', secondary: '#ffffff', name: 'Blue' },
        { primary: '#ea4335', secondary: '#ffffff', name: 'Red' },
        { primary: '#34a853', secondary: '#ffffff', name: 'Green' },
        { primary: '#fbbc05', secondary: '#ffffff', name: 'Yellow' },
        { primary: '#9c27b0', secondary: '#ffffff', name: 'Purple' },
        { primary: '#ff6d00', secondary: '#ffffff', name: 'Orange' },
        { primary: '#00bcd4', secondary: '#ffffff', name: 'Cyan' }
    ];



    // Update the socialIcons array with actual icon URLs
    const socialIcons = [
        {
            name: 'Facebook',
            icon: 'fab fa-facebook-f',
            color: '#1877f2',
            // Use actual logo URL or base64
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
        },
        {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            color: '#e4405f',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png'
        },
        {
            name: 'Twitter',
            icon: 'fab fa-twitter',
            color: '#1da1f2',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg'
        },
        {
            name: 'X',
            icon: 'fab fa-x-twitter',
            color: '#000000',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg'
        },
        {
            name: 'TikTok',
            icon: 'fab fa-tiktok',
            color: '#000000',
            logoUrl: 'https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png'
        },
        {
            name: 'LinkedIn',
            icon: 'fab fa-linkedin-in',
            color: '#0077b5',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png'
        },
        {
            name: 'WhatsApp',
            icon: 'fab fa-whatsapp',
            color: '#25d366',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg'
        },
        {
            name: 'YouTube',
            icon: 'fab fa-youtube',
            color: '#ff0000',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'
        },
        {
            name: 'Telegram',
            icon: 'fab fa-telegram-plane',
            color: '#0088cc',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
        },
        {
            name: 'Snapchat',
            icon: 'fab fa-snapchat-ghost',
            color: '#fffc00',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg'
        },
        {
            name: 'Pinterest',
            icon: 'fab fa-pinterest-p',
            color: '#e60023',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png'
        },
        {
            name: 'Reddit',
            icon: 'fab fa-reddit-alien',
            color: '#ff4500',
            logoUrl: 'https://www.redditinc.com/assets/images/site/reddit-logo.png'
        },
        {
            name: 'Discord',
            icon: 'fab fa-discord',
            color: '#5865f2',
            logoUrl: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'
        },
        {
            name: 'Twitch',
            icon: 'fab fa-twitch',
            color: '#9146ff',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Twitch_Glitch_Logo_Purple.svg'
        },
        {
            name: 'GitHub',
            icon: 'fab fa-github',
            color: '#181717',
            logoUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        },
        {
            name: 'Spotify',
            icon: 'fab fa-spotify',
            color: '#1db954',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
        }
    ];

    function init() {
        // console.log('QR Designer V2: Initializing elegant UI...');
        generateIcons();
        const designCard = document.getElementById('design-card-view');
        if (!designCard) {
            console.error('QR Designer V2: Design card not found');
            return;
        }

        designCard.innerHTML = renderDesignerHTML();
        cacheElements();
        attachEventListeners();
        setDefaults();

        // console.log('QR Designer V2: Initialized successfully');
    }

    function renderDesignerHTML() {
        return `
            <div class="qr-designer-elegant">
                <!-- Header -->
                <div class="qr-header">
                    <div class="qr-designer-title-icon">
                        <h2 class="qr-title">
                            <i class="fas fa-qrcode"></i>
                            
                        </h2>
                        <h2 class="qr-title">
                        QR Code Designer
                            
                        </h2>
                    </div>
                    <div class="qr-designer-subtitle">
                        <p class="qr-subtitle">Create beautiful, professional QR codes in seconds</p>
                    </div>
                    <div class="qrcode-position">(QRCode Preview will be at the bottom of the screen.)</div>
                </div>

                <div class="qr-main-layout">
                    <!-- Left Panel - Controls -->
                    <div class="qr-controls-panel">
                        ${renderDataSection()}
                        ${renderDotsSection()}
                        ${renderCornersSection()}
                        ${renderColorsSection()}
                        ${renderLogoSection()}
                        ${renderActionsSection()}
                    </div>

                    <!-- Right Panel - Preview -->
                    <div class="qr-preview-panel-elegant">
                        <div class="qr-preview-sticky">
                            <div class="qr-preview-header">
                                <h3>Preview</h3>
                                <button class="qr-preview-download" id="qr-quick-download" disabled>
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                            <div class="qr-preview-box" id="qr-preview-box">
                                <div class="qr-preview-placeholder" id="qr-preview-placeholder">
                                    <i class="fas fa-qrcode"></i>
                                    <p>Enter URL to generate</p>
                                </div>
                                <div class="qr-preview-loading" id="qr-preview-loading" style="display:none;">
                                    <div class="qr-spinner"></div>
                                    <p>Generating...</p>
                                </div>
                                <img id="qr-preview-image" class="qr-preview-img" style="display:none;" alt="QR Preview">
                            </div>
                            <div class="qr-preview-info">
                                <p><i class="fas fa-info-circle"></i> Scan with your camera to test</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderDataSection() {
        return `
            <div class="qr-section" data-step="1">
                <div class="qr-section-header" data-toggle-step="1">
                    <div class="qr-section-title-wrapper">
                        <span class="qr-step-number">1</span>
                        <h3 class="qr-section-title">
                            <i class="fas fa-link"></i>
                            Data
                        </h3>
                    </div>
                    <i class="fas fa-chevron-down qr-collapse-icon"></i>
                </div>
                <div class="qr-section-content">
                    <div class="qr-form-group">
                        <label class="qr-label">Name <span class="qr-required">*</span></label>
                        <input 
                            type="text" 
                            id="qr-name-input" 
                            class="qr-input-elegant" 
                            placeholder="My QR Code"
                            maxlength="150"
                        />
                    </div>
                    <div class="qr-form-group">
                        <label class="qr-label">URL <span class="qr-required">*</span></label>
                        <input 
                            type="url" 
                            id="qr-url-input" 
                            class="qr-input-elegant" 
                            placeholder="https://example.com"
                        />
                        <div class="qr-input-hint">Enter the destination link for your QR code. (ex: https://google.com)</div>
                    </div>
                    <div class="qr-form-group">
                        <label class="qr-label">Description </label>
                        <textarea 
                            id="myqrcodeDescription"
                            rows="4"
                            maxlength="500"
                            placeholder="Type here (max 500 characters)..."></textarea>
                        <div class="qr-input-hint">Enter the short texts for QR code.</div>
                    </div>
                    <button class="qr-next-btn" data-next-step="2">
                        Next: Dots Style <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    function renderDotsSection() {
        return `
            <div class="qr-section qr-collapsed" data-step="2">
                <div class="qr-section-header" data-toggle-step="2">
                    <div class="qr-section-title-wrapper">
                        <span class="qr-step-number">2</span>
                        <h3 class="qr-section-title">
                            <i class="fas fa-grip-dots"></i>
                            Dots Style
                        </h3>
                    </div>
                    <i class="fas fa-chevron-down qr-collapse-icon"></i>
                </div>
                <div class="qr-section-content">
                    <div class="qr-style-grid">
                        ${dotsStyles.map(style => `
                            <label class="qr-style-card ${style.value === 'rounded' ? 'active' : ''}" data-style="${style.value}">
                                <input 
                                    type="radio" 
                                    name="dots-style" 
                                    value="${style.value}"
                                    ${style.value === 'rounded' ? 'checked' : ''}
                                />
                                <div class="qr-style-preview">${style.icon}</div>
                                <div class="qr-style-name">${style.label}</div>
                            </label>
                        `).join('')}
                    </div>
                    <button class="qr-next-btn" data-next-step="3">
                        Next: Corners <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    function renderCornersSection() {
        return `
            <div class="qr-section qr-collapsed" data-step="3">
                <div class="qr-section-header" data-toggle-step="3">
                    <div class="qr-section-title-wrapper">
                        <span class="qr-step-number">3</span>
                        <h3 class="qr-section-title">
                            <i class="fas fa-vector-square"></i>
                            Corners
                        </h3>
                    </div>
                    <i class="fas fa-chevron-down qr-collapse-icon"></i>
                </div>
                <div class="qr-section-content">
                    <div class="qr-form-group">
                        <label class="qr-label">Corner Square Style</label>
                        <select id="qr-corner-square-style" class="qr-select-elegant">
                            ${cornerSquareStyles.map(style => `
                                <option value="${style.value}" ${style.value === 'extra-rounded' ? 'selected' : ''}>
                                    ${style.label}
                                </option>
                            `).join('')}
                        </select>
                        <div class="qr-color-input-wrapper corner-color-picker-div">
                                    <input type="color" id="qr-color-corner-square" class="qr-color-input" value="#000000">
                                    <input type="text" id="qr-color-corner-square-text" class="qr-color-text-input" value="#000000" placeholder="#000000 or rgb(0,0,0)">
                        </div>
                    </div>
                    <div class="qr-form-group">
                        <label class="qr-label">Corner Dot Style</label>
                        <select id="qr-corner-dot-style" class="qr-select-elegant">
                            ${cornerDotStyles.map(style => `
                                <option value="${style.value}" ${style.value === 'dot' ? 'selected' : ''}>
                                    ${style.label}
                                </option>
                            `).join('')}
                        </select>
                        <div class="qr-color-input-wrapper corner-color-picker-div">
                                    <input type="color" id="qr-color-corner-dot" class="qr-color-input" value="#000000">
                                    <input type="text" id="qr-color-corner-dot-text" class="qr-color-text-input" value="#000000" placeholder="#000000 or rgb(0,0,0)">
                        </div>
                    </div>
                    <button class="qr-next-btn" data-next-step="4">
                        Next: Colors <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    function renderColorsSection() {
        return `
            <div class="qr-section qr-collapsed" data-step="4">
                <div class="qr-section-header" data-toggle-step="4">
                    <div class="qr-section-title-wrapper">
                        <span class="qr-step-number">4</span>
                        <h3 class="qr-section-title">
                            <i class="fas fa-palette"></i>
                            Colors
                        </h3>
                    </div>
                    <i class="fas fa-chevron-down qr-collapse-icon"></i>
                </div>
                <div class="qr-section-content">
                    <div class="qr-color-presets">
                        ${colorPresets.map((preset, i) => `
                            <button 
                                class="qr-color-preset ${i === 0 ? 'active' : ''}" 
                                data-primary="${preset.primary}"
                                data-secondary="${preset.secondary}"
                                style="background: linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%);"
                                title="${preset.name}"
                            ></button>
                        `).join('')}
                    </div>
                    <div class="qr-color-pickers">
                        <div class="qr-color-picker-group">
                            <label class="qr-label">Dots Color</label>
                            <div class="qr-color-controls">
                                <div class="qr-color-input-wrapper">
                                    <input type="color" id="qr-color-primary" class="qr-color-input" value="#000000">
                                    <input type="text" id="qr-color-primary-text" class="qr-color-text-input" value="#000000" placeholder="#000000 or rgb(0,0,0)">
                                </div>
                                <div class="qr-opacity-wrapper">
                                    <label class="qr-opacity-label">Opacity</label>
                                    <div class="qr-opacity-controls">
                                        <input type="range" id="qr-color-primary-opacity" class="qr-opacity-slider" min="0" max="100" value="100">
                                        <input type="number" id="qr-color-primary-opacity-value" class="qr-opacity-value" min="0" max="100" value="100">
                                        <span class="qr-opacity-percent">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="qr-color-picker-group">
                            <label class="qr-label">Background</label>
                            <div class="qr-color-controls">
                                <div class="qr-color-input-wrapper">
                                    <input type="color" id="qr-color-secondary" class="qr-color-input" value="#ffffff">
                                    <input type="text" id="qr-color-secondary-text" class="qr-color-text-input" value="#ffffff" placeholder="#ffffff or rgb(255,255,255)">
                                </div>
                                <div class="qr-opacity-wrapper">
                                    <label class="qr-opacity-label">Opacity</label>
                                    <div class="qr-opacity-controls">
                                        <input type="range" id="qr-color-secondary-opacity" class="qr-opacity-slider" min="0" max="100" value="100">
                                        <input type="number" id="qr-color-secondary-opacity-value" class="qr-opacity-value" min="0" max="100" value="100">
                                        <span class="qr-opacity-percent">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="qr-next-btn" data-next-step="5">
                        Next: Logo <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * ${socialIcons.map((social, i) => `
                                <button class="qr-social-btn" data-index="${i}" title="${social.name}">
                                    <i class="${social.icon}" style="color: ${social.color}"></i>
                                </button>
                            `).join('')}
     */

    function renderLogoSection(iconlist) {
        return `
            <div class="qr-section qr-collapsed" data-step="5">
                <div class="qr-section-header" data-toggle-step="5">
                    <div class="qr-section-title-wrapper">
                        <span class="qr-step-number">5</span>
                        <h3 class="qr-section-title">
                            <i class="fas fa-image"></i>
                            Logo (Optional)
                        </h3>
                    </div>
                    <i class="fas fa-chevron-down qr-collapse-icon"></i>
                </div>
                <div class="qr-section-content">
                    <div class="qr-logo-tabs">
                        <button class="qr-logo-tab active" data-tab="none">
                            <i class="fas fa-ban"></i> None
                        </button>
                        <button class="qr-logo-tab" data-tab="social">
                            <i class="fas fa-share-alt"></i> Social
                        </button>
                        <button class="qr-logo-tab" data-tab="upload">
                            <i class="fas fa-upload"></i> Upload
                        </button>
                    </div>
                    
                    <div id="qr-logo-social" class="qr-logo-content" style="display:none;">
                        <div class="qr-social-grid" id="qr-social-icons-container">
                            
                        </div>
                    </div>
                    
                    <div id="qr-logo-upload" class="qr-logo-content" style="display:none;">
                        <div class="qr-upload-zone" id="qr-upload-zone">
                            <input type="file" id="qr-avatar-file" accept="image/*" style="display:none;">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Click to upload or drag & drop</p>
                            <span class="qr-upload-hint">PNG, JPG up to 5MB</span>
                        </div>
                        <div id="qr-avatar-preview-wrapper" class="qr-avatar-preview-wrapper" style="display:none;">
                            <img id="qr-avatar-preview-img" class="qr-avatar-preview-img" alt="Logo">
                            <button class="qr-remove-logo" id="qr-remove-logo">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <button class="qr-next-btn" data-next-step="6">
                        Next: Actions <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    function renderActionsSection() {
        return `
            <div class="qr-section qr-collapsed" data-step="6">
                <div class="qr-section-header" data-toggle-step="6">
                    <div class="qr-section-title-wrapper">
                        <span class="qr-step-number">6</span>
                        <h3 class="qr-section-title">
                            <i class="fas fa-check-circle"></i>
                            Save & Download
                        </h3>
                    </div>
                    <i class="fas fa-chevron-down qr-collapse-icon"></i>
                </div>
                <div class="qr-section-content">
                    <div class="qr-actions-elegant">
                        <button class="qr-btn-elegant qr-btn-primary" id="qr-save-btn" disabled>
                            <i class="fas fa-save"></i>
                            Save to Pocket
                        </button>
                        <button class="qr-btn-elegant qr-btn-secondary" id="qr-download-btn" disabled>
                            <i class="fas fa-download"></i>
                            Download PNG
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function cacheElements() {
        elements = {
            nameInput: document.getElementById('qr-name-input'),
            urlInput: document.getElementById('qr-url-input'),
            descriptionInput: document.getElementById('myqrcodeDescription'),
            dotsStyleInputs: document.querySelectorAll('input[name="dots-style"]'),
            cornerSquareStyle: document.getElementById('qr-corner-square-style'),
            colorPrimaryCornerSquare: document.getElementById('qr-color-corner-square'),
            colorPrimaryTextCornerSquare: document.getElementById('qr-color-corner-square-text'),

            cornerDotStyle: document.getElementById('qr-corner-dot-style'),
            colorPrimaryDot: document.getElementById('qr-color-corner-dot'),
            colorPrimaryTextDot: document.getElementById('qr-color-corner-dot-text'),

            colorPresets: document.querySelectorAll('.qr-color-preset'),

            colorPrimary: document.getElementById('qr-color-primary'),
            colorPrimaryText: document.getElementById('qr-color-primary-text'),

            colorPrimaryOpacity: document.getElementById('qr-color-primary-opacity'),
            colorPrimaryOpacityValue: document.getElementById('qr-color-primary-opacity-value'),
            colorSecondary: document.getElementById('qr-color-secondary'),
            colorSecondaryText: document.getElementById('qr-color-secondary-text'),
            colorSecondaryOpacity: document.getElementById('qr-color-secondary-opacity'),
            colorSecondaryOpacityValue: document.getElementById('qr-color-secondary-opacity-value'),
            logoTabs: document.querySelectorAll('.qr-logo-tab'),
            logoSocial: document.getElementById('qr-logo-social'),
            logoUpload: document.getElementById('qr-logo-upload'),
            socialBtns: document.querySelectorAll('.qr-social-btn'),
            uploadZone: document.getElementById('qr-upload-zone'),
            avatarFile: document.getElementById('qr-avatar-file'),
            avatarPreviewWrapper: document.getElementById('qr-avatar-preview-wrapper'),
            avatarPreviewImg: document.getElementById('qr-avatar-preview-img'),
            removeLogo: document.getElementById('qr-remove-logo'),
            previewPlaceholder: document.getElementById('qr-preview-placeholder'),
            previewLoading: document.getElementById('qr-preview-loading'),
            previewImage: document.getElementById('qr-preview-image'),
            saveBtn: document.getElementById('qr-save-btn'),
            downloadBtn: document.getElementById('qr-download-btn'),
            quickDownload: document.getElementById('qr-quick-download'),


        };
    }

    function attachEventListeners() {
        // Data inputs
        elements.nameInput.addEventListener('input', handleNameInput);
        elements.urlInput.addEventListener('input', handleUrlInput);
        elements.descriptionInput.addEventListener('input', handleDescriptionInput);

        elements.cornerDotStyle.addEventListener('change', (e) => {
            state.cornerDotStyle = e.target.value;
            // console.log("corner DOT style: ", state);
            // console.log("====================");
            triggerRegenerate();
        });

        // Dots color picker
        elements.colorPrimaryDot.addEventListener('input', (e) => {
            state.colorPrimaryDot = e.target.value;
            elements.colorPrimaryTextDot.value = e.target.value.toUpperCase();
            // console.log("Primary  colorPrimaryTextCornerSquare color style: ", state);
            // console.log("====================");
            triggerRegenerate();
        });

        // Dots color text input (supports HEX and RGB)
        elements.colorPrimaryTextDot.addEventListener('change', (e) => {
            const color = parseColorInput(e.target.value);
            if (color) {
                state.colorPrimaryDot = color;
                elements.colorPrimaryDot.value = color;
                elements.colorPrimaryTextDot.value = color.toUpperCase();
                // console.log("colorPrimaryTextCornerSquare style: ", state);
                // console.log("====================");
                triggerRegenerate();
            } else {
                // Reset to current value if invalid
                elements.colorPrimaryTextDot.value = state.colorPrimaryDot.toUpperCase();
                // console.log("colorPrimaryTextCornerSquare else style: ", state);
                // console.log("====================");
            }
        });

        //==========================

        // Dots style
        elements.dotsStyleInputs.forEach(input => {
            input.addEventListener('change', (e) => {

                document.querySelectorAll('.qr-style-card').forEach(card => card.classList.remove('active'));
                e.target.closest('.qr-style-card').classList.add('active');
                state.dotsStyle = e.target.value;
                // console.log("Dots style: ", state);
                // console.log("====================");
                triggerRegenerate();
            });
        });

        //============================================

        // Corners color picker
        elements.colorPrimaryCornerSquare.addEventListener('input', (e) => {
            state.colorPrimaryCornerSquare = e.target.value;
            elements.colorPrimaryTextCornerSquare.value = e.target.value.toUpperCase();
            // console.log("Primary  colorPrimaryTextCornerSquare color style: ", state);
            // console.log("====================");
            triggerRegenerate();
        });

        // Corners color text input (supports HEX and RGB)
        elements.colorPrimaryTextCornerSquare.addEventListener('change', (e) => {
            const color = parseColorInput(e.target.value);
            if (color) {
                state.colorPrimaryCornerSquare = color;
                elements.colorPrimaryCornerSquare.value = color;
                elements.colorPrimaryTextCornerSquare.value = color.toUpperCase();
                // console.log("colorPrimaryTextCornerSquare style: ", state);
                // console.log("====================");
                triggerRegenerate();
            } else {
                // Reset to current value if invalid
                elements.colorPrimaryTextCornerSquare.value = state.colorPrimaryCornerSquare.toUpperCase();
                // console.log("colorPrimaryTextCornerSquare else style: ", state);
                // console.log("====================");
            }
        });

        // Corners
        elements.cornerSquareStyle.addEventListener('change', (e) => {

            state.cornerSquareStyle = e.target.value;
            //  console.log("corner style: ", state);
            //     console.log("====================");
            triggerRegenerate();
        });

        // =============================================

        // Color presets
        elements.colorPresets.forEach(preset => {
            preset.addEventListener('click', (e) => {
                elements.colorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                const primary = preset.dataset.primary;
                const secondary = preset.dataset.secondary;

                // Update all primary color inputs
                elements.colorPrimary.value = primary;
                elements.colorPrimaryText.value = primary.toUpperCase();
                state.colorPrimary = primary;

                // Update all secondary color inputs
                elements.colorSecondary.value = secondary;
                elements.colorSecondaryText.value = secondary.toUpperCase();
                state.colorSecondary = secondary;
                // console.log("Color style: ", state);
                // console.log("====================");
                triggerRegenerate();
            });
        });

        // ------------------------------------------

        // Primary color picker
        elements.colorPrimary.addEventListener('input', (e) => {
            state.colorPrimary = e.target.value;
            elements.colorPrimaryText.value = e.target.value.toUpperCase();

            // console.log("Primary color style: ", state);
            // console.log("====================");
            triggerRegenerate();
        });


        // Primary color text input (supports HEX and RGB)
        elements.colorPrimaryText.addEventListener('change', (e) => {
            const color = parseColorInput(e.target.value);
            if (color) {
                state.colorPrimary = color;
                elements.colorPrimary.value = color;
                elements.colorPrimaryText.value = color.toUpperCase();
                // console.log("colorPrimaryText style: ", state);
                // console.log("====================");
                triggerRegenerate();
            } else {
                // Reset to current value if invalid
                elements.colorPrimaryText.value = state.colorPrimary.toUpperCase();
                // console.log("colorPrimaryText else style: ", state);
                // console.log("====================");
            }
        });

        // Primary opacity slider
        elements.colorPrimaryOpacity.addEventListener('input', (e) => {
            const value = e.target.value;
            state.colorPrimaryOpacity = parseInt(value);
            elements.colorPrimaryOpacityValue.value = value;
            // console.log("colorPrimary Opacity slider style: ", state);
            //     console.log("====================");
            triggerRegenerate();
        });

        // Primary opacity value input
        elements.colorPrimaryOpacityValue.addEventListener('change', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) value = 100;
            value = Math.max(0, Math.min(100, value));
            state.colorPrimaryOpacity = value;
            elements.colorPrimaryOpacity.value = value;
            elements.colorPrimaryOpacityValue.value = value;
            // console.log("colorPrimary Opacity Value style: ", state);
            //     console.log("====================");
            triggerRegenerate();
        });

        //======================================================

        // Secondary color picker
        elements.colorSecondary.addEventListener('input', (e) => {
            state.colorSecondary = e.target.value;
            elements.colorSecondaryText.value = e.target.value.toUpperCase();
            // console.log("seconday  color slider slider style: ", state);
            //     console.log("====================");
            triggerRegenerate();
        });

        // Secondary color text input (supports HEX and RGB)
        elements.colorSecondaryText.addEventListener('change', (e) => {
            const color = parseColorInput(e.target.value);
            if (color) {
                state.colorSecondary = color;
                elements.colorSecondary.value = color;
                elements.colorSecondaryText.value = color.toUpperCase();
                // console.log("seconday  color  text style: ", state);
                // console.log("====================");
                triggerRegenerate();
            } else {
                // Reset to current value if invalid
                elements.colorSecondaryText.value = state.colorSecondary.toUpperCase();
            }
        });

        // Secondary opacity slider
        elements.colorSecondaryOpacity.addEventListener('input', (e) => {
            const value = e.target.value;
            state.colorSecondaryOpacity = parseInt(value);
            elements.colorSecondaryOpacityValue.value = value;
            // console.log("color seconday Opacity slider style: ", state);
            // console.log("====================");
            triggerRegenerate();
        });

        // Secondary opacity value input
        elements.colorSecondaryOpacityValue.addEventListener('change', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) value = 100;
            value = Math.max(0, Math.min(100, value));
            state.colorSecondaryOpacity = value;
            elements.colorSecondaryOpacity.value = value;
            elements.colorSecondaryOpacityValue.value = value;
            // console.log("color seconday Opacity text input style: ", state);
            // console.log("====================");
            triggerRegenerate();
        });

        //=================================================

        // **FIX: Add click event listener on avatar preview image to re-trigger generation**
        // This allows clicking the already-uploaded avatar to regenerate the QR with that avatar
        elements.avatarPreviewImg.addEventListener('click', () => {
            // console.log("Before avtar preview image style: ", state);
            //     console.log("====================");
            if (state.avatarDataUrl) {
                state.logoType = 'avatar';
                // Clear social icon selection
                state.socialIcon = '';
                state.socialIconName = '';
                $('.qr-social-btn').removeClass('active');
                // Trigger regeneration with the existing avatar
                // console.log("avatarPreviewImg style: ", state);
                // console.log("====================");
                triggerRegenerate();
            }
        });

        // Logo tabs
        // elements.logoTabs.forEach(tab => {
        //     tab.addEventListener('click', (e) => {
        //         elements.logoTabs.forEach(t => t.classList.remove('active'));
        //         tab.classList.add('active');
        //         const tabType = tab.dataset.tab;
        //         elements.logoSocial.style.display = tabType === 'social' ? 'block' : 'none';
        //         elements.logoUpload.style.display = tabType === 'upload' ? 'block' : 'none';

        //         if (tabType === 'none') {
        //             // console.log("1");
        //             state.logoType = 'none';
        //             state.socialIcon = '';
        //             state.avatarDataUrl = null;
        //             triggerRegenerate();
        //             // console.log("color logo tab style: ", state);
        //             // console.log("====================");
        //         }
        //     });
        // });

        elements.logoTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                elements.logoTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabType = tab.dataset.tab;

                elements.logoSocial.style.display = tabType === 'social' ? 'block' : 'none';
                elements.logoUpload.style.display = tabType === 'upload' ? 'block' : 'none';

                // ✅ NEW: Clear conflicting data
                if (tabType === 'none') {
                    state.logoType = 'none';
                    state.socialIcon = '';
                    state.socialIconName = '';
                    state.avatarDataUrl = null;
                    state.avatarBuffer = null;
                    $('.qr-social-btn').removeClass('active');
                    elements.uploadZone.style.display = 'flex';
                    elements.avatarPreviewWrapper.style.display = 'none';
                    triggerRegenerate();
                }
                else if (tabType === 'social') {
                    state.logoType = 'social';
                    state.avatarDataUrl = null;  // ✅ Clear avatar
                    state.avatarBuffer = null;   // ✅ Clear avatar
                    if (state.socialIconName) {
                        triggerRegenerate();
                    }
                }
                else if (tabType === 'upload') {
                    state.socialIcon = '';        // ✅ Clear social
                    state.socialIconName = '';    // ✅ Clear social
                    $('.qr-social-btn').removeClass('active');
                    if (state.avatarBuffer || state.avatarDataUrl) {
                        state.logoType = 'avatar';
                        triggerRegenerate();
                    } else {
                        state.logoType = 'none';
                    }
                }
            });
        });

        // Attach click for dynamically created buttons
        $(document).on('click', '.qr-social-btn', function () {

            // Remove active class from all buttons
            $('.qr-social-btn').removeClass('active');

            // Add active to clicked one
            $(this).addClass('active');

            // Get index from button
            const index = parseInt($(this).data('index'));

            // Update your state object
            state.logoType = 'social';
            state.socialIcon = $(this).attr('title').toLowerCase();
            state.socialIconName = $(this).attr('title').toLowerCase();

            state.avatarDataUrl = null;
            state.avatarBuffer = null;
            // (Optional) clear avatar
            // state.logoDataUrl = null;
            // console.log("color qr-social-btn style: ", state);
            // console.log("====================");
            // Regenerate QR code with selected icon
            triggerRegenerate();
            // handleRemoveLogo();
        });


        // Upload zone
        elements.uploadZone.addEventListener('click', () => {
            elements.avatarFile.click();
        });
        elements.avatarFile.addEventListener('change', handleAvatarUpload);
        elements.removeLogo.addEventListener('click', handleRemoveLogo);

        // Actions - old
        // elements.saveBtn.addEventListener('click', handleSave);
        // After update
        elements.saveBtn.addEventListener('click', () => generateQRPreview('', true));


        elements.downloadBtn.addEventListener('click', handleDownload);
        elements.quickDownload.addEventListener('click', handleDownload);

        // Collapse/Expand functionality
        attachCollapseListeners();
        attachNextButtonListeners();




    }

    function setDefaults() {
        state.dotsStyle = 'rounded';
        state.cornerSquareStyle = 'extra-rounded';
        state.cornerDotStyle = 'dot';
        state.colorPrimary = '#000000';
        state.colorSecondary = '#ffffff';
        state.colorPrimaryOpacity = 100;
        state.colorSecondaryOpacity = 100;
    }

    function parseColorInput(input) {
        const value = input.trim();

        // HEX format: #RRGGBB or RRGGBB
        if (value.match(/^#?[0-9A-Fa-f]{6}$/)) {
            return value.charAt(0) === '#' ? value.toUpperCase() : '#' + value.toUpperCase();
        }

        // RGB format: rgb(r, g, b) or r, g, b
        const rgbMatch = value.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i) ||
            value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);

        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);

            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                return rgbToHex(r, g, b);
            }
        }

        return null;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    function hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const a = opacity / 100;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function handleNameInput(e) {
        state.name = e.target.value.trim();
        updateButtonStates();
    }

    function handleUrlInput(e) {
        state.url = e.target.value.trim();
        updateButtonStates();

        // Don't auto-generate on Step 1 - wait for user to click Next button
        // Auto-regeneration will still work after initial generation
    }

    function handleDescriptionInput(e) {
        state.description = e.target.value.trim();
        updateButtonStates();
    }

    function triggerRegenerate() {
        if (state.url) {
            clearTimeout(generateTimeout);
            generateTimeout = setTimeout(() => {
                generateQRPreview();
            }, 300);
        }
    }



    function mongoBufferToBlob(imageObj) {
        const byteArray = new Uint8Array(imageObj.data); // array → bytes
        return new Blob([byteArray], { type: imageObj.contentType });
    }

    function mongoBufferToUrl(imageObj) {
        const blob = mongoBufferToBlob(imageObj);
        return URL.createObjectURL(blob);
    }



    // ============================================================================
    // ADD NEW HELPER FUNCTIONS (add these before the return statement)
    // ============================================================================

    /**
     * Clear all form elements inside qr-controls-panel
     */
    function clearAllFormElements() {
        console.log('Clearing all form elements...');

        // Clear text inputs
        if (elements.nameInput) elements.nameInput.value = '';
        if (elements.urlInput) elements.urlInput.value = '';
        if (elements.descriptionInput) elements.descriptionInput.value = '';

        // Reset color pickers to defaults
        if (elements.colorPrimary) elements.colorPrimary.value = '#000000';
        if (elements.colorSecondary) elements.colorSecondary.value = '#ffffff';
        if (elements.colorPrimaryText) elements.colorPrimaryText.value = '#000000';
        if (elements.colorSecondaryText) elements.colorSecondaryText.value = '#ffffff';

        // Reset opacity sliders
        if (elements.colorPrimaryOpacity) elements.colorPrimaryOpacity.value = '100';
        if (elements.colorSecondaryOpacity) elements.colorSecondaryOpacity.value = '100';
        if (elements.colorPrimaryOpacityValue) elements.colorPrimaryOpacityValue.value = '100';
        if (elements.colorSecondaryOpacityValue) elements.colorSecondaryOpacityValue.value = '100';

        // Reset style selections
        document.querySelectorAll('.qr-style-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Reset color presets
        document.querySelectorAll('.qr-color-preset').forEach(btn => {
            btn.classList.remove('active');
        });

        // Clear avatar/logo
        if (elements.avatarFile) elements.avatarFile.value = '';
        if (elements.uploadZone) elements.uploadZone.style.display = 'flex';
        if (elements.avatarPreviewWrapper) elements.avatarPreviewWrapper.style.display = 'none';
        if (elements.avatarPreviewImg) elements.avatarPreviewImg.src = '';

        // Clear social icon selection
        document.querySelectorAll('.qr-social-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Reset logo tabs to "Upload" tab
        document.querySelectorAll('.qr-logo-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const uploadTab = document.querySelector('.qr-logo-tab[data-tab="upload"]');
        if (uploadTab) uploadTab.classList.add('active');

        // Show upload section, hide social section
        if (elements.logoUpload) elements.logoUpload.style.display = 'block';
        if (elements.logoSocial) elements.logoSocial.style.display = 'none';

        // Clear preview
        if (elements.previewImage) {
            elements.previewImage.style.display = 'none';
            elements.previewImage.src = '';
        }

        // Show placeholder
        if (elements.previewPlaceholder) {
            elements.previewPlaceholder.style.display = 'flex';
        }

        console.log('✅ All form elements cleared');
    }

    // Use only for the formdata building
    function buildFormData(data, isSaveflag) {

        const fd = new FormData();
        fd.append('url', data.url);
        fd.append('name', data.name);
        fd.append('description', data.description);
        fd.append('qrcodeid', data.qrcodeid);
        fd.append('savedata', isSaveflag ? 'true' : 'false');

        fd.append('settings', JSON.stringify(data.settings));

        if (data.avatarBuffer) {
            fd.append(
                'avatarFile',
                new Blob([data.avatarBuffer], { type: 'image/png' }),
                'avatar.png'
            );
        }

        return fd;
    }


    /**
     * Hide personalized QR section by collapsing all steps
     */
    function hidePersonalizedQRSection() {
        console.log('Hiding personalized QR section...');

        // Collapse all QR sections
        const sections = document.querySelectorAll('.qr-section');
        sections.forEach(section => {
            section.classList.add('qr-collapsed');
        });

        // Reset to step 1
        state.currentStep = 1;

        // Hide the entire personalized QR container if it exists
        const personalizedQRContainer = document.getElementById('personalized-qr');
        if (personalizedQRContainer) {
            personalizedQRContainer.style.display = 'none';
        }

        console.log('✅ Personalized QR section hidden');
    }

    // Generating the QR preview.
    async function generateQRPreview(qrcodeid, isSave) {
        if (!state.name || !state.url || state.isGenerating) return;

        try {
            state.isGenerating = true;
            showLoading();

            // const colorPrimaryRgba = hexToRgba(state.colorPrimary, state.colorPrimaryOpacity);
            // const colorSecondaryRgba = hexToRgba(state.colorSecondary, state.colorSecondaryOpacity);

            const colorPrimaryRgba = hexToRgba(state.colorPrimary, state.colorPrimaryOpacity);
            const colorSecondaryRgba = hexToRgba(state.colorSecondary, state.colorSecondaryOpacity);


            if (state.colorPrimaryDot === state.colorPrimary && state.colorPrimaryCornerSquare === state.colorPrimary) {
                state.colorPrimaryDot = state.colorPrimary;
                state.colorPrimaryCornerSquare = state.colorPrimary;
            }
            if (state.colorPrimaryDot !== state.colorPrimary) {
                if (state.colorPrimaryDot == '#000000') {
                    state.colorPrimaryDot = state.colorPrimary;
                } else {
                    state.colorPrimaryDot = state.colorPrimaryDot;
                }
            }
            if (state.colorPrimaryCornerSquare !== state.colorPrimary) {
                if (state.colorPrimaryCornerSquare == '#000000') {
                    state.colorPrimaryCornerSquare = state.colorPrimary;
                } else {
                    state.colorPrimaryCornerSquare = state.colorPrimaryCornerSquare;
                }

            }

            const dotColorRgba = hexToRgba(state.colorPrimaryDot, 100);
            const squareColorRgba = hexToRgba(state.colorPrimaryCornerSquare, 100);

            const savedRequestData = {
                url: state.url,
                name: state.name,
                description: state.description,
                qrcodeid: qrcodeid || '',
                settings: {
                    colorPrimary: colorPrimaryRgba,
                    colorSecondary: colorSecondaryRgba,
                    dotsStyle: state.dotsStyle,
                    cornerSquareStyle: state.cornerSquareStyle,
                    cornerDotStyle: state.cornerDotStyle,
                    colorPrimaryDot: dotColorRgba,
                    colorPrimaryCornerSquare: squareColorRgba,
                    logoType: state.logoType || '',
                    socialIconName: state.socialIconName || '',
                    size: 300,
                    colorPrimaryOpacity: state.colorPrimaryOpacity || '',
                    colorSecondaryOpacity: state.colorSecondaryOpacity || ''
                },
                avatarBuffer: state.avatarBuffer || null
            };


            // if (state.avatarBuffer) {
            //     const avatarBlob = new Blob([state.avatarBuffer], { type: 'image/png' });
            //     formData.append('avatarFile', avatarBlob, 'avatar.png');
            // }
            let formData1 = buildFormData(savedRequestData, false);
            // When you want to save the data 
            if (isSave) {
                formData1 = buildFormData(savedRequestData, true);
            }

            const response = await fetch('/api/qr-designer/savetobucket', {
                method: 'POST',
                body: formData1,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                if (isSave) {
                   
                    showSuccessMessage('QR code saved successfully!');
                    state.editingId = null;
                    state.isEditMode = false;

                    // Reset form to clean state
                    resetForm();

                    // Navigate to first tab (default-card view)
                    switchToDefaultCardTab();
                    updateDisplayPage();
                } else {
                    // console.log("data.qrData: ", data.qrData);
                    const qrBlob = mongoBufferToBlob(data.qrData);
                    state.currentQRBlob = qrBlob;
                    activeQRBlob.QRBlob = qrBlob;
                    // console.log("qrBlob: ", qrBlob);
                    const imgUrl = URL.createObjectURL(qrBlob);
                    state.currentQRDataUrl = imgUrl;
                    // console.log("imgUrl: ", imgUrl);
                    elements.previewImage.src = imgUrl;
                    showPreview();
                    updateButtonStates();
                }

            } else {
                // showErrorMessage(data.message);
                elements.previewLoading.style.display = 'none';
                console.log("data: ", data);
                if (data.response.limitReached) {
                    // Show message box with registration option
                    const result = await MessageBox.show(
                        `<p>You've reached the maximum limit of <strong>${data.maxAllowed} custom QR codes</strong> for your current account.</p>
                        <p>To create more custom QR codes, please create a new account or upgrade your existing account.</p>`,
                        {
                            type: 'warning',
                            title: 'QR Code Limit Reached',
                            closable: true,
                            closeOnOverlay: false,
                            buttons: [
                                { text: 'Cancel', style: 'secondary', value: false },
                                { text: 'Create New Account', style: 'primary', value: true, icon: 'fas fa-user-plus' }
                            ]
                        }
                    );

                    // if (result) {
                    //     await logout()
                    //     window.location.href = '/signup';
                    // }
                    // ✅ NEW: Handle both Cancel and Create Account buttons
                    if (result === false) {
                        // User clicked Cancel - clear everything and go to QRCode tab
                        console.log('User cancelled - clearing QR designer state');

                        // 1. Clear state
                        resetState();

                        // 2. Clear all form elements
                        clearAllFormElements();

                        // 3. Hide personalized QR section
                        hidePersonalizedQRSection();

                        // 4. Switch to QRCode tab
                        switchToDefaultCardTab();

                        console.log('✅ QR designer cleared and switched to QRCode tab');

                    } else if (result === true) {
                        // User clicked "Create New Account" - logout and redirect
                        await logout();
                        window.location.href = '/signup';
                    }
                } else {
                    showErrorMessage(data.message || 'Failed to save QR code');
                }

            }


        } catch (err) {
            console.error('QR preview error:', err);
        } finally {
            state.isGenerating = false;
        }
    }

    /**
     * Switch to the default card tab (QRCode tab)
     */
    function switchToDefaultCardTab() {
        // Find the default card tab button
        const defaultCardTab = document.querySelector('.card-tab[data-card="default-card"]');

        if (defaultCardTab) {
            // Trigger click on the default card tab
            defaultCardTab.click();

            // console.log('Switched to default card tab');
        } else {
            console.warn('Default card tab not found');
        }
    }

    async function generateIcons() {

        try {

            let savedIconlist = JSON.parse(localStorage.getItem("qrcodeIcons"));
            let responsedata = {};
            if (savedIconlist) {
                responsedata = savedIconlist;
            } else {
                const response = await fetch('/api/qr-designer/geticons', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',

                });
                responsedata = await response.json();
                localStorage.setItem("qrcodeIcons", JSON.stringify(responsedata));
            }
            // logoType, logoDataUrl, socialIconName
            // console.log("responsedata: ", responsedata)

            if (responsedata.message && responsedata.message.success) {

                const html = `
                    <div class="qr-social-grid">
                        ${responsedata.message.data.map((icon, i) => `
                            <button class="qr-social-btn" data-index="${i}" title="${icon.name}">
                                <img src="${icon.url}" class="qr-social-img" />
                            </button>
                        `).join('')}
                    </div>
                `;

                let iconsDiv = $("#qr-social-icons-container").length;
                setTimeout(() => {
                    if (iconsDiv > 0) {
                        $("#qr-social-icons-container").empty()
                        $("#qr-social-icons-container").append(html)
                    }
                }, 1000);

                // console.log("html", html);
            } else {
                console.log("Somehting is wrong:", responsedata);
            }

        } catch (error) {
            console.error('generateIcons Generate error:', error.message);
        }
    }

    function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            // alert('File must be less than 5MB');
            MessageBox.show('File must be less than 5MB')
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            state.logoType = 'avatar';
            state.avatarDataUrl = null; // clear old data URL
            state.avatarBuffer = new Uint8Array(e.target.result); // store JSON-safe buffer
            elements.avatarPreviewImg.src = URL.createObjectURL(new Blob([state.avatarBuffer], { type: file.type }));
            elements.uploadZone.style.display = 'none';
            elements.avatarPreviewWrapper.style.display = 'block';

            state.socialIcon = '';
            state.socialIconName = '';
            $('.qr-social-btn').removeClass('active');
            triggerRegenerate();
        };
        reader.readAsArrayBuffer(file); // <-- important, read as ArrayBuffer
        // reader.readAsArrayBuffer(file); // <-- important, read as ArrayBuffer
        // state.socialIcon = '';
        // state.socialIconName = '';
        // $('.qr-social-btn').removeClass('active');
    }


    function handleRemoveLogo() {
        state.avatarDataUrl = null;
        state.logoType = 'none';
        elements.avatarFile.value = '';
        elements.uploadZone.style.display = 'flex';
        elements.avatarPreviewWrapper.style.display = 'none';
        triggerRegenerate();

    }
    function handleDownload() {
        // console.log("state.currentQRDataUrl: ",state.currentQRDataUrl);
        if (!state.currentQRDataUrl) return;

        const link = document.createElement('a');
        const fileName = state.name ?
            `${state.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png` :
            'qr-code.png';
        link.download = fileName;
        link.href = state.currentQRDataUrl;
        link.click();
    }

    function updateButtonStates() {
        const canSave = state.name && state.url && state.currentQRDataUrl;
        elements.saveBtn.disabled = !canSave;
        elements.downloadBtn.disabled = !state.currentQRDataUrl;
        elements.quickDownload.disabled = !state.currentQRDataUrl;
    }

    function showPlaceholder() {
        elements.previewPlaceholder.style.display = 'flex';
        elements.previewLoading.style.display = 'none';
        elements.previewImage.style.display = 'none';
    }

    function showLoading() {
        elements.previewPlaceholder.style.display = 'none';
        elements.previewLoading.style.display = 'flex';
        elements.previewImage.style.display = 'none';
    }

    function showPreview() {
        elements.previewPlaceholder.style.display = 'none';
        elements.previewLoading.style.display = 'none';
        elements.previewImage.style.display = 'block';
    }

    function attachCollapseListeners() {
        const headers = document.querySelectorAll('[data-toggle-step]');
        headers.forEach(header => {
            header.addEventListener('click', function () {
                const stepNumber = parseInt(this.getAttribute('data-toggle-step'));
                toggleStep(stepNumber);
            });
        });
    }

    function attachNextButtonListeners() {
        const nextButtons = document.querySelectorAll('.qr-next-btn');
        nextButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const nextStep = parseInt(this.getAttribute('data-next-step'));
                goToStep(nextStep);
            });
        });
    }

    function toggleStep(stepNumber) {
        const section = document.querySelector(`.qr-section[data-step="${stepNumber}"]`);
        if (!section) return;

        const isCollapsed = section.classList.contains('qr-collapsed');

        if (isCollapsed) {
            // Expand this section
            section.classList.remove('qr-collapsed');
            state.currentStep = stepNumber;
        } else {
            // Collapse this section
            section.classList.add('qr-collapsed');
        }
    }

    function goToStep(stepNumber) {
        // Validation for Step 1 -> Step 2: Require URL
        if (state.currentStep === 1 || stepNumber === 2) {
            if (!state.url) {
                // alert('Please enter a URL before proceeding');
                MessageBox.show('Please enter a URL before proceeding')
                return;
            }

            // Generate the initial QR code
            if (!state.currentQRDataUrl) {
                generateQRPreview();
            }
        }

        // Collapse current step
        const currentSection = document.querySelector(`.qr-section[data-step="${state.currentStep}"]`);
        if (currentSection) {
            currentSection.classList.add('qr-collapsed');
        }

        // Expand next step
        const nextSection = document.querySelector(`.qr-section[data-step="${stepNumber}"]`);
        if (nextSection) {
            nextSection.classList.remove('qr-collapsed');
            state.currentStep = stepNumber;

            // Smooth scroll to the next section
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }


    function resetForm() {
        // Clear form elements
        clearAllFormElements();

        // Reset state
        state.name = '';
        state.url = '';
        state.description = '';
        state.currentQRDataUrl = null;
        state.dotsStyle = 'rounded';
        state.cornerSquareStyle = 'extra-rounded';
        state.cornerDotStyle = 'dot';
        state.colorPrimary = '#000000';
        state.colorSecondary = '#ffffff';
        state.colorPrimaryOpacity = 100;
        state.colorSecondaryOpacity = 100;
        state.logoType = 'none';
        state.socialIcon = null;
        state.avatarFile = null;
        state.avatarDataUrl = null;
        state.isGenerating = false;
        state.currentStep = 1;
        state.colorPrimaryDot = '#000000';
        state.colorPrimaryCornerSquare = '#000000';
        state.socialIconName = '';
        state.editingId = '';
        state.isEditMode = false;
        state.avatarBuffer = '';
        state.currentQRBlob = '';

        // Update UI
        showPlaceholder();
        updateButtonStates();
    }


    /**
 * Update state from external sources (for edit functionality)
 */
    function updateState(newState) {
        Object.assign(state, newState);
        // console.log('QR Designer V2: State updated', state);
        updateButtonStates();


    }

    function updateActiveqrblob(newQRBlob) {
        Object.assign(activeQRBlob, newQRBlob);
        // console.log('QR Designer V2: newBlob updated', activeQRBlob);

        const imgUrl = URL.createObjectURL(activeQRBlob.QRBlob);
        // console.log('QR Designer V2: image url', imgUrl);
        state.currentQRDataUrl = imgUrl;
        // updateButtonStates();
    }

    /**
     * Get current state (read-only)
     */
    function getState() {
        return { ...state };
    }

    /**
     * Reset state to defaults
     */
    function resetState() {
        state.name = '';
        state.url = '';
        state.description = '';
        state.dotsStyle = 'rounded';
        state.cornerSquareStyle = 'extra-rounded';
        state.cornerDotStyle = 'dot';
        state.colorPrimary = '#000000';
        state.colorSecondary = '#ffffff';
        state.colorPrimaryOpacity = 100;
        state.colorSecondaryOpacity = 100;
        state.logoType = 'none';
        state.socialIcon = null;
        state.avatarFile = null;
        state.avatarDataUrl = null;
        state.currentQRDataUrl = null;
        state.isGenerating = false;
        state.currentStep = 1;
        state.editingId = null;      // CLEAR THIS
        state.isEditMode = false;    // CLEAR THIS
        state.colorPrimaryDot = '#000000';
        state.colorPrimaryCornerSquare = '#000000';
        updateButtonStates();
    }
    /**
     * Force regeneration (useful for edit mode)
     */
    function forceRegenerate(qrcodeid) {
        if (state.url && state.url.trim()) {
            // console.log('Force regenerating QR code...');
            generateQRPreview(qrcodeid);
        }
    }

    return {
        init, updateState, updateActiveqrblob,
        getState,
        resetState,
        forceRegenerate,
        mongoBufferToBlob
    };
})();

export default QRDesignerV2;