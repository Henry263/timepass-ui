
// ui/notifications.js
// Toast Notifications

export function showSuccessMessage(message) {
    const msg = document.createElement("div");
    msg.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 1001;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(40, 167, 69, 0.3);
        animation: slideInUp 0.3s ease;
    `;
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => {
        msg.style.animation = "slideOutDown 0.3s ease forwards";
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

export function showErrorMessage(message) {
    const msg = document.createElement("div");
    msg.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #dc3545;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 1001;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(220, 53, 69, 0.3);
    `;
    msg.textContent = message;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
}

export function showCriticalError(title, message, duration = 5000) {
    // Remove any existing critical error
    const existing = document.getElementById("criticalError");
    if (existing) {
        existing.remove();
    }

    const errorModal = document.createElement("div");
    errorModal.id = "criticalError";
    errorModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        color: #333;
        padding: 2rem;
        border-radius: 15px;
        z-index: 10001;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: slideIn 0.3s ease;
    `;
    
    errorModal.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            background: #dc3545;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
        ">
            ⚠️
        </div>
        <h3 style="
            margin: 0 0 1rem;
            font-size: 1.5rem;
            color: #dc3545;
            font-weight: 700;
        ">${title}</h3>
        <p style="
            margin: 0 0 1.5rem;
            font-size: 1rem;
            color: #666;
            line-height: 1.5;
        ">${message}</p>
        <div style="
            font-size: 0.875rem;
            color: #999;
        ">This message will close automatically...</div>
    `;

    // Add backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "criticalErrorBackdrop";
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    // Add CSS animations
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translate(-50%, -60%);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%);
                opacity: 1;
            }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(backdrop);
    document.body.appendChild(errorModal);

    setTimeout(() => {
        errorModal.style.animation = "fadeOut 0.3s ease forwards";
        backdrop.style.animation = "fadeOut 0.3s ease forwards";
        setTimeout(() => {
            errorModal.remove();
            backdrop.remove();
            style.remove();
        }, 300);
    }, duration);
}

export function showError(fieldId, message) {
    const field = document.getElementById(fieldId);

    field.style.borderColor = "#ee8b46";
    field.style.backgroundColor = "#fff5f5";

    const socialFields = [
        "instagram", "facebook", "twitter", "linkedin", "calendly",
        "zoom", "snapchat", "tiktok", "youtube", "whatsapp",
        "telegram", "reddit", "pinterest"
    ];

    if (socialFields.includes(fieldId)) {
        const socialItem = field.closest(".social-item");
        const errorContainer = socialItem.querySelector(".input-error");

        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message" style="
                    color: #ee8b46;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                    font-weight: 500;
                    display: block;
                    width: 100%;
                ">${message}</div>
            `;
        }
    } else {
        const formGroup = field.closest(".form-group");
        const existingError = formGroup.querySelector(".error-message");
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.style.cssText = `
            color: #ee8b46;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            font-weight: 500;
            display: block;
            width: 100%;
        `;
        errorDiv.textContent = message;

        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
}

export function clearAllErrors() {
    const inputs = document.querySelectorAll("#profileForm input, #profileForm textarea");
    inputs.forEach((input) => {
        input.style.borderColor = "";
        input.style.backgroundColor = "";
    });

    const socialErrorContainers = document.querySelectorAll(".input-error");
    socialErrorContainers.forEach((container) => {
        container.innerHTML = "";
    });

    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((error) => error.remove());
}
                
export function scrollToFirstError() {
    const errorFields = document.querySelectorAll(".error-message");
    const socialErrorFields = document.querySelectorAll(".input-error:not(:empty)");

    let firstErrorElement = null;

    if (errorFields.length > 0) {
        const firstError = errorFields[0];
        firstErrorElement =
            firstError.previousElementSibling ||
            firstError.parentElement.querySelector("input, textarea, select");
    }

    if (!firstErrorElement && socialErrorFields.length > 0) {
        const firstSocialError = socialErrorFields[0];
        const socialItem = firstSocialError.closest(".social-item");
        firstErrorElement = socialItem ? socialItem.querySelector("input") : null;
    }

    if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        setTimeout(() => {
            firstErrorElement.focus();
            firstErrorElement.style.animation = "shake 0.5s";
            setTimeout(() => {
                firstErrorElement.style.animation = "";
            }, 500);
        }, 300);
    }
}