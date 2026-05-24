import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const brandMap   = { bs: 'Bridgestone', jk: 'JK Tyre' };
const vehicleMap = { cars: 'Cars & SUVs', trucks: 'Trucks & Commercial' };

function stockStatus(qty) {
  if (qty <= 0) return { label: 'Out of Stock', color: '#ef4444' };
  if (qty <= 5) return { label: 'Low Stock',    color: '#f59e0b' };
  return             { label: 'In Stock',       color: '#22c55e' };
}

const loginScreen    = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginBtn       = document.getElementById('loginBtn');
const logoutBtn      = document.getElementById('logoutBtn');
const loginError     = document.getElementById('loginError');
const addTyreBtn     = document.getElementById('addTyreBtn');
const adminListings  = document.getElementById('adminListings');

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

loginBtn.addEventListener('click', async () => {
  const email    = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = 'Wrong email or password.';
  }
});

document.getElementById('passwordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', () => signOut(auth));

async function loadListings() {
  adminListings.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'tyres'));
  snapshot.forEach(docSnap => {
    const t   = docSnap.data();
    const id  = docSnap.id;
    const qty = t.quantity ?? 0;
    const s   = stockStatus(qty);

    const row = document.createElement('div');
    row.className = 'admin-tyre-row';
    row.innerHTML = `
      <div class="admin-tyre-row__info">
        <p class="admin-tyre-row__name">${t.brand} — ${t.model}</p>
        <p class="admin-tyre-row__detail">${t.size} · ${t.vehicle} · ${t.price}</p>
        <span style="color:${s.color};font-size:0.75rem;font-weight:700;">● ${s.label}</span>
      </div>
      <div class="stock-controls">
        <button class="stock-btn" data-action="minus">−</button>
        <span class="stock-count">${qty}</span>
        <button class="stock-btn" data-action="plus">+</button>
      </div>
      <button class="btn btn--outline edit-btn" style="font-size:0.7rem;padding:0.4rem 0.85rem;">Edit</button>
      <button class="btn btn--danger del-btn" style="font-size:0.7rem;padding:0.4rem 0.85rem;">Delete</button>
    `;

    row.querySelectorAll('.stock-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const current = parseInt(row.querySelector('.stock-count').textContent);
        const newQty  = btn.dataset.action === 'plus' ? current + 1 : Math.max(0, current - 1);
        await updateDoc(doc(db, 'tyres', id), { quantity: newQty });
        loadListings();
      });
    });

    row.querySelector('.del-btn').addEventListener('click', async () => {
      if (confirm('Delete this tyre?')) {
        await deleteDoc(doc(db, 'tyres', id));
        loadListings();
      }
    });

    row.querySelector('.edit-btn').addEventListener('click', () => openEditForm(id, t));

    adminListings.appendChild(row);
  });
}

function openEditForm(id, t) {
  document.getElementById('editFormContainer')?.remove();
  const container = document.createElement('div');
  container.id = 'editFormContainer';
  container.className = 'admin-form';
  container.style.marginTop = '2rem';
  container.innerHTML = `
    <h3 class="admin-form__title">Edit Tyre</h3>
    <div class="admin-form__grid">
      <select class="login-input" id="e-brandSelect">
        <option value="bs" ${t.brandKey==='bs'?'selected':''}>Bridgestone</option>
        <option value="jk" ${t.brandKey==='jk'?'selected':''}>JK Tyre</option>
      </select>
      <select class="login-input" id="e-vehicleSelect">
        <option value="cars"   ${t.vehicleKey==='cars'  ?'selected':''}>Cars & SUVs</option>
        <option value="trucks" ${t.vehicleKey==='trucks'?'selected':''}>Trucks & Commercial</option>
      </select>
      <input type="text"   class="login-input" id="e-model"    value="${t.model}"       placeholder="Model">
      <input type="text"   class="login-input" id="e-size"     value="${t.size}"        placeholder="Size">
      <input type="text"   class="login-input" id="e-price"    value="${t.price}"       placeholder="Price">
      <input type="number" class="login-input" id="e-quantity" value="${t.quantity??0}" placeholder="Quantity">
      <input type="text"   class="login-input" id="e-imageUrl" value="${t.imageUrl??''}" placeholder="Cloudinary Image URL" style="grid-column:span 2;">
    </div>
    <div style="display:flex;gap:0.75rem;margin-top:0.75rem;">
      <button class="btn btn--primary" id="saveEditBtn">Save Changes</button>
      <button class="btn btn--outline"  id="cancelEditBtn">Cancel</button>
    </div>
    <p class="login-error" id="editError"></p>
  `;
  document.querySelector('.admin-body').appendChild(container);
  container.scrollIntoView({ behavior: 'smooth' });

  document.getElementById('cancelEditBtn').addEventListener('click', () => container.remove());
  document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const brandKey   = document.getElementById('e-brandSelect').value;
    const vehicleKey = document.getElementById('e-vehicleSelect').value;
    await updateDoc(doc(db, 'tyres', id), {
      brand:      brandMap[brandKey],
      brandKey,
      model:      document.getElementById('e-model').value,
      size:       document.getElementById('e-size').value,
      vehicle:    vehicleMap[vehicleKey],
      vehicleKey,
      price:      document.getElementById('e-price').value,
      quantity:   parseInt(document.getElementById('e-quantity').value) || 0,
      imageUrl:   document.getElementById('e-imageUrl').value,
    });
    container.remove();
    loadListings();
  });
}

addTyreBtn.addEventListener('click', async () => {
  const brandKey   = document.getElementById('f-brandSelect').value;
  const vehicleKey = document.getElementById('f-vehicleSelect').value;
  const tyre = {
    brand:      brandMap[brandKey],
    brandKey,
    model:      document.getElementById('f-model').value,
    size:       document.getElementById('f-size').value,
    vehicle:    vehicleMap[vehicleKey],
    vehicleKey,
    price:      document.getElementById('f-price').value,
    quantity:   parseInt(document.getElementById('f-quantity').value) || 0,
    imageUrl:   document.getElementById('f-imageUrl').value,
  };
  if (!tyre.brand || !tyre.model || !tyre.size || !tyre.price) {
    document.getElementById('addError').textContent = 'Please fill in all required fields.';
    return;
  }
  await addDoc(collection(db, 'tyres'), tyre);
  document.getElementById('addError').textContent = '';
  ['f-model','f-size','f-price','f-quantity','f-imageUrl'].forEach(id => {
    document.getElementById(id).value = '';
  });
  loadListings();
});