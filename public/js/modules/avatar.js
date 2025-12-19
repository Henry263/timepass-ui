// modules/avatar.js
// Profile Photo Management

import { api } from '../core/api-client.js';
import { APP_CONFIG } from '../core/config.js';
import { showSuccessMessage, showErrorMessage } from '../ui/notifications.js';
import { loadProfileData } from './profile.js';
import { showPage, updateURL, setActiveNavItem } from '../ui/navigation.js';
import MessageBox from './message-box.js'
const timestamp = new Date().getTime();


// js/modules/social-category-manager.js
// Social Links Category Manager Module
// Handles expand/collapse functionality for categorized social links


// Helper function to fetch photo as base64
async function fetchPhotoAsBase64(cardId) {
    try {
        const response = await fetch(`/api/profile/photo/c/${cardId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            cache: 'no-store' // Important for mobile
        });

        if (!response.ok) {
            throw new Error('Failed to fetch photo');
        }

        const blob = await response.blob();
        console.log("blob: ", blob);
        // Convert to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching photo:', error);
        return null;
    }
}


export async function updateProfileDisplay(profile) {
    const avatarDisplay = $("#avatarDisplay");
    const avatarInitials = $("#avatarInitials");
    const profilePhotoImg = $("#profilePhotoImg");
    const deleteBtn = $("#deletePhotoBtn");

    let profilePhotourl = window.location.origin + '/api/profile/photo/c/' + profile.cardId + '?t=' + timestamp;;
    if (profile.hasProfilePhoto) {
        avatarDisplay.hide();
        profilePhotoImg.hide();
        const base64Photo = await fetchPhotoAsBase64(profile.cardId);
        if (base64Photo) {
            // Remove and recreate image element
            const parentContainer = profilePhotoImg.parent();
            const imgClasses = profilePhotoImg.attr('class') || '';
            const imgId = profilePhotoImg.attr('id');

            profilePhotoImg.remove();

            // Create new image with base64 data
            const newImg = $(`<img id="${imgId}" class="${imgClasses}" alt="Profile Photo">`);
            newImg.attr('src', base64Photo);
            parentContainer.append(newImg);

            newImg.show();
            deleteBtn.show();
        } else {
            // Fallback to initials
            avatarInitials.text(profile.initials);
            avatarDisplay.show();
            deleteBtn.hide();
        }
        // // Show photo
        // // profilePhotoImg.attr("src", `/api/profile/photo/c/${profile.cardId}`);
        // // profilePhotoImg.attr("src", profilePhotourl);
        // // profilePhotoImg.show();
        // // avatarDisplay.hide();
        // // deleteBtn.show();

        // // Clear src first
        // profilePhotoImg.hide().attr("src", "");

        // // Create a new image object to force fresh load
        // const img = new Image();
        // img.onload = function() {
        //     profilePhotoImg.attr("src", profilePhotourl).show();
        //     avatarDisplay.hide();
        //     deleteBtn.show();
        // };
        // img.onerror = function() {
        //     console.error("Failed to load profile photo");
        //     // Fallback to initials on error
        //     avatarInitials.text(profile.initials);
        //     avatarDisplay.show();
        //     profilePhotoImg.hide();
        //     deleteBtn.hide();
        // };
        // img.src = profilePhotourl;
        //window.location.reload();

    } else {
        // Show avatar with initials
        avatarInitials.text(profile.initials);
        avatarDisplay.show();
        profilePhotoImg.hide();
        deleteBtn.hide();
    }
}

export function updateNavbarAvatar(profile) {
    let navbarAvatar = $(".navbar-avatar");

    // Create navbar avatar if it doesn't exist
    if (navbarAvatar.length === 0) {
        navbarAvatar = $('<div class="navbar-avatar"></div>');
        $("#logoutBtn").after(navbarAvatar);
    }

    navbarAvatar.empty();

    if (profile.hasProfilePhoto) {
        navbarAvatar.html(`<img src="/api/profile/photo/c/${profile.cardId}?t=${timestamp}" alt="Profile">`);
    } else {
        navbarAvatar.text(profile.initials);
    }

    // Make it clickable
    navbarAvatar.off("click").on("click", function () {
        // Could navigate to profile page
    });
}

export async function uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("profilePhoto", file);

    const isHEIC = file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");

    const uploadBtn = $("#uploadPhotoBtn");
    const originalText = uploadBtn.html();
    uploadBtn.prop("disabled", true)
        .text(isHEIC ? "Converting & Uploading..." : "Uploading...");

    try {
        const response = await $.ajax({
            url: "/api/profile/upload-profile-photo",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        });

        if (response.success) {
            showSuccessMessage("Profile photo uploaded successfully!");
            $("#deletePhotoBtn").show();
            uploadBtn.prop("disabled", false).html(originalText);

            // Reload profile to update navbar
            //await loadProfileData();
            showPage('display');
            updateURL('display');
            setActiveNavItem('display');
        }
    } catch (error) {
        console.error("Error uploading photo:", error);
        showErrorMessage(error.responseJSON?.message || "Error uploading photo");

        // Reset preview
        $("#profilePhotoImg").hide();
        $("#avatarDisplay").show();
        $("#profilePhotoInput").val("");
        uploadBtn.prop("disabled", false).html(originalText);
    }
}

export async function deleteProfilePhoto() {

    // MessageBox.show()

    const result = await MessageBox.show(
        `<p>Are you sure you want to remove your profile photo?.</p>`,
        {
            type: 'warning',
            title: 'Delete Profile Photo',
            closable: true,
            closeOnOverlay: false,
            buttons: [
                { text: 'Cancel', style: 'secondary', value: false },
                { text: 'Delete', style: 'primary', value: true, icon: 'fas fa-trash' }
            ]
        }
    );
    if (result === false) {
        // User clicked Cancel - clear everything and go to QRCode tab
        console.log('User cancelled - clearing QR designer state');


    } else if (result === true) {
        // User clicked "Create New Account" - logout and redirect
        try {
            const response = await $.ajax({
                url: "/api/profile/delete-profile-photo",
                method: "DELETE",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            if (response.success) {
                showSuccessMessage("Profile photo removed successfully!");

                // Show avatar again
                $("#profilePhotoImg").hide();
                $("#avatarDisplay").show();
                $("#deletePhotoBtn").hide();
                $("#profilePhotoInput").val("");

                // Reload profile to update navbar
                // await loadProfileData();
                showPage('display');
                updateURL('display');

                setActiveNavItem('display');
            }
        } catch (error) {
            console.error("Error deleting photo:", error);
            showErrorMessage("Error removing photo");
        }
    }

    // if (!confirm("Are you sure you want to remove your profile photo?")) {
    //     return;
    // }

    // try {
    //     const response = await $.ajax({
    //         url: "/api/profile/delete-profile-photo",
    //         method: "DELETE",
    //         headers: {
    //             Authorization: "Bearer " + localStorage.getItem("token"),
    //         },
    //     });

    //     if (response.success) {
    //         showSuccessMessage("Profile photo removed successfully!");

    //         // Show avatar again
    //         $("#profilePhotoImg").hide();
    //         $("#avatarDisplay").show();
    //         $("#deletePhotoBtn").hide();
    //         $("#profilePhotoInput").val("");

    //         // Reload profile to update navbar
    //        // await loadProfileData();
    //        showPage('display');
    //        updateURL('display');

    //         setActiveNavItem('display');
    //     }
    // } catch (error) {
    //     console.error("Error deleting photo:", error);
    //     showErrorMessage("Error removing photo");
    // }
}

export function initializeAvatarHandlers() {
    // Handle upload button click
    $("#uploadPhotoBtn").on("click", function () {
        $("#profilePhotoInput").click();
    });

    // Handle file selection
    $("#profilePhotoInput").on("change", async function (e) {
        const file = e.target.files[0];

        if (!file) return;

        // Validate file size
        if (file.size > APP_CONFIG.maxPhotoSize) {
            showErrorMessage("File size must be less than 5MB");
            $(this).val("");
            return;
        }

        const fileName = file.name.toLowerCase();
        const isHEIC = fileName.endsWith(".heic") || fileName.endsWith(".heif");
        const isStandardImage = file.type.startsWith("image/");

        // Validate file type
        if (!isStandardImage && !isHEIC) {
            showErrorMessage("Please select an image file (JPG, PNG, GIF, HEIC)");
            $(this).val("");
            return;
        }

        // Preview handling
        if (isHEIC) {
            console.log("📸 HEIC file - will be converted on server");
            $("#avatarDisplay").show();
            $("#profilePhotoImg").hide();
        } else {
            // Preview standard images
            const reader = new FileReader();
            reader.onload = function (e) {
                $("#profilePhotoImg").attr("src", e.target.result).show();
                $("#avatarDisplay").hide();
            };
            reader.readAsDataURL(file);
        }

        // Upload photo
        await uploadProfilePhoto(file);
    });

    // Handle delete button
    $("#deletePhotoBtn").on("click", deleteProfilePhoto);
}