import { CONFIG } from './config.js';

const PORT = CONFIG.PORT;
const BASE_Url = CONFIG.BASE_URL;

async function loadNewsDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const res = await fetch(`${BASE_Url}:${PORT}/api/news/${id}`);
    const news = await res.json();
    const container = document.getElementById("newsDetail");

    if (!news || !news.title) {
      container.innerHTML = "<p>News not found.</p>";
      return;
    }

    // Render article
    container.innerHTML = `
      <div class="news-article">
        ${news.image ? `<img src="${BASE_Url}:${PORT}/uploads/news/${news.image}" alt="${news.title}" class="news-image">` : ""}
        <h1 class="news-title">${news.title}</h1>
        <p class="news-date">${new Date(news.date).toLocaleDateString()}</p>
        <p class="news-content">${news.content}</p>

        <!-- Share Button -->
        <button class="share-btn">
          <i class="fa-solid fa-share"></i>
        </button>
      </div>
    `;

    // Attach share button event listener
    const shareBtn = container.querySelector(".share-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", copyLink);
    }
  } catch (err) {
    console.error("Error loading news:", err);
    document.getElementById("newsDetail").innerHTML = "<p>Error loading news.</p>";
  }
}

function copyLink() {
  const url = window.location.href;

  navigator.clipboard.writeText(url).then(() => {
    let toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }).catch(err => {
    console.error("Failed to copy link: ", err);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadNewsDetail();

  // Create Toast Element once if not exists
  if (!document.getElementById("toast")) {
    const toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.textContent = "Link copied to clipboard!";
    document.body.appendChild(toast);
  }
});
