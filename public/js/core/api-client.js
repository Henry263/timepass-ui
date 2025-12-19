// // core/api-client.js
// // API Client Class

// import { APP_CONFIG } from './config.js';

// export let userPublicIP = null;

// async function getRealPublicIP() {
//     try {
//         const response = await fetch("/api/card/get-client-ip");
//         const data = await response.json();
//         if (data.success) {
//             return data.ip;
//         }
//         return null;
//     } catch (error) {
//         console.error("Failed to get public IP:", error);
//         return null;
//     }
// }

// // Initialize IP on load
// (async function() {
//     userPublicIP = await getRealPublicIP();
// })();

// export class QrProfileAppAPI {
//     constructor(baseURL = APP_CONFIG.baseURL) {
//         this.baseURL = baseURL;
//         this.token = this.getToken();
//     }

//     async getUserWithProfile() {
//         return this.apiRequest('/auth/user-profile');
//       }

//     getToken() {
//         return localStorage.getItem("authToken") || null;
//     }

//     setToken(token) {
//         this.token = token;
//         localStorage.setItem("authToken", token);
//     }

//     clearToken() {
//         this.token = null;
//         localStorage.removeItem("authToken");
//     }

//     async apiRequest(endpoint, options = {}) {
//         const url = `${this.baseURL}${endpoint}`;
//         const config = {
//             headers: {
//                 "Content-Type": "application/json",
//                 ...options.headers,
//             },
//             credentials: "include",
//             ...options,
//         };

//         try {
//             const response = await fetch(url, config);
            
//             // Check if response is not ok before trying to parse JSON
//             if (!response.ok) {
//                 let errorMessage = "API request failed";
//                 try {
//                     const data = await response.json();
//                     errorMessage = data.message || errorMessage;
//                 } catch (e) {
//                     // If JSON parsing fails, use status text
//                     errorMessage = response.statusText || errorMessage;
//                 }
                
//                 // Handle specific error status codes
//                 if (response.status === 401) {
//                     await this.handleUnauthorized();
//                     throw new Error("Session expired. Please log in again.");
//                 } else if (response.status === 503 || response.status === 502) {
//                     await this.handleServerError("Service temporarily unavailable. Please try again later.");
//                     throw new Error("Service temporarily unavailable");
//                 }
                
//                 throw new Error(errorMessage);
//             }

//             const data = await response.json();
//             return data;
            
//         } catch (error) {
//             console.error("API Request Error:", error);
            
//             // Handle network/connection errors
//             if (error instanceof TypeError && error.message.includes('fetch')) {
//                 await this.handleConnectionError();
//                 throw new Error("Unable to connect to server. Please check your connection.");
//             }
            
//             // Handle specific error patterns
//             if (error.message && (
//                 error.message.includes('ECONNREFUSED') ||
//                 error.message.includes('NetworkError') ||
//                 error.message.includes('Failed to fetch') ||
//                 error.message.includes('Network request failed')
//             )) {
//                 await this.handleConnectionError();
//                 throw new Error("Unable to connect to server. Please check your connection.");
//             }
            
//             throw error;
//         }
//     }

//     async handleConnectionError() {
//         console.log("🚨 Connection error detected - initiating logout");
        
//         // Clear local storage
//         this.clearToken();
//         localStorage.clear();
//         sessionStorage.clear();
        
//         // Import necessary functions dynamically to avoid circular dependencies
//         const { showCriticalError } = await import('../ui/notifications.js');
//         const { showPage } = await import('../ui/navigation.js');
        
//         // Show critical error message
//         showCriticalError(
//             "Connection Lost",
//             "Unable to connect to the server. You have been logged out for security reasons. Please check your internet connection and try logging in again.",
//             6000
//         );
        
//         // Redirect to login page after a delay
//         setTimeout(() => {
//             showPage('login');
            
//             // Reload vertical navigation to update UI
//             if (window.verticalNav && window.verticalNav.checkAuth) {
//                 window.verticalNav.checkAuth();
//             }
//         }, 2000);
//     }

//     async handleUnauthorized() {
//         console.log("🚨 Unauthorized access detected - initiating logout");
        
//         // Clear local storage
//         this.clearToken();
//         localStorage.clear();
//         sessionStorage.clear();
        
//         // Import necessary functions dynamically
//         const { showCriticalError } = await import('../ui/notifications.js');
//         const { showPage } = await import('../ui/navigation.js');
        
