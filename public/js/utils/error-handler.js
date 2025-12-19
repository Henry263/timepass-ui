// utils/error-handler.js
// Universal Error Handler for the application

import { showCriticalError, showErrorMessage } from '../ui/notifications.js';
import { showPage } from '../ui/navigation.js';

/**
 * Error types enum
 */
export const ERROR_TYPES = {
    CONNECTION_ERROR: 'connection_error',
    AUTHENTICATION_ERROR: 'authentication_error',
    SERVER_ERROR: 'server_error',
    VALIDATION_ERROR: 'validation_error',
    TIMEOUT_ERROR: 'timeout_error',
    UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Categorize error type based on error object
 */
export function categorizeError(error) {
    if (!error) return ERROR_TYPES.UNKNOWN_ERROR;

    const errorMessage = error.message ? error.message.toLowerCase() : '';

    // Connection errors
    if (
        error instanceof TypeError && errorMessage.includes('fetch') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('networkerror') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network request failed') ||
        errorMessage.includes('connection') ||
        error.name === 'NetworkError'
    ) {
        return ERROR_TYPES.CONNECTION_ERROR;
    }

    // Authentication errors
    if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('session expired') ||
        errorMessage.includes('token') ||
        error.status === 401
    ) {
        return ERROR_TYPES.AUTHENTICATION_ERROR;
    }

    // Server errors
    if (
        error.status === 500 ||
        error.status === 502 ||
        error.status === 503 ||
        error.status === 504 ||
        errorMessage.includes('server error') ||
        errorMessage.includes('internal server')
    ) {
        return ERROR_TYPES.SERVER_ERROR;
    }

    // Validation errors
    if (
        error.status === 400 ||
        error.status === 422 ||
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid')
    ) {
        return ERROR_TYPES.VALIDATION_ERROR;
    }

    // Timeout errors
    if (
        errorMessage.includes('timeout') ||
        errorMessage.includes('timed out')
    ) {
        return ERROR_TYPES.TIMEOUT_ERROR;
    }

    return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Handle error based on its type
 */
export async function handleError(error, context = {}) {
    const errorType = categorizeError(error);
    console.error(`🚨 Error detected [${errorType}]:`, error);

    switch (errorType) {
        case ERROR_TYPES.CONNECTION_ERROR:
            await handleConnectionError(error, context);
            break;

        case ERROR_TYPES.AUTHENTICATION_ERROR:
            await handleAuthenticationError(error, context);
            break;

        case ERROR_TYPES.SERVER_ERROR:
            await handleServerError(error, context);
            break;

        case ERROR_TYPES.VALIDATION_ERROR:
            handleValidationError(error, context);
            break;

        case ERROR_TYPES.TIMEOUT_ERROR:
            handleTimeoutError(error, context);
            break;

        default:
            handleUnknownError(error, context);
            break;
    }
}

/**
 * Handle connection errors
 */
async function handleConnectionError(error, context) {
    console.log("🔌 Connection error - clearing session and logging out");

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Show critical error
    showCriticalError(
        "Connection Lost",
        "Unable to connect to the server. You have been logged out for security reasons. Please check your internet connection and try logging in again.",
        6000
    );

    // Wait before redirecting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirect to login
    showPage('login');

    // Update navigation UI
    if (window.verticalNav && window.verticalNav.checkAuth) {
        window.verticalNav.checkAuth();
    }
}

/**
 * Handle authentication errors
 */
async function handleAuthenticationError(error, context) {
    console.log("🔐 Authentication error - clearing session and logging out");

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Show critical error
    showCriticalError(
        "Session Expired",
        "Your session has expired for security reasons. Please log in again to continue.",
        1000
    );

    // Wait before redirecting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to login
    showPage('login');

    // Update navigation UI
    if (window.verticalNav && window.verticalNav.checkAuth) {
        window.verticalNav.checkAuth();
    }
}

/**
 * Handle server errors
 */
async function handleServerError(error, context) {
    console.log("⚙️ Server error detected");

    const message = error.message || "The server is experiencing issues. Please try again later.";
    
    showCriticalError(
        "Server Error",
        message,
        5000
    );
}

/**
 * Handle validation errors
 */
function handleValidationError(error, context) {
    console.log("✏️ Validation error detected");

    const message = error.message || "Please check your input and try again.";
    showErrorMessage(message);
}

/**
 * Handle timeout errors
 */
function handleTimeoutError(error, context) {
    console.log("⏱️ Timeout error detected");

    showCriticalError(
        "Request Timeout",
        "The request took too long to complete. Please check your connection and try again.",
        5000
    );
}

/**
 * Handle unknown errors
 */
function handleUnknownError(error, context) {
    console.log("❓ Unknown error detected");

    const message = error.message || "An unexpected error occurred. Please try again.";
    showErrorMessage(message);
}

/**
 * Create a wrapper for async functions with error handling
 */
export function withErrorHandling(asyncFunction, context = {}) {
    return async function(...args) {
        try {
            return await asyncFunction.apply(this, args);
        } catch (error) {
            await handleError(error, { ...context, functionName: asyncFunction.name });
            throw error; // Re-throw if the caller needs to handle it
        }
    };
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', async (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        await handleError(event.reason, { source: 'unhandledrejection' });
        event.preventDefault();
    });

    // Handle global errors
    window.addEventListener('error', async (event) => {
        console.error('Global error:', event.error);
        if (event.error) {
            await handleError(event.error, { source: 'global' });
        }
    });

    // console.log('✅ Global error handlers initialized');
}

export default {
    ERROR_TYPES,
    categorizeError,
    handleError,
    withErrorHandling,
    setupGlobalErrorHandlers
};