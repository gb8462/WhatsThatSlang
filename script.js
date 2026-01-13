document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector('.sidebar-toggle'); // button to hide/show sidebar
  const layout = document.querySelector(".layout");
  const checkbox = document.getElementById("themeCheckbox");

  // ---------- Theme Toggle ----------
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

  // ---------- Sidebar State ----------
  if (sidebar && toggleBtn) {
    // Load saved state
    if (localStorage.getItem('sidebarHidden') === 'true') {
      sidebar.classList.add('hidden');
      layout.classList.add('sidebar-hidden'); // optional if layout changes
    }

    // Toggle sidebar on button click
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
      layout.classList.toggle('sidebar-hidden'); // optional
      localStorage.setItem('sidebarHidden', sidebar.classList.contains('hidden'));
    });
  }
});
