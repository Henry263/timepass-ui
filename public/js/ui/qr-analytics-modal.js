// QR Analytics Modal Module
// server/public/js/ui/qr-analytics-modal.js

import { showErrorMessage, showSuccessMessage } from '../ui/notifications.js';

class QRAnalyticsModal {
    constructor() {
        this.currentQRData = null;
        this.profileId = null;
        this.isLoading = false;
        console.log('🎯 QRAnalyticsModal initialized');
    }

    /**
     * Show detailed analytics for a specific QR code
     */
    async showModal(qrCodeId) {
        try {
            console.log(`📊 Opening detailed analytics for QR: ${qrCodeId}`);
            
            if (!qrCodeId) {
                showErrorMessage('Invalid QR code ID');
                return;
            }

            this.isLoading = true;
            this.renderLoadingModal();
            
            // ✅ Load analytics data from single API endpoint
            const analyticsData = await this.loadQRAnalytics(qrCodeId);

            // Store current QR data
            this.currentQRData = {
                qrCodeId,
                analytics: analyticsData.analytics || analyticsData,
                history: analyticsData.history || analyticsData.scanHistory || [],
                summary: analyticsData.summary || {}
            };

            this.renderModal();
            this.isLoading = false;

        } catch (error) {
            console.error('❌ Error opening QR analytics modal:', error);
            showErrorMessage('Failed to load QR analytics');
            this.hideModal();
            this.isLoading = false;
        }
    }