//         // Show critical error message
//         showCriticalError(
//             "Session Expired",
//             "Your session has expired for security reasons. Please log in again to continue.",
//             5000
//         );
        
//         // Redirect to login page
//         setTimeout(() => {
//             showPage('login');
            
//             // Reload vertical navigation to update UI
//             if (window.verticalNav && window.verticalNav.checkAuth) {
//                 window.verticalNav.checkAuth();
//             }
//         }, 1500);
//     }

//     async handleServerError(message) {
//         console.log("🚨 Server error detected");
        
//         // Import necessary functions dynamically
//         const { showErrorMessage } = await import('../ui/notifications.js');
        
//         // Show error message
//         showErrorMessage(message || "⚠️ Server is experiencing issues. Please try again later.");
//     }

//     // Authentication
//     async checkAuthStatus() {
//         try {
//             const response = await this.apiRequest("/auth/status");
//             return response.authenticated;
//         } catch (error) {
//             return false;
//         }
//     }

//     async getCurrentUser() {
//         // return this.apiRequest("/auth/me");
//         try {
//             return this.apiRequest('/auth/user-profile'); 
//         } catch (error) {
//             console.error("Get getCurrentUser error:", error);
//             return { success: false, error: error.message };
//         }
//     }

//     async logout() {
//         try {
//             await this.apiRequest("/auth/logout", { method: "POST" });
//             this.clearToken();
//             return true;
//         } catch (error) {
//             console.error("Logout error:", error);
//             this.clearToken();
//             return false;
//         }
//     }

//     // Profile
//     async getProfile() {
//         try {
//             return await this.apiRequest("/api/profile");
//         } catch (error) {
//             console.error("Get profile error:", error);
//             return { success: false, error: error.message };
//         }
//     }

//     async saveProfile(profileData) {
//         return this.apiRequest("/api/profile", {
//             method: "POST",
//             body: JSON.stringify(profileData),
//         });
//     }

//     async uploadQRCode(file) {
//         const formData = new FormData();
//         formData.append("qrCode", file);

//         return this.apiRequest("/api/profile/upload-qr", {
//             method: "POST",
//             headers: {},
//             body: formData,
//         });
//     }

//     async updatesuggestions(suggestiondata) {
//         return this.apiRequest("/api/suggestions", {
//             method: "POST",
//             body: JSON.stringify(suggestiondata),
//         });
//     }

//     async updatecontactinfo(contactdata) {
//         return this.apiRequest("/api/contact", {
//             method: "POST",
//             body: JSON.stringify(contactdata),
//         });
//     }

//     async deleteProfile() {
//         return this.apiRequest("/api/profile", { method: "DELETE" });
//     }

//     async getAnalytics() {
//         return this.apiRequest("/api/profile/analytics");
//     }

//     // Card
//     async getPublicCard(cardId) {
//         return this.apiRequest(`/api/card/${cardId}`);
//     }

//     async getCardhtmlData(identifier) {
//         return this.apiRequest(`/api/card/card-html/${identifier}`);
//     }

//     async downloadVCard(identifier) {
//         const url = `${this.baseURL}/api/card/${identifier}/vcard`;
//         window.open(url, "_blank");
//     }

//     async downloadWalletPass(identifier) {
//         const url = `${this.baseURL}/api/card/${identifier}/wallet-pass`;
//         window.open(url, "_blank");
//     }

//     async getQRCode(identifier, size = 400) {
//         return `${this.baseURL}/api/card/${identifier}/qr?size=${size}`;
//     }

//     async getstyledQRCode(identifier, size = 400) {
//         return `${this.baseURL}/api/card/${identifier}/download-styled-qr`;
//     }

//     async trackSocialClick(cardId, platform) {
//         return this.apiRequest(`/api/card/${cardId}/track/${platform}`, {
//             method: "POST",
//         });
//     }

//     async trackContactClick(cardId, action) {
//         return this.apiRequest(`/api/card/${cardId}/track/contact/${action}`, {
//             method: "POST",
//         });
//     }

//     async searchCards(query, limit = 10) {
//         return this.apiRequest(
//             `/api/card/search/${encodeURIComponent(query)}?limit=${limit}`
//         );
//     }
// }

// // Export singleton instance
// export const api = new QrProfileAppAPI();



// core/api-client.js
// API Client Class

