const addEventForm = document.getElementById("addEventForm");
addEventForm.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = {
    title: addEventForm.title.value,
    date: addEventForm.date.value,
    time: addEventForm.time.value,
    location: addEventForm.location.value
  };
  try {
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: "include"   // ensures cookies are sent with the request
    });
    const data = await res.json();
    if (res.ok) {
      alert("Event added successfully!");
      addEventForm.reset();
    } else {
      alert(`Error: ${data.message || "Unauthorized"}`);
    }
  } catch (err) {
    console.error("Error adding event:", err);
    alert("Something went wrong.");
  }
});
// ------- Edit Modal wiring -------
const editEventModal = document.getElementById("editEventModal");
const editEventForm = document.getElementById("editEventForm");
const editEventMessage = document.getElementById("editEventMessage");
const closeEditEvent = document.getElementById("closeEditEvent");
function openEditModal() {
  editEventModal.classList.remove("hidden");
}
function closeEditModal() {
  editEventModal.classList.add("hidden");
  editEventForm.reset();
  editEventMessage.textContent = "";
  editEventMessage.removeAttribute("style");
}
closeEditEvent.addEventListener("click", closeEditModal);
// click outside to close
editEventModal.addEventListener("click", (e) => {
  if (e.target === editEventModal) closeEditModal();
});
// Submit edits
editEventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editEventForm.id.value;
  const payload = {
    title: editEventForm.title.value.trim(),
    date: editEventForm.date.value,
    time: editEventForm.time.value,
    location: editEventForm.location.value.trim(),
  };
  try {
    const res = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      editEventMessage.textContent = data.message || "Event updated.";
      editEventMessage.style.color = "green";
      // reload with current filter
      const currentFilter = document.querySelector(".event-filters .active")?.dataset.filter || "all";
      await loadEvents(currentFilter);
      setTimeout(closeEditModal, 400);
    } else {
      editEventMessage.textContent = data.error || "Failed to update.";
      editEventMessage.style.color = "red";
    }
  } catch (err) {
    console.error("Error updating event:", err);
    editEventMessage.textContent = "Server error. Try again.";
    editEventMessage.style.color = "red";
  }
});
let EVENTS_CACHE = []; // holds latest events from the server
const eventsList = document.getElementById("eventsList");
const filterButtons = document.querySelectorAll(".event-filters button");
// Load & display events with optional filter
async function loadEvents(filter = "all") {
  try {
    const res = await fetch("/api/admin/events", { credentials: "include" });
    const events = await res.json();
    // cache
    EVENTS_CACHE = Array.isArray(events) ? events : [];
    eventsList.innerHTML = "";
    if (!EVENTS_CACHE.length) {
      eventsList.innerHTML = "<p>No events found.</p>";
      return;
    }
    const filteredEvents =
      filter === "all"
        ? EVENTS_CACHE
        : EVENTS_CACHE.filter(
            (ev) =>
              ev.status &&
              ev.status.toLowerCase() === filter.toLowerCase()
          );
    if (!filteredEvents.length) {
      eventsList.innerHTML = `<p>No ${filter} events found.</p>`;
      return;
    }
    // Build table
    let table = document.createElement("table");
    table.classList.add("events-table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Time</th>
          <th>Location</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredEvents
          .map(
            (event) => `
          <tr>
            <td>${event.title}</td>
            <td>${event.date}</td>
            <td>${event.time}</td>
            <td>${event.location}</td>
            <td>${event.status}</td>
            <td>
              <button class="edit-btn" data-id="${event.id}"><i class="fas fa-edit"></i> Edit</button>
              <button class="delete-btn" data-id="${event.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;
    eventsList.appendChild(table);
    attachEventActions(); // keeps Edit/Delete working
  } catch (err) {
    console.error("Error fetching events:", err);
    eventsList.innerHTML = "<p>Server error while loading events.</p>";
  }
}
// Attach filter button clicks
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active")); // remove active
    btn.classList.add("active"); // highlight clicked
    const filter = btn.getAttribute("data-filter");
    loadEvents(filter);
  });
});

// Attach edit & delete actions
function attachEventActions() {
  // Delete
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this event?")) {
        await fetch(`/api/admin/events/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const currentFilter = document.querySelector(".event-filters .active")?.dataset.filter || "all";
        loadEvents(currentFilter);
      }
    });
  });
  // Edit
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const ev = EVENTS_CACHE.find(e => e.id === id);
      if (!ev) return;
      // Prefill form
      editEventForm.id.value = ev.id;
      editEventForm.title.value = ev.title || "";
      editEventForm.date.value = ev.date || "";
      editEventForm.time.value = ev.time || "";
      editEventForm.location.value = ev.location || "";

      openEditModal();
    });
  });
}
// Load events on dashboard startup
loadEvents();