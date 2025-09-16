import { CONFIG } from './config.js';

const PORT = CONFIG.PORT
const BASE_Url = CONFIG.BASE_URL

const eventsList = document.getElementById("eventsList");
const loadMoreBtn = document.createElement("button");
let currentPage = 1;
const limit = 3; // how many events per page
async function fetchEvents(page = 1) {
  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/events?page=${page}&limit=${limit}`);
    const data = await res.json();
    // Render events
    data.data.forEach((event, index) => {
      const li = document.createElement("li");
      li.classList.add("timeline-item", "flyer");
      // Give each flyer its own unique gradient ID to avoid conflicts
      const gradientId = `gradient-${page}-${index}`;

      // Compare event date with today
      const now = new Date();
      const eventDate = new Date(event.date);

      // Calculate days left
      const timeDiff = eventDate - now;
      const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      let countdownHTML = "";
      if (daysLeft >= 0 && daysLeft <= 2) {
        const countdownId = `countdown-${event.id}`;
        countdownHTML = `<div id="${countdownId}" class="countdown"></div>`;
      }

      // Decide button state
      let registerButton = "";
      if (eventDate > now) {
        registerButton = `<a href="event.html?id=${event.id}" class="btn register-btn">Register</a>`;
      } else {
        registerButton = `<button class="btn register-btn btn-disabled" disabled>Registration Closed</button>`;
      }
      li.innerHTML = `
        <svg class="flyer-bg" viewBox="0 0 600 400" preserveAspectRatio="none">
          <path d="M0,0 C400,0 600,200 600,400 L0,400 Z" fill="url(#${gradientId})" />
          <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#004A99" />
              <stop offset="100%" stop-color="#3BB54A" />
            </linearGradient>
          </defs>
        </svg>
        <div class="flyer-body">
          <!-- Status Badge (top-right) -->
          <span class="status ${event.status.toLowerCase()}">${event.status}</span>

          <h2 class="flyer-title"><a href="event.html?id=${event.id}">${event.title}</a></h2>
          <p class="flyer-subheading">Empowering Business. Elevating Values.</p>
          <div class="event-details">
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
          </div>

          ${countdownHTML}
          ${registerButton}
        </div>
      `;

      eventsList.appendChild(li);
      // Start countdown if event is within 2 days
      if (daysLeft >= 0 && daysLeft <= 2) {
        const countdownEl = document.getElementById(`countdown-${event.id}`);
        const interval = setInterval(() => {
          const now = new Date();
          const diff = eventDate - now;

          if (diff <= 0) {
            countdownEl.textContent = "Event is live!";
            clearInterval(interval);
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          if (days > 0) {
            countdownEl.textContent = `Starts in ${days}D ${hours}H ${minutes}M ${seconds}s`;
          } else {
            countdownEl.textContent = `Starts in ${hours}H ${minutes}M ${seconds}s`;
          }
        }, 1000);
      }
    });
    // Show/hide "Load More" button
    loadMoreBtn.style.display = (data.page < data.pages) ? "block" : "none";
  } catch (err) {
    console.error("Error fetching events:", err);
  }
}
// Setup Load More button
loadMoreBtn.textContent = "More Events";
loadMoreBtn.classList.add("btn", "glass", "shadow");
loadMoreBtn.style.display = "none";
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchEvents(currentPage);
});
eventsList.insertAdjacentElement("afterend", loadMoreBtn);
// Initial fetch
fetchEvents();

// ----------------------
// News
// ----------------------
const newsContainer = document.getElementById("newsContainer");
const loadMoreNewsBtn = document.getElementById("loadMoreNews");

let currentNewsPage = 1;
const newsLimit = 5;

// Toast
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

async function fetchNews(page = 1) {
  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/news?page=${page}&limit=${newsLimit}`);
    const data = await res.json();

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      if (page === 1) {
        newsContainer.innerHTML = "<p>No news available.</p>";
      }
      loadMoreNewsBtn.style.display = "none";
      return;
    }

    data.data.forEach(news => {
      const article = document.createElement("article");
      article.classList.add("news-item");

      article.innerHTML = `
        <div class="news-menu">⋮</div>
        <div class="news-dropdown">
          <button class="share-btn">Share</button>
        </div>
        <h3><a href="news.html?id=${news.id}" class="news-link">${news.title}</a></h3>
        <a href="news.html?id=${news.id}">
          <p class="tiny">${new Date(news.date).toLocaleDateString()}</p>
          ${news.image ? `<img src="${BASE_Url}:${PORT}/uploads/news/${news.image}" alt="${news.title}" />` : ''}
          <p class="content">${news.content}</p>
        </a>
        <a href="news.html?id=${news.id}" class="read-more-btn">Read More</a>
      `;

      newsContainer.appendChild(article);

      // Menu toggle
      const menuBtn = article.querySelector(".news-menu");
      const dropdown = article.querySelector(".news-dropdown");
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
      });

      // Share button
      dropdown.querySelector(".share-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(`${window.location.origin}/news.html?id=${news.id}`);
        showToast("Link copied!");
        dropdown.style.display = "none";
      });

      // Close dropdown on outside click
      document.addEventListener("click", () => {
        dropdown.style.display = "none";
      });
    });

    loadMoreNewsBtn.style.display = (data.page < data.pages) ? "block" : "none";

  } catch (err) {
    console.error("Error fetching news:", err);
    if (page === 1) {
      newsContainer.innerHTML = "<p>Unable to load news at this time. Try again later.</p>";
    }
    loadMoreNewsBtn.style.display = "none";
  }
}