import { APP_CONFIG } from './config.js';

export let userPublicIP = null;

async function getRealPublicIP() {
    try {
        const response = await fetch("/api/card/get-client-ip");
        const data = await response.json();
        if (data.success) {
            return data.ip;
        }
        return null;
    } catch (error) {
        console.error("Failed to get public IP:", error);
        return null;
    }
}

// Initialize IP on load
(async function() {
    userPublicIP = await getRealPublicIP();
})();

export class QrProfileAppAPI {
    constructor(baseURL = APP_CONFIG.baseURL) {
        this.baseURL = baseURL;
        this.token = this.getToken();
    }

    async getUserWithProfile() {
        return this.apiRequest('/auth/user-profile');
      }

    getToken() {
        return localStorage.getItem("authToken") || null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem("authToken", token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem("authToken");
    }
    // Basic Main API request.
    async apiRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            credentials: "include",
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            // Check if response is not ok before trying to parse JSON
            if (!response.ok) {
                let errorMessage = "API request failed";
                try {
                    const data = await response.json();
                    errorMessage = data.message || errorMessage;
                } catch (e) {
                    // If JSON parsing fails, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                
                // Handle specific error status codes
                if (response.status === 401) {
                    await this.handleUnauthorized();
                    throw new Error("Session expired. Please log in again.");
                } else if (response.status === 503 || response.status === 502) {
                    await this.handleServerError("Service temporarily unavailable. Please try again later.");
                    throw new Error("Service temporarily unavailable");
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error("API Request Error:", error);
            
            // Handle network/connection errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                await this.handleConnectionError();
                throw new Error("Unable to connect to server. Please check your connection.");
            }
            
            // Handle specific error patterns
            if (error.message && (
                error.message.includes('ECONNREFUSED') ||
                error.message.includes('NetworkError') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('Network request failed')
            )) {
                await this.handleConnectionError();
                throw new Error("Unable to connect to server. Please check your connection.");
            }
            
            throw error;
        }
    }
    // To get the binary file.
    async downloadFile(endpoint, body = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log("url: ", url)
        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(body),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            });
    
            if (!response.ok) {
                let err = "Download failed";
                try {
                    const json = await response.json();
                    err = json.message || err;
                } catch (e) {}
                throw new Error(err);
            }
    
