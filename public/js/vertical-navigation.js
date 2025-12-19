

// js/vertical-navigation.js
// Vertical Sidebar Navigation - Integrated with existing app structure

import { showPage } from './ui/navigation.js';
import { api } from './core/api-client.js';
import { getCurrentUser, logout } from './core/auth.js';
import { showSuccessMessage, showErrorMessage } from './ui/notifications.js';
import QRManager from './ui/qr-manager.js';
// Replace old QRDesigner with new version
import QRDesignerV2 from './ui/qr-designer-v2.js';

import DigitalCardCustomization from './ui/card-branding.js'

/**
 * Initialize Vertical Navigation System
 */
export function initVerticalNavigation() {
    // console.log('Initializing vertical navigation...');
    
    setupSidebarNavigation();
    setupMobileMenu();
    checkAuthenticationStatus();
    
    // ✅ NEW: Initialize navigation visibility
    updateNavigation();

    // Handle page routing on load (if URL has page parameter)
    handleInitialRoute();
}

/**
 * Setup Sidebar Navigation Click Handlers
 */
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get the page from data attribute
            const page = this.getAttribute('data-page');
            
            if (page) {
                // Check if already on this page
                if (this.classList.contains('active')) {
                    // console.log(`Already on page: ${page}, skipping navigation`);
                    return;
                }
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Use existing showPage function from navigation.js
                showPage(page);
                
                // Update URL
                updateURL(page);
                
                // Close mobile menu if open
                closeMobileMenu();
                
                // Scroll to top
                window.scrollTo(0, 0);
            }
        });
    });
}

/**
 * Setup Mobile Menu Toggle
 */
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
            
            // Update icon
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('mobile-open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });
    }
}

/**
 * Close Mobile Menu
 */
function closeMobileMenu() {
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.getElementById('mobileMenuToggle');
        
        if (sidebar && menuToggle) {
            sidebar.classList.remove('mobile-open');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }
}

/**
 * Check Authentication Status and Update UI
 */
