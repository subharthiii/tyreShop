/* ================================
   SKT TYRES — V5
   script.js
   ================================ */

// Navbar shadow on scroll
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(0,0,0,0.4)'
      : 'none';
  });
}

// HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.navbar__links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// DARK / LIGHT MODE TOGGLE
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  // Check if user already picked a theme last time
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// ---- GOOGLE SHEETS INTEGRATION ----
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUMRdqUqR1a-feYaBw_r_a3KByEeob9iRe85rLBKwReXvPHqz3PBtxGps1Y8ytCdxm6NapOdyA1GLC/pub?gid=0&single=true&output=csv';

const grid = document.getElementById('tyreGrid');

if (grid) {
  // Show loading state
  grid.innerHTML = `<p style="color:var(--color-gray-lt);font-size:0.9rem;">Loading tyres...</p>`;

  fetch(SHEET_URL)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      const tyres = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
      });

      // Build cards
      grid.innerHTML = '';
      tyres.forEach(tyre => {
        const logoSrc = tyre.brandKey === 'bridgestone'
          ? 'images/B-logo.png'
          : 'images/jk-logo.png';

        const imageSrc = tyre.imageUrl
          ? tyre.imageUrl
          : 'https://placehold.co/280x160/222228/888888?text=Tyre';

        const card = document.createElement('div');
        card.className = 'tyre-card';
        card.dataset.brand = tyre.brandKey;
        card.dataset.vehicle = tyre.vehicleKey;
        card.dataset.size = tyre.size.replace(/\s/g, '');

        card.innerHTML = `
          <img class="tyre-card__img" src="${imageSrc}" alt="${tyre.model}">
          <div class="tyre-card__header">
            <img class="tyre-card__logo" src="${logoSrc}" alt="${tyre.brand}">
            <span class="tyre-card__vehicle">${tyre.vehicle}</span>
          </div>
          <h3 class="tyre-card__model">${tyre.model}</h3>
          <p class="tyre-card__size">${tyre.size}</p>
          <p class="tyre-card__price">${tyre.price}</p>
          <a href="index.html#contact" class="btn btn--primary">Enquire Now</a>
        `;

        grid.appendChild(card);
      });

      // Re-attach filters after cards are built
      applyFilters();
    })
    .catch(err => {
      grid.innerHTML = `<p style="color:var(--color-gray-lt);">Could not load tyres. Please try again later.</p>`;
      console.error('Sheet fetch error:', err);
    });
}

// ---- FILTERS ----
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

// Auto-filter from URL param e.g. listing.html?cat=cars
const params = new URLSearchParams(window.location.search);
const cat = params.get('cat');
if (cat && checkboxes.length) {
  checkboxes.forEach(cb => {
    if (cb.value === cat) cb.checked = true;
  });
  applyFilters();
}