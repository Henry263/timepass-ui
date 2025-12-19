// app.js
// Main Application Entry Point

// Core imports
import { setupGlobalErrorHandlers } from './utils/error-handler.js';
import { api } from './core/api-client.js';

import './vertical-navigation.js';
import {
    setCurrentUser,
    setUserProfile,
    getCurrentUser,
    loginWithGoogle,
    signupWithGoogle,
    logout,
    updateAuthUI,
    updateAuthUImobilebuttons
} from './core/auth.js';
import {updateFixedWidth} from './ui/card-carousel.js'
// Module imports
import { handleProfileSave, loadProfileData, handleQRUpload } from './modules/profile.js';
import {
    updateDisplayPage,
    downloadVCard,
    downloadQRCode,
    downloadStyledQRCard
} from './modules/display.js';
import { addToWallet } from './modules/wallet.js';
import { validateForm, initializeFormValidation } from './modules/form-validation.js';
import { initializeAvatarHandlers } from './modules/avatar.js';

// UI imports
import { showPage, handleURLParams, setActiveNavItem, updateURL } from './ui/navigation.js';
import { showSuccessMessage, showErrorMessage, scrollToFirstError } from './ui/notifications.js';
import { initializeModals } from './ui/modals.js';

// Form imports
import { initializeSuggestionsForm } from './forms/suggestions.js';
import { initializeContactForm } from './forms/contact.js';

// Utils
import { setUserEmail, copyStandaloneUrl } from './utils/helpers.js';
// import  { initQRDesigner }  from './ui/qr-designer.js'
import QRManager from './ui/qr-manager.js';
// Replace old QRDesigner with new version
import QRDesignerV2 from './ui/qr-designer-v2.js';

import DigitalCardCustomization from './ui/card-branding.js'
import phoneCarousel from './ui/phone-carousel.js';
import './init-avatar.js';
import './countries-autocomplete.js';
import './wallet.js';
import SocialCategoryManager from './modules/social-category-manager.js';

const AppModules = {
    socialCategoryManager: null
};
// Initialize when needed


