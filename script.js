document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("menuToggle"); // hamburger
  const backdrop = document.createElement("div"); // overlay for clicking outside
  const checkbox = document.getElementById("themeCheckbox");

  // ---------- THEME TOGGLE ----------
  if (checkbox) {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
  }

  // ---------- MOBILE SIDEBAR TOGGLE ----------
  if (sidebar && toggleBtn) {
    // Add a backdrop to close sidebar when clicking outside
    backdrop.classList.add("sidebar-backdrop");
    document.body.appendChild(backdrop);

    const toggleSidebar = () => {
      sidebar.classList.toggle("show");
      backdrop.style.display = sidebar.classList.contains("show") ? "block" : "none";
    };

    toggleBtn.addEventListener("click", toggleSidebar);

    // Close sidebar when clicking the backdrop
    backdrop.addEventListener("click", toggleSidebar);
  }
});

//================
//  BASIC LOGIN
//================

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

loginModal.addEventListener("click", e => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
});

// ========================
// SIDEBAR NAVIGATION
// ========================
const sidebar = document.querySelector(".sidebar");
const sidebarItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".content section");
const menuToggle = document.getElementById("menuToggle");

// Toggle sidebar (mobile)
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

// Handle sidebar item click
sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetId = item.dataset.target;
    const section = document.getElementById(targetId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    // Auto close on mobile
    if (window.innerWidth <= 768) {
      sidebar.classList.add("hidden");
    }
  });
});

// Active state on scroll
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const activeId = entry.target.id;

      sidebarItems.forEach(item => {
        item.classList.toggle(
          "active",
          item.dataset.target === activeId
        );
      });
    });
  },
  { threshold: 0.6 }
);

sections.forEach(section => observer.observe(section));