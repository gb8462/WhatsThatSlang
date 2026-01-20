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
    const { word, description, origin, author } = doc.data();

    slangList.insertAdjacentHTML("beforeend", `
      <div class="slang-item">
        <h3>${word}</h3>
        <p>${description}</p>
        <small>${origin || "Unknown"} • by ${author || "Anonymous"}</small>
      </div>
    `);
  });
}

loadSlangs();

/* ======================
   CREATE SLANG
===================== */
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

slangForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    showToast("Login required to submit slang", "error");
    return;
  }

  // Grab input values
  const [wordInput, descriptionInput, usageInput, originInput, backgroundInput] =
    slangForm.querySelectorAll("input, textarea");

  const word = wordInput.value.trim();
  const description = descriptionInput.value.trim();
  const usage = usageInput.value.trim();
  const origin = originInput.value.trim();
  const background = backgroundInput.value.trim();

  if (!word || !description) {
    showToast("Slang and description are required", "error");
    return;
  }

  try {
    // Normalize word for document ID
    const wordId = word.toLowerCase();

    // Reference to the document (deterministic ID)
    const docRef = doc(db, "slangs", wordId);

    // Check if slang already exists
    const existingSnap = await getDocs(
      query(collection(db, "slangs"), where("wordLower", "==", wordId))
    );

    if (!existingSnap.empty) {
      showToast(`Slang "${word}" already exists!`, "error");
      return;
    }

    // Add new slang — no merging, no overwrites
    await setDoc(docRef, {
      word,
      wordLower: wordId, // for future duplicate checks
      description,
      usage,
      origin,
      background,
      author: auth.currentUser.displayName || "Anonymous",
      createdAt: Date.now()
    });

    showToast("Slang submitted!", "success");
    slangForm.reset();
    loadSlangs(); // reload the slang list
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