function initializeSocialCategoryManager() {
    console.log('🔗 Initializing Social Category Manager...');
    
    try {
        AppModules.socialCategoryManager = new SocialCategoryManager();
        
        if (AppModules.socialCategoryManager.isAvailable()) {
            AppModules.socialCategoryManager.init();
            
            // Setup state persistence
            AppModules.socialCategoryManager
                .onCategoryExpanded(() => {
                    AppModules.socialCategoryManager.saveState();
                })
                .onCategoryCollapsed(() => {
                    AppModules.socialCategoryManager.saveState();
                });
            
            // Load saved state
            AppModules.socialCategoryManager.loadState();
            
            console.log('✅ Social Category Manager initialized successfully');
        } else {
            console.log('ℹ️ Social links not found, skipping initialization');
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize Social Category Manager:', error);
        AppModules.socialCategoryManager = null;
    }
}


async function initializeUIModules() {
    console.log('🎨 Initializing UI modules...');
    
    try {
       
        // Initialize Social Category Manager
        initializeSocialCategoryManager();
        
        console.log('✅ UI modules initialized');
    } catch (error) {
        console.error('❌ Failed to initialize UI modules:', error);
    }
}
/**
 * Initialize Phone Carousel for Home Page
 */
function initializePhoneCarousel() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get('page');
    
    // Only initialize on home page or when no page is specified
    if (!currentPage || currentPage === 'home') {
        // Initialize with default config
        phoneCarousel.init();
        
        // Optional: Custom configuration
        // phoneCarousel.updateConfig({
        //     interval: 3000, // 3 seconds
        //     images: [
        //         './image/card-1.png',
        //         './image/card-2.png',
        //         './image/card-3.png',
        //         './image/card-4.png'
        //     ]
        // });
    }
}
initializePhoneCarousel();
setupGlobalErrorHandlers();
// Initialize event handlers
function initializeEventHandlers() {
    // Guard against multiple initializations
    if (window._eventHandlersInitialized) {
        // console.log('Event handlers already initialized, skipping...');
        return;
    }
    window._eventHandlersInitialized = true;
    // Navigation buttons
    $("#signupWithGoogle-btn").on("click", signupWithGoogle);
    $("#singup-cta-button").on("click", () => showPage("signup"));
    $("#singup-cta-button-uc").on("click", () => showPage("signup"));
    $("#signupBtn").on("click", () => showPage("signup"));
    $("#faqBtn").on("click", () => showPage("faq"));
    $("#usecaseBtn").on("click", () => showPage("usecase"));
    $("#homepage-signup").on("click", () => showPage("signup"));
    $(".signupbutton").on("click", () => showPage("signup"));
    $(".homebutton").off("click").on("click", () => showPage("home"));
    $(".profilebutton").off("click").on("click", () => showPage("home"));
    $("#loginBtn").on("click", () => showPage("login"));
    $("#displayBtn").off("click").on("click", () => showPage("display"));
    $("#profileBtn").off("click").on("click", () => showPage("profile"));
    $("#logoutBtn").on("click", logout);
    $("#googlesignin-button").on("click", loginWithGoogle);

    // Card actions
    $("#qr-upload-div").on("click", () => document.getElementById("qrUpload").click());
    $("#downloadVCard-btn").on("click", downloadVCard);
    $("#shareCard-btn").on("click", copyStandaloneUrl);
    $("#addToWallet-btn").on("click", addToWallet);

    // Button which are available on my card page.
    $("#downloadQRCode-btn").on("click", downloadQRCode);

    // Dynamic buttons (delegated)
    // $(document).on("click", "#downloadQRCode-btn-dynamic", downloadStyledQRCard);
    $(document).on("click", "#downloadQRCode-btn-dynamic", downloadQRCode);
    $(document).on("click", "#downloadonlyQRCode-btn-dynamic", downloadStyledQRCard);

    $(document).on("click", "#downloadVCard-btn-dynamic", downloadVCard);
    $(document).on("click", ".copy-url-btn", copyStandaloneUrl);

    // Profile form
    $(".save-btn").on("click", function (e) {
        e.preventDefault();

        if (validateForm()) {
            handleProfileSave();
        } else {
            scrollToFirstError();
            showErrorMessage("Please fix the errors before saving");
        }
    });

    // Mobile menu toggle
    $("#hamburgerMenu").on("click", function () {
        $(this).toggleClass("active");
        $("#mobileMenu").toggleClass("active");
        $("body").toggleClass("menu-open");
    });

    // Close mobile menu when clicking outside
    $(document).on("click", function (event) {
        if (!$(event.target).closest(".mobile-menu, .hamburger-menu").length) {
            $("#hamburgerMenu").removeClass("active");
            $("#mobileMenu").removeClass("active");
            $("body").removeClass("menu-open");
        }
    });

    // Mobile menu buttons - ALL buttons
    $(".mobile-menu-btn.homebutton").on("click", function () {
        $(".homebutton").first().click();
        closeMobileMenu();
    });

    $("#loginBtnMobile").on("click", () => {
        $("#loginBtn").click();
        closeMobileMenu();
    });

    $("#signupBtnMobile").on("click", () => {
        $("#signupBtn").click();
        closeMobileMenu();
    });

    $("#profileBtnMobile").on("click", () => {
        $("#profileBtn").click();
        closeMobileMenu();
    });

    $("#displayBtnMobile").on("click", () => {
        $("#displayBtn").click();
        closeMobileMenu();
    });

    $("#walletBtnMobile").on("click", () => {
        $("#walletBtn").click();
        closeMobileMenu();
    });

    $("#usecaseBtnMobile").on("click", () => {
        $("#usecaseBtn").click();
        closeMobileMenu();
    });

    $("#faqBtnMobile").on("click", () => {
        $("#faqBtn").click();
        closeMobileMenu();
    });

    $("#logoutBtnMobile").on("click", () => {
        $("#logoutBtn").click();
        closeMobileMenu();
    });

    // Helper function
    function closeMobileMenu() {
        $("#hamburgerMenu").removeClass("active");
        $("#mobileMenu").removeClass("active");
        $("body").removeClass("menu-open");
    }
}

