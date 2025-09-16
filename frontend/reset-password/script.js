import { CONFIG } from '../scripts/config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

// =========================
// Toast function
// =========================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.classList.add("toast-message");
  if (type === "error") toast.classList.add("toast-error");
  if (type === "success") toast.classList.add("toast-success");

  toast.textContent = message;
  const container = document.getElementById("toast");
  if (!container) return console.warn("No toast container found!");
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

// =========================
// Password validation
// =========================
function isPasswordStrong(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

// =========================
// Toggle password visibility
// =========================
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const target = document.getElementById(icon.dataset.target);
    if (!target) return;
    target.type = target.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});

// =========================
// Reset Password - Send Code
// =========================
const resetForm = document.querySelector("form.auth-form:not(#resetPasswordForm)");
if (resetForm && document.getElementById("resetEmail")) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("resetEmail").value.trim();
    if (!email) return showToast("Please enter your email", "error");

    try {
      const res = await fetch(`${BASE_Url}:${PORT}/api/reset-password/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("Verification code sent!", "success");
        sessionStorage.setItem("resetEmail", email);
        setTimeout(() => window.location.href = "verify-code.html", 1500);
      } else showToast(data.message || "Error sending code", "error");
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    }
  });
}

// =========================
// Verify Code
// =========================
const verifyForm = document.querySelector("form.auth-form:not(#resetPasswordForm)"); 
if (verifyForm && document.getElementById("code")) {
  const email = sessionStorage.getItem("resetEmail");
  if (!email) {
    showToast("No email found. Start password reset again.", "error");
    setTimeout(() => window.location.href = "reset-password.html", 1500);
  }

  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("code").value.trim();
    if (!code) return showToast("Please enter the verification code", "error");

    try {
      const res = await fetch(`${BASE_Url}:${PORT}/api/reset-password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("Code verified! Redirecting...", "success");
        sessionStorage.setItem("resetVerified", "true");
        setTimeout(() => window.location.href = "set-password.html", 1500);
      } else showToast(data.message || "Invalid verification code", "error");
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    }
  });

  // Resend code
  const resendLink = document.querySelector(".form-links a[href='reset-password.html']");
  if (resendLink) {
    resendLink.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!email) return;
      try {
        const res = await fetch(`${BASE_Url}:${PORT}/api/reset-password/send-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) showToast("Verification code resent!", "success");
        else showToast(data.message || "Error resending code", "error");
      } catch (err) {
        console.error(err);
        showToast("Error connecting to server", "error");
      }
    });
  }
}

// =========================
// Set New Password
// =========================
const setPasswordForm = document.getElementById("resetPasswordForm");
if (setPasswordForm) {
  const email = sessionStorage.getItem("resetEmail");
  const verified = sessionStorage.getItem("resetVerified");
  if (!email || !verified) {
    showToast("Unauthorized access. Start password reset again.", "error");
    setTimeout(() => window.location.href = "reset-password.html", 1500);
  }

  setPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!isPasswordStrong(newPassword)) {
      showToast("Password must be strong", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    try {
      const res = await fetch(`${BASE_Url}:${PORT}/api/reset-password/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Password reset successful!", "success");
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetVerified");
        setTimeout(() => window.location.href = "../login/login.html", 1500);
      } else showToast(data.message || "Error resetting password", "error");
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    }
  });
}
