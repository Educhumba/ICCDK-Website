(() => {
  // ============================
  // Auth Guard: Redirect if not logged in
  // ============================
  async function checkAuth() {
    try {
      const res = await fetch("http://127.0.0.1:3000/auth/admin/check", {
        method: "GET",
        credentials: "include"
      });

      if (!res.ok) {
        window.location.href = "../Login/dashboard-login.html";
        return;
      }

      const data = await res.json();
      if (data.loggedIn && data.user) {
        // Display admin name
        const adminNameSpan = document.getElementById("adminName");
        if (adminNameSpan) adminNameSpan.textContent = data.user.name || data.user.email;

        // Hide sidebar items based on role
        hideUnauthorizedNav(data.user.role);
      }

    } catch (err) {
      window.location.href = "../Login/dashboard-login.html";
    }
  }

  // ============================
  // Sidebar Expand / Collapse
  // ============================
  function setupSidebar() {
    const parents = document.querySelectorAll(".sidebar .parent");
    parents.forEach(parent => {
      const trigger = parent.querySelector("span");
      const submenu = parent.querySelector(".submenu");

      submenu.style.display = "none"; // hide initially

      trigger.addEventListener("click", () => {
        parents.forEach(p => {
          if (p !== parent) {
            p.querySelector(".submenu").style.display = "none";
            p.classList.remove("open");
          }
        });

        const isOpen = parent.classList.contains("open");
        submenu.style.display = isOpen ? "none" : "block";
        parent.classList.toggle("open", !isOpen);
      });
    });
  }

  // ============================
  // Section Switching by Hash
  // ============================
  function showSectionFromHash() {
    const sections = document.querySelectorAll(".tab-section");
    if (!sections.length) return;

    let hash = window.location.hash.substring(1);
    if (!hash) hash = sections[0].id;

    sections.forEach(s => s.classList.remove("active"));
    const target = document.getElementById(hash);
    if (target) target.classList.add("active");
    else sections[0].classList.add("active");
  }

  // ============================
  // Global Counters (Applications + Feedbacks)
  // ============================
  const applicationsCounter = document.getElementById("headerApplicationsCounter");
  const feedbacksCounter = document.getElementById("headerFeedbackCounter");

  async function fetchApplicationsCount() {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      const apps = await res.json();

      const newCount = apps.filter(app => app.status === "new").length;
      applicationsCounter.textContent = newCount;
      applicationsCounter.style.display = newCount > 0 ? "inline-block" : "none";
    } catch (err) {
      console.error("Error fetching applications count:", err);
    }
  }

  async function fetchFeedbacksCount() {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const msgs = await res.json();

      const newCount = msgs.filter(msg => msg.status === "new").length;
      feedbacksCounter.textContent = newCount;
      feedbacksCounter.style.display = newCount > 0 ? "inline-block" : "none";
    } catch (err) {
      console.error("Error fetching feedbacks count:", err);
    }
  }

  function startCounters() {
    fetchApplicationsCount();
    fetchFeedbacksCount();
    setInterval(() => {
      fetchApplicationsCount();
      fetchFeedbacksCount();
    }, 10000); // refresh every 10s
  }

  // ============================
  // Admin Name Dropdown + Logout
  // ============================
  function setupAdminDropdown() {
    const adminMenu = document.getElementById("adminMenu");
    const adminToggle = document.getElementById("adminToggle");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!adminMenu || !adminToggle || !logoutBtn) return;

    // Toggle dropdown
    adminToggle.addEventListener("click", () => {
      adminMenu.classList.toggle("open");
    });

    // Logout
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("http://127.0.0.1:3000/auth/admin/logout", {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "../Login/dashboard-login.html";
      } catch (err) {
        console.error("Logout failed", err);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!adminMenu.contains(e.target)) {
        adminMenu.classList.remove("open");
      }
    });
  }

  // ============================
  // Role-based Sidebar Hiding
  // ============================
  function hideUnauthorizedNav(role) {
    const navItems = document.querySelectorAll(".sidebar li[data-role]");

    navItems.forEach(item => {
      const allowedRoles = item.getAttribute("data-role").split(",").map(r => r.trim());
      if (!allowedRoles.includes(role)) {
        item.style.display = "none";
      }
    });
  }

  // ============================
  // Init
  // ============================
  document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    setupSidebar();
    setupAdminDropdown();
    showSectionFromHash();
    startCounters();
  });

  window.addEventListener("hashchange", showSectionFromHash);
})();