async function checkAuthenticationStatus() {
    try {

        // Don't check auth for public pages
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = urlParams.get('page');
        const publicPages = ['home', 'faq', 'usecase', 'scenario', 'resetPassword', 'forgotPassword', 'verifyEmail'];
        
        if (publicPages.includes(currentPage)) {
            updateUIForGuestUser();
            return;
        }
        
        const user = getCurrentUser();
        
        if (user) {
            // User is authenticated
            updateUIForAuthenticatedUser(user);
        } else {
            // Check with API
            const response = await api.checkAuthStatus();
            
            if (response) {
                const userProfile = await api.getCurrentUser();
                if (userProfile.success && userProfile.user) {
                    updateUIForAuthenticatedUser(userProfile.user);
                } else {
                    updateUIForGuestUser();
                }
            } else {
                updateUIForGuestUser();
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
        updateUIForGuestUser();
    }
}

/**
 * Update UI for Authenticated User
 */
// function updateUIForAuthenticatedUser(user) {
//     // Show/hide appropriate navigation items
//     const homeBtn = document.querySelector('.homebutton'); // Home button
//     const loginBtn = document.getElementById('loginBtnSidebar');
//     const signupBtn = document.getElementById('signupBtnSidebar');
//     const profileBtn = document.getElementById('profileBtnSidebar');
//     const displayBtn = document.getElementById('displayBtnSidebar');
//     const walletBtn = document.getElementById('walletBtnSidebar');
//     const logoutBtn = document.getElementById('logoutBtnSidebar');
//     const userProfileSection = document.getElementById('userProfileSection');
    
//     // Hide home button for logged-in users
//     if (homeBtn) homeBtn.classList.add('hidden');
    
//     if (loginBtn) loginBtn.classList.add('hidden');
//     if (signupBtn) signupBtn.classList.add('hidden');
//     if (profileBtn) profileBtn.classList.remove('hidden');
//     if (displayBtn) displayBtn.classList.remove('hidden');
//     if (walletBtn) walletBtn.classList.remove('hidden');
//     if (logoutBtn) logoutBtn.style.display = 'flex';
    
//     // Update user profile section
//     if (userProfileSection) {
//         userProfileSection.style.display = 'flex';
        
//         const userName = document.getElementById('sidebarUserName');
//         const userEmail = document.getElementById('sidebarUserEmail');
//         const userInitials = document.getElementById('sidebarUserInitials');
        
//         if (userName) userName.textContent = user.name || user.email || 'User';
//         if (userEmail) userEmail.textContent = user.email || '';
        
//         if (userInitials && (user.name || user.email)) {
//             const name = user.name || user.email;
//             const initials = name
//                 .split(' ')
//                 .map(word => word[0])
//                 .join('')
//                 .toUpperCase()
//                 .substring(0, 2);
//             userInitials.textContent = initials;
//         }
//     }
// }


function updateUIForAuthenticatedUser(user) {
    // Show/hide appropriate navigation items
    const homeBtn = document.querySelector('.homebutton'); // Home button
    const loginBtn = document.getElementById('loginBtnSidebar');
    const signupBtn = document.getElementById('signupBtnSidebar');
    const profileBtn = document.getElementById('profileBtnSidebar');
    const displayBtn = document.getElementById('displayBtnSidebar');
    const walletBtn = document.getElementById('walletBtnSidebar');
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    const userProfileSection = document.getElementById('userProfileSection');
    const qrAnalyticsNav = document.querySelector('.nav-item[data-page="qranalytics"]');
    const formAnalyticsBtn = document.getElementById('formAnalyticsBtnSidebar');
    const connectikoApiBtn = document.getElementById('connectikoApiBtnSidebar');
    // Hide home button for logged-in users
    if (homeBtn) homeBtn.classList.add('hidden');
    
    if (loginBtn) loginBtn.classList.add('hidden');
    if (signupBtn) signupBtn.classList.add('hidden');
    if (profileBtn) profileBtn.classList.remove('hidden');
    if (displayBtn) displayBtn.classList.remove('hidden');
    if (walletBtn) walletBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (qrAnalyticsNav) qrAnalyticsNav.style.display = 'flex';
    if (formAnalyticsBtn) formAnalyticsBtn.style.display = 'flex';

    
    if (connectikoApiBtn) {
        if (user.subscription && user.subscription.status === 'active') {
            connectikoApiBtn.classList.remove('hidden');
        } else {
            connectikoApiBtn.classList.remove('hidden'); // Show for access denied screen
        }
    }

    // Update user profile section
    if (userProfileSection) {
        userProfileSection.style.display = 'flex';
        
        const userName = document.getElementById('sidebarUserName');
        const userEmail = document.getElementById('sidebarUserEmail');
        const userInitials = document.getElementById('sidebarUserInitials');
        
        if (userName) userName.textContent = user.name || user.email || 'User';
        if (userEmail) userEmail.textContent = user.email || '';
        
        if (userInitials && (user.name || user.email)) {
            const name = user.name || user.email;
            const initials = name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userInitials.textContent = initials;
        }
    }

    // ✅ FIX: Initialize QR managers when UI is updated for authenticated users
    // This handles cases where auth state is verified (page refresh, direct navigation)
    // and the user is already logged in, but QR modules haven't been initialized yet
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get('page');
    const publicPages = ['home', 'faq', 'usecase', 'scenario', 'resetPassword', 'forgotPassword', 'verifyEmail'];
    
    // Only initialize QR managers if we're NOT on a public page
    if (!publicPages.includes(currentPage)) {
        console.log('🔧 Initializing QR managers from vertical navigation...');
        if (typeof window.initiateQRmanager === 'function') {
            window.initiateQRmanager();
        } else {
            // Fallback: Direct initialization
            console.warn('⚠️ initiateQRmanager not found in vertical nav, attempting direct initialization');
            try {
                if (typeof QRDesignerV2 !== 'undefined' && QRDesignerV2.init) {
                    QRDesignerV2.init();
                    console.log('✅ QRDesignerV2 initialized from vertical nav');
                }
                if (typeof QRManager !== 'undefined' && QRManager.init) {
                    QRManager.init();
                    console.log('✅ QRManager initialized from vertical nav');
                }
                if (typeof DigitalCardCustomization !== 'undefined' && DigitalCardCustomization.init) {
                    DigitalCardCustomization.init();
                    console.log('✅ DigitalCardCustomization initialized from vertical nav');
                }
            } catch (initError) {
                console.error('❌ Error during QR module initialization from vertical nav:', initError);
            }
        }
    }
    updateNavigation();
}

/**
 * Update UI for Guest User
 */
function updateUIForGuestUser() {
    const homeBtn = document.querySelector('.homebutton'); // Home button
    const loginBtn = document.getElementById('loginBtnSidebar');
    const signupBtn = document.getElementById('signupBtnSidebar');
    const profileBtn = document.getElementById('profileBtnSidebar');
    const displayBtn = document.getElementById('displayBtnSidebar');
    const walletBtn = document.getElementById('walletBtnSidebar');
    const logoutBtn = document.getElementById('logoutBtnSidebar');
    const teamBtn = document.getElementById('teamBtnSidebar');
    const userProfileSection = document.getElementById('userProfileSection');
    const qrAnalyticsNav = document.querySelector('.nav-item[data-page="qranalytics"]');
    const formAnalyticsBtn = document.getElementById('formAnalyticsBtnSidebar');
    const connectikoApiBtn = document.getElementById('connectikoApiBtnSidebar'); 

    // Show home button for guest users
    if (homeBtn) homeBtn.classList.remove('hidden');
    
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (signupBtn) signupBtn.classList.remove('hidden');
    if (profileBtn) profileBtn.classList.add('hidden');
    if (displayBtn) displayBtn.classList.add('hidden');
    if (walletBtn) walletBtn.classList.add('hidden');
    if (teamBtn) teamBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userProfileSection) userProfileSection.style.display = 'none';
    if (qrAnalyticsNav) qrAnalyticsNav.style.display = 'none';
    if (formAnalyticsBtn) formAnalyticsBtn.style.display = 'none';
    if (connectikoApiBtn) connectikoApiBtn.classList.add('hidden');


    updateNavigation();
}


// ============================================
// ✅ UPDATED: ADD THIS FUNCTION
// ============================================
function updateNavigation() {
    const user = getCurrentUser();
    // Note: Check both possible cases for data-page attribute
    const qrAnalyticsNav = document.querySelector('.nav-item[data-page="qrAnalytics"]') || 
                          document.querySelector('.nav-item[data-page="qranalytics"]');
    
    if (qrAnalyticsNav) {
        if (user) {
            qrAnalyticsNav.style.display = 'flex';
            console.log('✅ QR Analytics navigation shown for authenticated user');
        } else {
            qrAnalyticsNav.style.display = 'none';
            console.log('👥 QR Analytics navigation hidden for guest user');
        }
    } else {
        console.warn('⚠️ QR Analytics navigation item not found in DOM');
        // Try to find with alternative selector
        const altSelector = document.getElementById('qrAnalyticsBtnSidebar');
        if (altSelector) {
            if (user) {
                altSelector.classList.remove('hidden');
                altSelector.style.display = 'flex';
            } else {
                altSelector.classList.add('hidden');
                altSelector.style.display = 'none';
            }
            console.log('✅ Found QR Analytics nav with alternative ID selector');
        }
    }
}
/**
 * Handle LogoutinitializeApplication
 */
async function handleLogout() {
    try {
        // Use existing logout function from auth.js
        await logout();
        
        // Update UI
        updateUIForGuestUser();
        
        // Redirect to home
        showPage('home');
        updateURL('home');
        setActiveNavItem('home');
        
        // Show notification
        showSuccessMessage('Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        showErrorMessage('Error logging out');
    }
}

/**
 * Setup Logout Button
 */
const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');
if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', handleLogout);
}

/**
 * Update URL without reload
 */
function updateURL(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
}

/**
 * Set Active Navigation Item
 */
function setActiveNavItem(page) {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
        const itemPage = item.getAttribute('data-page');
        if (itemPage === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Handle Initial Route on Page Load
 */
function handleInitialRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    if (page) {
        // If logged-in user tries to access home, set display as active
        const currentUser = getCurrentUser();
        if (page === 'home' && currentUser) {
            setActiveNavItem('display');
        } else {
            setActiveNavItem(page);
        }
    } else {
        // Default to display for logged-in users, home for guests
        const currentUser = getCurrentUser();
        setActiveNavItem(currentUser ? 'display' : 'home');
    }
}

/**
 * Handle Browser Back/Forward Buttons
 */
window.addEventListener('popstate', function() {
    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page') || 'home';
    
    // If logged-in user tries to go back to home, redirect to display
    const currentUser = getCurrentUser();
    if (page === 'home' && currentUser) {
        page = 'display';
    }
    
    showPage(page);
    setActiveNavItem(page);
});

/**
 * Export functions for use in other scripts
 */
if (typeof window !== 'undefined') {
    window.verticalNav = {
        init: initVerticalNavigation,
        setActive: setActiveNavItem,
        closeMobile: closeMobileMenu,
        checkAuth: checkAuthenticationStatus,
        updateAuthUI: updateUIForAuthenticatedUser,
        updateGuestUI: updateUIForGuestUser,
        updateNavigation: updateNavigation
    };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    // console.log("True")
    document.addEventListener('DOMContentLoaded', initVerticalNavigation);
} else {
    // console.log("false")
    initVerticalNavigation();
}