/* ================================
   SKT TYRES — V5
   script.js (index.html only)
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
const navLinks  = document.querySelector('.navbar__links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// DARK / LIGHT MODE TOGGLE
const themeToggle = document.getElementById('themeToggle');
const moonIcon    = document.getElementById('moonIcon');
const sunIcon     = document.getElementById('sunIcon');

if (themeToggle) {
  const savedTheme = localStorage.getItem('theme') ?? 'light';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    moonIcon.style.display = 'none';
    sunIcon.style.display  = 'block';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    moonIcon.style.display = isLight ? 'none'  : 'block';
    sunIcon.style.display  = isLight ? 'block' : 'none';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}