// Initialize application
async function initializeApplication() {
    console.log("🚀 Application starting...");

    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get('page');
    const publicPages = ['home', 'faq', 'usecase', 'scenario', 'resetPassword', 'forgotPassword', 'verifyEmail'];
     await initializeUIModules();
    // If on a public page, handle URL params and skip auth check
    if (publicPages.includes(currentPage)) {
        console.log(`✓ Public page detected: ${currentPage}, skipping auth check`);
        await handleURLParams();
        updateAuthUI();
        updateAuthUImobilebuttons();
        return;
    }

    // Initialize wallet button if exists
    if (typeof initializeWalletButton === "function") {
        initializeWalletButton();
    }

    try {
        const response = await api.getUserWithProfile();
        let currentUser = null;
        if (response.success && response.authenticated) {
            // console.log('✅ User authenticated', response);
            let showProfile = false;
            let showMyCard = false;
            // Set user data
            currentUser = response.user;
            // Store account type info
            // currentUser.accountType = result.user.accountType;
            // currentUser.isCorporate = result.user.isCorporate;
            // currentUser.canAccessTeamManagement = result.user.canAccessTeamManagement;
            // currentUser.companyName = result.user.companyName;
            // currentUser.teams = result.user.teams || [];
            // currentUser.ownedTeams = result.user.ownedTeams || [];
            // console.log("Setting user porofile: ", response.profile);
            setCurrentUser(currentUser);
            setUserProfile(response.profile);
            // Show appropriate page
            const urlParams = new URLSearchParams(window.location.search);
            const requestedPage = urlParams.get('page');

            if (requestedPage) {
                showPage(requestedPage);
                setActiveNavItem(requestedPage)
            } else if (response.profile) {

                // userProfile = response.profile;
                setUserProfile(response.profile);
                // console.log('✅ Profile loaded');
                setUserEmail(response.profile.email);
                $("#navbarAvatar").show();
                $("#navbarAvatarDesktop").show();
                //  showPage("display");

                $("#footer-cta").addClass("display-none-cta-button");
                $("#singup-cta-button-div-uc").addClass("display-none-cta-button");

                // Handle pending wallet card if available
                if (typeof handlePendingWalletCard === 'function') {
                    await handlePendingWalletCard();
                }
                showPage('display')
                setActiveNavItem("display")
                updateURL('display')
                
            } else {
                showPage('profile'); // No profile, show profile creation
                setActiveNavItem('profile')
                updateURL('profile')
            }

            let urlParamsreturn = await handleURLParams();
            //    console.log("updateFixedWidth", urlParamsreturn);
               
            // Update UI
            updateAuthUI();
            updateAuthUImobilebuttons();

            updateFixedWidth();

            // Handle OAuth callback success
            if (urlParams.get('auth') === 'success') {
                showSuccessMessage('Successfully logged in!');
                window.history.replaceState({}, document.title, window.location.pathname);
            }

        } else {
            // Not authenticated
            // console.log('ℹ️ User not authenticated');
            currentUser = null;
            userProfile = null;
            updateAuthUI();
            showPage('home');
        }


    } catch (error) {
        console.error("Auth check error:", error);
        setCurrentUser(null);
        handleURLParams();
        $("#footer-cta").removeClass("display-none-cta-button");
        $("#singup-cta-button-div-uc").removeClass("display-none-cta-button");
    }

    updateAuthUI();
    updateAuthUImobilebuttons();

    // Handle OAuth callback
    // const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("auth") === "success") {
        // console.log("Successful loggedin");
        showSuccessMessage("Successfully logged in!");
        setTimeout(async () => {
            if (typeof handlePendingWalletCard === 'function') {
                await handlePendingWalletCard();
            }

            const profileResponse = await api.getProfile();
            if (profileResponse.success && profileResponse.profile) {
                showPage("display");
            } else {
                showPage("profile");
            }
        }, 1000);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get("error")) {
        showErrorMessage("Login failed. Please try again.");
        handleURLParams();
        $("#footer-cta").removeClass("display-none-cta-button");
        $("#singup-cta-button-div-uc").removeClass("display-none-cta-button");
    }


    console.log("✅ Application initialized");
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", async function () {

    $("#navbarAvatar").hide();
    $("#navbarAvatarDesktop").hide();
    // Initialize all modules
    initializeEventHandlers();
    initializeModals();
    initializeSuggestionsForm();
    initializeContactForm();
    initializeAvatarHandlers();
    initializeFormValidation();

    // Initialize main application
    await initializeApplication();

    // Setup screen size check
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);

    // Setup URL change handlers
    $(window).on("popstate", handleURLParams);
    $(window).on("hashchange", handleURLParams);
    initiateQRmanager();
});

