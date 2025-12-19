// server/public/js/modules/qr-analytics.js
// QR Code Analytics Dashboard Module

import { api } from '../core/api-client.js';
import { showErrorMessage, showSuccessMessage } from '../ui/notifications.js';
import qrAnalyticsModal from '../ui/qr-analytics-modal.js';

class QRAnalytics {
    constructor() {
        this.analytics = null;
        this.isLoading = false;
        this.eventListenersAttached = false; // ✅ Track listener state
        this.boundClickHandler = null; // ✅ Store bound handler reference
        this.init();
    }

    init() {
        console.log('🔄 Initializing QR Analytics Dashboard');
        this.setupEventListeners();
    }

    async loadAnalytics() {
        try {
            console.log('📊 Loading QR analytics...');
            
            // const response = await api.get('/api/profile/custom-qr-analytics');
            const response = await api.getQRAnalytics();
            if (response.success) {
                this.analytics = response.analytics;
                this.renderAnalytics();
                console.log('✅ QR analytics loaded successfully');
            } else {
                throw new Error(response.message || 'Failed to load analytics');
            }
            
        } catch (error) {
            console.error('❌ QR Analytics loading error:', error);
            showErrorMessage('Failed to load QR analytics: ' + error.message);
        }
    }

    renderAnalytics() {
        const analyticsContainer = document.getElementById('qrAnalyticsContainer');
        if (!analyticsContainer) {
            console.warn('QR Analytics container not found');
            return;
        }

        const { totalCustomQRs, totalScans, qrCodeStats, period } = this.analytics;
        // <th>Last Scan</th>
        const html = `
            <div class="analytics-header">
                <h3><i class="fas fa-chart-pie"></i> <span>QR Code Analytics</span></h3>
                <span class="analytics-period">${period}</span>
            </div>
            
            <div class="analytics-summary">
                <div class="stat-card">
                    <div class="stat-number">${totalCustomQRs}</div>
                    <div class="stat-label">Custom QR Codes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalScans}</div>
                    <div class="stat-label">Total Scans</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.calculateAvgScans(qrCodeStats)}</div>
                    <div class="stat-label">Avg Scans per QR</div>
                </div>
            </div>

            <div class="qr-codes-table">
                <table>
                    <thead>
                        <tr>
                            <th>QR Code Name</th>
                             <th>QRCodeID</th>
                            <th>Destination URL</th>
                            <th>Total Scans</th>
                           
                            
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderQRCodeRows(qrCodeStats)}
                    </tbody>
                </table>
            </div>
        `;

        analyticsContainer.innerHTML = html;
        // ✅ RE-ATTACH LISTENERS AFTER CONTENT CHANGE
        this.attachTableEventListeners();
    }

