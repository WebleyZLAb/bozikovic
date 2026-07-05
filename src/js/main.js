import Lenis from 'lenis';
import L from 'leaflet';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initI18n } from './i18n.js';
import { initHotspots } from './hotspots.js';
import { initGallery } from './gallery.js';
import { initAnimations } from './animations.js';
import { initHeroVideo } from './hero-video.js';

// ── Lenis smooth scroll ───────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

// Keep ScrollTrigger in sync with Lenis's virtual scroll position, and drive
// Lenis off GSAP's own ticker so both stay on the same animation frame.
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ── Footer year ──────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Leaflet map ───────────────────────────────────────────────────────────
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Koordinate: Sv. Martin 94, Podstrana (prilagoditi ako treba)
  const LAT = 43.4835;
  const LNG = 16.5478;

  const map = L.map('map', {
    center: [LAT, LNG],
    zoom: 15,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Custom terracotta pin via DivIcon
  const pinIcon = L.divIcon({
    className: 'custom-pin',
    html: `<svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30S36 31.5 36 18C36 8.059 27.941 0 18 0z" fill="#C4622D"/>
      <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
      <circle cx="18" cy="18" r="5" fill="#C4622D"/>
    </svg>`,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });

  L.marker([LAT, LNG], { icon: pinIcon })
    .addTo(map)
    .bindPopup(
      `<strong>Apartmani Božiković</strong><br>Sv. Martin 94, Podstrana`,
      { maxWidth: 200 }
    )
    .openPopup();
}

// ── Init all modules ──────────────────────────────────────────────────────
async function main() {
  await initI18n();
  initHotspots(lenis);
  initGallery();
  initAnimations();
  initMap();
  initHeroVideo(lenis);
}

main();
