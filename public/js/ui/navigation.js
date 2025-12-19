

// ui/navigation.js
// Page Navigation Management

import { getCurrentUser, getUserProfile } from '../core/auth.js';
import { loadProfileData } from '../modules/profile.js';
import { updateDisplayPage } from '../modules/display.js';
import { showErrorMessage } from './notifications.js';
import { cacheManager } from '../utils/cache-manager.js';
import QRAnalytics from '../modules/qr-analytics.js';
import formAnalytics from './form-analytics.js';
import connectikoAPI from '../modules/connectiko-api.js'
import pricingHandler from '../ui/pricing-handler.js'
let isChangingPage = false;
let currentDisplayedPage = null;

let qrAnalyticsInstance = null;

// Import team management module
let teamManagement;
export async function showPage(pageId) {
    // Hide the team feature

    // Prevent multiple simultaneous page changes
    if (isChangingPage) {
        console.log('Page change already in progress, skipping...');
        return;
    }

    // Don't reload if already on this page
    if (currentDisplayedPage === pageId) {
        console.log(`Already on page: ${pageId}, skipping reload...`);
        return;
    }

    isChangingPage = true;
    try {
        const currentUser = getCurrentUser();
        const getuserprofile = getUserProfile();
        // console.log("inside show page: ", getuserprofile);
        // Check for standalone mode
        // const isStandalone = await checkStandaloneMode();
        // if (isStandalone) {
        //     return;
        // }

        // Redirect logged-in users from home page to display page
        if (currentUser && pageId === "home") {
            pageId = "display";
        }

        // Restrict access to authenticated pages
        if (!currentUser && (pageId === "profile" || pageId === "display" || pageId === "wallet" || pageId === "team")) {
            showPage("home");
            showErrorMessage("Please log in to access Profile and Card page");
            return;
        }

        document.querySelectorAll(".page").forEach((page) => {
            page.classList.remove("active");
            page.style.display = "none";
        });

        const targetPage = document.getElementById(pageId + "Page");

        if (targetPage) {
            targetPage.classList.add("active");
            targetPage.style.display = "block";

            if (pageId === "profile") {
                loadProfileData();
            } else if (pageId === "display") {
                updateDisplayPage();
            } else if (pageId === "wallet") {
                if (typeof loadWalletCards === "function") {
                    loadWalletCards();
                }
            } else if (pageId === "qranalytics") {
                // ✅ NEW: Load QR Analytics using proper import
                try {
                    // Initialize QR Analytics instance if not already done
                    if (!qrAnalyticsInstance) {
                        qrAnalyticsInstance = new QRAnalytics();
                    }
                    
                    // Load analytics data
                    await qrAnalyticsInstance.loadAnalytics();
                    console.log('✅ QR Analytics loaded successfully');
                } catch (error) {
                    console.error('❌ Error loading QR Analytics:', error);
                    showErrorMessage('Failed to load QR Analytics');
                }
            } else if (pageId === "formAnalytics") {
                console.log('🎯 Initializing Form Analytics page...');
                try {
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        formAnalytics.init();
                        console.log('✅ Form Analytics initialized successfully');
                    }, 100);
                } catch (error) {
                    console.error('❌ Error initializing Form Analytics:', error);
                }
            } else if (pageId === "connectikoApi") {
                 try {
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        connectikoAPI.initialize();
                        pricingHandler.init();
                        console.log('✅ API suite initialized successfully');
                    }, 100);
                } catch (error) {
                    console.error('❌ Error initializing API:', error);
                }
               
               
            }
            else if (pageId === "team") {
                // following code is to display the profile page by default when team feature is hidden.
                showPage("display");

                // Initialize team management if not already loaded

                // To turnoff the ream management feature.

                // if (!teamManagement) {
                //     import('../modules/team-management.js').then(module => {
                //         teamManagement = module.default;
                //         teamManagement.init();
                //     });
                // } else {
                //     // Refresh team data
                //     teamManagement.refresh();
                // }
            }
        }
        currentDisplayedPage = pageId;
    } finally {
        setTimeout(() => {
            isChangingPage = false;
        }, 100);
    }


}