    renderQRCodeRows(qrCodeStats) {
        if (!qrCodeStats || qrCodeStats.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="no-data">
                        No QR code scans in the last 30 days
                    </td>
                </tr>
            `;
        }
        //  <td class="last-scan">
        //             ${this.formatDate(qr.lastScan)}
        //         </td>
        return qrCodeStats.map(qr => `
            <tr>
                <td class="qr-name">
                    <div>${qr.qrCodeName || 'Unnamed QR'}</div>
                </td>
                 <td class="unique-users">
                    ${qr.qrCodeId}
                </td>
                <td class="qr-url">
                    <a href="${qr.originalUrl}" target="_blank" rel="noopener">
                        ${this.truncateUrl(qr.originalUrl)}
                    </a>
                </td>
                <td class="scan-count">
                    <span class="badge scan-badge">${qr.totalScans}</span>
                </td>
               
               
                <td class="actions">
                    <button class="btn-sm btn-primary qr-details-btn" 
                            data-qr-id="${qr.qrCodeId}"
                            title="View QR Details">
                        📈 Details
                    </button>
                </td>
            </tr>
        `).join('');
    }

    calculateAvgScans(qrCodeStats) {
        if (!qrCodeStats || qrCodeStats.length === 0) return 0;
        const totalScans = qrCodeStats.reduce((sum, qr) => sum + qr.totalScans, 0);
        return Math.round(totalScans / qrCodeStats.length);
    }

    truncateUrl(url, maxLength = 40) {
        if (!url) return '';
        return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    async viewDetails(qrCodeId) {
        try {
            console.log(`📋 Viewing details for QR: ${qrCodeId}`);
            
            // Validate QR ID format
            if (!qrCodeId || !/^[a-f0-9]{24}$/.test(qrCodeId)) {
                throw new Error('Invalid QR code ID format');
            }
            
            // TODO: Implement detailed analytics modal/page
            // Open detailed analytics modal
            // TODO: Implement detailed analytics modal/page
            await qrAnalyticsModal.showModal(qrCodeId);
            // showSuccessMessage(`Detailed analytics for QR Code ID: ${qrCodeId} (Feature coming soon)`);
            
        } catch (error) {
            console.error('QR details error:', error);
            showErrorMessage('Failed to load QR code details');
        }
    }

    // setupEventListeners() {
    //     // Refresh button
    //     const refreshBtn = document.getElementById('refreshQRAnalytics');
    //     if (refreshBtn) {
    //         refreshBtn.addEventListener('click', () => {
    //             this.loadAnalytics();
    //         });
    //     }
    // }

    // ✅ ENHANCED EVENT LISTENERS WITH EVENT DELEGATION
    setupEventListeners() {
        // ✅ PREVENT DUPLICATE ATTACHMENTS
        if (this.eventListenersAttached) {
            console.log('🔄 Event listeners already attached, skipping...');
            return;
        }

        // Refresh button
        // const refreshBtn = document.getElementById('refreshQRAnalytics');
        // if (refreshBtn) {
        //     refreshBtn.addEventListener('click', () => {
        //         this.loadAnalytics();
        //     });
        // }

        // Refresh button (one-time setup)
        const refreshBtn = document.getElementById('refreshQRAnalytics');
        if (refreshBtn) {
            // Remove existing listeners
            refreshBtn.removeEventListener('click', this.handleRefresh);
            // Add new listener
            refreshBtn.addEventListener('click', () => {
                this.loadAnalytics();
            });
        }

        this.eventListenersAttached = true;
        console.log('✅ QR Analytics base event listeners attached');


        // ✅ EVENT DELEGATION for dynamically created QR details buttons
        // const qrAnalyticsContainer = document.getElementById('qrAnalyticsContainer');
        // if (qrAnalyticsContainer) {
        //     qrAnalyticsContainer.addEventListener('click', async (e) => {
        //         // Handle QR details button clicks
        //         if (e.target.closest('.qr-details-btn')) {
        //             e.preventDefault();
        //             const button = e.target.closest('.qr-details-btn');
        //             const qrCodeId = button.dataset.qrId;
                    
        //             if (qrCodeId) {
        //                 // Show loading state on button
        //                 const originalText = button.innerHTML;
        //                 button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        //                 button.disabled = true;

        //                 try {
        //                     await this.viewDetails(qrCodeId);
        //                 } finally {
        //                     // Restore button state
        //                     button.innerHTML = originalText;
        //                     button.disabled = false;
        //                 }

        //                 // this.viewDetails(qrCodeId);
        //             } else {
        //                 console.error('❌ No QR ID found on button');
        //                 showErrorMessage('Unable to load QR details - missing ID');
        //             }
        //         }

        //         // Future: Add more button types here
        //         if (e.target.closest('.qr-export-btn')) {
        //             e.preventDefault();
        //             const button = e.target.closest('.qr-export-btn');
        //             const qrCodeId = button.dataset.qrId;
                    
        //             if (qrCodeId) {
        //                 this.exportQRData(qrCodeId);
        //             }
        //         }
        //     });
        // }

        // ESC key handler for future modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('qrAnalyticsModal');
                if (modal && modal.style.display === 'block') {
                    this.closeModal();
                }
            }
        });
    }

    // ✅ SEPARATE METHOD FOR TABLE EVENT LISTENERS
    attachTableEventListeners() {
        const qrAnalyticsContainer = document.getElementById('qrAnalyticsContainer');
        if (!qrAnalyticsContainer) {
            console.warn('QR Analytics container not found for event listeners');
            return;
        }

        // ✅ REMOVE EXISTING CLICK LISTENER BEFORE ADDING NEW ONE
        if (this.boundClickHandler) {
            qrAnalyticsContainer.removeEventListener('click', this.boundClickHandler);
        }

        // ✅ CREATE BOUND HANDLER TO PREVENT DUPLICATES
        this.boundClickHandler = async (e) => {
            // Handle QR details button clicks
            if (e.target.closest('.qr-details-btn')) {
                e.preventDefault();
                e.stopPropagation(); // ✅ Prevent event bubbling
                
                const button = e.target.closest('.qr-details-btn');
                
                // ✅ PREVENT MULTIPLE CLICKS WHILE LOADING
                if (button.disabled) {
                    console.log('🚫 Button disabled, ignoring click');
                    return;
                }
                
                const qrCodeId = button.dataset.qrId;
                
                if (qrCodeId) {
                    console.log(`🎯 QR Details clicked: ${qrCodeId}`);
                    
                    // Show loading state on button
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                    button.disabled = true;

                    try {
                        await this.viewDetails(qrCodeId);
                    } finally {
                        // Restore button state
                        button.innerHTML = originalText;
                        button.disabled = false;
                    }
                } else {
                    console.error('❌ No QR ID found on button');
                    showErrorMessage('Unable to load QR details - missing ID');
                }
            }
        };

        // ✅ ATTACH SINGLE EVENT LISTENER
        qrAnalyticsContainer.addEventListener('click', this.boundClickHandler);
        console.log('✅ Table event listeners attached');
    }

    // ✅ CLEANUP METHOD
    destroy() {
        const qrAnalyticsContainer = document.getElementById('qrAnalyticsContainer');
        if (qrAnalyticsContainer && this.boundClickHandler) {
            qrAnalyticsContainer.removeEventListener('click', this.boundClickHandler);
        }
        
        this.eventListenersAttached = false;
        this.boundClickHandler = null;
        console.log('🧹 QR Analytics cleaned up');
    }
    // Future enhancement method
    async exportQRData(qrCodeId) {
        try {
            console.log(`📊 Exporting data for QR: ${qrCodeId}`);
            // TODO: Implement QR-specific export functionality
            showSuccessMessage('QR data export feature coming soon');
        } catch (error) {
            console.error('QR export error:', error);
            showErrorMessage('Failed to export QR data');
        }
    }

    // Future enhancement method
    closeModal() {
        const modal = document.getElementById('qrAnalyticsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async exportAnalytics() {
        try {
            const csvContent = this.generateCSVReport();
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-analytics-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            window.URL.revokeObjectURL(url);
            showSuccessMessage('📁 Analytics exported successfully');
            
        } catch (error) {
            console.error('Export error:', error);
            showErrorMessage('Failed to export analytics');
        }
    }

    generateCSVReport() {
        const headers = ['QR Code Name', 'Destination URL', 'Total Scans', 'Unique Users', 'Last Scan'];
        const rows = this.analytics.qrCodeStats.map(qr => [
            qr.qrCodeName || 'Unnamed',
            qr.originalUrl || '',
            qr.totalScans,
            qr.uniqueUsers,
            this.formatDate(qr.lastScan)
        ]);

       const csvContent = [
            `QR Analytics Overview - ${new Date().toLocaleDateString()}`,
            '',
            `Summary: ${this.analytics.totalCustomQRs} QR Codes, ${this.analytics.totalScans} Total Scans`,
            '',
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }
}

// ✅ SINGLETON PATTERN TO PREVENT MULTIPLE INSTANCES
let qrAnalyticsInstance = null;

function getQRAnalytics() {
    if (!qrAnalyticsInstance) {
        qrAnalyticsInstance = new QRAnalytics();
    }
    return qrAnalyticsInstance;
}

// Create global instance
window.qrAnalytics = new QRAnalytics();

// CSS for QR Analytics Dashboard
const qrAnalyticsCSS = `
.analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.analytics-period {
    font-size: 14px;
    color: #666;
    background: #f5f5f5;
    padding: 4px 8px;
    border-radius: 4px;
    display:none;
}

.analytics-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
}

.stat-card {
    background: white;
   
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
}

.qr-codes-table {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.qr-codes-table table {
    width: 100%;
    border-collapse: collapse;
}

.qr-codes-table th {
    background: #f8f9fa;
    padding: 15px 12px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #dee2e6;
}

.qr-codes-table td {
    padding: 12px;
    border-bottom: 1px solid #f1f3f4;
    color: #6b6b6b;
    font-size: 0.9rem;
    font-weight: 600;
}

.qr-codes-table tr:hover {
    background: #f8f9fa;
}

.qr-name strong {
    color: #333;
}

.qr-url a {
    color: #1a73e8;
    text-decoration: none;
}

.qr-url a:hover {
    text-decoration: underline;
}

.scan-badge {
    background: #28a745;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: #1a73e8;
    color: white;
}

.btn-primary:hover {
    background: #1557b0;
}
/* QR-specific button styles */
.qr-details-btn {
    background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
    color: white;
    border: none;
}

.qr-details-btn:hover {
    background: linear-gradient(135deg, #1557b0 0%, #0d47a1 100%);
    box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3);
}

.qr-export-btn {
    background: linear-gradient(135deg, #28a745 0%, #218838 100%);
    color: white;
    border: none;
}

.qr-export-btn:hover {
    background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}


.qr-details-btn {
    position: relative;
    overflow: hidden;
}
.qr-details-btn:disabled::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
}


.no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 30px;
}
.btn-sm {
        padding: 6px 10px;
        font-size: 0.75rem;
    }
@media (max-width: 768px) {
    .qr-codes-table {
        overflow-x: auto;
    }
    
    .analytics-summary {
        grid-template-columns: 1fr;
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = qrAnalyticsCSS;
document.head.appendChild(style);

export default QRAnalytics;