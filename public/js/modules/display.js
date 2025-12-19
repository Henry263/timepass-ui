// modules/display.js
// Display Page & Card Management

import { api } from "../core/api-client.js";
import { getUserProfile } from "../core/auth.js";
import { SOCIAL_ICONS, VALID_SOCIAL_FIELDS } from "../core/config.js";
import { showSuccessMessage, showErrorMessage } from "../ui/notifications.js";
import { updateProfileDisplay, updateNavbarAvatar } from './avatar.js';
import cardCarousel from '../ui/card-carousel.js';
import MessageBox from './message-box.js'
import DigitalCardCustomization from '../ui/card-branding.js';


function renderCardPhoto(userProfile) {
    // console.log("contactData.cardId: ", contactData.cardId); photo/c/${data.cardId}
    const photoHtml = userProfile.hasProfilePhoto
        ? `<img src="/api/profile/photo/c/${userProfile.cardId}" alt="${userProfile.initials}">`
        : `<span>${userProfile.initials}</span>`;

    $(".profile-avatar").html(photoHtml);
}

function normalizeUrl(url) {
    if (!url || url.trim() === "") return "";

    url = url.trim();

    // If URL already has protocol, return as is
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    // Add https:// if missing
    return "https://" + url;
}
function displaypopulateContacts(userprofile) {
    const displaycontactSection = document.getElementById("displaycontactSection");
    let contactHtml = "";
    let phonedivhtml = "";
    let contentdivhtml = "";
    if (userprofile.phone && userprofile.phone.trim()) {
        phonedivhtml += `
        <a href="tel:${userprofile.phone}" class="contact-item contact-phone" onclick="trackContact('phone')">
            <div class="contact-icon"><i class="fas fa-phone"></i></div>
            <div class="contact-info">
                <div class="contact-label">Phone</div>
                <div class="contact-value">${userprofile.phone}</div>
            </div>
        </a>
    `;
    }

    if (userprofile.mobile && userprofile.mobile.trim()) {
        phonedivhtml += `
        <a href="tel:${userprofile.mobile}" class="contact-item contact-phone" onclick="trackContact('mobile')">
            <div class="contact-icon"><i class="fas fa-mobile-alt"></i></div>
            <div class="contact-info">
                <div class="contact-label">Mobile</div>
                <div class="contact-value">${userprofile.mobile}</div>
            </div>
        </a>
    `;
    }

    if (userprofile.email && userprofile.email.trim()) {
        contentdivhtml += `
        <a href="mailto:${userprofile.email}" class="contact-item" onclick="trackContact('email')">
            <div class="contact-icon"><i class="fas fa-envelope"></i></div>
            <div class="contact-info">
                <div class="contact-label">Email</div>
                <div class="contact-value">${userprofile.email}</div>
            </div>
        </a>
    `;
    }

    if (userprofile.website && userprofile.website.trim()) {
        const normalizedWebsite = normalizeUrl(userprofile.website);

        contentdivhtml += `
    <a href="${normalizedWebsite}" target="_blank" class="contact-item" onclick="trackContact('website')">
        <div class="contact-icon"><i class="fas fa-globe"></i></div>
        <div class="contact-info">
            <div class="contact-label">Website</div>
            <div class="contact-value">${userprofile.website}</div>
        </div>
    </a>
`;
    }

    // Display location only if country exists and has data
    // Display location only if country exists and has data
    if (
        userprofile.country &&
        userprofile.country.name &&
        userprofile.country.name.trim()
    ) {
        // Build location string
        let locationParts = [];

        if (
            userprofile.city &&
            userprofile.city.name &&
            userprofile.city.name.trim()
        ) {
            locationParts.push(userprofile.city.name);
        }

        if (
            userprofile.state &&
            userprofile.state.name &&
            userprofile.state.name.trim()
        ) {
            locationParts.push(userprofile.state.name);
        }

        locationParts.push(userprofile.country.name);

        const locationString = locationParts.join(", ");
        const encodedLocation = encodeURIComponent(locationString);

        // Detect device type
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
        const isAndroid = /android/i.test(userAgent);

        if (isIOS) {
            // For iOS - show both options
            contentdivhtml += `
        <div class="contact-item location-item" onclick="showMapOptions('${encodedLocation}', '${locationString.replace(
                /'/g,
                "\\'"
            )}')">
            <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="contact-info">
                <div class="contact-label">Location</div>
                <div class="contact-value">${locationString}</div>
            </div>
        </div>
    `;
        } else {
            // For Android and other devices - direct Google Maps link
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

            contentdivhtml += `
        <a href="${googleMapsUrl}" target="_blank" class="contact-item" onclick="trackContact('location')">
            <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="contact-info">
                <div class="contact-label">Location</div>
                <div class="contact-value">${locationString}</div>
            </div>
        </a>
    `;
        }
    }

    phonedivhtml = `<div class='contact-div'>${phonedivhtml}</div>`;
    contentdivhtml = `<div class='othercontact-div'>${contentdivhtml}</div>`;
    displaycontactSection.innerHTML = phonedivhtml + contentdivhtml;
}
async function loadCard(identifier) {
    const container = document.querySelector('.userprofile-dynamic-html');
    container.innerHTML = 'Loading...';

    try {
        // const response = await fetch(`/api/card-html/${cardId}`);
        let response = await api.getCardhtmlData(identifier)
        // console.log("getcardhtmldata",response);
        const data = await response;

        const standaloneUrl = `${window.location.origin}/card/${identifier}`;
        let button_save = `<div class="online-card-div-buttons"><button class="profile-card-buttons" id="downloadVCard-btn-dynamic">
                <i class="fa-regular fa-floppy-disk"></i>
            Save Contact
        </button> <button data-personal-card-url="${standaloneUrl}" class="profile-card-buttons copy-url-btn">
        <i class="fa-regular fa-copy"></i> Copy Digital Card URL
        </button></div>`;


        $("#save-contact-div").empty();
        // $("#save-contact-div").append(button_save);
        if (data.success) {
            container.innerHTML = data.html;
        } else {
            container.innerHTML = 'Error: ' + data.message;
        }
    } catch (error) {
        console.log("error:", error.message);
        container.innerHTML = 'Failed to load card';
    }
}

