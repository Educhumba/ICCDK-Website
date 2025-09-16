// This script handles fetching and displaying all feedbacks/messages on the admin dashboard with buttons to update status
document.addEventListener("DOMContentLoaded", () => {
  const feedbackList = document.getElementById("feedbackList");

  // Fetch all feedback messages
  async function fetchFeedback() {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const messages = await res.json();

      feedbackList.innerHTML = ""; // Clear existing

      if (messages.length === 0) {
        feedbackList.innerHTML = "<p>No feedback messages found.</p>";
        return;
      }
      // header row
      feedbackList.innerHTML = `
        <div class="feedback-header">
          <div>Name</div>
          <div>Email</div>
          <div>Subject</div>
          <div>Message</div>
          <div>Date</div>
          <div>Status</div>
          <div>Action</div>
        </div>
      `;
      // data rows
      messages.forEach((msg) => {
        const item = document.createElement("div");
        item.classList.add("feedback-row");
        item.innerHTML = `
          <p>${msg.name}</p>
          <p>${msg.email}</p>
          <p>${msg.subject || "—"}</p>
          <p>${msg.message}</p>
          <p>${msg.date}</p>
          <p><span class="status-label">${msg.status}</span></p>
          <div class="action-col">
            <select class="status-select" data-id="${msg.id}">
              <option value="new" ${msg.status === "new" ? "selected" : ""}>New</option>
              <option value="reviewed" ${msg.status === "reviewed" ? "selected" : ""}>Reviewed</option>
              <option value="archived" ${msg.status === "archived" ? "selected" : ""}>Archived</option>
            </select>
          </div>
        `;
        feedbackList.appendChild(item);
      });

      // attach listeners for updating status
      document.querySelectorAll(".status-select").forEach((select) => {
        select.addEventListener("change", async (e) => {
          const id = e.target.getAttribute("data-id");
          const status = e.target.value;
          try {
            const res = await fetch(`/api/messages/${id}/status`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            alert("Status updated successfully");
            fetchFeedback(); // Refresh
          } catch (err) {
            console.error(err);
            alert("Error updating status");
          }
        });
      });
    } catch (err) {
      console.error("Error fetching feedback:", err);
      feedbackList.innerHTML = "<p>Error loading feedback messages.</p>";
    }
  }

  fetchFeedback();
  setInterval(fetchFeedback, 10000);
});