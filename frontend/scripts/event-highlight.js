import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

const params = new URLSearchParams(window.location.search);
const batchId = params.get("batchId");

const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const highlightGallery = document.getElementById("highlightGallery");
const eventDriveLink = document.getElementById("eventDriveLink");

async function fetchEventHighlights() {
  if (!batchId) {
    highlightGallery.innerHTML = "<p>Invalid event link.</p>";
    return;
  }

  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/highlights/${batchId}`);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();

    // Update header
    eventTitle.textContent = data.eventName;
    eventDate.textContent = new Date(data.uploaded_at).toDateString();

    // Event Drive Link
    if (data.eventLink) {
      eventDriveLink.href = data.eventLink;
    } else {
      eventDriveLink.parentElement.innerHTML = "<em>No external drive link available for this event.</em>";
    }

    // Render images
    if (!data.images || data.images.length === 0) {
      highlightGallery.innerHTML = "<p>No images available for this event.</p>";
      return;
    }

    highlightGallery.innerHTML = "";
    data.images.forEach((img) => {
      const fig = document.createElement("figure");
      fig.innerHTML = `
        <img src="${BASE_Url}:${PORT}/uploads/highlights/${img.image}" alt="${img.title}" />
        <figcaption>${img.title}</figcaption>
      `;
      highlightGallery.appendChild(fig);
    });
  } catch (err) {
    console.error("Error:", err);
    highlightGallery.innerHTML = "<p>Could not load highlights. Try again later.</p>";
  }
}

// Copy page link to clipboard (toast)
document.querySelector(".share-btn").addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  });
});

fetchEventHighlights();
