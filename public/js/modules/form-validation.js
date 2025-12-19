// // modules/form-validation.js
// // Complete Form Validation

// import { showError, clearAllErrors, scrollToFirstError } from '../ui/notifications.js';
// import { validateURL } from './social-validation.js';
// import { 
//     validateRequired, 
//     validatePhone, 
//     validateFieldLength,
//     validateNameOrganizationDifferent 
// } from '../utils/validators.js';
// import { APP_CONFIG, VALID_SOCIAL_FIELDS } from '../core/config.js';

// export function validateForm() {
//     clearAllErrors();
//     let isValid = true;

//     // Validate required fields
//     isValid = validateRequired("name", "Full name is required") && isValid;
//     isValid = validateRequired("email", "Email address is required") && isValid;

//     // Validate name length
//     const nameValue = document.getElementById("name").value.trim();
//     if (nameValue) {
//         isValid = validateFieldLength("name", APP_CONFIG.maxNameLength, "Name") && isValid;
//     }

//     // Validate organization length
//     const organizationValue = document.getElementById("organization").value.trim();
//     if (organizationValue) {
//         isValid = validateFieldLength("organization", APP_CONFIG.maxOrgLength, "Organization") && isValid;
//     }

//     // Validate name and organization are different
//     if (nameValue && organizationValue) {
//         isValid = validateNameOrganizationDifferent() && isValid;
//     }

//     // Validate phone numbers (optional but must be valid if provided)
//     const phone = document.getElementById("phone").value.trim();
//     const mobile = document.getElementById("mobile").value.trim();

//     if (phone) {
//         isValid = validatePhone("phone") && isValid;
//     }

//     if (mobile) {
//         isValid = validatePhone("mobile") && isValid;
//     }

//     // Validate website (optional)
//     const website = document.getElementById("website").value.trim();
//     if (website) {
//         isValid = validateURL("website", "Please enter a valid website URL") && isValid;
//     }

//     // Validate social media URLs (optional)
//     VALID_SOCIAL_FIELDS.forEach((field) => {
//         const value = document.getElementById(field).value.trim();
//         if (value) {
//             isValid = validateURL(field, `Please enter a valid ${field} URL`) && isValid;
//         }
//     });

//     return isValid;
// }

// export function setupRealtimeValidation() {
//     const form = document.getElementById("profileForm");
//     if (!form) return;

//     // Validate on input change (debounced)
//     form.addEventListener("input", function(e) {
//         setTimeout(() => {
//             validateForm();
//         }, 100);
//     });

//     // Validate on blur for immediate feedback
//     form.addEventListener("blur", function(e) {
//         const fieldId = e.target.id;
//         if (!fieldId) return;

//         // Clear previous error
//         if (VALID_SOCIAL_FIELDS.includes(fieldId)) {
//             const socialItem = e.target.closest(".social-item");
//             const errorContainer = socialItem?.querySelector(".input-error");
//             if (errorContainer) {
//                 errorContainer.innerHTML = "";
//             }
//         } else {
//             const existingError = e.target.parentNode.querySelector(".error-message");
//             if (existingError) {
//                 existingError.remove();
//             }
//         }

//         e.target.style.borderColor = "";
//         e.target.style.backgroundColor = "";

//         // Validate specific field
//         validateField(fieldId, e.target.value.trim());

//         // Check overall form validity
//         setTimeout(() => {
//             validateForm();
//         }, 50);
//     }, true);
// }

// function validateField(fieldId, fieldValue) {
//     let fieldValid = true;

//     switch (fieldId) {
//         case "name":
//             fieldValid = validateRequired(fieldId, "Full name is required");
//             if (fieldValid && fieldValue) {
//                 fieldValid = validateFieldLength("name", APP_CONFIG.maxNameLength, "Name");
//             }
//             if (fieldValid && fieldValue) {
//                 const orgValue = document.getElementById("organization").value.trim();
//                 if (orgValue) {
//                     fieldValid = validateNameOrganizationDifferent();
//                 }
//             }
//             break;