// Cache for custom cards data
let customCardsCache = {
    data: null,
    identifier: null,
    timestamp: 0,
    cacheDuration: 5000 // 5 seconds cache
};

function clearCustomCardsCache() {
    customCardsCache = {
        data: null,
        identifier: null,
        timestamp: 0,
        cacheDuration: 5000
    };
    // console.log('Custom cards cache cleared');
}
export async function loadCustomCards(identifier) {
    // Check cache first
    const now = Date.now();
    if (customCardsCache.identifier === identifier && 
        customCardsCache.data && 
        customCardsCache.data.success && // Ensure cached data is valid
        (now - customCardsCache.timestamp) < customCardsCache.cacheDuration) {
        // console.log('Using cached custom cards data');
        return customCardsCache.data;
    }

    try {
        let response = await api.getCustomCardData(identifier)
        const data = await response;
        console.log("getCustomCardData: ", data);
        if (data.success && data.qrCodes && data.qrCodes.length > 0) {
            // Convert buffer data to blob URLs for each QR code
            const processedQRCodes = data.qrCodes.map(qr => {
                // Convert QR code image data
                if (qr.data && qr.data.data && Array.isArray(qr.data.data)) {
                    const uint8Array = new Uint8Array(qr.data.data);
                    const blob = new Blob([uint8Array], {
                        type: qr.data.contentType || 'image/png'
                    });
                    const imageUrl = URL.createObjectURL(blob);
                    qr.imageUrl = imageUrl;
                }

                // Convert avatar file data if present
                if (qr.settings && qr.settings.avatarFile && qr.settings.avatarFile.data) {
                    const avatarArray = new Uint8Array(qr.settings.avatarFile.data);
                    const avatarBlob = new Blob([avatarArray], {
                        type: qr.settings.avatarFile.contentType || 'image/png'
                    });
                    const avatarUrl = URL.createObjectURL(avatarBlob);
                    qr.settings.avatarUrl = avatarUrl;
                }

                return qr;
            });

            const result = {
                data: { ...data, qrCodes: processedQRCodes },
                success: true
            };
            
            // Update cache with processed data
            customCardsCache = {
                data: result,
                identifier: identifier,
                timestamp: now,
                cacheDuration: 5000
            };
            
            return result;
        }
        else {
            // Don't cache failed responses
            // showErrorMessage("Failed to load the card.")
            MessageBox.info("Create your own custom QR code in Personalized QR section. Choose your own branding with colors and logo.", "Try New Feature !!")
            return {
                data: data,
                success: false
            }
        }
    } catch (error) {
        console.log("error:", error.message);
        showErrorMessage("Failed to load the card.")
        MessageBox.show("Failed to load the card."+ error.message)
        // Don't cache errors
        return {
            data: error.message,
            success: false
        }
    }
}

