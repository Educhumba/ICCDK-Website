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

// Password validation regex
function isPasswordStrong(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
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

// Store form data temporarily
let tempFormData = {};

// Handle signup form submission
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const orgName = document.getElementById("orgName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!isPasswordStrong(password)) {
    showToast(
      "Password must be at least 8 chars, include upper, lower, number, and special char.",
      "error"
    );
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match!", "error");
    return;
  }

  tempFormData = { organization: orgName, email, phone, password };

  try {
    const res = await fetch("http://127.0.0.1:3000/api/registration/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization: orgName, email, phone, password }),
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById("signupForm").classList.add("hidden");
      document.getElementById("verifyForm").classList.remove("hidden");
      showToast("A verification code has been sent to your email", "success");
    } else {
      showToast(data.message, "error");
    }
  } catch (err) {
    showToast("Error sending verification code", "error");
  }
});

// Handle verification form
document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = document.getElementById("verificationCode").value.trim();
  if (!code) {
    showToast("Please enter the verification code", "error");
    return;
  }

  const payload = { ...tempFormData, code };

  try {
    const res = await fetch("http://127.0.0.1:3000/api/registration/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      showToast("Registration completed successfully!", "success");

      // Redirect to login after 2s
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 2000);
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    showToast("Error completing registration", "error");
  }
});
