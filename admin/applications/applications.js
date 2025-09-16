// This script handles fetching and displaying applications on the admin dashboard with buttons to update status
document.addEventListener("DOMContentLoaded", () => {
  const applicationsList = document.getElementById("applicationsList");

  // fetch and render applications
  async function loadApplications() {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      const apps = await res.json();
      renderApplications(apps);
    } catch (err) {
      console.error("Error loading applications:", err);
      applicationsList.innerHTML = `<p class="error">Failed to load applications.</p>`;
    }
  }

  // render applications dynamically
  function renderApplications(apps) {
    if (!apps.length) {
      applicationsList.innerHTML = `<p>No applications yet.</p>`;
      return;
    }
    // header row
    applicationsList.innerHTML = `
      <div class="applications-header">
        <div>Name</div>
        <div>Email</div>
        <div>Contact</div>
        <div>Category</div>
        <div>Date Established</div>
        <div>Size</div>
        <div>Years Active</div>
        <div>Message</div>
        <div>Submitted</div>
        <div>Actions</div>
      </div>
    `;
    // data rows
    apps.forEach(app => {
      const row = document.createElement("div");
      row.classList.add("application-row");
      row.innerHTML = `
        <p>${app.name}</p>
        <p>${app.email}</p>
        <p>${app.number}</p>
        <p>${app.category || "N/A"}</p>
        <p>${app.date_established || "—"}</p>
        <p>${app.organization_size ? app.organization_size + " employees" : "—"}</p>
        <p>${app.years_activity || "—"}</p>
        <p>${app.message || "—"}</p>
        <p>${app.submission_date || app.date}</p>
        <div class="actions">
          <button onclick="updateStatus(${app.id}, 'reviewed')">Reviewed</button>
          <button onclick="updateStatus(${app.id}, 'archived')">Archive</button>
        </div>
      `;
      applicationsList.appendChild(row);
    });
  }

  // update status (admin action)
  window.updateStatus = async function (id, status) {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      await loadApplications(); // refresh list
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // initial load + polling
  loadApplications();
  setInterval(loadApplications, 10000);
});
