//  Publish News Form 
// News modal helpers
function openEditNewsModal() {
  document.getElementById("editNewsModal").classList.remove("hidden");
}

function closeEditNewsModal() {
  document.getElementById("editNewsModal").classList.add("hidden");
  document.getElementById("editNewsForm").reset();
}
const publishNewsForm = document.getElementById("publishNewsForm");
const publishNewsMessage = document.getElementById("publishNewsMessage");
publishNewsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(publishNewsForm);
  try {
    const res = await fetch("/api/admin/news", {
      method: "POST",
      body: formData,
      credentials: "include", // if your backend uses cookies for auth
    });
    const data = await res.json();
    if (res.ok) {
      publishNewsMessage.textContent = data.message;
      publishNewsMessage.style.color = "green";
      publishNewsForm.reset();
    } else {
      publishNewsMessage.textContent = data.error || "Failed to publish news";
      publishNewsMessage.style.color = "red";
    }
  } catch (err) {
    console.error("Error publishing news:", err);
    publishNewsMessage.textContent = "Server error. Try again later.";
    publishNewsMessage.style.color = "red";
  }
});
// Fetch and render news
let currentNews = []; // store fetched news globally
// Fetch and render news
async function fetchNews() {
  try {
    const res = await fetch("/api/admin/news"); // use correct endpoint
    if (!res.ok) throw new Error("Failed to fetch news");
    currentNews = await res.json(); // save to global
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    if (currentNews.length === 0) {
      newsList.innerHTML = "<p>No news published yet.</p>";
      return;
    }
    // header row
    newsList.innerHTML = `
      <div class="news-header">
        <div>Title</div>
        <div>Content</div>
        <div>Image</div>
        <div>Author</div>
        <div>Date</div>
        <div>Actions</div>
      </div>
    `;
    // rows
    currentNews.forEach(news => {
      const div = document.createElement("div");
      div.classList.add("news-row");
      div.innerHTML = `
        <p>${news.title}</p>
        <p>${news.content}</p>
        <div>${news.image ? `<img src="http://localhost:3000/uploads/news/${news.image}" alt="News Image" />` : "—"}</div>
        <p>${news.author || "Unknown"}</p>
        <p>${news.date}</p>
        <div class="admin-actions">
          <button class="edit-news" data-id="${news.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-news" data-id="${news.id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `;
      newsList.appendChild(div);
    });
    // Attach listeners
    document.querySelectorAll(".delete-news").forEach(btn => {
      btn.addEventListener("click", handleDeleteNews);
    });
    document.querySelectorAll(".edit-news").forEach(btn => {
      btn.addEventListener("click", handleEditNews);
    });
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}

// Delete news
async function handleDeleteNews(e) {
  const id = e.target.dataset.id;
  if (!confirm("Are you sure you want to delete this news item?")) return;
  try {
    const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" }); // fixed endpoint
    const data = await res.json();

    if (data.message) {
      alert("News deleted!");
      fetchNews(); // refresh
    } else {
      alert("Delete failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
  }
}
// Edit news (open modal)
function handleEditNews(e) {
  const id = e.target.dataset.id;
  const newsItem = currentNews.find(n => n.id == id);
  document.getElementById("editNewsId").value = newsItem.id;
  document.getElementById("editNewsTitle").value = newsItem.title;
  document.getElementById("editNewsContent").value = newsItem.content;
  document.getElementById("editNewsAuthor").value = newsItem.author;
  document.getElementById("editNewsDate").value = newsItem.date;
  openEditNewsModal();
}
// Close modal
document.getElementById("closeEditModal").onclick = closeEditNewsModal;
document.getElementById("editNewsModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("editNewsModal")) {
    closeEditNewsModal();
  }
});
// Submit edit form
document.getElementById("editNewsForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("editNewsId").value;
  const formData = new FormData(this);
  try {
    const res = await fetch(`/api/admin/news/${id}`, { // fixed endpoint
      method: "PUT",
      body: formData
    });
    const data = await res.json();
    if (data.message) {
      alert("News updated!");
      document.getElementById("editNewsModal").style.display = "none";
      fetchNews(); // refresh
    } else {
      alert("Update failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
  }
});
// Load news on startup
document.addEventListener("DOMContentLoaded", fetchNews);