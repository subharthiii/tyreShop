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

// ---- LISTING PAGE FILTERS ----
const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
const cards = document.querySelectorAll('.tyre-card');
const clearBtn = document.getElementById('clearFilters');

if (checkboxes.length && cards.length) {

  function applyFilters() {
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

  checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = false);
      cards.forEach(card => card.style.display = '');
    });
  }

  // Auto-filter from URL param e.g. listing.html?cat=cars
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if (cat) {
    checkboxes.forEach(cb => {
      if (cb.value === cat) {
        cb.checked = true;
      }
    });
    applyFilters();
  }
}