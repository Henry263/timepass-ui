/**
 * QR CODE MANAGER
 * Handles edit, delete, and reload functionality for saved QR codes
 */

import { showSuccessMessage, showErrorMessage } from "./notifications.js";
import QRDesignerV2 from './qr-designer-v2.js';
import MessageBox from '../modules/message-box.js'
import { getCurrentUser, getUserProfile, logout } from '../core/auth.js';

const QRManager = (function () {
    'use strict';

    // let QRDesignerV2Instance = null;

    function init(designerInstance) {
        // QRDesignerV2Instance = designerInstance;
        attachEventListeners();
        console.log('QR Manager: Initialized');
    }

    function attachEventListeners() {
        // Edit button - use event delegation
        $(document).on('click', '.edit-qr-btn', handleEdit);
        
        // Delete button - use event delegation
        $(document).on('click', '.delete-qr-btn', handleDelete);

       

    }

    async function handleEdit(e) {
        
        e.preventDefault();
        const qrCodeId = $(this).data('qrcodeid');
        
        if (!qrCodeId) {
            showErrorMessage('QR Code ID not found');
            return;
        }

        try {
            // Show loading state
            $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Loading...');
            let qrcodeData = {"qrcodeId": qrCodeId}
            // // Fetch QR code details
            const response = await fetch(`/api/qr-designer/edit`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                method: "POST",
                body: JSON.stringify(qrcodeData),
            });


            const data = await response.json();

            if (data.success && data.qrCode) {
                // Switch to design card view
                switchToDesignView();
                
                // Load QR code data into designer
                loadQRCodeIntoDesigner(data.qrCode);
                
                showSuccessMessage('QR Code loaded for editing');
            } else {
                if (data.response.limitReached) {
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
                    if (result === false) {
                        // User clicked Cancel - clear everything and go to QRCode tab
                        console.log('User cancelled - clearing QR designer state');

                       
                    } else if (result === true) {
                        // User clicked "Create New Account" - logout and redirect
                        await logout();
                        window.location.href = '/signup';
                    }
                } else {
                    const result = await MessageBox.show(
                        `<p>Some Error on Server <strong>${data.message} </strong> for your current account.</p>`,
                        {
                            type: 'warning',
                            title: 'Server Error',
                            closable: true,
                            closeOnOverlay: false,
                            buttons: [
                                { text: 'Cancel', style: 'secondary', value: false },
                               
                            ]
                        }
                    );
                }
                
                // showErrorMessage(data.message || 'Failed to load QR code');
            }

        } catch (error) {
            console.error('Edit error:', error);
            showErrorMessage('Failed to load QR code for editing');
        } finally {
            // Reset button state
            $(this).prop('disabled', false).html('<i class="fas fa-edit"></i> Edit');
        }
    }

    async function handleDelete(e) {
        e.preventDefault();
        const qrCodeId = $(this).data('qrcodeid');
        
        if (!qrCodeId) {
            showErrorMessage('QR Code ID not found');
            return;
        }

        MessageBox.show('Are you sure you want to delete this QR code? This action cannot be undone.', {
            type: 'confirm',
            buttons: [
                { text: 'Cancel', style: 'secondary' },
                { 
                    text: 'Proceed', 
                    style: 'primary',
                    onClick: async () => {
                       


                        try {
                            // Show loading state
                            $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Deleting...');
                
                            // Delete QR code
                            const response = await fetch(`/api/qr-designer/${qrCodeId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include'
                            });
                
                            const data = await response.json();
                
                            if (data.success) {
                                showSuccessMessage('QR Code deleted successfully');
                                
                                // Remove the card from DOM
                                $(this).closest('.profile-qrcode-div').fadeOut(300, function() {
                                    $(this).remove();
                                    
                                    // Check if there are no more QR codes
                                    checkEmptyState();
                                });
                                MessageBox.success('QR Code deleted successfully');
                            } else {
                                // showErrorMessage(data.message || 'Failed to delete QR code');
                                MessageBox.error('Failed to delete QR code: ' + data.message);
                                $(this).prop('disabled', false).html('<i class="fas fa-trash-alt"></i> Delete');
                            }
                
                        } catch (error) {
                            console.error('Delete error:', error);
                            // showErrorMessage('Failed to delete QR code');
                            MessageBox.error('Failed to delete QR code: ' + error.message);
                            $(this).prop('disabled', false).html('<i class="fas fa-trash-alt"></i> Delete');
                        }


                    }
                }
            ]
        });

        // // Confirmation dialog
        // const confirmed = confirm('Are you sure you want to delete this QR code? This action cannot be undone.');
        // if (!confirmed) return;

        
    }

    function switchToDesignView() {
        // Switch carousel to design card view
        const designCardTab = document.querySelector('.card-tab[data-card="design-card"]');
        if (designCardTab) {
            designCardTab.click();
        }

        // Alternatively, directly trigger the carousel
        const designCardView = document.getElementById('design-card-view');
        if (designCardView) {
            // Remove active from all cards
            document.querySelectorAll('.carousel-card').forEach(card => {
                card.classList.remove('active');
            });
            
            // Add active to design card
            designCardView.classList.add('active');
            
            // Update tabs
            document.querySelectorAll('.card-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            if (designCardTab) {
                designCardTab.classList.add('active');
            }

            // Scroll to view
            designCardView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function convertoImgurl(imgData){
        if (imgData.data &&  Array.isArray(imgData.data)) {
            const uint8Array = new Uint8Array(imgData.data );
            const blob = new Blob([uint8Array], { 
                type: imgData.data.contentType || 'image/png' 
            });
            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        } else {
            return null;
        }
    }
    function loadQRCodeIntoDesigner(qrCode) {
        console.log('Loading QR code into designer:', qrCode);
        
        // Populate form fields
        const nameInput = document.getElementById('qr-name-input');
        const urlInput = document.getElementById('qr-url-input');
        const textareaInput = document.getElementById('myqrcodeDescription');
        
        if (nameInput) nameInput.value = qrCode.name || '';
        if (urlInput) urlInput.value = qrCode.url || '';
        if (textareaInput) textareaInput.value = qrCode.description || '';
    
        const settings = qrCode.settings || {};
    
        // Load dots style
        const dotsStyle = settings.dotsStyle || 'rounded';
        const dotsRadio = document.querySelector(`input[name="dots-style"][value="${dotsStyle}"]`);
        if (dotsRadio) {
            dotsRadio.checked = true;
            // Manually update the card styling
            document.querySelectorAll('.qr-style-card').forEach(card => card.classList.remove('active'));
            const activeCard = dotsRadio.closest('.qr-style-card');
            if (activeCard) activeCard.classList.add('active');
        }
    
        // Load corner styles
        const cornerSquareSelect = document.getElementById('qr-corner-square-style');
        const cornerDotSelect = document.getElementById('qr-corner-dot-style');
        
        if (cornerSquareSelect && settings.cornerSquareStyle) {
            cornerSquareSelect.value = settings.cornerSquareStyle;
        }
        
        if (cornerDotSelect && settings.cornerDotStyle) {
            cornerDotSelect.value = settings.cornerDotStyle;
        }
    
        // Load colors - strip opacity if present in rgba format
        const primaryColor = extractHexFromColor(settings.colorPrimary) || '#000000';
        const secondaryColor = extractHexFromColor(settings.colorSecondary) || '#ffffff';

        const colorPrimary = document.getElementById('qr-color-primary');
        const colorPrimaryText = document.getElementById('qr-color-primary-text');
        const colorSecondary = document.getElementById('qr-color-secondary');
        const colorSecondaryText = document.getElementById('qr-color-secondary-text');

        if (colorPrimary) colorPrimary.value = primaryColor;
        if (colorPrimaryText) colorPrimaryText.value = primaryColor.toUpperCase();
        if (colorSecondary) colorSecondary.value = secondaryColor;
        if (colorSecondaryText) colorSecondaryText.value = secondaryColor.toUpperCase();

        //======== Below colors for the dot and corner style ======

        const primaryColorDot = extractHexFromColor(settings.colorPrimaryDot) || '#000000';
        const primaryColorSquare = extractHexFromColor(settings.colorPrimaryCornerSquare) || '#000000';

        const colorPrimaryCornerSquare = document.getElementById('qr-color-corner-square');
        const colorPrimaryTextCornerSquare = document.getElementById('qr-color-corner-square-text');
        const colorPrimaryDot = document.getElementById('qr-color-corner-dot');
        const colorPrimaryTextDot = document.getElementById('qr-color-corner-dot-text');

        if (colorPrimaryDot) colorPrimaryDot.value = primaryColorDot;
        if (colorPrimaryTextDot) colorPrimaryTextDot.value = primaryColorDot.toUpperCase();
        if (colorPrimaryCornerSquare) colorPrimaryCornerSquare.value = primaryColorSquare;
        if (colorPrimaryTextCornerSquare) colorPrimaryTextCornerSquare.value = primaryColorSquare.toUpperCase();
       
    
        // Deselect all color presets (custom colors)
        document.querySelectorAll('.qr-color-preset').forEach(preset => {
            preset.classList.remove('active');
        });
    
        // Load logo type
        let setLogoType = settings.logoType
        if(settings.logoType == 'avatar'){
            setLogoType = 'upload'
        }

        if (settings.logoType && settings.logoType !== 'none') {
            const logoTab = document.querySelector(`.qr-logo-tab[data-tab="${setLogoType}"]`);
            if (logoTab) {
                // Remove active from all tabs
                document.querySelectorAll('.qr-logo-tab').forEach(tab => tab.classList.remove('active'));
                logoTab.classList.add('active');
                
                // Show appropriate content
                const logoSocial = document.getElementById('qr-logo-social');
                const logoUpload = document.getElementById('qr-logo-upload');
                
                if (logoSocial) logoSocial.style.display = setLogoType === 'social' ? 'block' : 'none';
                if (logoUpload) logoUpload.style.display = setLogoType=== 'upload' ? 'block' : 'none';
            }
    
            // If social icon, select it
            if (settings.logoType === 'social' && settings.socialIconName) {
                setTimeout(() => {
                    $('.qr-social-btn').removeClass('active');
                    const socialBtn = $(`.qr-social-btn[title="${capitalizeFirst(settings.socialIconName)}"]`);
                    if (socialBtn.length) {
                        socialBtn.addClass('active');
                    }
                }, 300);
            }
    
            // If avatar/upload, show preview (if we have logoDataUrl in settings)
            if (settings.logoType === 'avatar' && qrCode.data && settings.avatarFile) {
                const avatarPreviewImg = document.getElementById('qr-avatar-preview-img');
                const avatarPreviewWrapper = document.getElementById('qr-avatar-preview-wrapper');
                const uploadZone = document.getElementById('qr-upload-zone');
                
                let avtarimageUrl = convertoImgurl(settings.avatarFile)
                console.log("avtarimageUrl: ", avtarimageUrl);

                if (avatarPreviewImg) avatarPreviewImg.src = avtarimageUrl;
                if (avatarPreviewWrapper) avatarPreviewWrapper.style.display = 'block';
                if (uploadZone) uploadZone.style.display = 'none';
            }
        } else {
            // No logo - select "none" tab
            const noneTab = document.querySelector('.qr-logo-tab[data-tab="none"]');
            if (noneTab) {
                document.querySelectorAll('.qr-logo-tab').forEach(tab => tab.classList.remove('active'));
                noneTab.classList.add('active');
            }
        }
    
        // Load preview image
        if (qrCode.data) {
            const previewImage = document.getElementById('qr-preview-image');
            if (previewImage && qrCode.data) {
                let previewimageUrl = convertoImgurl(qrCode.data)
                console.log("previewimageUrl: ", previewimageUrl);
                previewImage.src =previewimageUrl;
                previewImage.style.display = 'block';
                
                const placeholder = document.getElementById('qr-preview-placeholder');
                const loading = document.getElementById('qr-preview-loading');
                if (placeholder) placeholder.style.display = 'none';
                if (loading) loading.style.display = 'none';
            }
        }
    
        // Expand first step
        const firstSection = document.querySelector('.qr-section[data-step="1"]');
        if (firstSection) {
            firstSection.classList.remove('qr-collapsed');
        }
        
        function jsonSafeToUint8Array(jsonBuffer) {
            let avtarbuttfer = '';
            if (jsonBuffer && Array.isArray(jsonBuffer)) {
                avtarbuttfer = new Uint8Array(jsonBuffer);
                
            }
            // Convert normal array back to Uint8Array
            return avtarbuttfer
        }
        // NOW update the designer state using the exposed method
        if (QRDesignerV2 && typeof QRDesignerV2.updateState === 'function') {
            let avatarBuffer = '';
            if (qrCode.settings.avatarFile && qrCode.settings.avatarFile.data){
                avatarBuffer = jsonSafeToUint8Array(qrCode.settings.avatarFile.data)
                console.log("avatarBuffer after update: ", avatarBuffer);
            }
            
            //state.description
            QRDesignerV2.updateState({
                name: qrCode.name || '',
                url: qrCode.url || '',
                description: qrCode.description || '',
                dotsStyle: settings.dotsStyle || 'rounded',
                cornerSquareStyle: settings.cornerSquareStyle || 'extra-rounded',
                cornerDotStyle: settings.cornerDotStyle || 'dot',
                colorPrimary: primaryColor,
                colorSecondary: secondaryColor,
                colorPrimaryOpacity: extractOpacityFromColor(settings.colorPrimary) || 100,
                colorSecondaryOpacity: extractOpacityFromColor(settings.colorSecondary) || 100,
                logoType: settings.logoType || 'none',
                socialIcon: settings.socialIconName || null,
                socialIconName: settings.socialIconName || null,
                avatarDataUrl: settings.logoDataUrl || null,
                currentQRDataUrl: qrCode.data || null,
                editingId: qrCode.id || null,
                isEditMode: true,
                avatarBuffer: avatarBuffer,
                colorPrimaryDot: settings.colorPrimaryDot || '#000000',
                colorPrimaryCornerSquare : settings.colorPrimaryCornerSquare || '#000000'
            });

            const qrBlob = QRDesignerV2.mongoBufferToBlob(qrCode.data);
            console.log("qrBlob updateActiveqrblob: ", qrBlob);
            QRDesignerV2.updateActiveqrblob({QRBlob: qrBlob || ''});
            
            console.log('QR Designer state updated successfully');
            // ADD THIS: Force initial regeneration to ensure everything is in sync
            // Wait a bit for DOM updates to complete
            // setTimeout(() => {
            //     if (typeof QRDesignerV2.forceRegenerate === 'function') {
            //         QRDesignerV2.forceRegenerate(qrCode.id);
            //     }
            // }, 500);
        } else {
            console.warn('QR Designer updateState method not available');
        }
    }
    
    // Add helper function to extract opacity from rgba color
    function extractOpacityFromColor(color) {
        if (!color) return 100;
        
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
            if (match && match[1]) {
                return Math.round(parseFloat(match[1]) * 100);
            }
        }
        
        return 100; // Default full opacity
    }
   

    function extractHexFromColor(color) {
        if (!color) return null;
        
        // If already hex
        if (color.startsWith('#')) {
            return color.substring(0, 7); // Remove any alpha if present
        }
        
        // If rgba format
        if (color.startsWith('rgba') || color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
                const r = parseInt(match[0]);
                const g = parseInt(match[1]);
                const b = parseInt(match[2]);
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

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function checkEmptyState() {
        const qrCards = document.querySelectorAll('.profile-qrcode-div');
        if (qrCards.length === 0) {
            const container = document.getElementById('generatedQR') || 
                            document.querySelector('.owner-qr-code-options');
            
            if (container) {
                container.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem 1rem;">
                        <i class="fas fa-qrcode" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem; color: white;"></i>
                        <h3 style="color: white; margin-bottom: 0.5rem;">No Custom QR Codes Yet</h3>
                        <p style="color: rgba(255,255,255,0.8); margin-bottom: 1.5rem;">Create your first personalized QR code using the designer</p>
                        <button class="btn btn-primary" onclick="document.querySelector('.card-tab[data-card=\\'design-card\\']').click()">
                            <i class="fas fa-plus"></i> Create QR Code
                        </button>
                    </div>
                `;
            }
        }
    }

    return { init };
})();

export default QRManager;