//         case "organization":
//             if (fieldValue) {
//                 fieldValid = validateFieldLength("organization", APP_CONFIG.maxOrgLength, "Organization");
//             }
//             if (fieldValid && fieldValue) {
//                 const nameValue = document.getElementById("name").value.trim();
//                 if (nameValue) {
//                     fieldValid = validateNameOrganizationDifferent();
//                 }
//             }
//             break;

//         case "email":
//             fieldValid = validateRequired(fieldId, "Email is required");
//             break;

//         case "phone":
//         case "mobile":
//             if (fieldValue) {
//                 fieldValid = validatePhone(fieldId);
//             }
//             break;

//         case "website":
//             if (fieldValue) {
//                 fieldValid = validateURL("website", "Please enter a valid website URL");
//             }
//             break;

//         default:
//             if (VALID_SOCIAL_FIELDS.includes(fieldId) && fieldValue) {
//                 fieldValid = validateURL(fieldId, `Please enter a valid ${fieldId} URL`);
//             }
//     }

//     return fieldValid;
// }

// // Initialize validation when form is ready
// export function initializeFormValidation() {
//     setupRealtimeValidation();
    
//     // Handle checkbox changes
//     $("#isPublic").on("change", function() {
//         const isChecked = $(this).is(":checked");
//         const helpText = $(this).closest(".form-group").find(".form-text");

//         if (isChecked) {
//             helpText.text("When checked, others can view your card using the link or QR code");
//             helpText.removeClass("text-danger").addClass("text-muted");
//         } else {
//             helpText.text("Your card will be private - only you can access it when logged in");
//             helpText.removeClass("text-muted").addClass("text-danger");
//         }
//     });
// }




// modules/form-validation.js
// Complete Form Validation - FIXED VERSION

import { showError, clearAllErrors, scrollToFirstError } from '../ui/notifications.js';
import { validateURL } from './social-validation.js';
import { 
    validateRequired, 
    validatePhone, 
    validateFieldLength,
    validateNameOrganizationDifferent 
} from '../utils/validators.js';
import { APP_CONFIG, VALID_SOCIAL_FIELDS } from '../core/config.js';

export function validateForm() {
    clearAllErrors();
    let isValid = true;

    // ✅ FIX: Add null checks for all elements
    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");
    const organizationElement = document.getElementById("organization");
    const phoneElement = document.getElementById("phone");
    const mobileElement = document.getElementById("mobile");
    const websiteElement = document.getElementById("website");

    // Validate required fields
    if (nameElement) {
        isValid = validateRequired("name", "Full name is required") && isValid;
    }
    if (emailElement) {
        isValid = validateRequired("email", "Email address is required") && isValid;
    }

    // Validate name length
    const nameValue = nameElement?.value?.trim() || "";
    if (nameValue) {
        isValid = validateFieldLength("name", APP_CONFIG.maxNameLength, "Name") && isValid;
    }

    // Validate organization length
    const organizationValue = organizationElement?.value?.trim() || "";
    if (organizationValue) {
        isValid = validateFieldLength("organization", APP_CONFIG.maxOrgLength, "Organization") && isValid;
    }

    // Validate name and organization are different
    if (nameValue && organizationValue) {
        isValid = validateNameOrganizationDifferent() && isValid;
    }

    // Validate phone numbers (optional but must be valid if provided)
    const phone = phoneElement?.value?.trim() || "";
    const mobile = mobileElement?.value?.trim() || "";

    if (phone) {
        isValid = validatePhone("phone") && isValid;
    }

    if (mobile) {
        isValid = validatePhone("mobile") && isValid;
    }

    // Validate website (optional)
    const website = websiteElement?.value?.trim() || "";
    if (website) {
        isValid = validateURL("website", "Please enter a valid website URL") && isValid;
    }

    // Validate social media URLs (optional)
    VALID_SOCIAL_FIELDS.forEach((field) => {
        const element = document.getElementById(field);
        const value = element?.value?.trim() || "";
        if (value) {
            isValid = validateURL(field, `Please enter a valid ${field} URL`) && isValid;
        }
    });

    return isValid;
}

