document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createAdminForm");
  const messageDiv = document.getElementById("createAdminMessage");
  const adminsList = document.getElementById("adminsList");
  const toggleBtn = document.getElementById("toggleAddAdmin");
  const addAdminContainer = document.getElementById("addAdminContainer");

  // Toggle add admin form
  toggleBtn.addEventListener("click", () => {
    addAdminContainer.classList.toggle("show");
    addAdminContainer.classList.toggle("hidden");
  });

// ==========================
// Fetch and display admins
// ==========================
async function fetchAdmins() {
  adminsList.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
  try {
    const res = await fetch("http://127.0.0.1:3000/auth/admins", {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      adminsList.innerHTML = `<tr><td colspan="5" style="color:red">${errData.message || "Could not load admins."}</td></tr>`;
      return;
    }

    const data = await res.json();

    if (!data.admins || data.admins.length === 0) {
      adminsList.innerHTML = `<tr><td colspan="5">No admins found.</td></tr>`;
      return;
    }

    adminsList.innerHTML = "";
    data.admins.forEach(admin => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${admin.name}</td>
        <td>${admin.email}</td>
        <td>${admin.role}</td>
        <td>${admin.status === "active" ? "Active" : "Suspended"}</td>
        <td>
          <button data-id="${admin.id}" class="action-btn delete-btn"><i class="fas fa-trash"></i> Remove Admin</button>
          <button data-id="${admin.id}" class="action-btn status-btn ${admin.status === "active" ? "suspend-btn" : "activate-btn"}">
            ${admin.status === "active" ? '<i class="fa-solid fa-ban"></i> Suspend' : '<i class="fa-solid fa-circle-check"></i> Activate'}
          </button>
        </td>
      `;
      adminsList.appendChild(tr);
    });

    // Delete handlers
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to remove this admin?")) return;
        const id = btn.getAttribute("data-id");
        try {
          const res = await fetch(`http://127.0.0.1:3000/auth/admins/${id}`, {
            method: "DELETE",
            credentials: "include"
          });
          const result = await res.json();
          alert(result.message || "Done");
          fetchAdmins();
        } catch {
          alert("Server error while deleting admin");
        }
      });
    });

    // Suspend/Activate handlers (with confirmation)
    document.querySelectorAll(".status-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const isSuspend = btn.classList.contains("suspend-btn");
        const actionText = isSuspend ? "suspend" : "activate";

        if (!confirm(`Are you sure you want to ${actionText} this admin?`)) return;

        try {
          const res = await fetch(`http://127.0.0.1:3000/auth/admins/${id}/status`, {
            method: "PATCH",
            credentials: "include"
          });
          const result = await res.json();
          alert(result.message || "Updated");
          fetchAdmins();
        } catch {
          alert("Server error while updating admin");
        }
      });
    });

  } catch {
    adminsList.innerHTML = `<tr><td colspan="5" style="color:red">Server error loading admins.</td></tr>`;
  }
}

  // ==========================
  // Create admin form
  // ==========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const role = formData.get("role");

    try {
      const res = await fetch("http://127.0.0.1:3000/auth/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, role })
      });

      const data = await res.json();
      if (res.ok) {
        messageDiv.style.color = "green";
        messageDiv.textContent = data.message || "Admin created successfully.";
        form.reset();
        fetchAdmins();
      } else {
        messageDiv.style.color = "red";
        messageDiv.textContent = data.message || "Error creating admin.";
      }
    } catch {
      messageDiv.style.color = "red";
      messageDiv.textContent = "Server error.";
    }
  });

  // Initial load
  fetchAdmins();
});
