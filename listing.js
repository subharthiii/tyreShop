import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const grid = document.getElementById('tyreGrid');

async function loadTyres() {
  grid.innerHTML = '<p style="color:var(--color-gray-lt);font-size:0.9rem;">Loading tyres...</p>';
  
  const snapshot = await getDocs(collection(db, 'tyres'));
  grid.innerHTML = '';

  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    
   const logoSrc = t.brandKey === 'bs'
        ? 'images/B-logo.png'
        : 'images/jk-logo.png';

    const imageSrc = t.imageUrl
      ? t.imageUrl
      : 'https://placehold.co/280x160/222228/888888?text=Tyre';

    const card = document.createElement('div');
    card.className = 'tyre-card';
    card.dataset.brand = t.brandKey;
    card.dataset.vehicle = t.vehicleKey;
    card.dataset.size = t.size ? t.size.replace(/\s/g, '') : '';

    card.innerHTML = `
      <img class="tyre-card__img" src="${imageSrc}" alt="${t.model}">
      <div class="tyre-card__header">
        <img class="tyre-card__logo" src="${logoSrc}" alt="${t.brand}">
        <span class="tyre-card__vehicle">${t.vehicle}</span>
      </div>
      <h3 class="tyre-card__model">${t.model}</h3>
      <p class="tyre-card__size">${t.size}</p>
      <p class="tyre-card__price">${t.price}</p>
      <a href="index.html#contact" class="btn btn--primary">Enquire Now</a>
    `;

    grid.appendChild(card);
  });

  applyFilters();
}

// FILTERS
const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
const clearBtn = document.getElementById('clearFilters');

function applyFilters() {
  const cards = document.querySelectorAll('.tyre-card');
  const checked = { brand: [], vehicle: [], size: [] };

  checkboxes.forEach(cb => {
    if (!cb.checked) return;
    const group = cb.closest('.filter-group');
    const label = group.querySelector('.filter-group__label').textContent.trim().toLowerCase();
    if (label === 'brand')        checked.brand.push(cb.value);
    if (label === 'vehicle type') checked.vehicle.push(cb.value);
    if (label === 'size')         checked.size.push(cb.value);
  });

  cards.forEach(card => {
    const matchBrand   = !checked.brand.length   || checked.brand.includes(card.dataset.brand);
    const matchVehicle = !checked.vehicle.length  || checked.vehicle.includes(card.dataset.vehicle);
    const matchSize    = !checked.size.length     || checked.size.includes(card.dataset.size);
    card.style.display = (matchBrand && matchVehicle && matchSize) ? '' : 'none';
  });
}

if (checkboxes.length) {
  checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = false);
    document.querySelectorAll('.tyre-card').forEach(card => card.style.display = '');
  });
}

// Auto filter from URL
const params = new URLSearchParams(window.location.search);
const cat = params.get('cat');
if (cat && checkboxes.length) {
  checkboxes.forEach(cb => {
    if (cb.value === cat) cb.checked = true;
  });
}

loadTyres();

// DARK / LIGHT MODE TOGGLE
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');

  if (!themeToggle) return;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    moonIcon.style.display = isLight ? 'none' : 'block';
    sunIcon.style.display = isLight ? 'block' : 'none';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
});