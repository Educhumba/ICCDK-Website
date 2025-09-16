// =========================
// Upload Highlights
// =========================
const addHighlightBtn = document.getElementById("addHighlightBtn");
const uploadHighlightForm = document.getElementById("uploadHighlightForm");
const uploadHighlightMessage = document.getElementById("uploadHighlightMessage");

// Add new title+image pair dynamically
addHighlightBtn.addEventListener("click", () => {
  const container = document.getElementById("highlightInputs");
  const newItem = document.createElement("div");
  newItem.classList.add("highlight-item");
  newItem.innerHTML = `
    <input type="text" name="imageTitle" placeholder="Enter image title" required />
    <input type="file" name="highlightImages" accept="image/*" required />
  `;
  container.appendChild(newItem);
});

// Handle upload form submission
uploadHighlightForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventName = uploadHighlightForm.eventName.value.trim();
  const eventLink = uploadHighlightForm.eventLink.value.trim();

  if (!eventName || !eventLink) {
    uploadHighlightMessage.textContent = "Please provide Event Name and Drive Link.";
    uploadHighlightMessage.style.color = "red";
    return;
  }

  const titleInputs = [...uploadHighlightForm.querySelectorAll('input[name="imageTitle"]')];
  const fileInputs = [...uploadHighlightForm.querySelectorAll('input[name="highlightImages"]')];
  const selectedFiles = fileInputs.filter(inp => inp.files && inp.files.length > 0);

  if (selectedFiles.length === 0) {
    uploadHighlightMessage.textContent = "Please select at least one image.";
    uploadHighlightMessage.style.color = "red";
    return;
  }
  if (selectedFiles.length > 5) {
    uploadHighlightMessage.textContent = "You can only upload a maximum of 5 images at once.";
    uploadHighlightMessage.style.color = "red";
    return;
  }
  if (titleInputs.length !== fileInputs.length) {
    uploadHighlightMessage.textContent = "Each uploaded image must have a corresponding title.";
    uploadHighlightMessage.style.color = "red";
    return;
  }
  for (let i = 0; i < fileInputs.length; i++) {
    const hasFile = fileInputs[i].files && fileInputs[i].files.length > 0;
    const title = (titleInputs[i].value || "").trim();
    if (hasFile && !title) {
      uploadHighlightMessage.textContent = "Please add a title for each selected image.";
      uploadHighlightMessage.style.color = "red";
      return;
    }
  }

  const formData = new FormData(uploadHighlightForm);
  formData.set("eventName", eventName);
  formData.set("eventLink", eventLink);

  try {
    const res = await fetch("/api/admin/highlights", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();

    if (res.ok) {
      uploadHighlightMessage.textContent = data.message || "Highlights uploaded successfully!";
      uploadHighlightMessage.style.color = "green";
      uploadHighlightForm.reset();

      // Reset highlight inputs to one row
      document.getElementById("highlightInputs").innerHTML = `
        <div class="highlight-item">
          <input type="text" name="imageTitle" placeholder="Enter image title" required />
          <input type="file" name="highlightImages" accept="image/*" required />
        </div>
      `;

      fetchHighlights();
    } else {
      uploadHighlightMessage.textContent = data.error || "Failed to upload highlights";
      uploadHighlightMessage.style.color = "red";
    }
  } catch (err) {
    console.error("Error uploading highlights:", err);
    uploadHighlightMessage.textContent = "Server error. Try again later.";
    uploadHighlightMessage.style.color = "red";
  }
});

// =========================
// Fetch and render highlights (ADMIN VIEW)
// =========================
async function fetchHighlights() {
  try {
    const res = await fetch("/api/admin/highlights", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch highlights");

    const highlights = await res.json();
    const highlightsList = document.getElementById("highlightsList");

    if (!highlights || highlights.length === 0) {
      highlightsList.innerHTML = "<p>No highlights uploaded yet.</p>";
      return;
    }

    // Group by batchId
    const batches = {};
    highlights.forEach(hl => {
      const key = hl.batchId || "ungrouped";
      if (!batches[key]) {
        batches[key] = {
          batchId: key,
          eventName: hl.eventName || "(No Event Name)",
          eventLink: hl.eventLink || "#",
          uploaded_at: hl.uploaded_at,
          items: []
        };
      }
      batches[key].items.push(hl);
    });

    // Sort batches by uploaded_at desc
    const orderedBatches = Object.values(batches).sort((a, b) =>
      new Date(b.uploaded_at) - new Date(a.uploaded_at)
    );

    let html = "";
    orderedBatches.forEach(batch => {
      html += `
        <div class="highlight-batch-card">
          <div class="batch-header">
            <h4>${batch.eventName}</h4>
            <a href="${batch.eventLink}" target="_blank" rel="noopener noreferrer">Open Drive Folder</a>
            <small>Batch: ${batch.batchId}</small>
          </div>
          <div class="batch-grid">
            ${batch.items.map(hl => `
              <div class="image-item">
                <img src="http://localhost:3000/uploads/highlights/${hl.image}" alt="${hl.title}" />
                <div class="meta">
                  <p class="title">${hl.title}</p>
                  <button class="delete-highlight" data-id="${hl.id}">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    });

    highlightsList.innerHTML = html;

    // Attach delete button events
    document.querySelectorAll(".delete-highlight").forEach(btn => {
      btn.addEventListener("click", handleDeleteHighlight);
    });
  } catch (err) {
    console.error("Error fetching highlights:", err);
    document.getElementById("highlightsList").innerHTML = "<p>Error loading highlights.</p>";
  }
}

// Delete highlight
async function handleDeleteHighlight(e) {
  const id = e.target.closest("button").dataset.id;
  if (!confirm("Are you sure you want to delete this highlight?")) return;

  try {
    const res = await fetch(`/api/admin/highlights/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (res.ok) {
      alert("Highlight deleted!");
      fetchHighlights();
    } else {
      alert("Delete failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting highlight:", err);
    alert("Server error. Try again later.");
  }
}

// Load highlights when dashboard loads
document.addEventListener("DOMContentLoaded", fetchHighlights);
