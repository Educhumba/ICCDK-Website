document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("registrationsList");

  // Create filter controls
  const controls = document.createElement("div");
  controls.className = "filter-controls";
  controls.innerHTML = `
    <label>
      <i class="fa-solid fa-filter"></i> Filter:
      <select id="filterSelect">
        <option value="">All</option>
        <option value="upcoming">Upcoming</option>
        <option value="past">Past</option>
      </select>
    </label>
    <label>
      <i class="fa-regular fa-calendar"></i> Event:
      <select id="eventSelect">
        <option value="">All Events</option>
      </select>
    </label>
  `;
  container.before(controls);

  async function loadRegistrations(filter = "", eventId = "") {
    try {
      container.innerHTML = "<p>Loading...</p>";
      const res = await fetch(
        `http://127.0.0.1:3000/api/admin/event-registrations?filter=${filter}&eventId=${eventId}`
      );
      const data = await res.json();

      container.innerHTML = "";
      if (!res.ok || !data.success || data.registrations.length === 0) {
        container.innerHTML = "<p>No registrations found.</p>";
        return;
      }

      let grouped = {};
      data.registrations.forEach((reg) => {
        if (!grouped[reg.event.id]) grouped[reg.event.id] = { event: reg.event, regs: [] };
        grouped[reg.event.id].regs.push(reg);
      });

      // Populate event dropdown ONCE
      const eventSelect = document.getElementById("eventSelect");
      const currentEventId = eventId; // keep selection
      if (eventSelect.options.length <= 1) {
        Object.values(grouped).forEach((g) => {
          const opt = document.createElement("option");
          opt.value = g.event.id;
          opt.textContent = g.event.title;
          eventSelect.appendChild(opt);
        });
      }
      // Keep selection when reloading
      if (currentEventId) {
        eventSelect.value = currentEventId;
      }

      // Render grouped registrations
      Object.values(grouped).forEach((group) => {
        const section = document.createElement("div");
        section.className = "event-group";

        // Table with numbering
        let table = `
          <h4>${group.event.title} - ${group.event.date} (${group.event.location})</h4>
          <table class="registrations-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Organization</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${group.regs
                .map(
                  (r, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${r.organization}</td>
                    <td>${r.contactPerson}</td>
                    <td>${r.email}</td>
                    <td>${r.phone}</td>
                    <td>${r.status}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        `;

        section.innerHTML = table;
        container.appendChild(section);
      });
    } catch (err) {
      console.error("Error loading registrations:", err);
      container.innerHTML = "<p>Error loading registrations.</p>";
    }
  }

  // Initial load
  loadRegistrations();

  // React immediately when filter changes
  document.getElementById("filterSelect").addEventListener("change", () => {
    const filter = document.getElementById("filterSelect").value;
    const eventId = document.getElementById("eventSelect").value;
    loadRegistrations(filter, eventId);
  });

  // React immediately when event changes
  document.getElementById("eventSelect").addEventListener("change", () => {
    const filter = document.getElementById("filterSelect").value;
    const eventId = document.getElementById("eventSelect").value;
    loadRegistrations(filter, eventId);
  });

  // Export PDF
  const exportBtn = document.createElement("button");
  exportBtn.innerHTML = `Export PDF  <i class="fa-solid fa-download"></i>`;
  exportBtn.className = "btn-export";
  exportBtn.addEventListener("click", () => {
    const filter = document.getElementById("filterSelect").value;
    const eventId = document.getElementById("eventSelect").value;
    window.open(
      `http://127.0.0.1:3000/api/admin/event-registrations/export?filter=${filter}&eventId=${eventId}`,
      "_blank"
    );
  });
  container.before(exportBtn);
});
