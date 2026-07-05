let lightboxItems = [];
let currentIndex = 0;

export function initGallery() {
  document.querySelectorAll('.gallery-track').forEach(track => {
    const items = track.querySelectorAll('.gallery-item');
    items.forEach((item, idx) => {
      item.addEventListener('click', () => openLightbox(track, idx));
    });
  });

  const close = document.getElementById('lightboxClose');
  const prev = document.getElementById('lightboxPrev');
  const next = document.getElementById('lightboxNext');
  const lb = document.getElementById('lightbox');

  close?.addEventListener('click', closeLightbox);
  prev?.addEventListener('click', () => navigateLightbox(-1));
  next?.addEventListener('click', () => navigateLightbox(1));

  lb?.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb?.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(track, startIndex) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const items = track.querySelectorAll('.gallery-item');
  lightboxItems = Array.from(items);
  currentIndex = startIndex;

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
  lightboxItems = [];
}

function navigateLightbox(dir) {
  currentIndex = (currentIndex + dir + lightboxItems.length) % lightboxItems.length;
  renderLightboxItem();
}

function renderLightboxItem() {
  const content = document.getElementById('lightboxContent');
  if (!content || !lightboxItems.length) return;

  const item = lightboxItems[currentIndex];
  content.innerHTML = '';

  if (item.classList.contains('placeholder')) {
    const label = item.dataset.label || 'Fotografija';
    const div = document.createElement('div');
    div.className = 'placeholder-lb';
    div.textContent = label;
    content.appendChild(div);
  } else {
    const img = item.querySelector('img');
    if (img) {
      const clone = document.createElement('img');
      clone.src = img.src;
      clone.alt = img.alt || '';
      content.appendChild(clone);
    }
  }

  // Show/hide prev-next arrows
  const showNav = lightboxItems.length > 1;
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (prevBtn) prevBtn.style.display = showNav ? '' : 'none';
  if (nextBtn) nextBtn.style.display = showNav ? '' : 'none';
}
