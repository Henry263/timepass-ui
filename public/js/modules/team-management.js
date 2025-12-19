// modules/team-management.js
// Team Management Module - Integrated with existing ConnectiKo structure

import { api } from '../core/api-client.js';
import { getCurrentUser } from '../core/auth.js';
import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';
import { showLoadingMessage, hideLoadingMessage } from '../utils/helpers.js';
import {updateURL, showPage, setActiveNavItem} from '../ui/navigation.js'
// modules/team-management.js
// Team Management Module - FIXED VERSION with proper headers

// import { api } from '../core/api-client.js';
// import { getCurrentUser } from '../core/auth.js';
// import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';

class TeamManagement {
    constructor() {
        this.currentTeam = null;
        this.members = [];
        this.cards = [];
        this.initialized = false;
        this.currentUser = null;
        this.userPermissions = null;
    }

    async loadUserPermissions() {
        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/permissions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            console.log("loadUserPermissions 2: ", data);
            if (data.success) {
                this.userPermissions = data.permissions;
                console.log("true conditions 2: ", data.permissions);
                this.updateUIBasedOnPermissions();
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
        }
    }

    async managerRoleUI() {
        await this.loadDashboard();
        await this.loadMembers();
        $('#teamMetrics').show();
        $('[data-tab="members"]').show();
        // $('[data-tab="analytics"]').hide();
        $('#membersTab').addClass('active');
        $('#membersTab').siblings().removeClass('active')
    }

    defaultDivPosiiton(flag) {
        if (flag) {
            $('#teamcreationdiv').hide();
            $('#addMemberBtn').hide();
            $('#bulkImportBtn').hide();
            $('#teamMetrics').hide();

            $('#exportCardsBtn').hide();

            $('[data-tab="members"]').hide();
            $('[data-tab="activity"]').hide();
            $('[data-tab="settings"]').hide();
            $('#cardsTab').addClass('active');
            $('#cardsTab').siblings().removeClass('active')
        } else {
            $('#teamcreationdiv').show();
            $('#addMemberBtn').show();
            $('#bulkImportBtn').show();
            $('#teamMetrics').show();

            $('#exportCardsBtn').show();

            $('[data-tab="members"]').show();
            $('[data-tab="activity"]').show();
            $('[data-tab="settings"]').show();
            $('#membersTab').addClass('active');
            $('#membersTab').siblings().removeClass('active')
        }
    }
    // Update UI based on user permissions
    async updateUIBasedOnPermissions() {


        await this.loadCards();
        
        this.defaultDivPosiiton(true)
        console.log("updateUIBasedOnPermissions: ", 3);
        if (!this.userPermissions) return;



        // Hide/show "Add Member" button
        if (this.userPermissions.canManageMembers) {

        }

        // Hide/show analytics tab
        if (this.userPermissions.canViewAnalytics && this.userPermissions.canEditOwnProfile) {
            this.managerRoleUI()

        }

        // Hide/show templates management
        // if (this.userPermissions.canManageTemplates) {
        //     $('[data-tab="templates"]').hide();
        //     $('.btn-create-template').hide();
        // }

        // Hide/show bulk edit options
        if (this.userPermissions.canViewAnalytics && this.userPermissions.canEditOwnProfile && this.userPermissions.canManageMembers) {
            this.managerRoleUI()
            await this.loadActivity();
            $('[data-tab="activity"]').show();
            $('#teamcreationdiv').show();
            $('#addMemberBtn').show();
            $('[data-tab="settings"]').show();

        }

        // Hide/show settings
        // if (this.userPermissions.role !== 'super_admin' && this.userPermissions.role !== 'admin') {
        //     $('[data-tab="settings"]').hide();
        // }

        if (this.userPermissions.canViewAnalytics &&
            this.userPermissions.canEditOwnProfile &&
            this.userPermissions.canManageMembers &&
            this.userPermissions.canBulkEdit) {
            this.defaultDivPosiiton(false)
            await this.loadActivity();

        }
        // Update member action buttons
        this.updateMemberActionButtons();
    }

