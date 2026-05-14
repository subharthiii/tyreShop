import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGr0yEXsGjoHundodFx6iwIYrBw4qWgxY",
  authDomain: "skt-tyres.firebaseapp.com",
  projectId: "skt-tyres",
  storageBucket: "skt-tyres.firebasestorage.app",
  messagingSenderId: "306416135466",
  appId: "1:306416135466:web:1d8681dbb534130cf78253"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);