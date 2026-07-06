import { gsap } from 'gsap';
import { horizontalLoop } from './gallery-loop.js';

const GALLERY_IMAGES = {
  studio: ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6'],
  a3: ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6'],
  a4: ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-8', '4-9'],
};

const GALLERY_LABELS = {
  studio: 'Studio',
  a3: 'Apartman A3',
  a4: 'Apartman A4+2',
};

const loops = [];
let lightboxImages = [];
let lightboxIndex = 0;

export function initGallery() {
  Object.keys(GALLERY_IMAGES).forEach(buildGallery);
  initLightbox();
  gsap.ticker.add(updateAllDepths);
}

function buildGallery(key) {
  const track = document.getElementById(`gallery-${key}`);
  const viewport = track?.closest('.gallery-viewport');
  if (!track || !viewport) return;

  const label = GALLERY_LABELS[key] || key;
  const images = GALLERY_IMAGES[key].map((name) => `/images/slike apartmana/${name}.jpg`);

  track.innerHTML = images
    .map(
      (src, i) => `
      <div class="gallery-tile" data-index="${i}">
        <img src="${src}" alt="${label} — fotografija ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" />
      </div>`
    )
    .join('');

  const tiles = track.querySelectorAll('.gallery-tile');
  tiles.forEach((tile) => {
    tile.addEventListener('click', () => openLightbox(images, Number(tile.dataset.index)));
  });

  const loop = horizontalLoop(tiles, { paused: true, draggable: true, center: viewport });
  loop.toIndex(0, { duration: 0 });
  loops.push(track);

  const nav = (dir) => () => loop[dir === 1 ? 'next' : 'previous']({ duration: 0.4, ease: 'power2.inOut' });
  viewport.querySelector('.gallery-arrow--prev')?.addEventListener('click', nav(-1));
  viewport.querySelector('.gallery-arrow--next')?.addEventListener('click', nav(1));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nav(-1)();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nav(1)();
    }
  });
}

function updateAllDepths() {
  loops.forEach(updateDepth);
}

function updateDepth(track) {
  const viewport = track.closest('.gallery-viewport');
  if (!viewport) return;
  const vRect = viewport.getBoundingClientRect();
  const centerX = vRect.left + vRect.width / 2;

  track.querySelectorAll('.gallery-tile').forEach((tile) => {
    const rect = tile.getBoundingClientRect();
    const tileCenter = rect.left + rect.width / 2;
    const dist = Math.abs(tileCenter - centerX);
    const maxDist = vRect.width / 2 + rect.width / 2;
    const t = Math.min(dist / maxDist, 1);
    gsap.set(tile, {
      scale: gsap.utils.mapRange(0, 1, 1, 0.82, t),
      opacity: gsap.utils.mapRange(0, 1, 1, 0.55, t),
    });
  });
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function initLightbox() {
  const close = document.getElementById('lightboxClose');
  const prev = document.getElementById('lightboxPrev');
  const next = document.getElementById('lightboxNext');
  const lb = document.getElementById('lightbox');

  close?.addEventListener('click', closeLightbox);
  prev?.addEventListener('click', () => navigateLightbox(-1));
  next?.addEventListener('click', () => navigateLightbox(1));

  lb?.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(images, startIndex) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lightboxImages = images;
  lightboxIndex = startIndex;

  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  renderLightboxItem();

  document.getElementById('lightboxClose')?.focus();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.hidden = true;
  document.body.style.overflow = '';
  lightboxImages = [];
}

function navigateLightbox(dir) {
  if (!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  renderLightboxItem();
}

function renderLightboxItem() {
  const content = document.getElementById('lightboxContent');
  if (!content || !lightboxImages.length) return;

  content.innerHTML = '';
  const img = document.createElement('img');
  img.src = lightboxImages[lightboxIndex];
  img.alt = '';
  content.appendChild(img);

  const showNav = lightboxImages.length > 1;
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (prevBtn) prevBtn.style.display = showNav ? '' : 'none';
  if (nextBtn) nextBtn.style.display = showNav ? '' : 'none';
}
