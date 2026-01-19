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
//  MAIN CONTENT
//================