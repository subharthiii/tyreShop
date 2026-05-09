import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const loginScreen    = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginBtn       = document.getElementById('loginBtn');
const logoutBtn      = document.getElementById('logoutBtn');
const loginError     = document.getElementById('loginError');
const addTyreBtn     = document.getElementById('addTyreBtn');
const adminListings  = document.getElementById('adminListings');

// Check if already logged in
onAuthStateChanged(auth, user => {
  if (user) {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    loadListings();
  } else {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
  }
});

// LOGIN
loginBtn.addEventListener('click', async () => {
  const email    = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = 'Wrong email or password.';
  }
});

// LOGOUT
logoutBtn.addEventListener('click', () => signOut(auth));

// LOAD LISTINGS
async function loadListings() {
  adminListings.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'tyres'));
  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    const row = document.createElement('div');
    row.className = 'admin-tyre-row';
    row.innerHTML = `
      <div class="admin-tyre-row__info">
        <p class="admin-tyre-row__name">${t.brand} — ${t.model}</p>
        <p class="admin-tyre-row__detail">${t.size} · ${t.vehicle} · ${t.price}</p>
      </div>
      <button class="btn btn--danger" data-id="${docSnap.id}">Delete</button>
    `;
    row.querySelector('.btn--danger').addEventListener('click', async () => {
      await deleteDoc(doc(db, 'tyres', docSnap.id));
      loadListings();
    });
    adminListings.appendChild(row);
  });
}

// ADD TYRE
addTyreBtn.addEventListener('click', async () => {
  const tyre = {
    brand:      document.getElementById('f-brand').value,
    brandKey:   document.getElementById('f-brandKey').value,
    model:      document.getElementById('f-model').value,
    size:       document.getElementById('f-size').value,
    vehicle:    document.getElementById('f-vehicle').value,
    vehicleKey: document.getElementById('f-vehicleKey').value,
    price:      document.getElementById('f-price').value,
    imageUrl:   document.getElementById('f-imageUrl').value,
  };

  if (!tyre.brand || !tyre.model || !tyre.size || !tyre.price) {
    document.getElementById('addError').textContent = 'Please fill in all required fields.';
    return;
  }

  await addDoc(collection(db, 'tyres'), tyre);
  document.getElementById('addError').textContent = '';
  document.querySelectorAll('.login-input').forEach(i => i.value = '');
  loadListings();
});