// ✅ NEW: Function to get QR Analytics instance (for external use)
export function getQRAnalyticsInstance() {
    if (!qrAnalyticsInstance) {
        qrAnalyticsInstance = new QRAnalytics();
    }
    return qrAnalyticsInstance;
}

// ✅ NEW: Function to refresh QR Analytics (for external calls)
export async function refreshQRAnalytics() {
    try {
        const instance = getQRAnalyticsInstance();
        await instance.loadAnalytics();
        return true;
    } catch (error) {
        console.error('Failed to refresh QR Analytics:', error);
        return false;
    }
}

export async function handleURLParams() {

    const urlParams = new URLSearchParams(window.location.search);

    if (!urlParams.toString()) {
        // Check if user is logged in
        const { getUserStatus } = await import('../core/auth.js');
        const user = await getUserStatus();

        // If logged in, show display page, otherwise show home
        showPage(user && user.authenticated ? "display" : "home");
        updateURL(user && user.authenticated ? "display" : "home")
        return null;
    }

    const params = {};
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }

    if (urlParams.has("page")) {
        const { getUserStatus } = await import('../core/auth.js');
        const pagename = urlParams.get("page");

        // const pageMap = {
        //     home: "home",
        //     faq: "faq",
        //     usecase: "usecase",
        //     scenario: "usecase",
        //     resetPassword: "resetPassword",
        //     team: "team"
        // };

        // if (pageMap[pagename]) {
        //     // If user is logged in and trying to access home, redirect to display
        //     const user = await getUserStatus();
        //     if (pagename === "home" && user && user.authenticated) {
        //         showPage("display");
        //         updateURL("display")
        //     } else {
        //         showPage(pageMap[pagename]);
        //         updateURL(pageMap[pagename])
        //     }
        //     return params;
        // }

        // version 2======= added. 
        const pageMap = {
            home: "home",
            faq: "faq",
            usecase: "usecase",
            scenario: "usecase",
            resetPassword: "resetPassword",
            forgotPassword: "forgotPassword",
            verifyEmail: "verifyEmail",
            qranalytics: "qranalytics"
            
        };
        
        // Define public pages that don't require authentication
        const publicPages = ["home", "faq", "usecase", "scenario", "resetPassword", "forgotPassword", "verifyEmail", "qranalytics"];
        
        if (pageMap[pagename]) {
            // For public pages, show directly without auth check
            if (publicPages.includes(pagename)) {
                showPage(pageMap[pagename]);
                updateURL(pageMap[pagename]);
                return params;
            }
            
            // For other pages, check if user is logged in and redirect appropriately
            const user = await getUserStatus();
            if (pagename === "home" && user && user.authenticated) {
                showPage("display");
                updateURL("display")
            } else {
                showPage(pageMap[pagename]);
                updateURL(pageMap[pagename])
            }
            return params;
        }
        // version 2======= added. 
        // Pages requiring auth check
        const authPages = ["signup", "login", "profile", "wallet", "team"];
        if (authPages.includes(pagename)) {
            const user = await getUserStatus();

            if (user && user.authenticated) {
                showPage(pagename === "signup" || pagename === "login" ? "display" : pagename);
                updateURL(pagename === "signup" || pagename === "login" ? "display" : pagename)
            } else {
                showPage(pagename === "profile" || pagename === "wallet" || pagename === "team" ? "login" : pagename);
                updateURL(pagename === "profile" || pagename === "wallet" || pagename === "team" ? "login" : pagename)
            }
        }

    }

    return params;
}

/**
 * Update URL without reload - ENHANCED VERSION
 */
export function updateURL(page) {
    try {
        const url = new URL(window.location);
        url.searchParams.set('page', page);

        // Use pushState to update URL without reload
        window.history.pushState({ page: page }, '', url.toString());

        // Log for debugging
        console.log(`✓ URL updated to: ${url.toString()}`);
    } catch (error) {
        console.error('Error updating URL:', error);
    }
}

/**
 * Set Active Navigation Item
 */
export function setActiveNavItem(page) {
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

if (typeof window !== 'undefined') {
    console.log("window formAnalytics");
    window.formAnalytics = formAnalytics;
}