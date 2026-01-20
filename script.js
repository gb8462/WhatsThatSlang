document.addEventListener("DOMContentLoaded", () => {
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
});


// ========================
// SIDEBAR NAVIGATION
// ========================
const sidebar = document.querySelector(".sidebar");
const sidebarItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".content section");
const menuToggle = document.getElementById("menuToggle");
const browseBtn = document.getElementById("browseSlangsBtn");
const slangsSection = document.getElementById("slangs");
const backdrop = document.querySelector(".sidebar-backdrop");

// Toggle sidebar (mobile)
menuToggle?.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});

// Close sidebar when clicking outside
backdrop?.addEventListener("click", () => {
  sidebar.classList.remove("show");
});

// Scroll to slangs
browseBtn?.addEventListener("click", () => {
  slangsSection?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// Sidebar item click
sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetId = item.dataset.target;
    const section = document.getElementById(targetId);

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("show");
    }
  });
});

// Active state on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    sidebarItems.forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.target === entry.target.id
      );
    });
  });
}, { threshold: 0.6 });

sections.forEach(section => observer.observe(section));

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

/* =========================
   TOAST ALERTS
========================= */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  toast.innerHTML = `
    <div class="icon">
      ${type === "success" ? "✓" : type === "error" ? "!" : "i"}
    </div>
    <div class="message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

//================
//    MODALS
//================
const signupModal = document.getElementById("signupModal");
const forgotModal = document.getElementById("forgotModal");

// Buttons
const switchToSignupBtn = document.getElementById("switchToSignupBtn");
const switchToLoginBtn = document.getElementById("switchToLoginBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const switchToLoginFromForgotBtn = document.getElementById("switchToLoginFromForgotBtn");

// Show/Hide functions
function showModal(modal) {
  modal.style.display = "flex";
}

function hideModal(modal) {
  modal.style.display = "none";
}

// Switch between modals
switchToSignupBtn.addEventListener("click", () => {
  hideModal(loginModal);
  showModal(signupModal);
});

switchToLoginBtn?.addEventListener("click", () => {
  hideModal(signupModal);
  showModal(loginModal);
});

forgotPasswordBtn.addEventListener("click", () => {
  hideModal(loginModal);
  showModal(forgotModal);
});

switchToLoginFromForgotBtn.addEventListener("click", () => {
  hideModal(forgotModal);
  showModal(loginModal);
});