export function setupRealtimeValidation() {
    const form = document.getElementById("profileForm");
    if (!form) {
        console.warn('Profile form not found, skipping real-time validation setup');
        return;
    }

    // ✅ FIX: Better event handling with null checks
    // Validate on input change (debounced)
    form.addEventListener("input", function(e) {
        // ✅ FIX: Check if target exists and has value property
        if (!e.target || typeof e.target.value === 'undefined') {
            return;
        }

        setTimeout(() => {
            validateForm();
        }, 100);
    });

    // Validate on blur for immediate feedback
    form.addEventListener("blur", function(e) {
        // ✅ FIX: Comprehensive target validation
        if (!e.target || !e.target.id || typeof e.target.value === 'undefined') {
            return;
        }

        const fieldId = e.target.id;
        const fieldValue = e.target.value?.trim() || ""; // ✅ FIX: Safe value extraction

        // Clear previous error
        if (VALID_SOCIAL_FIELDS.includes(fieldId)) {
            const socialItem = e.target.closest(".social-item");
            const errorContainer = socialItem?.querySelector(".input-error");
            if (errorContainer) {
                errorContainer.innerHTML = "";
            }
        } else {
            const existingError = e.target.parentNode?.querySelector(".error-message");
            if (existingError) {
                existingError.remove();
            }
        }

        // Reset field styling
        if (e.target.style) {
            e.target.style.borderColor = "";
            e.target.style.backgroundColor = "";
        }

        // Validate specific field
        validateField(fieldId, fieldValue);

        // Check overall form validity
        setTimeout(() => {
            validateForm();
        }, 50);
    }, true);
}

function validateField(fieldId, fieldValue) {
    // ✅ FIX: Add safety check for fieldValue
    if (typeof fieldValue === 'undefined' || fieldValue === null) {
        fieldValue = "";
    }

    let fieldValid = true;

    try {
        switch (fieldId) {
            case "name":
                fieldValid = validateRequired(fieldId, "Full name is required");
                if (fieldValid && fieldValue) {
                    fieldValid = validateFieldLength("name", APP_CONFIG.maxNameLength, "Name");
                }
                if (fieldValid && fieldValue) {
                    const orgElement = document.getElementById("organization");
                    const orgValue = orgElement?.value?.trim() || "";
                    if (orgValue) {
                        fieldValid = validateNameOrganizationDifferent();
                    }
                }
                break;

            case "organization":
                if (fieldValue) {
                    fieldValid = validateFieldLength("organization", APP_CONFIG.maxOrgLength, "Organization");
                }
                if (fieldValid && fieldValue) {
                    const nameElement = document.getElementById("name");
                    const nameValue = nameElement?.value?.trim() || "";
                    if (nameValue) {
                        fieldValid = validateNameOrganizationDifferent();
                    }
                }
                break;

            case "email":
                fieldValid = validateRequired(fieldId, "Email is required");
                break;

            case "phone":
            case "mobile":
                if (fieldValue) {
                    fieldValid = validatePhone(fieldId);
                }
                break;

            case "website":
                if (fieldValue) {
                    fieldValid = validateURL("website", "Please enter a valid website URL");
                }
                break;

            default:
                if (VALID_SOCIAL_FIELDS.includes(fieldId) && fieldValue) {
                    fieldValid = validateURL(fieldId, `Please enter a valid ${fieldId} URL`);
                }
        }
    } catch (error) {
        console.error(`Validation error for field ${fieldId}:`, error);
        fieldValid = false;
    }

    return fieldValid;
}

// ✅ ENHANCED: Better initialization with error handling
export function initializeFormValidation() {
    try {
        console.log('🔍 Initializing form validation...');
        
        // Setup real-time validation
        setupRealtimeValidation();
        
        // Handle checkbox changes with safety checks
        const publicCheckbox = $("#isPublic");
        if (publicCheckbox.length) {
            publicCheckbox.on("change", function() {
                try {
                    const isChecked = $(this).is(":checked");
                    const helpText = $(this).closest(".form-group").find(".form-text");

                    if (helpText.length) {
                        if (isChecked) {
                            helpText.text("When checked, others can view your card using the link or QR code");
                            helpText.removeClass("text-danger").addClass("text-muted");
                        } else {
                            helpText.text("Your card will be private - only you can access it when logged in");
                            helpText.removeClass("text-muted").addClass("text-danger");
                        }
                    }
                } catch (error) {
                    console.error('Error handling public checkbox change:', error);
                }
            });
        }

        // ✅ NEW: Setup validation for social category fields
        setupSocialCategoryValidation();
        
        console.log('✅ Form validation initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize form validation:', error);
    }
}

