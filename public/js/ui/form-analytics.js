// Form Analytics Module
// server/public/js/ui/form-analytics.js

import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';

class FormAnalytics {
    constructor() {
        this.currentSubmissions = [];
        this.currentAnalytics = null;
        this.currentStatus = 'all';
        this.isInitialized = false;
        
        console.log('🏗️ FormAnalytics constructor called');
    }

    /**
     * Initialize Form Analytics
     */
    init() {
        if (this.isInitialized) {
            console.log('⚠️ FormAnalytics already initialized, skipping...');
            return;
        }

        console.log('🚀 Initializing FormAnalytics...');
        
        try {
            this.setupEventListeners();
            this.loadFormAnalytics();
            this.isInitialized = true;
            console.log('✅ FormAnalytics initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing FormAnalytics:', error);
        }
    }

    /**
     * Setup event listeners for form analytics UI
     */
    setupEventListeners() {
        console.log('🎛️ Setting up FormAnalytics event listeners...');

        // Submissions Status Filter
        const statusFilter = document.getElementById('formAnalyticsStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.loadSubmissions(e.target.value);
            });
        }

        // Export Submissions Button
        const exportBtn = document.getElementById('formAnalyticsExportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSubmissions());
        }

        // Refresh Analytics Button
        const refreshBtn = document.getElementById('formAnalyticsRefreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadFormAnalytics());
        }

        // Submission Details Modal Close
        const closeModalBtn = document.getElementById('formAnalyticsCloseModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeSubmissionModal());
        }

        // ✅ EVENT DELEGATION for dynamically created submission table buttons
        const submissionsContainer = document.getElementById('formAnalyticsSubmissionsTable');
        if (submissionsContainer) {
            submissionsContainer.addEventListener('click', (e) => {
                // Handle view submission button clicks
                if (e.target.closest('.view-submission-btn')) {
                    e.preventDefault();
                    const button = e.target.closest('.view-submission-btn');
                    const submissionId = button.dataset.submissionId;
                    const newStatus = button.dataset.statusDetails;
                    if (submissionId) {
                        this.viewSubmission(submissionId);
                        // this.changeSubmissionStatus(submissionId, newStatus);
                    } else {
                        console.error('❌ No submission ID found on button');
                    }
                }

                // Handle status change buttons (future enhancement)
                if (e.target.closest('.status-change-btn')) {
                    e.preventDefault();
                    const button = e.target.closest('.status-change-btn');
                    const submissionId = button.dataset.submissionId;
                    const newStatus = button.dataset.status;
                    
                    if (submissionId && newStatus) {
                        this.changeSubmissionStatus(submissionId, newStatus);
                    }
                }
            });
        }

        // Modal background click to close
        const modal = document.getElementById('formAnalyticsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeSubmissionModal();
                }
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('formAnalyticsModal');
                if (modal && modal.style.display === 'block') {
                    this.closeSubmissionModal();
                }
            }
        });
    }

    /**
     * Load complete form analytics data
     */
    async loadFormAnalytics() {
        try {
            console.log('📊 Loading form analytics...');
            
            // Load analytics stats
            await this.loadAnalyticsStats();
            
            // Load submissions table
            await this.loadSubmissions(this.currentStatus);
            
            showSuccessMessage('Form analytics updated');
        } catch (error) {
            console.error('❌ Error loading form analytics:', error);
            showErrorMessage('Failed to load form analytics');
        }
    }

    /**
     * Load form analytics statistics
     */
    async loadAnalyticsStats() {
        try {
            const response = await fetch('/api/forms/config', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.formConfig) {
                this.currentAnalytics = data.formConfig.analytics;
                this.updateAnalyticsDisplay(data.formConfig.analytics);
            }
        } catch (error) {
            console.error('❌ Error loading analytics stats:', error);
        }
    }

    /**
     * Load form submissions with optional status filter
     */
    async loadSubmissions(status = 'all') {
        try {
            console.log(`📝 Loading submissions with status: ${status}`);
            
            this.currentStatus = status;
            
            const response = await fetch(`/api/forms/submissions?status=${status}`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                this.currentSubmissions = data.submissions || [];
                this.renderSubmissionsTable(data.submissions);
                this.updateSubmissionCount(data.submissions, status);
            } else {
                this.renderEmptySubmissions();
                this.updateSubmissionCount([], status);
            }
        } catch (error) {
            console.error('❌ Error loading submissions:', error);
            this.renderEmptySubmissions();
            this.updateSubmissionCount([], status);
        }
    }

    /**
     * Render submissions table
     */
    renderSubmissionsTable(submissions) {
        const container = document.getElementById('formAnalyticsSubmissionsTable');
        
        if (!container) {
            console.error('❌ Submissions table container not found');
            return;
        }

        if (!submissions || submissions.length === 0) {
            this.renderEmptySubmissions();
            return;
        }

        let tableHtml = `
            <div class="form-analytics-table-wrapper">
                <table class="form-analytics-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Contact Info</th>
                            <th>Custom Questions</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        submissions.forEach(submission => {
            const submittedData = this.extractSubmissionData(submission);
            const customResponses = this.extractCustomQuestions(submission);
            const date = new Date(submission.submittedAt).toLocaleDateString();
            const source = submission.context?.triggerType || 'manual';
            
            tableHtml += `
                <tr class="submission-row" data-submission-id="${submission._id}">
                    <td class="submission-date">${date}</td>
                    <td class="submission-contact">
                        <div class="contact-info">
                            <strong>${submittedData.name || 'N/A'}</strong>
                            <div class="contact-details">
                                <div> ${submittedData.email ? `📧 ${submittedData.email}` : ''}</div>
                                <div> ${submittedData.phone ? `📱 ${submittedData.phone}` : ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="submission-custom">
                        <div class="custom-responses">
                            ${customResponses.length > 0 ? 
                                customResponses.slice(0, 2).map(response => 
                                    `<div class="custom-item">
                                        <span class="custom-question">${response.question.substring(0, 30)}${response.question.length > 30 ? '...' : ''}</span>
                                        <span class="custom-answer">${response.response}</span>
                                    </div>`
                                ).join('') 
                                : '<span class="no-custom">No custom questions</span>'
                            }
                            ${customResponses.length > 2 ? `<div class="custom-more">+${customResponses.length - 2} more</div>` : ''}
                        </div>
                    </td>
                    <td class="submission-source">
                        <span class="source-badge ${source}">${this.formatSource(source)}</span>
                    </td>
                    <td class="submission-status">
                        <span class="status-badge ${submission.status}">${submission.status}</span>
                    </td>
                    <td class="submission-actions">
                        <button class="action-btn view-submission-btn" 
                                data-submission-id="${submission._id}" 
                                title="View Details" data-status-details="read">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHtml;
    }

    /**
     * Render empty submissions state
     */
    renderEmptySubmissions() {
        const container = document.getElementById('formAnalyticsSubmissionsTable');
        if (container) {
            container.innerHTML = `
                <div class="empty-submissions">
                    <i class="fas fa-inbox"></i>
                    <h3>No submissions yet</h3>
                    <p>Submissions will appear here when visitors fill out your form</p>
                </div>
            `;
        }
    }

    /**
     * Update submission count display
     */
    updateSubmissionCount(submissions, status) {
        const countElement = document.getElementById('formAnalyticsSubmissionCount');
        if (countElement) {
            const count = submissions ? submissions.length : 0;
            const statusText = status === 'all' ? 'Total' : status.charAt(0).toUpperCase() + status.slice(1);
            
            if (count === 0) {
                countElement.textContent = `No ${status === 'all' ? '' : status + ' '}submissions found`;
                countElement.className = 'no-submissions';
            } else if (count === 1) {
                countElement.textContent = `1 ${statusText} submission`;
                countElement.className = 'has-submissions';
            } else {
                countElement.textContent = `${count} ${statusText} submissions`;
                countElement.className = 'has-submissions';
            }
            
            console.log(`📊 Updated submission count: ${countElement.textContent}`);
        }
    }

    /**
     * Extract submission data safely
     */
    extractSubmissionData(submission) {
        const data = submission.submittedData || {};
        
        // Handle both Map and Object formats
        return {
            name: data.get ? data.get('name') : data.name || '',
            email: data.get ? data.get('email') : data.email || '',
            phone: data.get ? data.get('phone') : data.phone || '',
            notes: data.get ? data.get('notes') : data.notes || ''
        };
    }

    /**
     * Extract custom questions from submission
     */
    extractCustomQuestions(submission) {
        // Check for structured custom questions first (hybrid approach)
        if (submission.customQuestionResponses && submission.customQuestionResponses.length > 0) {
            return submission.customQuestionResponses.map(response => ({
                question: response.question,
                response: response.response,
                type: response.answerType
            }));
        }

        // Fallback: extract from submittedData
        const data = submission.submittedData || {};
        const customQuestions = [];

        // Look for custom question patterns in submittedData
        Object.keys(data).forEach(key => {
            if (typeof key === 'string' && (key.includes('?') || key.startsWith('custom_'))) {
                const value = data.get ? data.get(key) : data[key];
                customQuestions.push({
                    question: key,
                    response: value,
                    type: 'text'
                });
            }
        });

        return customQuestions;
    }

    /**
     * Format trigger source for display
     */
    formatSource(source) {
        const sourceMap = {
            'on_load': 'Page Load',
            'on_click': 'Button Click',
            'on_scroll': 'Scroll',
            'on_exit': 'Exit Intent',
            'manual': 'Manual'
        };
        
        return sourceMap[source] || source;
    }
   
    /**
     * Update submission status in the current table without full reload
     */
    updateSubmissionStatusInTable(submissionId, newStatus) {
        try {
            // Find submission in current data and update status
            const submission = this.currentSubmissions.find(sub => sub._id === submissionId);
            if (submission && submission.status !== newStatus) {
                submission.status = newStatus;
                submission.readAt = new Date();
                
                // Update the status badge in the table
                const statusElement = document.querySelector(`tr[data-submission-id="${submissionId}"] .status-badge`);
                if (statusElement) {
                    statusElement.className = `status-badge ${newStatus}`;
                    statusElement.textContent = newStatus;
                }
                
                console.log(`📊 Updated submission ${submissionId} status to ${newStatus} in table`);
            }
        } catch (error) {
            console.error('❌ Error updating submission status in table:', error);
        }
    }

    /**
     * View detailed submission information
     */
    // async viewSubmission(submissionId) {
    //     try {

    //         const submission = this.currentSubmissions.find(sub => sub._id === submissionId);
            
    //         if (!submission) {
    //             showErrorMessage('Submission not found');
    //             return;
    //         }
    //         const response = await fetch(`/api/forms/submissions/${submissionId}`, {
    //                 method: 'GET',
    //                 credentials: 'include'
    //             });
    //         this.showSubmissionModal(submission);
    //         this.updateSubmissionStatusInTable(submissionId, 'read');
           
    //     } catch (error) {
    //         console.error('❌ Error viewing submission:', error);
    //         showErrorMessage('Failed to load submission details');
    //     }
    // }

    /**
     * View detailed submission information
     */
    async viewSubmission(submissionId) {
        try {
            console.log(`👁️ Viewing submission: ${submissionId}`);
            
            // ✅ Call individual submission endpoint to trigger markAsRead()
            const response = await fetch(`/api/forms/submissions/${submissionId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.submission) {
                this.showSubmissionModal(data.submission);
                
                // ✅ Update the status in the current submissions list
                this.updateSubmissionStatusInTable(submissionId, 'read');
                
                console.log(`✅ Submission ${submissionId} marked as read`);
            } else {
                showErrorMessage(data.message || 'Submission not found');
            }
        } catch (error) {
            console.error('❌ Error viewing submission:', error);
            showErrorMessage('Failed to load submission details');
        }
    }

    /**
     * Show submission details modal
     */
    showSubmissionModal(submission) {
        const submittedData = this.extractSubmissionData(submission);
        const customResponses = this.extractCustomQuestions(submission);
        
        let modalHtml = `
            <div class="submission-details">
                <div class="submission-header">
                    <h3>Submission Details</h3>
                    <p class="submission-date">Submitted: ${new Date(submission.submittedAt).toLocaleString()}</p>
                </div>
                
                <div class="submission-contact-info">
                    <h4><i class="fas fa-user"></i> Contact Information</h4>
                    <div class="contact-grid">
                        ${submittedData.name ? `<div class="contact-item"><strong>Name:</strong> ${submittedData.name}</div>` : ''}
                        ${submittedData.email ? `<div class="contact-item"><strong>Email:</strong> ${submittedData.email}</div>` : ''}
                        ${submittedData.phone ? `<div class="contact-item"><strong>Phone:</strong> ${submittedData.phone}</div>` : ''}
                        ${submittedData.notes ? `<div class="contact-item"><strong>Message:</strong> ${submittedData.notes}</div>` : ''}
                    </div>
                </div>
        `;

        if (customResponses.length > 0) {
            modalHtml += `
                <div class="submission-custom-questions">
                    <h4><i class="fas fa-question-circle"></i> Custom Questions</h4>
                    <div class="custom-responses-grid">
                        ${customResponses.map(response => `
                            <div class="custom-response-item">
                                <div class="custom-question-text">${response.question}</div>
                                <div class="custom-answer-text">${response.response}</div>
                                <div class="custom-answer-type">${response.type}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (submission.visitorInfo) {
            modalHtml += `
                <div class="submission-visitor-info">
                    <h4><i class="fas fa-chart-line"></i> Visitor Information</h4>
                    <div class="visitor-grid">
                        ${submission.visitorInfo.location ? 
                            `<div class="visitor-item"><strong>Location:</strong> ${submission.visitorInfo.location.city || ''}, ${submission.visitorInfo.location.country || ''}</div>` : ''
                        }
                        ${submission.context?.triggerType ? 
                            `<div class="visitor-item"><strong>Source:</strong> ${this.formatSource(submission.context.triggerType)}</div>` : ''
                        }
                        ${submission.context?.timeOnPageSeconds ? 
                            `<div class="visitor-item"><strong>Time on Page:</strong> ${Math.round(submission.context.timeOnPageSeconds)}s</div>` : ''
                        }
                    </div>
                </div>
            `;
        }

        modalHtml += `</div>`;

        const modalContainer = document.getElementById('formAnalyticsModalContent');
        if (modalContainer) {
            modalContainer.innerHTML = modalHtml;
            
            const modal = document.getElementById('formAnalyticsModal');
            if (modal) {
                modal.style.display = 'block';
            }
        }
    }

    /**
     * Close submission details modal
     */
    closeSubmissionModal() {
        const modal = document.getElementById('formAnalyticsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Change submission status (future enhancement)
     */
    async changeSubmissionStatus(submissionId, newStatus) {
        try {
            console.log(`🔄 Changing status for submission ${submissionId} to ${newStatus}`);
            
            const response = await fetch(`/api/forms/submissions/${submissionId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                showSuccessMessage(`Status updated to ${newStatus}`);
                // Reload submissions to reflect changes
                await this.loadSubmissions(this.currentStatus);
            } else {
                showErrorMessage('Failed to update status');
            }
        } catch (error) {
            console.error('❌ Error changing submission status:', error);
            showErrorMessage('Error updating submission status');
        }
    }

    /**
     * Export submissions to CSV
     */
    async exportSubmissions() {
        try {
            if (!this.currentSubmissions || this.currentSubmissions.length === 0) {
                showErrorMessage('No submissions to export');
                return;
            }

            let csv = 'Date,Name,Email,Phone,Status,Source,Location';
            
            // Add custom question headers
            const customQuestionHeaders = new Set();
            this.currentSubmissions.forEach(submission => {
                const customResponses = this.extractCustomQuestions(submission);
                customResponses.forEach(response => {
                    customQuestionHeaders.add(response.question);
                });
            });
            
            customQuestionHeaders.forEach(header => {
                csv += `,${this.sanitizeCSVHeader(header)}`;
            });
            
            csv += '\n';

            this.currentSubmissions.forEach(submission => {
                const data = this.extractSubmissionData(submission);
                const customResponses = this.extractCustomQuestions(submission);
                const customResponsesMap = {};
                
                customResponses.forEach(response => {
                    customResponsesMap[response.question] = response.response;
                });
                
                const row = [
                    new Date(submission.submittedAt).toLocaleDateString(),
                    data.name || '',
                    data.email || '',
                    data.phone || '',
                    submission.status || '',
                    this.formatSource(submission.context?.triggerType || 'manual'),
                    submission.visitorInfo?.location?.city || ''
                ];
                
                // Add custom question responses
                customQuestionHeaders.forEach(header => {
                    row.push(customResponsesMap[header] || '');
                });
                
                csv += row.map(value => `"${(value || '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form-submissions-${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showSuccessMessage('Submissions exported successfully');
        } catch (error) {
            console.error('❌ Export error:', error);
            showErrorMessage('Failed to export submissions');
        }
    }

    /**
     * Sanitize CSV header
     */
    sanitizeCSVHeader(header) {
        return header.replace(/[,"\n]/g, '_').substring(0, 30);
    }

    /**
     * Update analytics display
     */
    updateAnalyticsDisplay(analytics) {
        if (analytics) {
            const viewsElement = document.getElementById('formAnalyticsViews');
            const submissionsElement = document.getElementById('formAnalyticsSubmissions');
            const conversionElement = document.getElementById('formAnalyticsConversion');

            if (viewsElement) viewsElement.textContent = analytics.totalViews || 0;
            if (submissionsElement) submissionsElement.textContent = analytics.totalSubmissions || 0;
            if (conversionElement) conversionElement.textContent = (analytics.conversionRate || 0) + '%';
        }
    }
}

// Export singleton instance
const formAnalytics = new FormAnalytics();

// Export for global access
export default formAnalytics;

// Also make available globally for onclick handlers
if (typeof window !== 'undefined') {
    window.formAnalytics = formAnalytics;
}