/**
 * Code for the signup page with the account type - jQuery Version
 */

// Account type selection
let selectedAccountType = '';

$(document).ready(function () {

    // Handle account type selection
    $('.select-account-type').on('click', function () {
        selectedAccountType = $(this).data('type');

        // Update UI
        $('.account-type-card').removeClass('selected');
        $(this).closest('.account-type-card').addClass('selected');

        // Set or create hidden field
        if ($('#accountType').length === 0) {
            $('#signupForm').append('<input type="hidden" id="accountType" name="accountType">');
        }
        $('#accountType').val(selectedAccountType);

        // Show/hide corporate fields
        const $corporateFields = $('#corporateFields');
        if (selectedAccountType === 'corporate') {
            $corporateFields.show();
            $('#companyName').prop('required', true);
        } else {
            $corporateFields.hide();
            $('#companyName').prop('required', false);
        }

        // Hide account type selection, show form
        $('.account-type-selection').hide();
        $('#signupForm').show();
    });

    // Back to account type selection
    $('#backToAccountType').on('click', function () {
        $('.account-type-selection').show();
        $('#signupForm').hide();
        selectedAccountType = '';
        $('#accountType').val('');
        $('.account-type-card').removeClass('selected');
    });

    // Handle signup form submission
    $('#signupForm').on('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            accountType: formData.get('accountType')
        };

        // Add corporate-specific fields if corporate account
        if (data.accountType === 'corporate') {
            data.companyName = formData.get('companyName');
            data.companyDomain = formData.get('companyDomain');
            data.companySize = formData.get('companySize');
            data.industry = formData.get('industry');
        }

        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showSuccessMessage('Account created! Please verify your email.');
                // Redirect to verification page
                setTimeout(() => {
                    showPage('emailVerification');
                }, 1500);
            } else {
                showErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Signup error:', error);
            showErrorMessage('An error occurred. Please try again.');
        }
    });

    // Handle Google signup with account type
    $('#googleSignupBtn, #signupWithGoogle-btn').on('click', async function (e) {
        e.preventDefault();

        // If no account type selected, show selection first
        if (!selectedAccountType) {
            showErrorMessage('Please select an account type first');
            return;
        }

        // Store account type and company data in session before OAuth
        const companyData = {};
        if (selectedAccountType === 'corporate') {
            companyData.companyName = $('[name="companyName"]').val() || '';
            companyData.companyDomain = $('[name="companyDomain"]').val() || '';
            companyData.companySize = $('[name="companySize"]').val() || '';
            companyData.industry = $('[name="industry"]').val() || '';
        }

        try {
            // Send account type to server before OAuth redirect
            await fetch('/auth/google/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountType: selectedAccountType,
                    ...companyData
                })
            });

            // Redirect to Google OAuth
            window.location.href = '/auth/google';
        } catch (error) {
            console.error('Google signup init error:', error);
            showErrorMessage('Error initiating Google signup');
        }
    });

    // Handle create account button click (if separate from form submit)
    //   $('#createActButton').on('click', function() {
    //     $('#signupForm').trigger('submit');
    //   });

});

