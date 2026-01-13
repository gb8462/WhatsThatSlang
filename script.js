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

const slangList = document.getElementById("slangList");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterDifficulty = document.getElementById("filterDifficulty");
const addForm = document.getElementById("addSlangForm");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editSlangForm");
let currentEditIndex = null;

// Example initial data
let slangs = [];

// ---------- Render Function ----------
function renderSlangs(list) {
  slangList.innerHTML = ""; // clear existing cards
  const isDark = document.documentElement.classList.contains("dark"); // check current theme

  list.forEach((slang, index) => {
    // Create card container
    const card = document.createElement("div");
    card.className = "slang-card";

    // Inner HTML
    card.innerHTML = `
      <div class="slang-header">
        <h3>${slang.word}</h3>
        <div class="actions">
          <button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <p class="slang-meaning">${slang.meaning}</p>
      <div class="slang-tags">Tags: ${slang.tags.join(", ")}</div>
      <div class="slang-difficulty">Difficulty: ${slang.difficulty}</div>
      <small class="slang-date">Added: ${slang.date}</small>
    `;

    // Optional: Add dark mode class dynamically (CSS already handles global .dark)
    if (isDark) card.classList.add("dark");

    slangList.appendChild(card);

    // ---------- Delete Button ----------
    card.querySelector(".delete-btn").addEventListener("click", () => {
      // TODO: Check user auth before deleting
      slangs.splice(index, 1);
      renderSlangs(slangs); // re-render after deletion
    });

    // ---------- Edit Button ----------
    card.querySelector(".edit-btn").addEventListener("click", () => {
      // TODO: Check user auth before editing
      currentEditIndex = index;
      editForm.slang.value = slang.word;
      editForm.meaning.value = slang.meaning;
      editForm.tags.value = slang.tags.join(", ");
      editForm.difficulty.value = slang.difficulty;

      editModal.classList.add("show");
    });
  });
}

// ---------- Search & Filter ----------
function filterSlangs() {
  const query = searchInput.value.toLowerCase();
  const category = filterCategory.value;
  const difficulty = filterDifficulty.value;

  const filtered = slangs.filter(s => {
    const matchesQuery = s.word.toLowerCase().includes(query);
    const matchesCategory = category ? s.tags.includes(category) : true;
    const matchesDifficulty = difficulty ? s.difficulty === difficulty : true;
    return matchesQuery && matchesCategory && matchesDifficulty;
  });

  renderSlangs(filtered);
}

searchInput.addEventListener("input", filterSlangs);
filterCategory.addEventListener("change", filterSlangs);
filterDifficulty.addEventListener("change", filterSlangs);

// ---------- Add New Slang ----------
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const word = addForm.slang.value.trim();
  const meaning = addForm.meaning.value.trim();
  const tags = addForm.tags.value.split(",").map(t => t.trim()).filter(Boolean);
  const difficulty = addForm.difficulty.value;

  slangs.push({
    word,
    meaning,
    tags,
    difficulty,
    date: new Date().toISOString().split("T")[0],
  });

  addForm.reset();
  filterSlangs();
});

// ---------- Edit Slang ----------
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentEditIndex !== null) {
    slangs[currentEditIndex].meaning = editForm.meaning.value.trim();
    slangs[currentEditIndex].tags = editForm.tags.value.split(",").map(t => t.trim()).filter(Boolean);
    slangs[currentEditIndex].difficulty = editForm.difficulty.value;
    filterSlangs();
    editModal.classList.remove("show");
  }
});

document.getElementById("closeModal").addEventListener("click", () => {
  editModal.classList.remove("show");
});

// ---------- Initial render ----------
filterSlangs();
