import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");

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

  // Custom confirmation popup
  function showConfirm(message) {
    return new Promise((resolve) => {
      const confirmBox = document.createElement("div");
      confirmBox.className = "confirm-box";
      confirmBox.innerHTML = `
        <p>${message}</p>
        <div class="confirm-buttons">
          <button class="confirm-yes">Yes</button>
          <button class="confirm-no">No</button>
        </div>
      `;
      document.body.appendChild(confirmBox);
      confirmBox.querySelector(".confirm-yes").addEventListener("click", () => {
        resolve(true);
        confirmBox.remove();
      });
      confirmBox.querySelector(".confirm-no").addEventListener("click", () => {
        resolve(false);
        confirmBox.remove();
      });
    });
  }

  // Redirect to login if not authenticated
  if (!token) {
    showToast("Please login to view your events", "error");
    setTimeout(() => {
      window.location.href =
        "../login/login.html?redirect=../pages/myevents.html";
    }, 1500);
    return;
  }

  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/event-registrations/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const container = document.getElementById("myEventsList");
    container.innerHTML = "";

    if (res.ok && data.success) {
      if (data.registrations.length === 0) {
        container.innerHTML =
          "<p>You have not registered for any events yet.</p>";
        return;
      }

      data.registrations.forEach((reg) => {
        const event = reg.event;
        const div = document.createElement("div");
        div.className = "event-card";
        div.innerHTML = `
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Status:</strong> 
            <span class="status-text">${reg.status}</span>
          </p>
          <div class="actions">
            <button class="btn-cancel" data-id="${reg.id}">Cancel</button>
            <button class="btn-absent" data-id="${reg.id}">Report Absent</button>
          </div>
        `;

        const cancelBtn = div.querySelector(".btn-cancel");
        const absentBtn = div.querySelector(".btn-absent");

        // Disable buttons if already cancelled or absent
        if (reg.status !== "registered") {
          cancelBtn.disabled = true;
          absentBtn.disabled = true;
        }

        container.appendChild(div);

        // Cancel button
        cancelBtn.addEventListener("click", async (e) => {
          const btn = e.target;
          const confirmed = await showConfirm(
            "Are you sure you want to cancel this registration?"
          );
          if (!confirmed) return;

          btn.disabled = true;
          try {
            const res = await fetch(
              `${BASE_Url}:${PORT}/api/event-registrations/${reg.id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const result = await res.json();
            if (res.ok && result.success) {
              showToast("Registration cancelled");
              div.remove();
            } else {
              showToast(result.error || "Failed to cancel", "error");
              btn.disabled = false;
            }
          } catch (err) {
            showToast("Error cancelling registration", "error");
            btn.disabled = false;
          }
        });

        // Absent button
        absentBtn.addEventListener("click", async (e) => {
          const btn = e.target;
          const confirmed = await showConfirm(
            "Are you sure you want to mark yourself as absent?"
          );
          if (!confirmed) return;

          btn.disabled = true;
          try {
            const res = await fetch(
              `${BASE_Url}:${PORT}/api/event-registrations/${reg.id}/absent`,
              {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const result = await res.json();
            if (res.ok && result.success) {
              showToast("Marked as absent");
              div.querySelector(".status-text").textContent = "absent";
              cancelBtn.disabled = true;
              absentBtn.disabled = true;
            } else {
              showToast(result.error || "Failed to mark absent", "error");
              btn.disabled = false;
            }
          } catch (err) {
            showToast("Error reporting absent", "error");
            btn.disabled = false;
          }
        });
      });
    } else {
      showToast(data.error || "Failed to load your events", "error");
    }
  } catch (err) {
    console.error("Error fetching events:", err);
    showToast("Error fetching your events", "error");
  }
});
