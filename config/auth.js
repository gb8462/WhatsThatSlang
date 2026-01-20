/* ======================
   IMPORTS
====================== */
import { auth } from "./firebase.js";
import { db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ======================
   DOM ELEMENTS
====================== */
const slangForm = document.querySelector(".slang-form");
const slangList = document.querySelector(".slang-list");
const slangSearch = document.getElementById("slangSearch");
const rollBtn = document.getElementById("rollSlang");
const randomResult = document.getElementById("randomResult");

const nameEl = document.querySelector(".user-name");
const statusEl = document.querySelector(".user-status");
const avatarEl = document.querySelector(".avatar");
const authBtn = document.getElementById("authActionBtn");

/* ======================
   TOAST ALERT
====================== */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="icon">${type === "success" ? "✓" : type === "error" ? "!" : "i"}</div>
    <div class="message">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

/* ======================
   CONFIRM TOAST
===================== */
function showConfirmToast(message, onConfirm, onCancel) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast warning confirm-toast";
  toast.innerHTML = `
    <div class="message">${message}</div>
    <div class="actions">
      <button class="btn btn-confirm">Overwrite</button>
      <button class="btn btn-cancel">Cancel</button>
    </div>
  `;

  container.appendChild(toast);

  // Handle clicks
  toast.querySelector(".btn-confirm").addEventListener("click", () => {
    if (typeof onConfirm === "function") onConfirm();
    toast.remove();
  });

  toast.querySelector(".btn-cancel").addEventListener("click", () => {
    if (typeof onCancel === "function") onCancel();
    toast.remove();
  });
}

/* ======================
   HELPERS
====================== */
function closeAllModals() {
  document.querySelectorAll(".login-modal").forEach(m => {
    m.style.display = "none";
  });
}

function authError(err) {
  switch (err.code) {
    case "auth/user-not-found": return "Account does not exist";
    case "auth/wrong-password": return "Wrong password";
    case "auth/email-already-in-use": return "Email already registered";
    case "auth/invalid-email": return "Invalid email address";
    default: return err.message;
  }
}

/* ======================
   FIRESTORE — SLANGS
====================== */
async function loadSlangs() {
  slangList.innerHTML = "";

  const q = query(collection(db, "slangs"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();

    slangList.insertAdjacentHTML("beforeend", `
      <div class="slang-item"
        data-word="${data.word}"
        data-description="${data.description}"
        data-usage="${data.usage || "—"}"
        data-origin="${data.origin || "Unknown"}"
        data-background="${data.background || "—"}"
        data-author="${data.author || "Anonymous"}"
      >
        <h3>${data.word}</h3>
        <p>${data.description}</p>
        <small>${data.origin || "Unknown"} • by ${data.author || "Anonymous"}</small>
      </div>
    `);
  });
}

loadSlangs();

const modal = document.getElementById("slangModal");

slangList.addEventListener("click", (e) => {
  const item = e.target.closest(".slang-item");
  if (!item) return;

  document.getElementById("modalWord").textContent = item.dataset.word;
  document.getElementById("modalDescription").textContent = item.dataset.description;
  document.getElementById("modalUsage").textContent = item.dataset.usage;
  document.getElementById("modalOrigin").textContent = item.dataset.origin;
  document.getElementById("modalBackground").textContent = item.dataset.background;
  document.getElementById("modalAuthor").textContent =
    "Submitted by " + item.dataset.author;

  modal.classList.add("active");
});

document.getElementById("closeModal").onclick = () =>
  modal.classList.remove("active");

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

/* ======================
   CREATE SLANG
===================== */
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* Form submit handler */
slangForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    showToast("Login required to submit slang", "error");
    return;
  }

  const [wordInput, descInput, usageInput, originInput, bgInput] =
    slangForm.querySelectorAll("input, textarea");

  const word = wordInput.value.trim();
  const description = descInput.value.trim();
  const usage = usageInput.value.trim();
  const origin = originInput.value.trim();
  const background = bgInput.value.trim();

  if (!word || !description) {
    showToast("Slang and description are required", "error");
    return;
  }

  const wordId = word.toLowerCase();
  const docRef = doc(db, "slangs", wordId);

  try {
    const existingSnap = await getDoc(docRef);

    if (existingSnap.exists()) {
      // Slang exists — ask user to overwrite
      showConfirmToast(
        `Slang "${word}" already exists!`,
        async () => {
          await setDoc(docRef, {
            word,
            wordLower: wordId,
            description,
            usage,
            origin,
            background,
            author: auth.currentUser.displayName || "Anonymous",
            createdAt: Date.now()
          });
          showToast("Slang updated!", "success");
          slangForm.reset();
          loadSlangs();
        },
        () => showToast("Cancelled", "info")
      );
      return; // stop until user chooses
    }

    // Slang doesn't exist — create new
    await setDoc(docRef, {
      word,
      wordLower: wordId,
      description,
      usage,
      origin,
      background,
      author: auth.currentUser.displayName || "Anonymous",
      createdAt: Date.now()
    });

    showToast("Slang submitted!", "success");
    slangForm.reset();
    loadSlangs();
  } catch (err) {
    console.error("Error submitting slang:", err);
    showToast("Failed to submit slang", "error");
  }
});