// Auto-scroll (continuous, only once)
setInterval(() => {
  const card = newsContainer.querySelector(".news-item");
  if (!card) return;
  const cardWidth = card.offsetWidth + 16;
  newsContainer.scrollBy({ left: cardWidth, behavior: "smooth" });

  if (newsContainer.scrollLeft + newsContainer.clientWidth >= newsContainer.scrollWidth - 10) {
    newsContainer.scrollTo({ left: 0, behavior: "smooth" });
  }
}, 7000);

// Load more
loadMoreNewsBtn.addEventListener("click", () => {
  currentNewsPage++;
  fetchNews(currentNewsPage);
});

// Initial load
fetchNews();




// ----------------------
// Highlights
// ----------------------
const highlightsContainer = document.getElementById("highlightsContainer");
const prevBtn = document.querySelector(".highlight-btn.prev");
const nextBtn = document.querySelector(".highlight-btn.next");

// Scroll amount per click (adjust to image width + gap)
const scrollAmount = 260;

nextBtn.addEventListener("click", () => {
  highlightsContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
});

prevBtn.addEventListener("click", () => {
  highlightsContainer.scrollBy({ left: -scrollAmount, behavior: "smooth" });
});

async function fetchHighlights() {
  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/highlights`);
    const result = await res.json();
    const highlights = result.data;

    if (!highlights || !Array.isArray(highlights) || highlights.length === 0) {
      highlightsContainer.innerHTML = "<p>No highlights available at the moment.</p>";
      return;
    }

    highlightsContainer.innerHTML = ""; // clear old content

    highlights.forEach(batch => {
      const batchDiv = document.createElement("div");
      batchDiv.classList.add("highlight-batch");

      // Make whole batch clickable
      batchDiv.addEventListener("click", () => {
        window.location.href = `./event-highlight.html?batchId=${batch.batchId}`;
      });

      // Preview stack (limit to 3 images max)
      const stackDiv = document.createElement("div");
      stackDiv.classList.add("highlight-stack");

      batch.images.slice(0, 3).forEach(img => {
        const image = document.createElement("img");
        image.src = `${BASE_Url}:${PORT}/uploads/highlights/${img.image}`;
        image.alt = img.title;
        stackDiv.appendChild(image);
      });

      // Title (with view link, optional)
      const titleDiv = document.createElement("div");
      titleDiv.classList.add("highlight-title");
      titleDiv.innerHTML = `
        ${batch.eventName}
        <a href="./event-highlight.html?batchId=${batch.batchId}" onclick="event.stopPropagation()">View Gallery</a>
      `;

      batchDiv.appendChild(stackDiv);
      batchDiv.appendChild(titleDiv);
      highlightsContainer.appendChild(batchDiv);
    });

    // Auto-scroll (continuous, only once per cycle)
    setInterval(() => {
      const card = highlightsContainer.querySelector(".highlight-batch");
      if (!card) return;
      const cardWidth = card.offsetWidth + 16; // width + gap
      highlightsContainer.scrollBy({ left: cardWidth, behavior: "smooth" });

      if (highlightsContainer.scrollLeft + highlightsContainer.clientWidth >= highlightsContainer.scrollWidth - 10) {
        highlightsContainer.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 7000);

  } catch (err) {
    console.error("Error fetching highlights:", err);
    highlightsContainer.innerHTML = "<p>Unable to load highlights. Try again later.</p>";
  }
}


// ----------------------
// PDFs (Public view)
// ----------------------
const pdfsContainer = document.getElementById("pdfsContainer");

async function fetchPdfs() {
  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/pdfs`); // public route
    const data = await res.json();

    pdfsContainer.innerHTML = "";

    if (!data.data || data.data.length === 0) {
      pdfsContainer.innerHTML = "<li>No publications available at the moment.</li>";
      return;
    }

    data.data.forEach(pdf => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${BASE_Url}:${PORT}/uploads/pdfs/${encodeURIComponent(pdf.file_path)}" target="_blank">
                        ${pdf.original_name}
                      </a>`;
      pdfsContainer.appendChild(li);
    });

  } catch (err) {
    console.error("Error fetching PDFs:", err);
    pdfsContainer.innerHTML = "<li>Unable to load publications. Try again later.</li>";
  }
}


// ----------------------
// Initial load
// ----------------------
fetchHighlights();
fetchPdfs();