function toUnderscore(str) {
    return str.trim().replace(/\s+/g, '-');
}
function returnQRDivHTML(qrUrl, standaloneUrl, qrcodename, id, slug, description) {

    let defaultBtnid = "addToWallet-btn";
    let defaultCopyBtnid = "copyUrlIcon";
    let defaultTextareaid = "cardUrlTextarea";
    let formattedqrcodename = toUnderscore(qrcodename);
    if (qrcodename) {
        defaultBtnid = "addToWallet-btn-" + formattedqrcodename;
        defaultCopyBtnid = "copyUrlIcon-" + formattedqrcodename;
        defaultTextareaid = "cardUrlTextarea-" + formattedqrcodename;
    }

    /**
     * 
     */
    let urlCopySection = ` <div class="url-copy-section">
            <div class="url-input-wrapper">
                <textarea class="url-textarea" id="${defaultTextareaid}" readonly>${standaloneUrl}</textarea>
                <button class="copy-icon-btn" id="${defaultCopyBtnid}" data-user-slug=${slug} title="Copy URL">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
       `;
    let buttonid = 'downloadonlyQRCode-btn-' + formattedqrcodename;
    /*
       <button class="profile-card-buttons" id="${buttonid}" data-qrcodeid="${id}" data-user-slug=${slug}>
                   
                     <i class="fa-solid fa-download"></i>
                 </button>

                   <button id="measureBtn" class="measure-btn">
                <i class="fas fa-ruler-horizontal"></i>
            
            </button>
    */
    let editDeleteButtons = `<div class="qr-action-buttons" style="display: flex; gap: 10px;">

  
        <button class="profile-card-buttons control-btn edit-qr-btn" data-qrcodeid="${id}" data-user-slug=${slug} style="flex: 1;">
            <i class="fas fa-edit"></i>
          
        </button>
        <button class="profile-card-buttons  control-btn download-qr-btn download-custom-qr-code" id="" data-qrcodeid="${id}" data-user-slug=${slug} style="flex: 1;">
        <i class="fa-solid fa-download"></i>
          
        </button>
        <button class="profile-card-buttons  control-btn delete-qr-btn" data-qrcodeid="${id}" data-user-slug=${slug} style="flex: 1; ">
            <i class="fas fa-trash-alt"></i>
           
        </button>
        <div class="slider-wrapper">
          

            <!-- Overlay -->
            <div  class="overlay hidden"></div>

            <!-- Popup Modal -->
            <div  class="popup hidden">
                <h3 class="popup-title">Choose Image Size for download.</h3>
                <h5 class="popup-sub-title">( Default size is 300Px )</h5>
                <div class="slider-area">
                    <input type="input" class="sizeSlider qrsize-input" max="2400" step="100" value="50">
                    <span class="sliderValue">= px</span>
                </div>
                <div class="download-model-all-buttons">
                    <button  class="model-btn-style ok-btn">OK</button>
                    <button  class="model-btn-style download-btn-from-model" data-qrcodeid="${id}" data-user-slug=${slug}>
                    <i class="fa-solid fa-download"></i></i><span>Download</span>
                    </button>
                </div>
                
            </div>
        </div>

    </div>

    <div class="qrcode-info-div">
        <div>
            <div><span class="bold-label">Title:</span> ${qrcodename}</div>
        </div>
        <div>
            <div><span class="bold-label">Description:</span> ${description} </div>
        </div>
         <div>
            <div><span class="bold-label">QRCodeID:</span> ${id} </div>
        </div>
    </div>`;
    // This for the custom QRCodes.

    //  ${urlCopySection}

    let returnHTML = `<div class="profile-qrcode-div">
                <div class="profile-qrcode-image-div" data-qrcodeid="${id}">
                    <img src="${qrUrl}" alt="QR Code" data-qrcodeid="${id}" class="qr-preview" style="border-radius: 10px;">
                    
                </div>
                <div class="Download-qrcode-buttons">
                    
                    
                    
                    <!-- URL Copy Section -->
                   
                    ${editDeleteButtons}
                </div>`;

    if (!qrcodename) {
        // This for the Default QRCodes.
        returnHTML = `<div class="profile-qrcode-div">
                <div class="profile-qrcode-image-div">
                    <img src="${qrUrl}" alt="QR Code" class="qr-preview" style="border-radius: 10px;">
                    
                </div>
                <div class="Download-qrcode-buttons">
                    
                    
                    <button class="profile-card-buttons" id="downloadonlyQRCode-btn-dynamic" data-user-slug=${slug}>
                        <i class="fas fa-qrcode"></i>
                        Download This QR Code
                    </button>
                    <!-- URL Copy Section -->
                    ${urlCopySection}
                   
                </div>`;
    }


    return returnHTML;
}

