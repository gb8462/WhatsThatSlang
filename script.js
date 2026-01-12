document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("themeCheckbox");

  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
    checkbox.checked = true;
  }

  checkbox.addEventListener("change", () => {
    document.documentElement.classList.toggle("dark");

    if (document.documentElement.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
});