    /**
     * Load QR analytics data from single API endpoint
     */
    async loadQRAnalytics(qrCodeId) {
        try {
            const response = await fetch(`/api/qrana/analytics?qrCodeId=${qrCodeId}&days=30`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message || 'Failed to load analytics');
            }
        } catch (error) {
            console.error('❌ Error loading QR analytics:', error);
            throw error;
        }
    }

    /**
     * Render complete analytics modal
     */
    renderLoadingModal() {
        const modalHtml = `
            <div id="qrAnalyticsModal" class="qr-analytics-modal">
                <div class="qr-analytics-modal-content loading">
                    <div class="modal-loading">
                        <div class="loading-spinner"></div>
                        <h3>Loading QR Analytics...</h3>
                        <p>Gathering detailed scan data and statistics</p>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        this.removeExistingModal();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = document.getElementById('qrAnalyticsModal');
        modal.style.display = 'block';
        
        // Add event listeners
        this.setupModalEventListeners();
    }

    /**
     * Render complete analytics modal
     */
    renderModal() {
        if (!this.currentQRData) {
            this.hideModal();
            return;
        }

        const { qrCodeId, analytics, history, summary } = this.currentQRData;
        
        // Handle different possible response structures
        const qrAnalytics = analytics.analytics?.[0] || analytics[0] || analytics || {};
        const qrHistory = history.history || history || [];
        const qrSummary = summary || analytics.summary || {};

        const modalHtml = `
            <div id="qrAnalyticsModal" class="qr-analytics-modal">
                <div class="qr-analytics-modal-content">
                    ${this.renderModalHeader(qrAnalytics)}
                    ${this.renderAnalyticsStats(qrAnalytics, qrSummary)}
                    ${this.renderScanChart(qrAnalytics)}
                    ${this.renderScanHistory(qrHistory)}
                    ${this.renderModalActions(qrCodeId)}
                </div>
            </div>
        `;

        // Remove existing modal
        this.removeExistingModal();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = document.getElementById('qrAnalyticsModal');
        modal.style.display = 'block';
        
        // Setup event listeners
        this.setupModalEventListeners();
    }

    /**
     * Render modal header
     */
    renderModalHeader(qrAnalytics) {
        const qrName = qrAnalytics._id?.qrCodeName || 'Custom QR Code';
        
        return `
            <div class="qr-modal-header">
                <div class="qr-modal-title">
                    <i class="fas fa-qrcode"></i>
                    <div>
                        <h2>${qrName}</h2>
                        <p class="qr-modal-subtitle">Detailed Analytics & Scan History</p>
                    </div>
                </div>
                <button class="qr-modal-close" id="qrModalClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    /**
     * Render analytics statistics
     */
    renderAnalyticsStats(qrAnalytics, summary) {
        const totalScans = qrAnalytics.totalScans || 0;
        const uniqueUsers = qrAnalytics.uniqueUsers || 0;
        const dailyScans = qrAnalytics.dailyScans || [];
        
        // Calculate average scans per day
        const avgScansPerDay = dailyScans.length > 0 ? 
            Math.round(totalScans / Math.max(1, dailyScans.length)) : 0;
        
        // Get peak day
        const peakDay = dailyScans.reduce((max, day) => 
            day.scans > (max?.scans || 0) ? day : max, null);

        return `
            <div class="qr-analytics-stats">
                <div class="stats-grid">
                    <div class="stat-card primary">
                        <div class="stat-icon-qrana">
                            <i class="fas fa-eye"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${totalScans}</div>
                            <div class="stat-label">Total Scans</div>
                        </div>
                    </div>
                    
                    <div class="stat-card secondary">
                        <div class="stat-icon-qrana">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${uniqueUsers}</div>
                            <div class="stat-label">Unique Visitors</div>
                        </div>
                    </div>
                    
                    <div class="stat-card accent">
                        <div class="stat-icon-qrana">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${avgScansPerDay}</div>
                            <div class="stat-label">Avg. Daily Scans</div>
                        </div>
                    </div>
                    
                    <div class="stat-card highlight">
                        <div class="stat-icon-qrana">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${peakDay?.scans || 0}</div>
                            <div class="stat-label">Peak Day Scans</div>
                            ${peakDay ? `<div class="stat-meta">${peakDay.date}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render scan chart visualization
     */
    renderScanChart(qrAnalytics) {
        const dailyScans = qrAnalytics.dailyScans || [];
        
        if (dailyScans.length === 0) {
            return `
                <div class="qr-scan-chart">
                    <h3><i class="fas fa-chart-area"></i> Scan Activity</h3>
                    <div class="no-chart-data">
                        <i class="fas fa-chart-line"></i>
                        <p>No scan data available for chart visualization</p>
                    </div>
                </div>
            `;
        }

        // Create simple bar chart with CSS
        const maxScans = Math.max(...dailyScans.map(day => day.scans));
        const chartBars = dailyScans.slice(-14).map(day => { // Last 14 days
            const height = maxScans > 0 ? (day.scans / maxScans) * 100 : 0;
            const date = new Date(day.date);
            const shortDate = date.getMonth() + 1 + '/' + date.getDate();
            
            return `
                <div class="chart-bar-wrapper" title="${day.scans} scans on ${day.date}">
                    <div class="chart-bar" style="height: ${height}%">
                        <div class="bar-value">${day.scans}</div>
                    </div>
                    <div class="chart-label">${shortDate}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="qr-scan-chart">
                <h3><i class="fas fa-chart-area"></i> Scan Activity (Last 14 Days)</h3>
                <div class="chart-container">
                    <div class="chart-bars">
                        ${chartBars}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render recent scan history
     */
    renderScanHistory(historyData) {
        // Handle different possible data structures
        const history = Array.isArray(historyData) ? historyData : 
                       historyData?.history || historyData?.scanHistory || [];
        
        if (!history || history.length === 0) {
            return `
                <div class="qr-scan-history">
                    <h3><i class="fas fa-history"></i> Recent Scans</h3>
                    <div class="no-history-data">
                        <i class="fas fa-calendar-times"></i>
                        <p>No recent scan history available</p>
                    </div>
                </div>
            `;
        }

        const historyRows = history.slice(0, 10).map(scan => {
            const scanDate = new Date(scan.createdAt || scan.timestamp);
            const location = scan.location ? 
                `${scan.location.city || 'Unknown'}, ${scan.location.country || 'Unknown'}` : 
                'Unknown Location';
            
            const device = this.parseDeviceInfo(scan.device);
            
            return `
                <tr class="history-row">
                    <td class="scan-time">
                        <div class="time-info">
                            <span class="date">${scanDate.toLocaleDateString()}</span>
                            <span class="time">${scanDate.toLocaleTimeString()}</span>
                        </div>
                    </td>
                    <td class="scan-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${location}
                    </td>
                    <td class="scan-device">
                        <i class="fas fa-${device.icon}"></i>
                        ${device.name}
                    </td>
                    <td class="scan-ip">
                        <code>${scan.ip || 'Unknown'}</code>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="qr-scan-history">
                <h3><i class="fas fa-history"></i> Recent Scans</h3>
                <div class="history-table-wrapper">
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Location</th>
                                <th>Device</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historyRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Render modal action buttons
     */
    renderModalActions(qrCodeId) {
        return `
            <div class="qr-modal-actions">
                <button class="qr-action-btn secondary" id="qrExportData" data-qr-id="${qrCodeId}">
                    <i class="fas fa-download"></i> Export Data
                </button>
                <button class="qr-action-btn primary" id="qrRefreshData" data-qr-id="${qrCodeId}">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
        `;
    }

    /**
     * Parse device information for display
     */
    parseDeviceInfo(device) {
        if (!device) {
            return { name: 'Unknown Device', icon: 'desktop' };
        }

        if (device.isMobile) {
            return { name: 'Mobile Device', icon: 'mobile-alt' };
        } else if (device.isTablet) {
            return { name: 'Tablet', icon: 'tablet-alt' };
        } else {
            return { name: 'Desktop', icon: 'desktop' };
        }
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        // Close modal events
        const closeBtn = document.getElementById('qrModalClose');
        const modal = document.getElementById('qrAnalyticsModal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Export data button
        const exportBtn = document.getElementById('qrExportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalyticsData());
        }

        // Refresh data button
        const refreshBtn = document.getElementById('qrRefreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                const qrCodeId = refreshBtn.dataset.qrId;
                this.showModal(qrCodeId);
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('qrAnalyticsModal')) {
                this.hideModal();
            }
        });
    }

    /**
     * Export analytics data as CSV
     */
    async exportAnalyticsData() {
        try {
            if (!this.currentQRData) {
                showErrorMessage('No data to export');
                return;
            }

            const { analytics, history, summary } = this.currentQRData;
            
            // Handle different possible response structures
            const qrAnalytics = analytics.analytics?.[0] || analytics[0] || analytics || {};
            const qrHistory = Array.isArray(history) ? history : 
                             history?.history || history?.scanHistory || [];
            const qrSummary = summary || analytics.summary || {};
            
            const qrName = qrAnalytics._id?.qrCodeName || qrAnalytics.qrCodeName || 'Custom QR Code';

            // Create CSV content
            let csvContent = 'QR Code Analytics Export\n\n';
            csvContent += `QR Code Name,${qrName}\n`;
            csvContent += `Total Scans,${qrAnalytics.totalScans || 0}\n`;
            csvContent += `Unique Users,${qrAnalytics.uniqueUsers || 0}\n`;
            csvContent += `Export Date,${new Date().toLocaleString()}\n\n`;

            // Daily scans data
            csvContent += 'Daily Scan History\n';
            csvContent += 'Date,Scans,Unique Users\n';
            
            if (qrAnalytics.dailyScans) {
                qrAnalytics.dailyScans.forEach(day => {
                    csvContent += `${day.date},${day.scans},${day.uniqueUsers || 0}\n`;
                });
            }

            csvContent += '\nRecent Scan Details\n';
            csvContent += 'Date,Time,Location,Device,IP Address\n';
            
            if (qrHistory) {
                qrHistory.forEach(scan => {
                    const scanDate = new Date(scan.createdAt || scan.timestamp);
                    const location = scan.location ? 
                        `"${scan.location.city || 'Unknown'}, ${scan.location.country || 'Unknown'}"` : 
                        'Unknown Location';
                    const device = this.parseDeviceInfo(scan.device);
                    
                    csvContent += `${scanDate.toLocaleDateString()},${scanDate.toLocaleTimeString()},"${location}","${device.name}",${scan.ip || 'Unknown'}\n`;
                });
            }

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-analytics-${qrName.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.csv`;
            a.click();
            
            window.URL.revokeObjectURL(url);
            showSuccessMessage('Analytics data exported successfully');

        } catch (error) {
            console.error('❌ Error exporting analytics data:', error);
            showErrorMessage('Failed to export analytics data');
        }
    }

    /**
     * Hide the modal
     */
    hideModal() {
        this.removeExistingModal();
        this.currentQRData = null;
    }

    /**
     * Remove existing modal from DOM
     */
    removeExistingModal() {
        const existingModal = document.getElementById('qrAnalyticsModal');
        if (existingModal) {
            existingModal.remove();
        }
    }
}

// Export singleton instance
const qrAnalyticsModal = new QRAnalyticsModal();
export default qrAnalyticsModal;

// Make available globally for the QR Analytics component
if (typeof window !== 'undefined') {
    window.qrAnalyticsModal = qrAnalyticsModal;
}