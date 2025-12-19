
/* ============================
   PART 2: Update Navigation Based on Account Type
   ============================ */

   function updateNavigationForAccountType() {
    if (!currentUser) {
      // Hide team management for non-authenticated users
      hideTeamManagementFeatures();
      return;
    }
    
    if (currentUser.canAccessTeamManagement) {
      // Show team management for corporate users
      showTeamManagementFeatures();
      
      // Update navigation menu
      addTeamManagementToNav();
    } else {
      // Hide team management for individual users
      hideTeamManagementFeatures();
      
      // Show upgrade prompt (optional)
      addUpgradePromptToNav();
    }
  }
  
  function showTeamManagementFeatures() {
    // Show team management menu item
    const teamManagementBtn = document.getElementById('teamManagementBtn');
    if (teamManagementBtn) {
      teamManagementBtn.style.display = 'block';
    }
    
    // Show team-related sections
    document.querySelectorAll('.team-feature').forEach(el => {
      el.style.display = 'block';
    });
    
    // Enable team functionality
    console.log('✅ Team management features enabled');
  }
  
  function hideTeamManagementFeatures() {
    // Hide team management menu item
    const teamManagementBtn = document.getElementById('teamManagementBtn');
    if (teamManagementBtn) {
      teamManagementBtn.style.display = 'none';
    }
    
    // Hide team-related sections
    document.querySelectorAll('.team-feature').forEach(el => {
      el.style.display = 'none';
    });
    
    console.log('ℹ️ Team management features hidden (individual account)');
  }
  
  function addTeamManagementToNav() {
    const profileBtn = document.getElementById('profileBtn');
    const navMenu = profileBtn?.parentElement;
    
    if (!navMenu) return;
    
    // Check if team button already exists
    if (document.getElementById('teamManagementBtn')) return;
    
    // Create team management button
    const teamBtn = document.createElement('a');
    teamBtn.href = '#';
    teamBtn.id = 'teamManagementBtn';
    teamBtn.className = 'nav-link team-feature';
    teamBtn.innerHTML = '<i class="fas fa-users"></i> Team Management';
    teamBtn.onclick = function(e) {
      e.preventDefault();
      showPage('teamManagement');
    };
    
    // Insert after profile button
    profileBtn.parentNode.insertBefore(teamBtn, profileBtn.nextSibling);
  }
  
  function addUpgradePromptToNav() {
    // Optional: Add upgrade button for individual users
    const profileBtn = document.getElementById('profileBtn');
    const navMenu = profileBtn?.parentElement;
    
    if (!navMenu) return;
    
    // Check if upgrade button already exists
    if (document.getElementById('upgradeToCorpBtn')) return;
    
    // Create upgrade prompt button
    const upgradeBtn = document.createElement('a');
    upgradeBtn.href = '#';
    upgradeBtn.id = 'upgradeToCorpBtn';
    upgradeBtn.className = 'nav-link upgrade-prompt';
    upgradeBtn.innerHTML = '<i class="fas fa-building"></i> Upgrade to Corporate';
    upgradeBtn.onclick = function(e) {
      e.preventDefault();
      showUpgradeModal();
    };
    
    // Insert before logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.parentNode.insertBefore(upgradeBtn, logoutBtn);
    }
  }
  
  /* ============================
     PART 3: Team Management Page Protection
     ============================ */
  
  // Update your showPage function to check access
  const originalShowPage = window.showPage;
  window.showPage = function(pageName) {
    // Check if trying to access team management
    if (pageName === 'teamManagement') {
      if (!currentUser) {
        showErrorMessage('Please login to access team management');
        originalShowPage('emailLoginPage');
        return;
      }
      
      if (!currentUser.canAccessTeamManagement) {
        showErrorMessage('Team management is only available for corporate accounts');
        showUpgradeModal();
        return;
      }
    }
    
    // Call original function
    originalShowPage(pageName);
  };
  
  /* ============================
     PART 4: Upgrade Modal (Optional)
     ============================ */
  
  function showUpgradeModal() {
    const modalHTML = `
      <div class="modal" id="upgradeModal" style="display: block;">
        <div class="modal-content">
          <span class="close" onclick="closeUpgradeModal()">&times;</span>
          <h2>Upgrade to Corporate Account</h2>
          <p>Unlock powerful team management features:</p>
          <ul class="feature-list">
            <li><i class="fas fa-check"></i> Manage unlimited team members</li>
            <li><i class="fas fa-check"></i> Create and manage multiple cards</li>
            <li><i class="fas fa-check"></i> Advanced analytics and reporting</li>
            <li><i class="fas fa-check"></i> Custom templates and branding</li>
            <li><i class="fas fa-check"></i> Bulk operations</li>
            <li><i class="fas fa-check"></i> Team roles and permissions</li>
          </ul>
          <button class="btn btn-primary" onclick="contactSales()">
            Contact Sales
          </button>
          <button class="btn btn-outline" onclick="closeUpgradeModal()">
            Maybe Later
          </button>
        </div>
      </div>
    `;
    
    // Add modal to page
    const modalContainer = document.getElementById('modalContainer') || document.body;
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    modalContainer.appendChild(modalDiv);
  }
  
  function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) {
      modal.remove();
    }
  }
  
  function contactSales() {
    // Implement your contact/upgrade flow
    window.location.href = 'mailto:sales@yourcompany.com?subject=Corporate Account Upgrade';
  }
  
  /* ============================
     PART 5: API Helper - Check Team Access
     ============================ */
  
  async function checkTeamAccess() {
    try {
      const response = await fetch('/api/team/check-access', {
        method: 'GET',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        return {
          canAccess: result.canAccessTeams,
          accountType: result.accountType,
          isCorporate: result.isCorporate,
          teams: result.teams,
          ownedTeams: result.ownedTeams
        };
      }
      
      return { canAccess: false };
    } catch (error) {
      console.error('Check team access error:', error);
      return { canAccess: false };
    }
  }
  
  /* ============================
     PART 6: Update Profile Button Display
     ============================ */
  
  function updateAuthUI() {
    const authNav = document.getElementById('authNav');
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const profileBtn = document.getElementById("profileBtn");
    const displayBtn = document.getElementById("displayBtn");
    const walletBtn = document.getElementById("walletBtn");
    const logoutBtn = document.getElementById("logoutBtn");
  
    if (currentUser) {
      // Hide login/signup
      loginBtn?.classList.add("hidden");
      signupBtn?.classList.add("hidden");
      
      // Show profile, wallet, logout
      profileBtn?.classList.remove("hidden");
      displayBtn?.classList.remove("hidden");
      walletBtn?.classList.remove("hidden");
      logoutBtn?.classList.remove("hidden");
      
      // Update navigation for account type
      updateNavigationForAccountType();
      
      // Update avatar
      updateUserAvatar();
      
      // Show account type badge (optional)
      showAccountTypeBadge();
    } else {
      // Show login/signup
      loginBtn?.classList.remove("hidden");
      signupBtn?.classList.remove("hidden");
      
      // Hide authenticated features
      profileBtn?.classList.add("hidden");
      displayBtn?.classList.add("hidden");
      walletBtn?.classList.add("hidden");
      logoutBtn?.classList.add("hidden");
      
      // Hide team management
      hideTeamManagementFeatures();
    }
  }
  
  function showAccountTypeBadge() {
    if (!currentUser) return;
    
    const badge = document.createElement('span');
    badge.className = 'account-type-badge';
    badge.textContent = currentUser.isCorporate ? 'Corporate' : 'Individual';
    badge.style.cssText = `
      background: ${currentUser.isCorporate ? '#007bff' : '#6c757d'};
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    `;
    
    // Add badge to profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && !profileBtn.querySelector('.account-type-badge')) {
      profileBtn.appendChild(badge);
    }
  }

  /* ============================
   PART 8: Export Functions
   ============================ */

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      checkTeamAccess,
      showTeamManagementFeatures,
      hideTeamManagementFeatures,
      updateNavigationForAccountType
    };
  }