    // Update member list action buttons based on permissions
    updateMemberActionButtons() {
        if (!this.userPermissions.canManageMembers) {
            $('.action-btns .btn-edit').hide();
            $('.action-btns .btn-delete').hide();
            $('.action-btns .btn-role').hide();
        }
    }

    // Check permission before action
    hasPermission(permission) {
        if (!this.userPermissions) return false;
        return this.userPermissions[permission] === true || this.userPermissions.isOwner;
    }
    // Helper method to get common fetch options
    getFetchOptions(method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Important for session cookies
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        return options;
    }

    async init() {
        // if (this.initialized) {
        //     this.refresh();
        //     return;
        // }

        // console.log('Initializing Team Management...');
        // this.setupEventListeners();
        // await this.loadTeams();
        // await this.loadUserPermissions();

        // this.initialized = true;
    }

    async refresh() {
        if (this.currentTeam) {
            await this.loadDashboard();
            await this.loadMembers();
        }
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Team selector
        $('#teamSelector').on('change', (e) => {
            this.selectTeam(e.target.value);
        });

        // Create team button
        $('#createTeamBtn').on('click', () => {
            this.openModal('createTeamModal');
        });

        $('#submitCreateTeam').on('click', () => {
            this.createTeam();
        });

        // Add member button
        $('#addMemberBtn').on('click', () => {
            this.openModal('addMemberModal');
        });

        $('#clickAddMember').on('click', () => {
            this.addMember();
        });

        // Bulk import
        $('#bulkImportBtn').on('click', () => {
            this.openModal('bulkImportModal');
        });

        $('#browseCsvBtn').on('click', () => {
            $('#csvFileInput').click();
        });

        $('#csvFileInput').on('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        $('#submitBulkImport').on('click', () => {
            this.bulkImportMembers();
        });

        // Tab navigation
        $('.team-tab').on('click', (e) => {
            const tab = $(e.currentTarget).data('tab');
            this.switchTab(tab);
        });

        // Search and filters
        $('#memberSearch').on('input', () => {
            this.filterMembers();
        });

        $('#statusFilter, #roleFilter').on('change', () => {
            this.filterMembers();
        });

        // Save settings
        $('#saveSettingsBtn').on('click', () => {
            this.saveSettings();
        });

        // Modal close buttons
        $('.modal-close, .modal .btn-secondary').on('click', function () {
            const modal = $(this).data('modal') || $(this).closest('.modal').attr('id');
            if (modal) {
                $(`#${modal}`).removeClass('show');
            }
        });