/* ======================
   SEARCH SLANGS
===================== */
slangSearch?.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();

  Array.from(document.querySelectorAll(".slang-item")).forEach((item) => {
    const word = item.querySelector("h3")?.textContent.toLowerCase() || "";
    const description = item.querySelector("p")?.textContent.toLowerCase() || "";
    const usage = item.querySelector("em")?.textContent.toLowerCase() || "";

    const match = word.includes(term) || description.includes(term) || usage.includes(term);

    item.style.display = match ? "block" : "none";
  });
});

/* ======================
   RANDOM SLANG
====================== */
rollBtn?.addEventListener("click", async () => {
  const snapshot = await getDocs(collection(db, "slangs"));
  if (snapshot.empty) {
    randomResult.textContent = "No slangs yet 😢";
    return;
  }

  const random = snapshot.docs[
    Math.floor(Math.random() * snapshot.docs.length)
  ].data();

  randomResult.innerHTML = `
    <span style="font-weight: bold;">${random.word}</span>: ${random.description}
    ${random.usage ? ` - <em>${random.usage}</em>` : ""}
  `;
});

/* ======================
   GOOGLE AUTH
====================== */
const provider = new GoogleAuthProvider();

document.querySelectorAll(".google-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      showToast(`Logged in as ${result.user.displayName || result.user.email}`, "success");
      closeAllModals();
    } catch (err) {
      showToast(authError(err), "error");
    }
  });
});

/* ======================
   LOGIN
====================== */
document.getElementById("authSubmitLogin")?.addEventListener("click", async () => {
  const email = emailLogin.value.trim();
  const password = passwordLogin.value;

  if (!email || !password) {
    showToast("Please fill in email and password", "error");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Welcome back!", "success");
    closeAllModals();
  } catch (err) {
    showToast(authError(err), "error");
  }
});

/* ======================
   SIGN UP
====================== */
document.getElementById("authSubmitSignup")?.addEventListener("click", async () => {
  const name = nameSignup.value.trim();
  const email = emailSignup.value.trim();
  const password = passwordSignup.value;
  const confirm = confirmPasswordSignup.value;

  if (!name || !email || !password || !confirm) {
    showToast("All fields are required", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  if (password !== confirm) {
    showToast("Passwords do not match", "error");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    showToast("Account created successfully", "success");
    closeAllModals();
  } catch (err) {
    showToast(authError(err), "error");
  }
});

/* ======================
   FORGOT PASSWORD
====================== */
document.getElementById("authSubmitForgot")?.addEventListener("click", async () => {
  const email = emailForgot.value.trim();

  if (!email) {
    showToast("Please enter your email", "error");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset link sent", "success");
  } catch (err) {
    showToast(authError(err), "error");
  }
});

/* ======================
   AUTH STATE UI
====================== */
// Hide sidebar until auth state is determined
nameEl.textContent = "";
statusEl.textContent = "";
avatarEl.textContent = "";
authBtn.style.display = "none";

onAuthStateChanged(auth, (user) => {
  // Now we know auth state, show sidebar
  authBtn.style.display = "inline-block";

  if (user) {
    const displayName = user.displayName || user.email;

    nameEl.textContent = displayName;
    statusEl.textContent = "Online";
    avatarEl.textContent = displayName[0].toUpperCase();

    authBtn.textContent = "Logout";
    authBtn.onclick = async () => {
      await signOut(auth);
      showToast("Logged out", "info");
    };
  } else {
    nameEl.textContent = "Guest";
    statusEl.textContent = "Not signed in";
    avatarEl.textContent = "G";

    authBtn.textContent = "Login";
    authBtn.onclick = () => {
      document.getElementById("loginModal").style.display = "flex";
    };
  }
});

/* ======================
   TOGGLE PASSWORD
====================== */
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    const hidden = input.type === "password";

    input.type = hidden ? "text" : "password";
    icon.classList.toggle("fa-eye", !hidden);
    icon.classList.toggle("fa-eye-slash", hidden);
  });
});

