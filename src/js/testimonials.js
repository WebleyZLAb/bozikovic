import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { testimonials } from './testimonials-data.js';

gsap.registerPlugin(SplitText);

const AUTOPLAY_MS = 6000;

let currentIndex = 0;
let split = null;
let autoplayTimer = null;

export function initTestimonials() {
  const slider = document.getElementById('testimonialSlider');
  if (!slider || !testimonials.length) return;

  renderSlide(0, false);

  document.getElementById('testimonialPrev')?.addEventListener('click', () => goTo(currentIndex - 1));
  document.getElementById('testimonialNext')?.addEventListener('click', () => goTo(currentIndex + 1));

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', startAutoplay);

  startAutoplay();
}

function goTo(index) {
  currentIndex = (index + testimonials.length) % testimonials.length;
  renderSlide(currentIndex, true);
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function renderSlide(index, animate) {
  const item = testimonials[index];
  const quoteEl = document.getElementById('testimonialQuote');
  const nameEl = document.getElementById('testimonialName');
  const locationEl = document.getElementById('testimonialLocation');
  const avatarEl = document.getElementById('testimonialAvatar');
  const counterEl = document.getElementById('testimonialCounter');
  if (!quoteEl) return;

  split?.revert();

  quoteEl.textContent = `“${item.text}”`;
  if (nameEl) nameEl.textContent = item.name;
  if (locationEl) locationEl.textContent = item.location;
  if (avatarEl) avatarEl.textContent = initials(item.name);
  if (counterEl) counterEl.textContent = `${index + 1} / ${testimonials.length}`;

  split = new SplitText(quoteEl, { type: 'lines', mask: 'lines' });

  if (animate) {
    gsap.from(split.lines, {
      yPercent: 100,
      stagger: 0.06,
      ease: 'power3.out',
      duration: 0.6,
    });
  } else {
    gsap.set(split.lines, { yPercent: 0 });
  }
}

function startAutoplay() {
  stopAutoplay();
  autoplayTimer = setInterval(() => goTo(currentIndex + 1), AUTOPLAY_MS);
}

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = null;
}