// Screen width check function
function checkScreenWidth() {
    const $navbar = $(".navbar");
    const $container = $(".container");
    // Detect if it's a mobile device
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Use stable screen width on mobile, innerWidth otherwise
    const screenWidth = isMobile ? window.screen.width : window.innerWidth;


    if (screenWidth < 330) {
        $navbar.hide();
        $container.hide();
        showResolutionMessage();
    } else {
        $navbar.show();
        $container.show();
        hideResolutionMessage();
    }
}

function showResolutionMessage() {
    if ($('#resolution-message').length) return;

    const messageHTML = `
    <div id="resolution-message" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    ">
      <div style="background: white; padding: 2rem; border-radius: 20px; text-align: center; max-width: 90%;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
        <h2 style="color: #333; margin-bottom: 1rem;">Screen Too Small</h2>
        <p style="color: #666; line-height: 1.5;">
          This application requires a minimum screen width of 400px.
        </p>
        <p style="color: #999; font-size: 0.9rem;">
          Current width: ${$(window).width()}px | Required: 400px minimum
        </p>
      </div>
    </div>
  `;

    $('body').append(messageHTML);
}

function hideResolutionMessage() {
    $('#resolution-message').remove();
}

// Close dropdown when clicking outside
$(document).on('click', function (event) {
    const $userMenu = $('.user-menu');
    const $dropdown = $('#userDropdown');

    if ($dropdown.length && $userMenu.length && !$userMenu.is(event.target) && $userMenu.has(event.target).length === 0) {
        $dropdown.hide();
    }
});

// Window resize handler
$(window).on('resize', checkScreenWidth);

async function publicPagedisplay(){
    await handleURLParams();
    updateAuthUI();
    updateAuthUImobilebuttons();
}
function initiateQRmanager(){
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get('page');
    const publicPages = ['home', 'faq', 'usecase', 'scenario', 'resetPassword', 'forgotPassword', 'verifyEmail'];
    console.log("document readu function");
    // If on a public page, handle URL params and skip auth check
    if (publicPages.includes(currentPage)) {
        console.log(`✓ Public page detected: ${currentPage}, skipping auth check`);
        // handleURLParams();
        // updateAuthUI();
        // updateAuthUImobilebuttons();
        publicPagedisplay()
        return;
    } else {
        console.log("QR code initialie");
        QRDesignerV2.init();
        QRManager.init();
        DigitalCardCustomization.init();
    }

    checkScreenWidth();
}
// Initial check
$(document).ready(function () {

    // const urlParams = new URLSearchParams(window.location.search);
    // const currentPage = urlParams.get('page');
    // const publicPages = ['home', 'faq', 'usecase', 'scenario', 'resetPassword', 'forgotPassword', 'verifyEmail'];
    // console.log("document readu function");
    // // If on a public page, handle URL params and skip auth check
    // if (publicPages.includes(currentPage)) {
    //     console.log(`✓ Public page detected: ${currentPage}, skipping auth check`);
    //     // handleURLParams();
    //     // updateAuthUI();
    //     // updateAuthUImobilebuttons();
    //     publicPagedisplay()
    //     return;
    // } else {
    //     console.log("QR code initialie");
    //     QRDesignerV2.init();
    //     QRManager.init();
    //     DigitalCardCustomization.init();
    // }

    // checkScreenWidth();
    // console.log('55');
    // initiateQRmanager();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log('3');
    document.addEventListener('DOMContentLoaded',QRDesignerV2.init());
} else {
    console.log('44');
    // QRDesignerV2.init();
    // initiateQRmanager();

}

// Make key functions globally accessible
window.showPage = showPage;
window.trackSocialClick = (platform) => import('./modules/display.js').then(m => m.trackSocialClick(platform));