        // Download CSV template
        $('#downloadTemplateBtn').on('click', (e) => {
            e.preventDefault();
            this.downloadCsvTemplate();
        });
    }

    // Load Teams - FIXED with proper headers
    async loadTeams() {
        try {
            // await this.loadUserPermissions();
            const response = await fetch('/api/team/my-teams', this.getFetchOptions('GET'));
            const data = await response.json();

            if (data.success && data.teams) {
                this.populateTeamSelector(data.teams);

                if (data.teams.length > 0) {
                    this.currentTeam = data.teams[0];
                    $('#teamSelector').val(this.currentTeam._id);
                    await this.selectTeam(this.currentTeam._id);
                }
            }
            // await this.loadUserPermissions();
        } catch (error) {
            console.error('Failed to load teams:', error);
            showErrorMessage('Failed to load teams');
        }
    }

    populateTeamSelector(teams) {
        const selector = $('#teamSelector');
        selector.empty();

        if (teams.length === 0) {
            selector.append('<option value="">No teams found</option>');
        } else {
            teams.forEach(team => {
                selector.append(`<option value="${team._id}">${team.name}</option>`);
            });
        }
    }

    // Select Team
    async selectTeam(teamId) {
        if (!teamId) return;
        console.log("4", teamId);
        this.currentTeam = { _id: teamId };

        // await this.loadDashboard();
        // await this.loadMembers();
        // await this.loadCards();
        // await this.loadActivity();
    }

    // Load Dashboard - FIXED
    async loadDashboard() {
        try {
            const response = await fetch(
                `/api/team/${this.currentTeam._id}/dashboard`,
                this.getFetchOptions('GET')
            );
            const data = await response.json();

            if (data.success && data.dashboard) {
                this.updateMetrics(data.dashboard.metrics);
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    }

    updateMetrics(metrics) {
        $('#totalMembers').text(metrics.totalMembers || 0);
        $('#activeCards').text(metrics.activeCards || 0);
        $('#totalShares').text(this.formatNumber(metrics.totalShares || 0));
        $('#totalViews').text(this.formatNumber(metrics.totalViews || 0));
    }

    // Load Members - FIXED
    async loadMembers() {
        try {
            const response = await fetch(
                `/api/team/${this.currentTeam._id}/members`,
                this.getFetchOptions('GET')
            );
            const data = await response.json();

            if (data.success && data.members) {
                this.members = data.members;
                this.renderMembers(data.members);
            }
        } catch (error) {
            console.error('Failed to load members:', error);
            $('#membersTableBody').html(`
                <tr>
                    <td colspan="6" class="error-cell">
                        Failed to load members. Please try again.
                    </td>
                </tr>
            `);
        }
    }


    // ============================================
    // NEW: Resend Invitation
    // ============================================
    async resendInvitation(email) {
        if (!confirm(`Resend invitation to ${email}?`)) return;

        try {
            showLoadingMessage('Resending invitation...');

            const response = await fetch(`/api/team/${this.currentTeam._id}/invitations/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Invitation resent successfully!');
            } else {
                showErrorMessage(data.message || 'Failed to resend invitation');
            }
        } catch (error) {
            console.error('Error resending invitation:', error);
            showErrorMessage('Failed to resend invitation');
        } finally {
            hideLoadingMessage();
        }
    }

    // ============================================
    // NEW: Revoke Invitation
    // ============================================
    async revokeInvitation(email) {
        if (!confirm(`Revoke invitation for ${email}? This cannot be undone.`)) return;

        try {
            showLoadingMessage('Revoking invitation...');

            const response = await fetch(`/api/team/${this.currentTeam._id}/invitations/revoke`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Invitation revoked successfully');
                await this.loadMembers(); // Reload members list
            } else {
                showErrorMessage(data.message || 'Failed to revoke invitation');
            }
        } catch (error) {
            console.error('Error revoking invitation:', error);
            showErrorMessage('Failed to revoke invitation');
        } finally {
            hideLoadingMessage();
        }
    }

    // ============================================
    // NEW: Get Pending Invitations
    // ============================================
    async loadPendingInvitations() {
        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/invitations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                return data.invitations;
            } else {
                console.error('Failed to load invitations:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error loading invitations:', error);
            return [];
        }
    }
    // Edit Member - Navigate to profile page
    async editMember(memberId) {
        try {
            // Store the member ID being edited for the profile page to check
            sessionStorage.setItem('editingMemberId', memberId);
            
            // Navigate to profile page
            updateURL("profile")
            showPage('profile');
            setActiveNavItem("profile")
            showSuccessMessage('Opening member profile for editing...');
            
        } catch (error) {
            console.error('Failed to open member profile:', error);
            showErrorMessage('Failed to open member profile');
        }
    }
    // Update the renderMembers method to show invitation status
    renderMembers(members) {
        if (!members || members.length === 0) {
            $('#membersTableBody').html('<tr><td colspan="6" class="empty-state">No members found</td></tr>');
            return;
        }

        const html = members.map(member => {
            // Determine if this is an invited member
            const isInvited = member.accountStatus === 'invited' || member.status === 'pending';
            const statusClass = isInvited ? 'status-invited' : 'status-active';
            const statusText = isInvited ? '✉️ Invited' : '✓ Active';

            return `
                <tr data-member-id="${member.userId._id || member.userId.slug}">
                    <td>
                        <div class="member-info">
                            ${this.getMemberAvatar(member.userId)}
                            <div>
                                <div class="member-name">${this.escapeHtml(member.userId.name)}</div>
                                <div class="member-email">${this.escapeHtml(member.userId.email)}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="role-badge role-${member.role}">${this.formatRole(member.role)}</span></td>
                    
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${member.joinedAt ? this.formatTimeAgo(member.joinedAt) : 'Pending'}</td>
                    <td>${member.lastActive ? this.formatTimeAgo(member.lastActive) : 'Never'}</td>
                    <td class="action-btns">
                        ${isInvited ?
                    `<button class="btn-icon btn-resend-invitation" data-email="${this.escapeHtml(member.userId.email)}" title="Resend Invitation">
                                <i class="fas fa-envelope"></i>
                            </button>
                            <button class="btn-icon btn-danger btn-revoke-invitation" data-email="${this.escapeHtml(member.userId.email)}" title="Revoke Invitation">
                                <i class="fas fa-times"></i>
                            </button>` :
                    `<button class="btn-icon btn-edit-member" data-member-id="${member.userId._id || member.userId.slug}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger btn-remove-member" data-member-id="${member.userId._id || member.userId.slug}" title="Remove">
                                <i class="fas fa-trash"></i>
                            </button>`
                }
                    </td>
                </tr>
            `;
        }).join('');

        $('#membersTableBody').html(html);
        
        // Attach event listeners using event delegation
        this.attachMemberActionListeners();
    }

    attachMemberActionListeners() {
        // Remove any existing listeners to prevent duplicates
        $('#membersTableBody').off('click', '.btn-resend-invitation');
        $('#membersTableBody').off('click', '.btn-revoke-invitation');
        $('#membersTableBody').off('click', '.btn-edit-member');
        $('#membersTableBody').off('click', '.btn-remove-member');
        
        // Resend invitation button
        $('#membersTableBody').on('click', '.btn-resend-invitation', (e) => {
            const email = $(e.currentTarget).data('email');
            this.resendInvitation(email);
        });
        
        // Revoke invitation button
        $('#membersTableBody').on('click', '.btn-revoke-invitation', (e) => {
            const email = $(e.currentTarget).data('email');
            this.revokeInvitation(email);
        });
        
        // Edit member button
        $('#membersTableBody').on('click', '.btn-edit-member', (e) => {
            const memberId = $(e.currentTarget).data('member-id');
            this.editMember(memberId);
        });
        
        // Remove member button
        $('#membersTableBody').on('click', '.btn-remove-member', (e) => {
            const memberId = $(e.currentTarget).data('member-id');
            this.removeMember(memberId);
        });
    }

    filterMembers() {
        const search = $('#memberSearch').val().toLowerCase();
        const statusFilter = $('#statusFilter').val();
        const roleFilter = $('#roleFilter').val();

        let filtered = this.members.filter(member => {
            const matchesSearch = !search ||
                member.userId.name.toLowerCase().includes(search) ||
                member.userId.email.toLowerCase().includes(search);

            const matchesStatus = !statusFilter || member.status === statusFilter;
            const matchesRole = !roleFilter || member.role === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });

        this.renderMembers(filtered);
    }

    // Load Cards - FIXED
    async loadCards() {
        try {
            const response = await fetch(
                `/api/team/${this.currentTeam._id}/cards`,
                this.getFetchOptions('GET')
            );
            const data = await response.json();

            if (data.success && data.cards) {
                this.cards = data.cards;
                this.renderCards(data.cards);
            }
        } catch (error) {
            console.error('Failed to load cards:', error);
            $('#cardsGrid').html('<div class="error-message">Failed to load cards</div>');
        }
    }

    renderCards(cards) {
        const grid = $('#cardsGrid');

        if (!cards || cards.length === 0) {
            grid.html('<div class="empty-state">No cards found</div>');
            return;
        }
        // <img src="${card.profilePhoto || '/images/default-avatar.png'}" 
        // alt="${card.personalInfo.firstName} ${card.personalInfo.lastName}">
        const html = cards.map(card => `
            <div class="card-item">
                <div class="card-preview">
                    ${this.getMemberAvatar(card)}
                   
                </div>
                <div class="card-info">
                    <h4>${this.escapeHtml(card.name)}</h4>
                    <p>${this.escapeHtml(card.title || '')}</p>
                    <div class="card-stats">
                        <span><i class="fas fa-eye"></i> ${card.analytics.views || 0}</span>
                        <span><i class="fas fa-share-alt"></i> ${card.analytics.shares || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');

        grid.html(html);
    }

    // Load Activity - FIXED
    async loadActivity() {
        try {
            const response = await fetch(
                `/api/team/${this.currentTeam._id}/activity`,
                this.getFetchOptions('GET')
            );
            const data = await response.json();

            if (data.success && data.activities) {
                this.renderActivity(data.activities);
            }
        } catch (error) {
            console.error('Failed to load activity:', error);
            $('#activityFeed').html('<div class="error-message">Failed to load activity</div>');
        }
    }

    renderActivity(activities) {
        const feed = $('#activityFeed');

        if (!activities || activities.length === 0) {
            feed.html('<div class="empty-state">No recent activity</div>');
            return;
        }

        const html = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${this.formatActivityText(activity)}</div>
                    <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');

        feed.html(html);
    }

    // Create Team - FIXED with proper headers
    async createTeam() {
        if (!this.hasPermission('canManageMembers')) {
            this.showErrorMessage('You do not have permission to create teams');
            return;
        }
        const name = $('#newTeamName').val().trim();
        const organization = $('#newTeamOrg').val().trim();
        const currentuser = getCurrentUser();
        console.log("current user: ", currentuser);
        if (!name) {
            showErrorMessage('Team name is required');
            return;
        }

        try {
            const response = await fetch('/api/team/create',
                this.getFetchOptions('POST', {
                    name,
                    email: currentuser.email,
                    organization: { name: organization }
                })
            );

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Team created successfully!');
                $('#createTeamForm')[0].reset();
                this.closeModal('createTeamModal');

                await this.loadTeams();
            } else {
                showErrorMessage(data.message || 'Failed to create team');
            }
        } catch (error) {
            console.error('Failed to create team:', error);
            showErrorMessage('Failed to create team');
        }
    }

    // Add Member - FIXED
    async addMember() {
        if (!this.hasPermission('canManageMembers')) {
            this.showErrorMessage('You do not have permission to add members');
            return;
        }
        const email = $('#memberEmail').val().trim();
        const role = $('#memberRole').val();
        const department = $('#memberDepartment').val().trim();

        if (!email) {
            showErrorMessage('Email is required');
            return;
        }

        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/members`,
                this.getFetchOptions('POST', { email, role, department })
            );

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Member added successfully!');
                this.closeModal('addMemberModal');
                $('#addMemberForm')[0].reset();
                await this.loadMembers();
                await this.loadDashboard();
            } else {
                showErrorMessage(data.message || 'Failed to add member');
            }
        } catch (error) {
            console.error('Failed to add member:', error);
            showErrorMessage('Failed to add member');
        }
    }

    // Remove Member - FIXED
    async removeMember(memberId) {
        if (!this.hasPermission('canManageMembers')) {
            this.showErrorMessage('You do not have permission to remove members');
            return;
        }
        if (!confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/members/${memberId}`,
                this.getFetchOptions('DELETE')
            );

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Member removed successfully!');
                await this.loadMembers();
                await this.loadDashboard();
            } else {
                showErrorMessage(data.message || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Failed to remove member:', error);
            showErrorMessage('Failed to remove member');
        }
    }

    // Edit Member Role - FIXED
    async editMemberRole(memberId) {
        if (!this.hasPermission('canManageMembers')) {
            this.showErrorMessage('You do not have permission to create teams');
            return;
        }
        const newRole = prompt('Enter new role (member, manager, admin, super_admin):');

        if (!newRole) return;

        const validRoles = ['member', 'manager', 'admin', 'super_admin'];
        if (!validRoles.includes(newRole)) {
            showErrorMessage('Invalid role');
            return;
        }

        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/members/${memberId}/role`,
                this.getFetchOptions('POST', { role: newRole })
            );

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Role updated successfully!');
                await this.loadMembers();
            } else {
                showErrorMessage(data.message || 'Failed to update role');
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            showErrorMessage('Failed to update role');
        }
    }

    // Bulk Import
    handleFileUpload(file) {
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            showErrorMessage('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            this.parseCsv(csv);
            $('#submitBulkImport').prop('disabled', false);
        };
        reader.readAsText(file);
    }

    parseCsv(csv) {
        const lines = csv.split('\n');
        const members = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [email, name, role, department] = line.split(',').map(s => s.trim());

            if (email) {
                members.push({ email, name, role: role || 'member', department });
            }
        }

        this.csvMembers = members;
        console.log('Parsed members:', members);
    }

    // Bulk Import Members - FIXED
    async bulkImportMembers() {
        if (!this.hasPermission('canManageMembers')) {
            this.showErrorMessage('You do not have permission to bulk import');
            return;
        }
        if (!this.csvMembers || this.csvMembers.length === 0) {
            showErrorMessage('No members to import');
            return;
        }

        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/bulk/import`,
                this.getFetchOptions('POST', { members: this.csvMembers })
            );

            const data = await response.json();

            if (data.success) {
                const { success, failed } = data.results;
                showSuccessMessage(`Imported ${success.length} members. ${failed.length} failed.`);
                this.closeModal('bulkImportModal');
                this.csvMembers = null;
                $('#csvFileInput').val('');
                $('#submitBulkImport').prop('disabled', true);
                await this.loadMembers();
                await this.loadDashboard();
            } else {
                showErrorMessage(data.message || 'Failed to import members');
            }
        } catch (error) {
            console.error('Failed to import members:', error);
            showErrorMessage('Failed to import members');
        }
    }

    downloadCsvTemplate() {
        const csv = 'email,name,role,department\n' +
            'john@example.com,John Doe,member,Sales\n' +
            'jane@example.com,Jane Smith,manager,Marketing\n';

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'team-import-template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Save Settings - FIXED
    async saveSettings() {
        const name = $('#teamNameInput').val().trim();
        const organization = $('#organizationInput').val().trim();
        const requireApproval = $('#requireApproval').is(':checked');

        try {
            const response = await fetch(`/api/team/${this.currentTeam._id}/settings`,
                this.getFetchOptions('PUT', {
                    name,
                    organization: { name: organization },
                    settings: { requireApproval }
                })
            );

            const data = await response.json();

            if (data.success) {
                showSuccessMessage('Settings saved successfully!');
                await this.loadTeams();
            } else {
                showErrorMessage(data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            showErrorMessage('Failed to save settings');
        }
    }

    // Tab Navigation
    switchTab(tabName) {
        $('.team-tab').removeClass('active');
        $(`.team-tab[data-tab="${tabName}"]`).addClass('active');

        $('.tab-pane').removeClass('active');
        $(`#${tabName}Tab`).addClass('active');
    }

    // Modal Management
    openModal(modalId) {
        $(`#${modalId}`).addClass('show');
    }

    // closeModal(modalId) {
    //     $(`#${modalId}`).removeClass('show');
    // }
    // Close modal helper
    closeModal(modalId) {
        $(`#${modalId}`).remove();
    }

    // Utility Functions
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    // Add method to get member avatar
    getMemberAvatar(member) {
        if (member.hasProfilePhoto) {
            return `<img src="${member.profilePhoto}" alt="${member.name}" class="team-memnber-avtar">`;
        } else {
            const initials = this.getInitials(member.name);
            return `<div class="team-memnber-avtar">${initials}</div>`;
        }
    }

    // Format time ago
    formatTimeAgo(date) {
        if (!date) return 'Never';

        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

        return past.toLocaleDateString();
    }

    // formatRole(role) {
    //     const roles = {
    //         'super_admin': 'Super Admin',
    //         'admin': 'Admin',
    //         'manager': 'Manager',
    //         'member': 'Member',
    //         'viewer': 'Viewer'
    //     };
    //     return roles[role] || role;
    // }


    // Get initials from name
    getInitials(name) {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    // Format role for display
    formatRole(role) {
        if (!role) return 'Member';
        return role.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    getActivityIcon(action) {
        const icons = {
            'TEAM_CREATED': 'fas fa-plus-circle',
            'MEMBER_ADDED': 'fas fa-user-plus',
            'MEMBER_REMOVED': 'fas fa-user-minus',
            'MEMBER_UPDATED': 'fas fa-user-edit',
            'MEMBER_ROLE_CHANGED': 'fas fa-user-shield'
        };
        return icons[action] || 'fas fa-circle';
    }

    formatActivityText(activity) {
        return activity.action.replace(/_/g, ' ').toLowerCase();
    }

    // escapeHtml(text) {
    //     if (!text) return '';
    //     const div = document.createElement('div');
    //     div.textContent = text;
    //     return div.innerHTML;
    // }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }


    // Update the add member modal to show invitation info
    showAddMemberModal() {
        if (!this.hasPermission('canManageMembers')) {
            this.showErrorMessage('You do not have permission to add members');
            return;
        }
        const modalHtml = `
            <div class="modal show" id="addMemberModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Add Team Member</h3>
                            <button class="modal-close" data-modal="addMemberModal">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="info-box" style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                                <i class="fas fa-info-circle" style="color: #1976d2;"></i>
                                <strong>Note:</strong> If the email doesn't exist in our system, we'll send them an invitation to join.
                            </div>
                            <form id="addMemberForm">
                                <div class="form-group">
                                    <label for="memberEmail">Email Address *</label>
                                    <input type="email" id="memberEmail" class="form-control" required 
                                        placeholder="member@company.com">
                                </div>
                                <div class="form-group">
                                    <label for="memberRole">Role *</label>
                                    <select id="memberRole" class="form-control" required>
                                        <option value="member">Member</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="memberDepartment">Department</label>
                                    <input type="text" id="memberDepartment" class="form-control" 
                                        placeholder="e.g., Engineering, Sales">
                                </div>
                                <div class="form-group">
                                    <label for="memberPosition">Position</label>
                                    <input type="text" id="memberPosition" class="form-control" 
                                        placeholder="e.g., Software Engineer">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary btn-cancel-modal" data-modal="addMemberModal">Cancel</button>
                            <button class="btn btn-primary btn-submit-add-member">
                                <i class="fas fa-user-plus"></i> Add Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(modalHtml);
        
        // Attach event listeners for modal buttons
        this.attachModalListeners();
    }

    attachModalListeners() {
        // Close button
        $('.modal-close, .btn-cancel-modal').off('click').on('click', (e) => {
            const modalId = $(e.currentTarget).data('modal');
            if (modalId) {
                this.closeModal(modalId);
            }
        });
        
        // Submit add member button
        $('.btn-submit-add-member').off('click').on('click', () => {
            this.submitAddMember();
        });
    }

    // Update submit member to handle invitation response
    async submitAddMember() {
        const email = $('#memberEmail').val().trim();
        const role = $('#memberRole').val();
        const department = $('#memberDepartment').val().trim();
        const position = $('#memberPosition').val().trim();

        if (!email) {
            showErrorMessage('Please enter an email address');
            return;
        }

        try {
            showLoadingMessage('Adding member...');

            const response = await fetch(`/api/team/${this.currentTeam._id}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    email,
                    role,
                    department,
                    position
                })
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal('addMemberModal');

                if (data.isInvitation) {
                    showSuccessMessage(`Invitation sent to ${email}! They will receive an email to join the team.`);
                } else {
                    showSuccessMessage('Member added successfully!');
                }

                await this.loadMembers(); // Reload members list
            } else {
                showErrorMessage(data.message || 'Failed to add member');
            }
        } catch (error) {
            console.error('Error adding member:', error);
            showErrorMessage('Failed to add member');
        } finally {
            hideLoadingMessage();
        }
    }

}

// Create and export singleton instance
const teamMgmt = new TeamManagement();
window.teamMgmt = teamMgmt;

export default teamMgmt;