let isUpdatingDisplay = false;
let lastUpdateTimestamp = 0;

export async function updateDisplayPage() {

    // Prevent multiple simultaneous updates
    if (isUpdatingDisplay) {
        // console.log('Display update already in progress, skipping...');
        return;
    }
    
    // Debounce: prevent updates within 500ms
    const now = Date.now();
    if (now - lastUpdateTimestamp < 500) {
        // console.log('Display updated recently, skipping...');
        return;
    }
    
    isUpdatingDisplay = true;
    lastUpdateTimestamp = now;


    const userProfile = getUserProfile();
    // console.log("userprofile: ", userProfile);
    if (!userProfile) return;

    try {

        // Initialize carousel
        cardCarousel.init();

        await loadCard(userProfile.slug);
        // renderCardPhoto(userProfile)
        // displaypopulateContacts(userProfile)
        // updateNavbarAvatar(userProfile)

        // Generate QR code
        if (userProfile.cardId) {

            const friendlyIdentifier = userProfile.slug || userProfile.cardId;
            const standaloneUrl = `${window.location.origin}/card/${friendlyIdentifier}`;
            const qrUrl = await api.getQRCode(friendlyIdentifier);
            const email = userProfile.email;
            const photoHtml = userProfile.hasProfilePhoto
                ? `<img src="/api/profile/photo/c/${userProfile.cardId}" alt="${userProfile.initials}">`
                : `<span>${userProfile.initials}</span>`;


            // document.getElementById("generatedQR").innerHTML = `
            //     <div class="qr-buttons-heading"><h2>QR For Promotion,Share,Advertise</h2></div>
                
            //     </div>`;


            let defaultQRcodeHTML = returnQRDivHTML(qrUrl, standaloneUrl, '', '', userProfile.slug);
            $("#defaultQR").empty()
            $("#defaultQR").append(defaultQRcodeHTML);
            let customCardObject = await loadCustomCards(friendlyIdentifier, email)
            const qrCodesData = customCardObject.data;
            // Load digital wallet card into carousel
            console.log("customCardObject: ", customCardObject)
            // if (customCardObject.success && customCardObject.data.qrCodes && customCardObject.data.qrCodes.length > 0) {
            if (qrCodesData.success && qrCodesData.qrCodes && qrCodesData.qrCodes.length > 0) {
                // let customQRCodesLength = customCardObject.data.qrCodes.length;
                // let allqrCodes = customCardObject.data.qrCodes;

                let customQRCodesLength = qrCodesData.qrCodes.length;
                let allqrCodes = qrCodesData.qrCodes;
                $("#generatedQR").empty();
                for (let i = 0; i < customQRCodesLength; i++) {

                    let customQRcodeHTML = returnQRDivHTML(
                        allqrCodes[i]["imageUrl"], 
                        allqrCodes[i]["url"], 
                        allqrCodes[i]["name"], 
                        allqrCodes[i]["id"], 
                        userProfile.slug, 
                        allqrCodes[i]["description"]);
                    // console.log(customQRcodeHTML);
                    $("#generatedQR").append(customQRcodeHTML);
                }

            }

            await loadDigitalWalletCard(userProfile.cardId);
            setupCopyUrlButton();
        }

        $("#navbarAvatar").show();
        $("#navbarAvatarDesktop").show();
        $(".card-actions").appendTo("#Download-qrcode-buttons");

        /**
       * For the click on the measure button.
       */
        // Open Popup
        $(document).on("click", ".download-qr-btn", function () {
            // console.log("on click");
            const wrapper = $(this).parent().find(".slider-wrapper");
            wrapper.find(".popup").removeClass("hidden");
            wrapper.find(".overlay").removeClass("hidden");
        });

        // Close Popup
        function closePopup(wrapper) {
            wrapper.find(".popup").addClass("hidden");
            wrapper.find(".overlay").addClass("hidden");
        }

        // OK button closes popup
        $(document).on("click", ".ok-btn", function () {
            const wrapper = $(this).closest(".slider-wrapper");
            closePopup(wrapper);
        });

        // Overlay click closes popup
        $(document).on("click", ".overlay", function () {
            const wrapper = $(this).closest(".slider-wrapper");
            closePopup(wrapper);
        });

        $(document).on("input", ".sizeSlider", function () {
        // Remove non-numeric characters
            var value = $(this).val().replace(/\D/g, '');
            
            // Convert to number
            var num = Number(value);
            
            // Clamp value between min and max
            if(num > 2400) num = 2400;
            if(num < 0 && value !== '') num = 0; // allow empty input while typing
            
            $(this).val(num || '');
            $(this).siblings(".sliderValue").text(num + "px");
        });
        // Slider input updates value
        // $(document).on("input", ".sizeSlider", function () {
        //     const value = $(this).val();
        //     $(this).siblings(".sliderValue").text(value + "px");
        // });

        let lastDownloadTime = 0; // global cooldown tracker
        $(document).on('click', '.download-btn-from-model', async function () {
            const now = Date.now();
            const timePassed = now - lastDownloadTime;

            if (timePassed < 5000) {
                const remaining = Math.ceil((5000 - timePassed) / 1000);
                MessageBox.error(`Please wait ${remaining} more seconds before downloading again.`);
                return;
            }

            // update cool-down timestamp
            lastDownloadTime = now;
            console.log("Dynamic element download clicked!");
            let qrcodeSize = $(this).parents('.popup').find('input.sizeSlider').val()

            let qrcodeID = $(this).attr("data-qrcodeid")
            const blob = await api.downloadCustomQRCode(qrcodeID, qrcodeSize)
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `qr_${qrcodeID}_${qrcodeSize}px.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            $('.ok-btn').trigger('click');
            MessageBox.success("QRCode Downloaded Successfully")
        });


        // updateStandalonePage();
    } catch (error) {
        console.error("Update display error:", error);
         // Clear cache on error to prevent stale data
         clearCustomCardsCache();  // ← CALLED HERE
        
         // Show user-friendly error message
         showErrorMessage("Failed to load display page. Please refresh and try again.");
    }finally {
        isUpdatingDisplay = false;
    }
}

function setupCopyUrlButton() {
    // Select ALL copy buttons whose ID starts with copyUrlIcon
    const copyButtons = document.querySelectorAll('[id^="copyUrlIcon"]');

    copyButtons.forEach(copyBtn => {
        // Avoid double binding
        copyBtn.replaceWith(copyBtn.cloneNode(true));
    });

    // Re-select fresh clones
    const newButtons = document.querySelectorAll('[id^="copyUrlIcon"]');

    newButtons.forEach(copyBtn => {
        copyBtn.addEventListener('click', async () => {
            try {
                // Find the textarea INSIDE the same wrapper div
                const wrapper = copyBtn.closest('.url-input-wrapper');
                const textarea = wrapper.querySelector('.url-textarea');

                if (!textarea) return;

                await navigator.clipboard.writeText(textarea.value);

                // Visual feedback
                const icon = copyBtn.querySelector('i');
                const originalClass = icon.className;

                icon.className = 'fas fa-check';
                copyBtn.style.background = '#28a745';
                copyBtn.style.color = 'white';

                showSuccessMessage('URL copied to clipboard!');

                setTimeout(() => {
                    icon.className = originalClass;
                    copyBtn.style.background = '';
                    copyBtn.style.color = '';
                }, 2000);

            } catch (err) {
                console.error("Copy failed:", err);
            }
        });
    });
}



export async function trackSocialClick(platform) {
    const userProfile = getUserProfile();
    if (userProfile && userProfile.cardId) {
        await api.trackSocialClick(userProfile.cardId, platform);
    }
}

export async function trackContactClick(action) {
    const userProfile = getUserProfile();
    if (userProfile && userProfile.cardId) {
        await api.trackContactClick(userProfile.cardId, action);
    }
}

export async function downloadVCard() {
    try {
        const userProfile = getUserProfile();
        if (userProfile && userProfile.cardId) {
            await api.downloadVCard(userProfile.cardId);
            showSuccessMessage("vCard download started!");
        }
    } catch (error) {
        console.error("vCard download error:", error);
        showErrorMessage("Failed to download vCard");
    }
}

/**
 * New way to download QR code
 */

/**
 * Load digital wallet card into carousel view
 */
async function loadDigitalWalletCard(cardId) {
    try {
        const response = await fetch(
            `${api.baseURL}/api/card/${cardId}/wallet-card-data`
        );
        const data = await response.json();

        if (data.success && data.data) {
            const cardHTML = createWalletCardHTML(data.data);
            $("#dc-digital-wallet-card-div")
            // document.getElementById('dc-digital-wallet-card').innerHTML = cardHTML;
            document.getElementById('dc-digital-wallet-card-div').innerHTML = cardHTML;
            $(".userprofile-dynamic-html").find(".card-navbar-parent").css("display", "none");

            //  ADD THESE 2 LINES:
            // DigitalCardCustomization.insertBrandingUI('#card-branding-container');
            // DigitalCardCustomization.applyToLoadedCard();

            const brandingInserted = DigitalCardCustomization.insertBrandingUI('#card-branding-container');
            
            if (brandingInserted) {
                // console.log('Branding UI loaded successfully');
                
                // Apply backend branding if available, otherwise use localStorage
                if (data.data.colorBranding) {
                    // Backend branding takes precedence
                    setTimeout(() => {
                        // console.log("1");
                        DigitalCardCustomization.applyGradientToCard(
                            data.data.colorBranding.gradientStart,
                            data.data.colorBranding.gradientEnd
                        );
                        // console.log('Applied backend branding:', data.data.colorBranding);
                    }, 100);
                } else {
                    // Fallback to localStorage
                    setTimeout(() => {
                        // console.log("2");
                        DigitalCardCustomization.applyToLoadedCard();
                        // console.log('Applied localStorage branding');
                    }, 100);
                }
                
                // Setup save handlers to sync with backend
                // setupBrandingSaveHandlers(cardId);

                // setTimeout(async () => {
                //     const gradient = DigitalCardCustomization.getCurrentGradient();
                //     await DigitalCardCustomization.savePreferences(gradient)
                //     // await saveBrandingToBackend(cardId, gradient);
                // }, 200);
            }

        } else {
            throw new Error('Failed to fetch card data');
        }
    } catch (error) {
        console.error('Failed to load digital wallet card:', error);
        document.getElementById('dc-digital-wallet-card').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6c757d;">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load digital wallet card</p>
            </div>
        `;
    }
}

/**
 * Fixed Wallet Card Downloader - No Empty Canvas Space
 * This version calculates proper dimensions automatically
 */


function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
// Function to create wallet card HTML
function createWalletCardHTML(data) {
    const fullQrUrl = `${api.baseURL}${data.qrUrl}`;
    const fullCardUrl = `${api.baseURL}${data.cardUrl}`;
    const profilePhotoUrl = data.cardId
        ? `${api.baseURL}/api/profile/photo/c/${data.cardId}`
        : null;
    let avatarHTML = "";
    if (data.hasProfilePhoto) {
        // Card has a profile photo - show image with fallback to initials on error
        const profilePhotoUrl = `${api.baseURL}/api/profile/photo/c/${data.cardId}`;
        avatarHTML = `<div class="wallet-card-avatar-overlap"><img src="${profilePhotoUrl}" 
                           alt="${escapeHtml(data.name)}" 
                           crossorigin="anonymous"
                           onerror="this.style.display='none'; this.parentElement.innerHTML='<span>${data.initials}</span>';"></div>`;
    } else {
        // No profile photo - show initials directly
        avatarHTML = ` <div class="wallet-card-avatar-download"><span>${data.initials}</span></div>`;
    }

    let cardNametoDisplay = escapeHtml(data.name);
    if (escapeHtml(data.organization)) {
        cardNametoDisplay = escapeHtml(data.organization);
    }

    return `<div class="digital-wallet-card" id="canvas-digital-wallet-card" data-card-id="${data.cardId}">
      
            
    <!-- Colored Header Section -->
    <div class="wallet-card-header-section">
        <div class="wallet-card-brand-name">${cardNametoDisplay}</div>
       
            ${avatarHTML}
       
        <!-- Overlapping Profile Photo -->
        
    </div>
    
    <!-- Content Section -->
    <div class="wallet-card-content">
        <div class="empty-div"><div class="wallet-qr-top-container">
            <img src="/card/${escapeHtml(data.slug)}/qr" alt="QR Code for ${escapeHtml(data.name)}">
        </div></div>
        <div class="actual-content">
        <div class="wallet-card-name">${escapeHtml(data.name)}</div>
        
        <div class="wallet-card-email"><a href="mailto:${escapeHtml(data.email)}" class="wallet-display-email" title="Email">${escapeHtml(data.email)}</a></div>
  
        </div>
    </div>
    
    <div class="digital-card-action-btn-style">
        <div class="logo">
            <img src="./image/connectiko-logo-transparent.png" alt="ConnectiKo Logo" class="card-logo-image-only">
        </div>
        <span>PoweredBy:${window.location.href} </span>
    </div>
 </div>`+ `<div class="dc-div-buttons">
 <button class="profile-card-buttons" id="downloadQRCode-btn-dynamic">
                            <i class="fa-regular fa-address-card"></i>
                            Download Digital Card
                        </button>
                        <button data-personal-card-url="${fullCardUrl}" class="profile-card-buttons copy-url-btn">
                            <i class="fa-regular fa-copy"></i> Copy Digital Card URL
                        </button>
 </div>`;

}



// Download only QR Code
export async function downloadStyledQRCard() {
    try {
        // console.log("Inside function");
        const userProfile = getUserProfile();
        const qrcodeurl = await api.getQRCode(userProfile.slug);
        const response = await fetch(qrcodeurl);
        // console.log("response", response);

        // Create a blob from the response
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-${userProfile.slug}.png`; // Set the filename
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // console.log("QR code downloaded successfully");
    } catch (error) {
        console.error("Styled QR card download error:", error);
        showErrorMessage("Failed to download styled QR card");
    }
}


/**
 * Screenshot Utility - Optimized Version
 * Reduces payload size by optimizing CSS extraction
 */

class ScreenshotCapture {
    constructor(apiUrl = '/api/wallet/screenshot') {
        this.apiUrl = apiUrl;
    }

    /**
     * Capture a specific element as an image
     * @param {string|HTMLElement} element - CSS selector or DOM element
     * @param {Object} options - Configuration options
     * @returns {Promise<string>} Base64 image data URL
     */
    async captureElement(element, options = {}) {
        try {
            const el = typeof element === 'string'
                ? document.querySelector(element)
                : element;

            if (!el) {
                throw new Error('Element not found');
            }

            // Get optimized CSS (much smaller payload)
            const css = this.extractOptimizedStyles(el);

            // Get the HTML content
            const html = el.outerHTML;

            // Get element dimensions
            const rect = el.getBoundingClientRect();

            const payload = {
                html: html,
                css: css,
                selector: options.selector || null,
                width: options.width || Math.ceil(rect.width) || 1920,
                height: options.height || Math.ceil(rect.height) || 1080,
                fullPage: options.fullPage !== undefined ? options.fullPage : false
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Screenshot failed');
            }

            return result.image;
        } catch (error) {
            console.error('Screenshot capture error:', error);
            throw error;
        }
    }

    /**
     * Capture current page from URL (no large CSS payload)
     * @param {Object} options - Configuration options
     * @returns {Promise<string>} Base64 image data URL
     */
    async captureFromUrl(options = {}) {
        try {
            const payload = {
                url: options.url || window.location.href,
                selector: options.selector || null,
                width: options.width || 1920,
                height: options.height || 1080,
                fullPage: options.fullPage !== undefined ? options.fullPage : true
            };

            const response = await fetch('/api/wallet/screenshot-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Screenshot failed');
            }

            return result.image;
        } catch (error) {
            console.error('Screenshot capture error:', error);
            throw error;
        }
    }

    /**
     * Download the captured image
     * @param {string} imageDataUrl - Base64 image data URL
     * @param {string} filename - Download filename
     */
    downloadImage(imageDataUrl, filename = 'screenshot.png') {
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Extract OPTIMIZED CSS styles (much smaller payload)
     * Only extracts essential styles, not entire stylesheets
     * @param {HTMLElement} element 
     * @returns {string} CSS string
     */
    extractOptimizedStyles(element) {
        const styles = [];

        // Get computed styles for the element and its children
        const elements = [element, ...element.querySelectorAll('*')];

        elements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const elementStyles = [];

            // Only extract essential visual properties
            const essentialProperties = [
                'background', 'background-color', 'background-image',
                'background-size', 'background-position', 'background-repeat',
                'color', 'font-family', 'font-size', 'font-weight', 'font-style',
                'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
                'border', 'border-radius', 'border-width', 'border-style', 'border-color',
                'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
                'display', 'position', 'top', 'right', 'bottom', 'left',
                'flex', 'flex-direction', 'justify-content', 'align-items',
                'grid', 'grid-template-columns', 'grid-template-rows', 'gap',
                'text-align', 'text-decoration', 'text-transform',
                'opacity', 'transform', 'box-shadow', 'text-shadow',
                'line-height', 'letter-spacing', 'white-space'
            ];

            essentialProperties.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'none' && value !== 'normal' && value !== '0px') {
                    elementStyles.push(`${prop}: ${value}`);
                }
            });

            if (elementStyles.length > 0) {
                // Create a unique selector
                const className = el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const selector = id || className;

                styles.push(`${selector} { ${elementStyles.join('; ')} }`);
            }
        });

        return styles.join('\n');
    }

    /**
     * Alternative: Extract inline styles only (smallest payload)
     * @param {HTMLElement} element 
     * @returns {string} CSS string
     */
    extractInlineStylesOnly(element) {
        const styles = [];

        // Get inline styles
        if (element.style.cssText) {
            styles.push(`${element.tagName.toLowerCase()} { ${element.style.cssText} }`);
        }

        // Get inline styles from children
        element.querySelectorAll('[style]').forEach(el => {
            if (el.style.cssText) {
                const className = el.className || el.tagName.toLowerCase();
                styles.push(`.${className} { ${el.style.cssText} }`);
            }
        });

        return styles.join('\n');
    }

    /**
     * Best approach: Capture by cloning and applying computed styles
     * This creates the most accurate screenshot with minimal payload
     */
    async captureElementOptimized(element, options = {}) {
        try {
            const el = typeof element === 'string'
                ? document.querySelector(element)
                : element;

            if (!el) {
                throw new Error('Element not found');
            }

            // Clone the element
            const clone = el.cloneNode(true);

            // Apply computed styles directly as inline styles
            this.applyComputedStyles(el, clone);

            // Get the HTML with inline styles (no separate CSS needed)
            const html = clone.outerHTML;
            const rect = el.getBoundingClientRect();

            const payload = {
                html: html,
                css: '', // Empty CSS since styles are inline
                selector: null,
                width: options.width || Math.ceil(rect.width) || 1920,
                height: options.height || Math.ceil(rect.height) || 1080,
                fullPage: false
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Screenshot failed');
            }

            return result.image;
        } catch (error) {
            console.error('Screenshot capture error:', error);
            throw error;
        }
    }

    /**
     * Apply computed styles as inline styles
     */
    applyComputedStyles(source, target) {
        const sourceStyle = window.getComputedStyle(source);
        let cssText = '';

        // Copy essential computed styles
        const properties = [
            'background', 'color', 'font-family', 'font-size', 'font-weight',
            'padding', 'margin', 'border', 'border-radius', 'width', 'height',
            'display', 'position', 'text-align', 'line-height'
        ];

        properties.forEach(prop => {
            cssText += `${prop}: ${sourceStyle.getPropertyValue(prop)};`;
        });

        target.style.cssText = cssText;

        // Recursively apply to children
        const sourceChildren = source.children;
        const targetChildren = target.children;

        for (let i = 0; i < sourceChildren.length; i++) {
            this.applyComputedStyles(sourceChildren[i], targetChildren[i]);
        }
    }

    /**
     * Capture and download in one step
     * @param {string|HTMLElement} element 
     * @param {string} filename 
     * @param {Object} options 
     */
    async captureAndDownload(element, filename = 'screenshot.png', options = {}) {
        try {
            // Use optimized method by default
            const imageDataUrl = options.optimized !== false
                ? await this.captureElementOptimized(element, options)
                : await this.captureElement(element, options);

            this.downloadImage(imageDataUrl, filename);
            return imageDataUrl;
        } catch (error) {
            console.error('Capture and download error:', error);
            throw error;
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenshotCapture;
}

/**
 * New way to download QR code digital business card
 */

export async function downloadQRCode() {
    // let digitalBusinesscardHTML = await createDigitalCardHTML();
    // $("#generatedQR").appendTo(digitalBusinesscardHTML);
    // console.log("In the new function");


    try {
        // Get your wallet card element
        const element = document.querySelector('#canvas-digital-wallet-card');

        if (!element) {
            // alert('Wallet card not found');
            MessageBox.show('Wallet card not found');
            return;
        }

        // Capture it!
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,  // High quality
            useCORS: true
        });

        // Download it!
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'wallet-card.png';
        link.click();

        // alert('Screenshot downloaded!');
        MessageBox.show('screenshot downloaded!');

    } catch (error) {
        // alert('Error: ' + error.message);
        MessageBox.show('Error: ' + error.message);
    }



    // Capture any div
    // await screenshotCapture.captureAndDownload('.dc-digital-wallet-card', 'screenshot.png');
}


// ============================================================================
// BACKEND SAVE HANDLERS
// ============================================================================

/**
 * Setup event handlers to save branding to backend when user changes colors
 */
// function setupBrandingSaveHandlers(cardId) {
    
//     $(document).off('click', '#save-branding-btn');
    
//     $(document).on('click', '#save-branding-btn', function() {
//         // Delay to ensure gradient is set in module
//         // console.log("On click save branding button");
//         // console.log("DigitalCardCustomization: ", DigitalCardCustomization.exportColorPreference())
//         setTimeout(async () => {
//             const gradient = DigitalCardCustomization.getCurrentGradient();
//             await DigitalCardCustomization.savePreferences(gradient)
//             // await saveBrandingToBackend(cardId, gradient);
//         }, 200);
//     });
    
//     // console.log('Branding save handlers registered for cardId:', cardId);
// }


// Old Code


