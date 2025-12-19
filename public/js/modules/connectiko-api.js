// js/modules/connectiko-api.js
// Connectiko API Management Module
// Frontend JavaScript for API dashboard, keys management, and usage analytics

import { api } from '../core/api-client.js';
import { getCurrentUser } from '../core/auth.js';
import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';
import { showLoadingMessage, hideLoadingMessage } from '../utils/helpers.js';

/**
 * Connectiko API Module
 */
class ConnectikoAPI {
    constructor() {
        this.currentCredentials = [];
        this.usageData = null;
        this.selectedCredentialId = null;
        this.charts = {};
    }

    /**
     * Initialize the Connectiko API module
     */
    async initialize() {
        console.log('🔗 Initializing Connectiko API module...');

        // Setup event listeners FIRST (before any rendering)
        // This ensures event delegation works for dynamically loaded content
        this.setupEventListeners();

        // Check if user has API access
        const hasAccess = await this.checkAPIAccess();
        // if (!hasAccess) {
        //     this.renderAccessDenied();
        //     console.log('✅ Connectiko API module initialized (access denied view)');
        //     return;
        // }

        // Load initial data
        await this.loadCredentials();
        await this.loadUsageOverview();

        // Render initial dashboard
        this.renderDashboard();

        console.log('✅ Connectiko API module initialized');
    }

    /**
     * Check if user has API access (paid subscription)
     */
    async checkAPIAccess() {
        try {
            const user = getCurrentUser();
            if (!user || !user.subscription || user.subscription.status !== 'active') {
                // Change this after stripe angagement.
                return true;
            }
            return true;
        } catch (error) {
            console.error('API access check error:', error);
            return false;
        }
    }

    /**
     * Load API credentials from backend
     */
    async loadCredentials() {
        try {
            const response = await api.apiRequest('/api/connectiko/credentials');
            if (response.success) {
                this.currentCredentials = response.data.credentials;
            }
        } catch (error) {
            console.error('Failed to load credentials:', error);
        }
    }

    /**
     * Load usage overview data
     */
    async loadUsageOverview() {
        try {
            const response = await api.apiRequest('/api/connectiko/usage/overview?period=30');
            if (response.success) {
                this.usageData = response.data;
            }
        } catch (error) {
            console.error('Failed to load usage overview:', error);
        }
    }

