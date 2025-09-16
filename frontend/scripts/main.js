(function(){
  'use strict';
  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click',function(event){
      if (!nav.contains(event.target)&& !toggle.contains(event.target)){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  }
//Preloader controller
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  preloader.classList.add("hidden");
});
// Animations for sections and features
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");
  const fadeItems = document.querySelectorAll(".fade-item");

  // Observer for sections (.reveal)
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach(el => sectionObserver.observe(el));

  // Observer for individual fade items (features, etc.)
  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show");
      }
    });
  }, { threshold: 0.3 });

  fadeItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.2}s`; // stagger
    itemObserver.observe(item);
  });
});

//Accordion styling for about and services pages
document.querySelectorAll('.accordion-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');

    document.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.icon').textContent = '+';
    });
    if (!isActive) {
      item.classList.add('active');
      btn.querySelector('.icon').textContent = '−';
    }
  });
});

  // Global control logic for user menu
  document.addEventListener("DOMContentLoaded", () => {
    const authMenu = document.getElementById("authMenu");
    const guestMenu = document.getElementById("guestMenu");
    const profileToggle = document.getElementById("profileToggle");
    const profileDropdown = document.getElementById("profileDropdown");
    const dropdownIcon = document.getElementById("dropdownIcon");
    const logoutBtn = document.getElementById("logoutBtn");
    const userNameEl = document.getElementById("userName");

    // Check login state from localStorage
    const token = localStorage.getItem("authToken");
    const name = localStorage.getItem("userOrganization");

    if (token && name) {
      if (guestMenu) guestMenu.classList.add("hidden");
      if (authMenu) authMenu.classList.remove("hidden");
      if (userNameEl) userNameEl.textContent = name;
    } else {
      if (guestMenu) guestMenu.classList.remove("hidden");
      if (authMenu) authMenu.classList.add("hidden");
    }
    // Toggle dropdown
    profileToggle?.addEventListener("click", () => {
      if (!profileDropdown || !dropdownIcon) return;
      profileDropdown.classList.toggle("hidden");
      dropdownIcon.style.transform = profileDropdown.classList.contains("hidden")
        ? "rotate(0deg)"
        : "rotate(180deg)";
    });
    // Close profile dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const isClickInside = profileToggle?.contains(e.target) || profileDropdown?.contains(e.target);
      if (!isClickInside && !profileDropdown?.classList.contains("hidden")) {
        profileDropdown.classList.add("hidden");
        if (dropdownIcon) dropdownIcon.style.transform = "rotate(0deg)";
      }
    });
    // Logout everywhere
    logoutBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("authToken");
      localStorage.removeItem("userOrganization");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");

      // Redirect to homepage
      window.location.href = "../pages/home.html";
    });
  });
})();