import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkIItcB9wCJdgT6wLy6oOsIlRNeTc1KSE",
  authDomain: "whatsthatslang.firebaseapp.com",
  projectId: "whatsthatslang",
  storageBucket: "whatsthatslang.appspot.com",
  messagingSenderId: "370340327256",
  appId: "1:370340327256:web:704e73a415f8f4907eff2d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