    /**
     * Render access denied screen for free users
     */
    renderAccessDenied() {
        const container = document.getElementById('connectikoApiPage');
        if (!container) return;

        container.innerHTML = `
            <div class="connectiko-access-denied">
                <div class="access-denied-content">
                    <div class="access-denied-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h2>Connectiko API</h2>
                    <p class="access-denied-subtitle">Enterprise QR Code API Suite</p>
                    
                    <div class="access-denied-message">
                        <h3>🔒 Premium Feature</h3>
                        <p>The Connectiko API is available exclusively for paid subscribers. Upgrade your plan to unlock:</p>
                        
                        <ul class="api-features-list">
                            <li><i class="fas fa-check"></i> RESTful QR Code Generation API</li>
                            <li><i class="fas fa-check"></i> HMAC Authentication & Security</li>
                            <li><i class="fas fa-check"></i> Custom QR Styling & Branding</li>
                            <li><i class="fas fa-check"></i> Usage Analytics & Reporting</li>
                            <li><i class="fas fa-check"></i> Webhook Integrations</li>
                            <li><i class="fas fa-check"></i> Enterprise-grade Rate Limiting</li>
                        </ul>
                    </div>
                    
                    <div class="access-denied-actions">
                        <button class="btn-primary upgrade-btn" data-action="upgrade">
                            <i class="fas fa-arrow-up"></i>
                            Upgrade to Pro
                        </button>
                        <button class="btn-secondary demo-btn" data-action="show-demo">
                            <i class="fas fa-play"></i>
                            View Demo
                        </button>
                    </div>
                    
                    <div class="pricing-preview">
                        <div class="pricing-card featured">
                            <h4>Starter Plan</h4>
                            <div class="price">$9/month</div>
                            <div class="api-limits">
                                <span>100 requests/min</span>
                                <span>10,000 requests/day</span>
                            </div>
                        </div>
                        <div class="pricing-card featured">
                            <h4>Pro Plan</h4>
                            <div class="price">$29/month</div>
                            <div class="api-limits">
                                <span>500 requests/min</span>
                                <span>100,000 requests/day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render main API dashboard
     */
    renderDashboard() {
        const container = document.getElementById('connectikoApiPage');
        if (!container) return;

        container.innerHTML = `
            <div class="connectiko-api-dashboard">
                ${this.renderHeader()}
                ${this.renderNavigation()}
                <div class="api-content">
                    ${this.renderOverviewTab()}
                    ${this.renderCredentialsTab()}
                    ${this.renderUsageTab()}
                    ${this.renderPlaygroundTab()}
                    ${this.renderDocumentationTab()}
                    ${this.renderBillingTab()}
                </div>
            </div>
        `;

        // Show overview tab by default
        this.showTab('overview');
    }

    /**
     * Render dashboard header
     */
    renderHeader() {
        return `
            <div class="api-header">
                <div class="api-header-content">
                    <div class="api-title-section">
                        <div class="api-logo">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="api-title-info">
                            <h1>Connectiko API</h1>
                            <p>Enterprise QR Code API Suite</p>
                        </div>
                    </div>
                    <div class="api-header-actions">
                        <button class="btn-secondary" data-action="show-documentation">
                            <i class="fas fa-book"></i>
                            Documentation
                        </button>
                        <button class="btn-primary" data-action="create-credential">
                            <i class="fas fa-plus"></i>
                            New API Key
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render navigation tabs
     */
    renderNavigation() {
        return `
            <nav class="api-navigation">
                <div class="api-nav-tabs">
                    <button class="api-nav-tab active" data-tab="overview">
                        <i class="fas fa-chart-line"></i>
                        Overview
                    </button>
                    <button class="api-nav-tab" data-tab="credentials">
                        <i class="fas fa-key"></i>
                        API Keys
                    </button>
                    <button class="api-nav-tab" data-tab="usage">
                        <i class="fas fa-chart-bar"></i>
                        Usage
                    </button>
                    <button class="api-nav-tab" data-tab="playground">
                        <i class="fas fa-play"></i>
                        Playground
                    </button>
                    <button class="api-nav-tab" data-tab="documentation">
                        <i class="fas fa-book"></i>
                        Documentation
                    </button>
                    <button class="api-nav-tab" data-tab="billing">
                        <i class="fas fa-credit-card"></i>
                        Billing
                    </button>
                </div>
            </nav>
        `;
    }

    /**
     * Render Overview Tab
     */
    renderOverviewTab() {
        return `
            <div id="overview-tab" class="api-tab-content">
                <h2>API Overview</h2>
                
                <div class="overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-key"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.currentCredentials.length}</h3>
                            <p>Active API Keys</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.formatNumber(this.usageData?.totalRequests || 0)}</h3>
                            <p>Total Requests</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.formatNumber(this.usageData?.requestsToday || 0)}</h3>
                            <p>Requests Today</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <div class="stat-info">
                            <h3>100/min</h3>
                            <p>Rate Limit</p>
                        </div>
                    </div>
                </div>
                
                <div class="overview-actions">
                    <button class="btn-primary" data-action="create-credential">
                        <i class="fas fa-plus"></i>
                        Create New API Key
                    </button>
                    <button class="btn-secondary" data-action="test-api">
                        <i class="fas fa-play"></i>
                        Test API
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render Credentials Tab
     */
    renderCredentialsTab() {
        return `
            <div id="credentials-tab" class="api-tab-content hidden">
                <h2>API Keys Management</h2>
                
                <div class="credentials-header">
                    <p>Manage your API keys and their permissions. Keep your credentials secure and never share them publicly.</p>
                    <button class="btn-primary" data-action="create-credential">
                        <i class="fas fa-plus"></i>
                        Create New API Key
                    </button>
                </div>
                
                <div class="credentials-list">
                    ${this.renderCredentialsList()}
                </div>
            </div>
        `;
    }

    /**
     * Render credentials list
     */
    renderCredentialsList() {
        if (this.currentCredentials.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-key"></i>
                    </div>
                    <h3>No API Keys</h3>
                    <p>Create your first API key to start using the Connectiko API</p>
                    <button class="btn-primary" data-action="create-credential">
                        <i class="fas fa-plus"></i>
                        Create API Key
                    </button>
                </div>
            `;
        }
        // Add this button to regenerate the APIkey
        //  <button class="btn-icon" data-action="regenerate-key" data-credential-id="${cred._id}" title="Regenerate">
        //                     <i class="fas fa-refresh"></i>
        //                 </button>
        return this.currentCredentials.map(cred => `
            <div class="credential-card">
                <div class="credential-header">
                    <div class="credential-info">
                        <h3>${cred.name}</h3>
                        <div class="credential-meta">
                            <span class="credential-env ${cred.environment}">${cred.environment.toUpperCase()} : </span>
                            <span class="credential-date">Created ${this.formatDate(cred.createdAt)}</span>
                        </div>
                    </div>
                    <div class="credential-actions">
                        <button class="btn-icon" data-action="copy-key" data-key="${cred.apiKey}" title="Copy API Key">
                            <i class="fas fa-copy"></i>
                        </button>
                       
                        <button class="btn-icon danger" data-action="delete-credential" data-credential-id="${cred._id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="credential-details">
                    <div class="credential-key">
                        <label>API Key: </label>
                        <code>${cred.apiKey}</code>
                    </div>
                    <div class="credential-permissions">
                        <label>Permissions: </label>
                        <div class="permission-tags">
                            ${cred.permissions.map(perm => `<span class="permission-tag">${perm}</span>`).join('')}
                        </div>
                    </div>
                    <div class="credential-stats">
                        <div class="stat">
                            <span class="stat-label">Last Used: </span>
                            <span class="stat-value">${this.formatDate(cred.lastUsedAt) || 'Never'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Total Requests: </span>
                            <span class="stat-value">${this.formatNumber(cred.totalRequests || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render Usage Tab
     */
    renderUsageTab() {
        return `
            <div id="usage-tab" class="api-tab-content hidden">
                <h2>Usage & Limits</h2>
                
                <div class="usage-overview">
                    <div class="usage-card">
                        <h3>Current Usage</h3>
                        <div class="usage-meter">
                            <div class="meter-bar">
                                <div class="meter-fill" style="width: 45%"></div>
                            </div>
                            <div class="meter-labels">
                                <span>4,500 / 10,000 requests today</span>
                                <span>45%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="usage-card">
                        <h3>Rate Limiting</h3>
                        <div class="rate-info">
                            <div class="rate-stat">
                                <span class="rate-label">Per Minute</span>
                                <span class="rate-value">100 requests</span>
                            </div>
                            <div class="rate-stat">
                                <span class="rate-label">Per Day</span>
                                <span class="rate-value">10,000 requests</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="usage-chart">
                    <h3>Usage History</h3>
                    <canvas id="usageHistoryChart"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Render Playground Tab with Dynamic Functionality
     */
    renderPlaygroundTab() {
        const playgroundHTML = `
            <div id="playground-tab" class="api-tab-content hidden">
                <h2>API Playground</h2>
                
                <div class="playground-container">
                    <div class="playground-controls">
                        <div class="form-group">
                            <label>Endpoint</label>
                            <select id="playgroundEndpoint" class="form-control">
                                <option value="/api/v1/qr/read">POST /api/v1/qr/read</option>
                                <option value="/api/v1/qr/qranalytics">POST /api/v1/qr/qranalytics</option>
                                <option value="/api/v1/lead/formanalytics">GET /api/v1/lead/formanalytics</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>API Key</label>
                            <select id="playgroundCredential" class="form-control">
                                ${this.currentCredentials.map(cred =>
            `<option value="${cred.apiKey}">${cred.name}</option>`
        ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Request Body <span class="auto-update-indicator">• Auto-updated</span></label>
                            <textarea id="playgroundRequestBody" class="form-control code-editor" rows="4">{
    "format": "png",
    "qrcodeId": "693b4aeb9fd28c6acca37a0c"
}</textarea>
                            <small class="form-help">Request body updates automatically when you change the endpoint</small>
                        </div>
                        
                        <div id="sample-image-div" class="sample-image-container">
                            <!-- QR images will be displayed here for /qr/read endpoint -->
                        </div>
                        
                        <button class="btn-primary" data-action="execute-playground">
                            <i class="fas fa-play"></i>
                            Execute Request
                        </button>
                        
                        <button class="btn-secondary" data-action="reset-request-body" style="margin-left: 10px;">
                            <i class="fas fa-undo"></i>
                            Reset to Default
                        </button>
                    </div>
                    
                    <div class="playground-response">
                        <h3>Response</h3>
                        <div id="playgroundResponse" class="response-container">
                            <p class="placeholder">Execute a request to see the response</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize playground after rendering
        setTimeout(() => {
            this.initializePlayground();

            // Set initial request body for default endpoint
            const defaultEndpoint = '/api/v1/qr/read';
            this.updateRequestBodyForEndpoint(defaultEndpoint);
        }, 100);

        return playgroundHTML;
    }

    /**
     * Render Documentation Tab
     */
    renderDocumentationTab() {
        return `
            <div id="documentation-tab" class="api-tab-content hidden">
                <h2>API Documentation</h2>
                
                <div class="documentation-content">
                    <section class="doc-section">
                        <h3>Authentication</h3>
                        <p>All API requests require HMAC-SHA256 authentication using your API key and secret.</p>
                        
                        <h4>Required Headers</h4>
                        <pre><code>X-Connectiko-API-Key: your_api_key
X-Connectiko-Timestamp: unix_timestamp
Content-Type: application/json</code></pre>


                    </section>
                    
                    <section class="doc-section">
                        <h3>QR Code Read</h3>
                        <p>Retrieve and display a previously generated QR code.</p>
                        
                        <h4>Endpoint</h4>
                        <pre><code>POST /api/v1/qr/read</code></pre>
                        
                        <h4>Request Body</h4>
                        <pre><code>{
    "qrcodeId": "693b4aeb9fd28c6acca37a0c",
    "format": "png",
}</code></pre>

                    <h4>Response Body (404)</h4>
                                            <pre><code>{
    "success":false,
    "message":"QR code not found"
}</code></pre>

                    <h4>Response Body (200)</h4>
                                            <pre><code>{
    "success": true,
    "data": {
        "qrId": "6940fd381143e6650cff7021",
        "format": "png",
        "size": 300,
        "imageData": "iVBORw0KGgoAAAANSUhEUgJyzf.....",
        "mimeType": "image/png",
        "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUh.....",
        "fileSize": 12126
    },
    "metadata": {
        "requestId": "3b17f656-ff01-40a3-b773-44894cb25ddb",
        "processingTime": "3.628917ms"
    }
}</code></pre>
                    </section>
                    
                    <section class="doc-section">
                        <h3>QR Analytics</h3>
                        <p>Get analytics data for QR code usage and scans.</p>
                        
                        <h4>Endpoint</h4>
                        <pre><code>POST /api/v1/qr/qranalytics</code></pre>
                        
                        <h4>Request Body</h4>
                        <pre><code>{
  "qrcodeId": "693b4aeb9fd28c6acca37a0c",
  "timeframe": 30 // Number of days. Not greater than 90. Starting from today.
}</code></pre>
                    </section>
                    
                    <section class="doc-section">
                        <h3>Form Analytics</h3>
                        <p>Retrieve analytics data for form submissions and interactions.</p>
                        
                        <h4>Endpoint</h4>
                        <pre><code>GET /api/v1/lead/formanalytics</code></pre>
                        
                        <h4>Request Body</h4>
                        <pre><code>{
  "formId": "693b4aeb9fd28c6acca37a0c",
  "timeframe": 30 // Number of days. Not greater than 90. Starting from today.
}</code></pre>
                    </section>
                    
                    <section class="doc-section">
                        <h3>Rate Limits</h3>
                        <p>API requests are rate limited based on your subscription tier:</p>
                        <ul>
                            <li>Starter: 100 requests/minute, 10,000 requests/day</li>
                            <li>Pro: 500 requests/minute, 100,000 requests/day</li>
                            <li>Enterprise: Custom limits</li>
                        </ul>
                    </section>
                </div>
            </div>
        `;
    }

    /**
     * Render Billing Tab
     */
    renderBillingTab() {
        return `
            <div id="billing-tab" class="api-tab-content hidden">
                <h2>Billing & Usage</h2>
                
                <div class="billing-overview">
                    <div class="current-plan">
                        <h3>Current Plan</h3>
                        <div class="plan-details">
                            <div class="plan-name">Pro Plan</div>
                            <div class="plan-price">$29/month</div>
                            <div class="plan-features">
                                <span>500 requests/minute</span>
                                <span>100,000 requests/day</span>
                            </div>
                        </div>
                        <button class="btn-secondary" data-action="manage-subscription">
                            Manage Subscription
                        </button>
                    </div>
                    
                    <div class="usage-summary">
                        <h3>This Month's Usage</h3>
                        <div class="usage-stat">
                            <span>Total Requests</span>
                            <strong>45,230</strong>
                        </div>
                        <div class="usage-stat">
                            <span>Estimated Cost</span>
                            <strong>$29.00</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup comprehensive event listeners
     */
    setupEventListeners() {
        console.log('🎯 Setting up Connectiko API event listeners...');

        // Remove any existing listeners to prevent duplicates
        $(document).off('.connectikoAPI');

        // Action button handler with detailed logging
        $(document).on('click.connectikoAPI', '[data-action]', (e) => {
            const action = $(e.currentTarget).data('action');
            const credentialId = $(e.currentTarget).data('credential-id');
            const apiKey = $(e.currentTarget).data('key');

            console.log('🔘 Button clicked:', action, 'Element:', e.currentTarget);

            // Prevent default for buttons
            if (e.currentTarget.tagName === 'BUTTON') {
                e.preventDefault();
            }

            // Route to appropriate handler
            switch (action) {
                case 'upgrade':
                    console.log('🔤 Opening upgrade page...');
                    window.open('/upgrade', '_blank');
                    break;
                case 'show-demo':
                    this.showAPIDemo();
                    break;
                case 'show-documentation':
                    this.showAPIDocumentation();
                    break;
                case 'create-credential':
                    this.createNewCredential();
                    break;
                case 'copy-key':
                    this.copyApiKey(apiKey);
                    break;
                case 'regenerate-key':
                    this.regenerateCredential(credentialId);
                    break;
                case 'delete-credential':
                    this.deleteCredential(credentialId);
                    break;
                case 'test-api':
                    this.showTab('playground');
                    break;
                case 'execute-playground':
                    this.executePlaygroundRequest();
                    break;
                case 'reset-request-body':
                    this.resetRequestBody();
                    break;
                case 'manage-subscription':
                    window.open('/subscription', '_blank');
                    break;
                case 'close-secret-modal':
                    this.closeSecretModal();
                    break;
                case 'download-credentials':
                    const key = $(e.currentTarget).data('api-key');
                    const secret = $(e.currentTarget).data('api-secret');
                    this.downloadCredentials(key, secret);
                    break;
                default:
                    console.warn('⚠️ Unknown action:', action);
            }
        });

        // Copy button handler in secret modal
        $(document).on('click.connectikoAPI', '.copy-btn', (e) => {
            e.preventDefault();
            const text = $(e.currentTarget).data('copy-text');
            console.log('📋 Copy button clicked:', text ? 'Has text' : 'No text');
            if (text) {
                this.copyToClipboard(text);
            }
        });

        // Tab navigation
        $(document).on('click.connectikoAPI', '.api-nav-tab', (e) => {
            const tab = $(e.currentTarget).data('tab');
            console.log('📑 Tab clicked:', tab);
            this.showTab(tab);
        });

        // Modal close handlers
        $(document).on('click.connectikoAPI', '.modal-close, [data-action="close-modal"]', (e) => {
            console.log('❌ Close modal clicked');
            this.hideCredentialModal();
        });

        // Credential form submission
        $(document).on('submit.connectikoAPI', '#credentialForm', (e) => {
            e.preventDefault();
            console.log('📝 Form submitted');
            this.submitCredentialForm();
        });

        // Setup playground-specific event handlers
        this.setupPlaygroundEventHandlers();

        console.log('✅ Connectiko API event listeners setup complete');
    }

    /**
     * Setup playground-specific event handlers
     */
    setupPlaygroundEventHandlers() {
        // Dynamic request body update based on endpoint selection
        $(document).on('change', '#playgroundEndpoint', (e) => {
            const endpoint = e.target.value;
            this.updateRequestBodyForEndpoint(endpoint);
        });

        // Auto-format JSON on blur
        $(document).on('blur', '#playgroundRequestBody', (e) => {
            try {
                const value = e.target.value.trim();
                if (value) {
                    const parsed = JSON.parse(value);
                    const formatted = JSON.stringify(parsed, null, 4);
                    e.target.value = formatted;
                }
            } catch (error) {
                // Invalid JSON, leave as is
            }
        });
    }

    /**
     * Get default request body based on endpoint
     */
    getDefaultRequestBody(endpoint) {
        const requestBodies = {
            '/api/v1/qr/read': {
                format: 'png',
                qrcodeId: '693b4aeb9fd28c6acca37a0c'
            },
            '/api/v1/qr/qranalytics': {
                qrcodeId: '693b4aeb9fd28c6acca37a0c',
                timeframe: 30
            },
            '/api/v1/lead/formanalytics': {
                formId: '693b4aeb9fd28c6acca37a0c',
                timeframe: 30
            }
        };

        return requestBodies[endpoint] || {};
    }

    /**
     * Update request body textarea based on selected endpoint
     */
    updateRequestBodyForEndpoint(endpoint) {
        const requestBodyTextarea = document.getElementById('playgroundRequestBody');

        if (!requestBodyTextarea) {
            console.error('Request body textarea not found');
            return;
        }

        try {
            const defaultBody = this.getDefaultRequestBody(endpoint);
            const formattedJson = JSON.stringify(defaultBody, null, 4);

            // Update textarea value
            requestBodyTextarea.value = formattedJson;

            // Add visual feedback
            requestBodyTextarea.style.borderColor = '#28a745';
            setTimeout(() => {
                requestBodyTextarea.style.borderColor = '';
            }, 1000);

            console.log(`Updated request body for endpoint: ${endpoint}`);

        } catch (error) {
            console.error('Error updating request body:', error);
            showErrorMessage('Failed to update request body');
        }
    }

    /**
     * Get endpoint method (GET, POST, etc.)
     */
    getEndpointMethod(endpoint) {
        const methods = {
            '/api/v1/qr/read': 'POST',
            '/api/v1/qr/qranalytics': 'POST',
            '/api/v1/lead/formanalytics': 'POST'
        };

        return methods[endpoint] || 'POST';
    }

    /**
     * Reset request body to default for current endpoint
     */
    resetRequestBody() {
        const currentEndpoint = $('#playgroundEndpoint').val();
        this.updateRequestBodyForEndpoint(currentEndpoint);
        showSuccessMessage('Request body reset to default');
    }

    /**
     * for JSON viewser
     * @param {*} qrData 
     * @returns 
     */
    formatQRCodeDataAPIDisplay(qrData) {
        const readApiResponse = `
        <div class="qr-display-container">
            <div class="info-qr-code">
                <h4>Generated QR Code</h4>
                <div class="qr-meta">
                    QR ID: ${qrData.qrId} | Size: ${qrData.size}px | Format: ${qrData.format.toUpperCase()}
                </div>
            </div>
        </div>
        <div class="api-qrcode-div">
            <img src="${qrData.dataUrl}" 
                 alt="QR Code ${qrData.qrId}"
                 style="max-width: 250px; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 10px;">
            <br>
            <a href="${qrData.dataUrl}" 
               download="qr-code-${qrData.qrId}.png" 
               class="btn-primary" 
               style="display: inline-block; padding: 8px 15px; text-decoration: none; border-radius: 4px;">
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `;

        return readApiResponse;
    }


    /**
 * Fixed renderJSONViewer method with proper line number sync
 */
    renderJSONViewer(jsonString) {
        const viewer = document.getElementById('jsonViewer');
        const lineNumbers = document.getElementById('lineNumbers');

        if (!viewer || !lineNumbers) {
            console.error('JSON viewer elements not found');
            return;
        }

        const lines = jsonString.split('\n');
        const MAX_LINES = 1000;

        const visibleLines = lines.length > MAX_LINES
            ? lines.slice(0, MAX_LINES).concat(['...truncated...'])
            : lines;

        // Format JSON content with proper line structure
        viewer.innerHTML = visibleLines
            .map((line, i) => `<div class="json-line" data-line="${i + 1}">${this.formatJSONLine(line)}</div>`)
            .join('');

        // Create line numbers that match exactly
        lineNumbers.innerHTML = visibleLines
            .map((_, i) => `<span class="line-number">${i + 1}</span>`)
            .join('');

        // Setup events after rendering
        this.setupJSONEvents();
    }

    /**
     * Updated formatQRanalyticsDataAPIDisplay method - NO LINE NUMBERS
     */
    formatQRanalyticsDataAPIDisplay() {
        return `
        <div class="qr-qranalyticsApiResponse-container">
            <div class="json-toolbar">
                <button id="copyJsonBtn" class="copy-json-btn">
                    <i class="fas fa-copy"></i> Copy JSON
                </button>
            </div>

            <div class="json-wrapper">
                <div class="json-viewer" id="jsonViewer"></div>
            </div>
        </div>
    `;
    }


    /**
     * Updated renderQRAnalyticsJSON method - LIMIT TO 100 LINES
     */
    renderQRAnalyticsJSON(qrData) {
        console.log('Rendering QR Analytics JSON:', qrData);

        const viewer = document.getElementById('jsonViewer');
        const copyBtn = document.getElementById('copyJsonBtn');

        // Check if elements exist
        if (!viewer) {
            console.error('JSON viewer element not found');

            // Try again after a longer delay
            setTimeout(() => {
                this.renderQRAnalyticsJSON(qrData);
            }, 200);
            return;
        }

        try {
            const jsonString = JSON.stringify(qrData, null, 2);
            const lines = jsonString.split('\n');
            const MAX_LINES = 100; // ✅ CHANGED: Limit to 100 lines

            // ✅ CHANGED: Show only first 100 lines, then show truncation message
            const visibleLines = lines.length > MAX_LINES
                ? lines.slice(0, MAX_LINES).concat([`... truncated (showing ${MAX_LINES} of ${lines.length} lines)`])
                : lines;

            // Store original JSON for copying (without chevrons/icons)
            this.originalJsonData = qrData;
            this.originalJsonString = jsonString;

            // Create structured JSON with proper line handling
            viewer.innerHTML = visibleLines
                .map((line, i) => {
                    // Don't add collapsible to truncation message
                    if (line.includes('... truncated')) {
                        return `<div class="json-line truncated-line" data-line="${i + 1}">${this.escapeHTML(line)}</div>`;
                    }
                    return `<div class="json-line" data-line="${i + 1}">${this.formatJSONLine(line)}</div>`;
                })
                .join('');

            // Setup events
            this.attachJSONEvents(copyBtn, viewer);

            console.log('✅ QR Analytics JSON rendered successfully');

        } catch (error) {
            console.error('Error rendering QR Analytics JSON:', error);
            viewer.innerHTML = `
            <div class="error-message" style="color: red; padding: 20px;">
                Failed to render JSON: ${error.message}
            </div>
        `;
        }
    }

    /**
     * Updated formatJSONLine method - same collapsible logic
     */
    formatJSONLine(line) {
        const escaped = this.escapeHTML(line);
        const trimmed = escaped.trim();

        // Check if line should be collapsible (opening braces/brackets)
        if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
            return `<span class="collapsible" data-collapsed="false">▼</span> ${escaped}`;
        }

        return escaped;
    }


    /**
     * ✅ FIXED: Enhanced attachJSONEvents - COPY WITHOUT CHEVRONS
     */
    attachJSONEvents(copyBtn, viewer) {
        if (copyBtn) {
            // Remove existing event listeners to prevent duplicates
            const newCopyBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

            newCopyBtn.addEventListener('click', () => {
                try {
                    // ✅ FIXED: Copy original JSON string without chevrons and icons
                    let textToCopy = '';

                    if (this.originalJsonString) {
                        // Use stored original JSON (complete and clean)
                        textToCopy = this.originalJsonString;
                    } else {
                        // Fallback: Clean the viewer content
                        textToCopy = this.getCleanJSONText(viewer);
                    }

                    navigator.clipboard.writeText(textToCopy).then(() => {
                        // Visual feedback
                        const originalText = newCopyBtn.innerHTML;
                        newCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        newCopyBtn.style.backgroundColor = '#28a745';

                        setTimeout(() => {
                            newCopyBtn.innerHTML = originalText;
                            newCopyBtn.style.backgroundColor = '';
                        }, 2000);
                    }).catch(err => {
                        console.error('Copy failed:', err);
                        alert('Failed to copy JSON');
                    });
                } catch (error) {
                    console.error('Copy button error:', error);
                }
            });
        }

        if (viewer) {
            // Setup collapsible functionality
            this.setupCollapsibleEvents(viewer);
        }
    }

    /**
     * ✅ NEW: Get clean JSON text without chevrons and icons
     */
    getCleanJSONText(viewer) {
        // Create a temporary clone to clean
        const clone = viewer.cloneNode(true);

        // Remove all collapsible elements (chevrons)
        const collapsibleElements = clone.querySelectorAll('.collapsible');
        collapsibleElements.forEach(el => el.remove());

        // Remove hidden lines (collapsed content)
        const hiddenLines = clone.querySelectorAll('.json-line[style*="display: none"]');
        hiddenLines.forEach(el => el.remove());

        // Get text content and clean up
        let text = clone.textContent || clone.innerText;

        // Remove the truncation message if present
        text = text.replace(/\.\.\. truncated.*$/m, '');

        // Clean up extra whitespace
        text = text.trim();

        return text;
    }

    /**
     * ✅ ENHANCED: setupCollapsibleEvents - works in both expand/collapse modes
     */
    setupCollapsibleEvents(viewer) {
        // Remove existing listeners
        viewer.removeEventListener('click', viewer._collapseHandler);

        viewer._collapseHandler = (e) => {
            if (!e.target.classList.contains('collapsible')) return;

            e.preventDefault();
            e.stopPropagation();

            const toggle = e.target;
            const currentLine = toggle.closest('.json-line');
            const isCollapsed = toggle.dataset.collapsed === 'true';

            // Toggle icon and state
            toggle.textContent = isCollapsed ? '▼' : '▶';
            toggle.dataset.collapsed = isCollapsed ? 'false' : 'true';

            // Get current line content to find matching block
            const lineText = currentLine.textContent.replace(/[▼▶]\s*/, ''); // Remove chevron for analysis
            const indentMatch = lineText.match(/^(\s*)/);
            const currentIndent = indentMatch ? indentMatch[1].length : 0;

            // Find and toggle related lines
            let nextLine = currentLine.nextElementSibling;
            let foundClosing = false;

            while (nextLine && !foundClosing) {
                const nextLineText = nextLine.textContent.replace(/[▼▶]\s*/, ''); // Remove chevron for analysis
                const nextIndentMatch = nextLineText.match(/^(\s*)/);
                const nextIndent = nextIndentMatch ? nextIndentMatch[1].length : 0;

                // If we find a line with same or less indentation that starts with } or ], it's our closing
                if (nextIndent <= currentIndent && (nextLineText.trim().startsWith('}') || nextLineText.trim().startsWith(']'))) {
                    foundClosing = true;
                    nextLine.style.display = isCollapsed ? 'block' : 'none';
                } else if (nextIndent > currentIndent) {
                    // This line is inside our block, toggle it
                    nextLine.style.display = isCollapsed ? 'block' : 'none';
                } else {
                    // We've reached a line outside our block, stop
                    break;
                }

                nextLine = nextLine.nextElementSibling;
            }

            console.log(`${isCollapsed ? 'Expanded' : 'Collapsed'} JSON section`);
        };

        viewer.addEventListener('click', viewer._collapseHandler);
    }

    /**
     * New method: Setup scroll synchronization between line numbers and content
     */



    /**
     * New method: Update line numbers when content changes
     */
    updateLineNumbers() {
        const viewer = document.getElementById('jsonViewer');
        const lineNumbers = document.getElementById('lineNumbers');

        if (!viewer || !lineNumbers) return;

        const visibleLines = Array.from(viewer.querySelectorAll('.json-line'))
            .filter(line => line.style.display !== 'none');

        lineNumbers.innerHTML = visibleLines
            .map((_, i) => `<span class="line-number">${i + 1}</span>`)
            .join('');
    }

    /**
     * New method: Setup JSON events (consolidated)
     */
    setupJSONEvents() {
        const copyBtn = document.getElementById('copyJsonBtn');
        const viewer = document.getElementById('jsonViewer');

        if (copyBtn && viewer) {
            this.attachJSONEvents(copyBtn, viewer);
            this.setupScrollSync();
        }
    }
    /**
     * Updated escapeHTML method
     */
    escapeHTML(str) {
        if (typeof str !== 'string') return str;

        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;");
    }

    /**
     * New method: Initialize JSON viewer with all fixes
     */
    initializeJSONViewer(containerId, jsonData) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        // Set up the HTML structure
        container.innerHTML = this.formatQRanalyticsDataAPIDisplay();

        // Wait for DOM update, then render JSON
        setTimeout(() => {
            this.renderQRAnalyticsJSON(jsonData);
        }, 10);
    }

    /**
 * ✅ NEW: Format Form Analytics Data API Display (same structure as QR analytics)
 */
formatFormAnalyticsDataAPIDisplay() {
    return `
        <div class="qr-formanalyticsApiResponse-container">
            <div class="json-toolbar">
                <div class="toolbar-title">
                    <i class="fas fa-clipboard-list"></i>
                    Form Analytics Data
                </div>
                <button id="copyFormJsonBtn" class="copy-json-btn">
                    <i class="fas fa-copy"></i> Copy JSON
                </button>
            </div>

            <div class="json-wrapper">
                <div class="json-viewer" id="formJsonViewer"></div>
            </div>
        </div>
    `;
}

/**
 * ✅ NEW: Render Form Analytics JSON (same functionality as QR analytics)
 */
renderFormAnalyticsJSON(formData) {
    console.log('Rendering Form Analytics JSON:', formData);
    
    const viewer = document.getElementById('formJsonViewer');
    const copyBtn = document.getElementById('copyFormJsonBtn');

    // Check if elements exist
    if (!viewer) {
        console.error('Form JSON viewer element not found');
        
        // Try again after a longer delay
        setTimeout(() => {
            this.renderFormAnalyticsJSON(formData);
        }, 200);
        return;
    }

    try {
        const jsonString = JSON.stringify(formData, null, 2);
        const lines = jsonString.split('\n');
        const MAX_LINES = 100; // Same limit as QR analytics

        // Show only first 100 lines, then show truncation message
        const visibleLines = lines.length > MAX_LINES
            ? lines.slice(0, MAX_LINES).concat([`... truncated (showing ${MAX_LINES} of ${lines.length} lines)`])
            : lines;

        // Store original JSON for copying (without chevrons/icons)
        this.originalFormJsonData = formData;
        this.originalFormJsonString = jsonString;

        // Create structured JSON with proper line handling
        viewer.innerHTML = visibleLines
            .map((line, i) => {
                // Don't add collapsible to truncation message
                if (line.includes('... truncated')) {
                    return `<div class="json-line truncated-line" data-line="${i + 1}">${this.escapeHTML(line)}</div>`;
                }
                return `<div class="json-line" data-line="${i + 1}">${this.formatJSONLine(line)}</div>`;
            })
            .join('');

        // Setup events
        this.attachFormAnalyticsEvents(copyBtn, viewer);

        console.log('✅ Form Analytics JSON rendered successfully');

    } catch (error) {
        console.error('Error rendering Form Analytics JSON:', error);
        viewer.innerHTML = `
            <div class="error-message" style="color: red; padding: 20px;">
                <i class="fas fa-exclamation-triangle"></i><br>
                Failed to render Form Analytics JSON<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

/**
 * ✅ NEW: Attach Form Analytics Events (similar to QR analytics)
 */
attachFormAnalyticsEvents(copyBtn, viewer) {
    if (copyBtn) {
        // Remove existing event listeners to prevent duplicates
        const newCopyBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
        
        newCopyBtn.addEventListener('click', () => {
            try {
                // Copy original JSON string without chevrons and icons
                let textToCopy = '';
                
                if (this.originalFormJsonString) {
                    // Use stored original JSON (complete and clean)
                    textToCopy = this.originalFormJsonString;
                } else {
                    // Fallback: Clean the viewer content
                    textToCopy = this.getCleanJSONText(viewer);
                }
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Visual feedback
                    const originalText = newCopyBtn.innerHTML;
                    newCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    newCopyBtn.style.backgroundColor = '#28a745';
                    
                    setTimeout(() => {
                        newCopyBtn.innerHTML = originalText;
                        newCopyBtn.style.backgroundColor = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Copy failed:', err);
                    alert('Failed to copy Form Analytics JSON');
                });
            } catch (error) {
                console.error('Copy button error:', error);
            }
        });
    }

    if (viewer) {
        // Setup collapsible functionality
        this.setupCollapsibleEvents(viewer);
    }
}


    /**
     * 
     * @param {*} qrData 
     * @param {*} apiName 
     * @returns 
     */

    // ✅ Also update your displayQRInSampleDiv method to remove line numbers setup
    async displayQRInSampleDiv(qrData, apiName) {
        const sampleDiv = document.getElementById('sample-image-div');
        if (!sampleDiv) return;

        try {
            console.log("apiName: ", apiName);

            if (apiName === 'read') {
                sampleDiv.innerHTML = this.formatQRCodeDataAPIDisplay(qrData);

            } else if (apiName === 'qranalytics') {
                // Display JSON viewer for QR analytics API
                sampleDiv.innerHTML = this.formatQRanalyticsDataAPIDisplay();

                // Wait for DOM to be ready before rendering JSON
                setTimeout(() => {
                    this.renderQRAnalyticsJSON(qrData);
                }, 100);

            } else if (apiName === 'formanalytics') {
            // ✅ ENHANCED: Use same UI components as QR analytics
            sampleDiv.innerHTML = this.formatFormAnalyticsDataAPIDisplay();

            // Wait for DOM to be ready before rendering JSON
            setTimeout(() => {
                this.renderFormAnalyticsJSON(qrData);
            }, 100);

        } else {
            // Unknown API type
            sampleDiv.innerHTML = `
                <div class="error-message" style="color: orange; text-align: center; padding: 20px;">
                    <i class="fas fa-question-circle"></i><br>
                    Unknown API type: ${apiName}
                </div>
            `;
        }

        } catch (error) {
            console.error('Error displaying QR in sample div:', error);
            sampleDiv.innerHTML = `
            <div class="error-message" style="color: red; text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-triangle"></i><br>
                Failed to display ${apiName} response<br>
                <small>${error.message}</small>
            </div>
        `;
        }
    }

    /**
     * Generate HMAC signature for API requests
     */
    async generateHMACSignature(apiSecret, requestBody, timestamp) {
        // Create the payload: timestamp + request body
        const payload = timestamp.toString() + requestBody;

        // Convert API secret to ArrayBuffer
        const secretKey = new TextEncoder().encode(apiSecret);

        // Import the secret key for HMAC
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            secretKey,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        // Sign the payload
        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            new TextEncoder().encode(payload)
        );

        // Convert to hex string
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Show specific tab
     */
    showTab(tabName) {
        // Update navigation
        $('.api-nav-tab').removeClass('active');
        $(`.api-nav-tab[data-tab="${tabName}"]`).addClass('active');

        // Update content
        $('.api-tab-content').addClass('hidden');
        $(`#${tabName}-tab`).removeClass('hidden');

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    /**
     * Load data for specific tab
     */
    async loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                await this.loadUsageOverview();
                this.renderUsageCharts();
                break;
            case 'usage':
                await this.loadDetailedUsage();
                break;
            case 'playground':
                this.initializePlayground();
                break;
        }
    }

    /**
     * Show API demo
     */
    showAPIDemo() {
        // Navigate to playground or show demo modal
        this.showTab('playground');
        showSuccessMessage('API demo loaded in playground');
    }

    /**
     * Show API documentation
     */
    showAPIDocumentation() {
        this.showTab('documentation');
    }

    /**
     * Create new credential
     */
    createNewCredential() {
        this.showCreateCredentialModal();
    }

    /**
     * Copy API key to clipboard
     */
    async copyApiKey(apiKey) {
        try {
            await navigator.clipboard.writeText(apiKey);
            showSuccessMessage('API key copied to clipboard');
        } catch (error) {
            console.error('Copy failed:', error);
            showErrorMessage('Failed to copy API key');
        }
    }

    /**
     * Regenerate credential
     */
    async regenerateCredential(credentialId) {
        if (!confirm('Are you sure you want to regenerate this API key? The old key will be immediately invalidated.')) {
            return;
        }

        try {
            showLoadingMessage('Regenerating API key...');

            const response = await api.apiRequest(`/api/connectiko/credentials/${credentialId}/regenerate`, {
                method: 'POST'
            });

            if (response.success) {
                showSuccessMessage('API key regenerated successfully');
                this.showSecretDisplay(response.data);
                await this.loadCredentials();
                this.refreshCredentialsList();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Regenerate credential error:', error);
            showErrorMessage(error.message || 'Failed to regenerate API key');
        } finally {
            hideLoadingMessage();
        }
    }

    /**
     * Delete credential
     */
    async deleteCredential(credentialId) {
        if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
            return;
        }

        try {
            showLoadingMessage('Deleting API key...');

            const response = await api.apiRequest(`/api/connectiko/credentials/${credentialId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                showSuccessMessage('API key deleted successfully');
                await this.loadCredentials();
                this.refreshCredentialsList();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Delete credential error:', error);
            showErrorMessage(error.message || 'Failed to delete API key');
        } finally {
            hideLoadingMessage();
        }
    }

    /**
   * Execute playground request
   */
    buildRequestBody(endpoint, parsedData) {
        if (endpoint.includes('read')) {
            let returnObj = {
                "endpointName": 'read',
                "apireqbody": JSON.stringify({
                    qrcodeId: parsedData.qrcodeId,
                    format: parsedData.format,
                    size: 300
                })
            }
            return returnObj;
        }

        if (endpoint.includes('qranalytics')) {

            let returnObj = {
                "endpointName": 'qranalytics',
                "apireqbody": JSON.stringify({
                    qrcodeId: parsedData.qrcodeId,
                    timeframe: 30
                })
            }
            return returnObj;
        }

        if (endpoint.includes('formanalytics')) {

            let returnObj = {
                "endpointName": 'formanalytics',
                "apireqbody": JSON.stringify({
                    formId: parsedData.formId,
                    timeframe: 30
                })
            }
            return returnObj
        }

        // fallback (optional)
        return JSON.stringify({});
    }

    async executePlaygroundRequest() {
        try {
            showLoadingMessage('Executing API request...');

            const endpoint = $('#playgroundEndpoint').val();
            const apiKey = $('#playgroundCredential').val();
            const requestBody = $('#playgroundRequestBody').val();
            let parsedData;
            try {
                parsedData = JSON.parse(requestBody);
            } catch (err) {
                console.error("Invalid JSON in textarea", err);
                return;
            }

            // Access individual values
            console.log(endpoint);    // "png"
            console.log(apiKey);
            // console.log(parsedData.format);    // "png"
            // console.log(parsedData.size);      // 300
            // console.log(parsedData.qrcodeId);  // "693b4aeb9fd28c6acca37a0c"
            // console.log(parsedData.timeframe); 
            // console.log(parsedData.formId); 
            // TODO: Implement actual API call with HMAC signature
            // For now, just show a placeholder response
            const user = getCurrentUser();
            console.log("parsedData: ", parsedData);
            // try {
            console.log("user Details: ", user);
            let reqbody = this.buildRequestBody(endpoint, parsedData);
            const body = reqbody["apireqbody"]
            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Connectiko-API-Key": apiKey,
                        "X-Connectiko-Timestamp": Math.floor(Date.now() / 1000).toString()
                    },
                    credentials: "include",
                    body
                });

                showSuccessMessage('Request executed successfully');

                // ✅ Now we can parse as JSON
                const result = await response.json();
                await this.displayQRInSampleDiv(result.data, reqbody["endpointName"]);

            } catch (error) {
                console.error("Error adding card to wallet:", error);
                return { success: false, message: "Failed to add card" };
            }


        } catch (error) {
            console.error('Playground request error:', error);
            showErrorMessage(error.message || 'Failed to execute request');
        } finally {
            hideLoadingMessage();
        }
    }

    /**
     * Display playground response with syntax highlighting
     */
    displayPlaygroundResponse(result, status, endpoint) {
        const statusClass = status >= 200 && status < 300 ? 'success' : 'error';
        const formattedJson = JSON.stringify(result, null, 2);

        $('#playgroundResponse').html(`
            <div class="response-header">
                <span class="status-badge status-${statusClass}">
                    ${status} ${status >= 200 && status < 300 ? 'OK' : 'Error'}
                </span>
                <span class="endpoint-info">${endpoint}</span>
            </div>
            <pre class="response-json"><code>${this.escapeHtml(formattedJson)}</code></pre>
        `);
    }

    /**
     * Initialize playground
     */
    initializePlayground() {

        // Set up endpoint change handler
        this.setupPlaygroundEventHandlers();


    }

    /**
     * Render usage charts
     */
    renderUsageCharts() {
        // TODO: Implement Chart.js charts
        console.log('Rendering usage charts...');
    }

    /**
     * Load detailed usage data
     */
    async loadDetailedUsage() {
        try {
            const response = await api.apiRequest('/api/connectiko/usage/overview?period=30');
            if (response.success) {
                this.detailedUsageData = response.data;
            }
        } catch (error) {
            console.error('Failed to load detailed usage:', error);
        }
    }

    /**
     * Format number for display
     */
    formatNumber(number) {
        return number ? number.toLocaleString() : '0';
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Escape HTML characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show create credential modal
     */
    showCreateCredentialModal() {
        const modal = `
            <div id="credentialModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create New API Key</h3>
                        <button class="modal-close" data-action="close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="credentialForm">
                        <div class="form-group">
                            <label for="credentialName">API Key Name</label>
                            <input type="text" id="credentialName" name="credentialName" class="form-control" 
                                   placeholder="e.g. Production API Key" required>
                            <small class="form-help">Choose a descriptive name to identify this API key</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="credentialEnvironment">Environment</label>
                            <select id="credentialEnvironment" name="credentialEnvironment" class="form-control" required>
                                <option value="live">Live (Production)</option>
                                <option value="test">Test (Development)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Permissions</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="permissions" value="qr.generate" checked>
                                    <span>Generate QR Codes</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="permissions" value="qr.batch">
                                    <span>Batch Operations</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="permissions" value="profile.read">
                                    <span>Read Profiles</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="permissions" value="analytics.read">
                                    <span>Read Analytics</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" data-action="close-modal">Cancel</button>
                            <button type="submit" class="btn-primary">Create API Key</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        $('body').append(modal);
        this.selectedCredentialId = null;
    }

    /**
     * Hide credential modal
     */
    hideCredentialModal() {
        $('#credentialModal').remove();
        this.selectedCredentialId = null;
    }

    /**
     * Submit credential form
     */
    async submitCredentialForm() {
        try {
            showLoadingMessage('Creating API key...');

            const formData = new FormData(document.getElementById('credentialForm'));
            const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
                .map(input => input.value);

            const data = {
                name: formData.get('credentialName'),
                environment: formData.get('credentialEnvironment'),
                permissions: permissions
            };

            const response = await api.apiRequest('/api/connectiko/credentials', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (response.success) {
                showSuccessMessage('API key created successfully');
                this.showSecretDisplay(response.data);
                await this.loadCredentials();
                this.refreshCredentialsList();
            } else {
                throw new Error(response.message);
            }

        } catch (error) {
            console.error('Create credential error:', error);
            showErrorMessage(error.message || 'Failed to create API key');
        } finally {
            hideLoadingMessage();
        }
    }

    /**
     * Show API secret display modal (shown only once)
     */
    showSecretDisplay(credentialData) {
        const modal = `
            <div id="secretDisplayModal" class="modal-overlay">
                <div class="modal-content secret-modal">
                    <div class="modal-header">
                        <h3>🔒 Your API Credentials</h3>
                        <div class="security-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            Save these credentials securely. The secret will only be shown once!
                        </div>
                    </div>
                    <div class="credential-display">
                        <div class="credential-field">
                            <label>API Key</label>
                            <div class="credential-value">
                                <code>${credentialData.apiKey}</code>
                                <button class="copy-btn" data-copy-text="${credentialData.apiKey}">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="credential-field">
                            <label>API Secret</label>
                            <div class="credential-value">
                                <code>${credentialData.apiSecret}</code>
                                <button class="copy-btn" data-copy-text="${credentialData.apiSecret}">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="implementation-example">
                        <h4>Quick Start Example</h4>
                        <pre><code>curl -X POST "${window.location.origin}/api/v1/qr/read" \\
  -H "X-Connectiko-API-Key: ${credentialData.apiKey}" \\
  -H "X-Connectiko-Signature: [HMAC-SHA256]" \\
  -H "X-Connectiko-Timestamp: $(date +%s)" \\
  -H "Content-Type: application/json" \\
  -d '{"qrcodeId": "693b4aeb9fd28c6acca37a0c", "format": "png"}'</code></pre>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary" data-action="download-credentials" 
                                data-api-key="${credentialData.apiKey}" 
                                data-api-secret="${credentialData.apiSecret}">
                            <i class="fas fa-download"></i>
                            Download as File
                        </button>
                        <button class="btn-primary" data-action="close-secret-modal">
                            <i class="fas fa-check"></i>
                            I've Saved These Credentials
                        </button>
                    </div>
                </div>
            </div>
        `;

        $('body').append(modal);
        this.hideCredentialModal();
    }

    /**
     * Close secret display modal
     */
    closeSecretModal() {
        $('#secretDisplayModal').remove();
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showSuccessMessage('Copied to clipboard');
        } catch (error) {
            console.error('Copy failed:', error);
            showErrorMessage('Failed to copy');
        }
    }

    /**
     * Download credentials as file
     */
    downloadCredentials(apiKey, apiSecret) {
        const content = `Connectiko API Credentials
Generated: ${new Date().toISOString()}

API Key: ${apiKey}
API Secret: ${apiSecret}

IMPORTANT: Keep these credentials secure and never commit them to version control.

Documentation: ${window.location.origin}/api/docs
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `connectiko-api-credentials-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccessMessage('Credentials downloaded successfully');
    }

    /**
     * Refresh credentials list
     */
    refreshCredentialsList() {
        const container = $('.credentials-list');
        if (container.length) {
            container.html(this.renderCredentialsList());
        }
    }
}

// Export singleton instance
const connectikoAPI = new ConnectikoAPI();

// Export for global access
export default connectikoAPI;

// Create global instance for backward compatibility
window.connectikoAPI = connectikoAPI;

