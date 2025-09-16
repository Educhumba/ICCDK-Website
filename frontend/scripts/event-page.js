import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const form = document.getElementById("eventRegistrationForm");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Toast function
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Fetch event details 
  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/events/${id}`);
    if (!res.ok) throw new Error("Event not found");
    const event = await res.json();

    document.getElementById("eventTitle").textContent = event.title;
    document.getElementById("eventDate").textContent = event.date;
    document.getElementById("eventLocation").textContent = event.location;
    document.getElementById("eventDescription").textContent = event.description;

    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`;
    document.getElementById("eventMap").src = mapUrl;
  } catch (err) {
    console.error(err);
    document.getElementById("eventDetail").innerHTML = "<p>Error loading event details.</p>";
  }

  // Handle Registration form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form).entries());
    const token = localStorage.getItem("authToken"); // get token from login

    if (!token) {
      showToast("Please login before registering.", "error");
      setTimeout(() => {
        const currentPage = window.location.href;
        window.location.href = `../login/login.html?redirect=${encodeURIComponent(currentPage)}`;
      }, 1500);
      return;
    }

    // disable button during submission
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Registering...";

    try {
      const res = await fetch(`${BASE_Url}:${PORT}/api/event-registrations/${id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // add token
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "Registered successfully!", "success");
        form.reset();
      } else if (res.status === 401) {
        showToast("Please log in to register.", "error");
        setTimeout(() => {
          window.location.href = "../pages/login.html";
        }, 1500);
      } else {
        showToast(data.error || "Error registering for event", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error registering for event", "error");
    } finally {
      // re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