            // Return binary blob
            return await response.blob();
    
        } catch (error) {
            console.error("Download Error:", error);
            throw error;
        }
    }
    

    async handleConnectionError() {
        console.log("🚨 Connection error detected - initiating logout");
        
        // Clear local storage
        this.clearToken();
        localStorage.clear();
        sessionStorage.clear();
        
        // Import necessary functions dynamically to avoid circular dependencies
        const { showCriticalError } = await import('../ui/notifications.js');
        const { showPage } = await import('../ui/navigation.js');
        
        // Show critical error message
        showCriticalError(
            "Connection Lost",
            "Unable to connect to the server. You have been logged out for security reasons. Please check your internet connection and try logging in again.",
            6000
        );
        
        // Redirect to login page after a delay
        setTimeout(() => {
            showPage('login');
            
            // Reload vertical navigation to update UI
            if (window.verticalNav && window.verticalNav.checkAuth) {
                window.verticalNav.checkAuth();
            }
        }, 2000);
    }

    async handleUnauthorized() {
        console.log("🚨 Unauthorized access detected - initiating logout");
        
        // Clear local storage
        this.clearToken();
        localStorage.clear();
        sessionStorage.clear();
        
        // Import necessary functions dynamically
        const { showCriticalError } = await import('../ui/notifications.js');
        const { showPage } = await import('../ui/navigation.js');
        
        // Need to add the logic to idenitfy if only profile page or display page.
        // Show critical error message
        // showCriticalError(
        //     "Session Expired",
        //     "Your session has expired for security reasons. Please log in again to continue.",
        //     1000
        // );
        
        // Redirect to login page
        setTimeout(() => {
            showPage('home');
            
            // Reload vertical navigation to update UI
            if (window.verticalNav && window.verticalNav.checkAuth) {
                window.verticalNav.checkAuth();
            }
        }, 1500);
    }

    async handleServerError(message) {
        console.log("🚨 Server error detected");
        
        // Import necessary functions dynamically
        const { showErrorMessage } = await import('../ui/notifications.js');
        
        // Show error message
        showErrorMessage(message || "⚠️ Server is experiencing issues. Please try again later.");
    }

    // Authentication
    async checkAuthStatus() {
        try {
            const response = await this.apiRequest("/auth/status");
            return response.authenticated;
        } catch (error) {
            return false;
        }
    }

    async getCurrentUser() {
        // return this.apiRequest("/auth/me");
        try {
            return this.apiRequest('/auth/user-profile'); 
        } catch (error) {
            console.error("Get getCurrentUser error:", error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await this.apiRequest("/auth/logout", { method: "POST" });
            this.clearToken();
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            this.clearToken();
            return false;
        }
    }

    // Profile
    async getProfile() {
        try {
            return await this.apiRequest("/api/profile");
        } catch (error) {
            console.error("Get profile error:", error);
            return { success: false, error: error.message };
        }
    }

    async saveProfile(profileData) {
        return this.apiRequest("/api/profile", {
            method: "POST",
            body: JSON.stringify(profileData),
        });
    }

    async uploadQRCode(file) {
        const formData = new FormData();
        formData.append("qrCode", file);

        return this.apiRequest("/api/profile/upload-qr", {
            method: "POST",
            headers: {},
            body: formData,
        });
    }

    async updatesuggestions(suggestiondata) {
        return this.apiRequest("/api/suggestions", {
            method: "POST",
            body: JSON.stringify(suggestiondata),
        });
    }

    async updatecontactinfo(contactdata) {
        return this.apiRequest("/api/contact", {
            method: "POST",
            body: JSON.stringify(contactdata),
        });
    }

    async deleteProfile() {
        return this.apiRequest("/api/profile", { method: "DELETE" });
    }

    async getAnalytics() {
        return this.apiRequest("/api/profile/analytics");
    }

    async getQRAnalytics() {
        return this.apiRequest("/api/profile/custom-qr-analytics");
    }

    

    // Card
    async getPublicCard(cardId) {
        return this.apiRequest(`/api/card/${cardId}`);
    }

    async getCardhtmlData(identifier) {
        return this.apiRequest(`/api/card/card-html/${identifier}`);
    }

    async getCustomCardData(identifier) {
        return this.apiRequest(`/api/qr-designer/list/${identifier}`);
    }

    async downloadCustomQRCode(qrCodeId, size) {
        return await this.downloadFile(`/api/qr-designer/downloadcustomqr`, {
            qrCodeId,
            size
        });
    }

    async editCustomCardData(identifier) {
        return this.apiRequest(`/api/qr-designer/edit/${identifier}`);
    }

    async downloadVCard(identifier) {
        const url = `${this.baseURL}/api/card/${identifier}/vcard`;
        window.open(url, "_blank");
    }

    async downloadWalletPass(identifier) {
        const url = `${this.baseURL}/api/card/${identifier}/wallet-pass`;
        window.open(url, "_blank");
    }

    async getQRCode(identifier, size = 300) {
        return `${this.baseURL}/api/card/${identifier}/qr?size=${size}`;
    }

    async getstyledQRCode(identifier, size = 400) {
        return `${this.baseURL}/api/card/${identifier}/download-styled-qr`;
    }

    async trackSocialClick(cardId, platform) {
        return this.apiRequest(`/api/card/${cardId}/track/${platform}`, {
            method: "POST",
        });
    }

    async trackContactClick(cardId, action) {
        return this.apiRequest(`/api/card/${cardId}/track/contact/${action}`, {
            method: "POST",
        });
    }

    async searchCards(query, limit = 10) {
        return this.apiRequest(
            `/api/card/search/${encodeURIComponent(query)}?limit=${limit}`
        );
    }
    /**
     * This is for branding
     */

    async saveBranding(cardId, brandingdata) {
        return this.apiRequest(`/api/card-branding/save`, {
            method: "POST",
            body: JSON.stringify(brandingdata),
        });
    }
    async saveBrandingforForm(cardId, brandingdata) {
        return this.apiRequest(`/api/forms/branding`, {
            method: "POST",
            body: JSON.stringify(brandingdata),
        });
    }

    async getBranding() {
        return this.apiRequest(`/api/card-branding/readbranding`, {
            method: "GET"
        });
    }

    async resetBranding() {
        return this.apiRequest(`/api/card-branding/resetbranding`, { method: "DELETE" });
    }

    
}

// Export singleton instance
export const api = new QrProfileAppAPI();