// ✅ NEW: Setup validation for social category fields
function setupSocialCategoryValidation() {
    try {
        // Check if social categories exist
        const socialCategories = document.querySelectorAll('.social-category-content');
        
        if (socialCategories.length === 0) {
            console.log('ℹ️ No social categories found, skipping social validation setup');
            return;
        }

        console.log(`🔗 Setting up validation for ${socialCategories.length} social categories`);

        // Add validation for each social category
        socialCategories.forEach((category, index) => {
            const categoryName = category.getAttribute('data-category-content') || `category-${index}`;
            const socialInputs = category.querySelectorAll('.social-item input[type="url"]');
            
            console.log(`📂 Category "${categoryName}" has ${socialInputs.length} social inputs`);

            socialInputs.forEach(input => {
                // Add real-time validation for social inputs
                input.addEventListener('input', function(e) {
                    if (!e.target || typeof e.target.value === 'undefined') return;
                    
                    const value = e.target.value.trim();
                    const fieldId = e.target.id;
                    
                    // Clear previous errors
                    const socialItem = e.target.closest('.social-item');
                    const errorContainer = socialItem?.querySelector('.input-error');
                    if (errorContainer) {
                        errorContainer.innerHTML = '';
                    }
                    
                    // Validate if there's a value
                    if (value && VALID_SOCIAL_FIELDS.includes(fieldId)) {
                        setTimeout(() => {
                            validateURL(fieldId, `Please enter a valid ${fieldId} URL`);
                        }, 300); // Debounce validation
                    }
                });

                // Add blur validation
                input.addEventListener('blur', function(e) {
                    if (!e.target || typeof e.target.value === 'undefined') return;
                    
                    const value = e.target.value.trim();
                    const fieldId = e.target.id;
                    
                    if (value && VALID_SOCIAL_FIELDS.includes(fieldId)) {
                        validateURL(fieldId, `Please enter a valid ${fieldId} URL`);
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error setting up social category validation:', error);
    }
}

// ✅ NEW: Utility function to safely get element value
export function safeGetElementValue(elementId) {
    const element = document.getElementById(elementId);
    return element?.value?.trim() || "";
}

// ✅ NEW: Utility function to safely set element error
export function safeSetElementError(elementId, errorMessage) {
    try {
        const element = document.getElementById(elementId);
        if (!element) return false;

        const socialItem = element.closest('.social-item');
        if (socialItem) {
            const errorContainer = socialItem.querySelector('.input-error');
            if (errorContainer) {
                errorContainer.innerHTML = errorMessage;
                return true;
            }
        }

        // Fallback for non-social fields
        showError(elementId, errorMessage);
        return true;
    } catch (error) {
        console.error(`Error setting error for ${elementId}:`, error);
        return false;
    }
}

// ✅ NEW: Validate all social categories
export function validateSocialCategories() {
    let isValid = true;
    
    try {
        const socialInputs = document.querySelectorAll('.social-item input[type="url"]');
        
        socialInputs.forEach(input => {
            const value = input?.value?.trim() || "";
            const fieldId = input?.id;
            
            if (value && fieldId && VALID_SOCIAL_FIELDS.includes(fieldId)) {
                const fieldValid = validateURL(fieldId, `Please enter a valid ${fieldId} URL`);
                isValid = isValid && fieldValid;
            }
        });
        
    } catch (error) {
        console.error('Error validating social categories:', error);
        isValid = false;
    }
    
    return isValid;
}

// ✅ ENHANCED: Export enhanced validation function
export function validateFormWithSocialCategories() {
    const basicValidation = validateForm();
    const socialValidation = validateSocialCategories();
    return basicValidation && socialValidation;
}