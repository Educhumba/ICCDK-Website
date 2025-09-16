import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

// Toast function
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.classList.add("toast-message");
  if (type === "error") toast.classList.add("toast-error");
  if (type === "success") toast.classList.add("toast-success");

  toast.textContent = message;
  document.getElementById("toast").appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const target = document.getElementById(icon.dataset.target);
    if (target.type === "password") {
      target.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      target.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showToast("Please enter both email and password.", "error");
    return;
  }

  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.token) {
    // Save token in localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("userOrganization", data.user.organization);
    localStorage.setItem("userId", data.user.id);

    showToast("Login successful!", "success");

    // Check if redirect was requested
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get("redirect");

    setTimeout(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl; // go back to event page
      } else {
        window.location.href = "../pages/home.html"; // default
      }
    }, 1000);
  } else {
      showToast(data.message || "Invalid credentials", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error connecting to server", "error");
  }
});
