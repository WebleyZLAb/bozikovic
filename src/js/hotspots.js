import { gsap } from 'gsap';

// ─── CONFIG — adjust these coordinates (%) after seeing the first render ───
export const HOTSPOT_CONFIG = {
  studio: {
    id: 'hotspot-studio',
    target: '#studio',
    left: '22%',
    top: '35%',
  },
  a4: {
    id: 'hotspot-a4',
    target: '#apartman-a4',
    left: '68%',
    top: '30%',
  },
  a3: {
    id: 'hotspot-a3',
    target: '#apartman-a3',
    left: '25%',
    top: '65%',
  },
};

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

export function initHotspots(lenisInstance) {
  const wrap = document.getElementById('heroImageWrap');
  if (!wrap) return;

  document.querySelectorAll('.hotspot').forEach(hotspot => {
    const targetSelector = hotspot.dataset.target;

    hotspot.addEventListener('click', () => handleHotspotClick(hotspot, targetSelector, wrap, lenisInstance));
    hotspot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleHotspotClick(hotspot, targetSelector, wrap, lenisInstance);
      }
    });
  });
}

function handleHotspotClick(hotspot, targetSelector, wrap, lenisInstance) {
  const targetEl = document.querySelector(targetSelector);
  if (!targetEl) return;

  if (isMobile()) {
    scrollToTarget(targetEl, lenisInstance);
    return;
  }

  // Desktop: zoom animation toward the hotspot, then scroll, then reset
  const hotspotLeft = parseFloat(hotspot.style.left) / 100;
  const hotspotTop = parseFloat(hotspot.style.top) / 100;

  const originX = hotspotLeft * 100;
  const originY = hotspotTop * 100;

  gsap.timeline()
    .set(wrap, { transformOrigin: `${originX}% ${originY}%` })
    .to(wrap, {
      scale: 1.15,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        scrollToTarget(targetEl, lenisInstance);
        gsap.to(wrap, { scale: 1, duration: 0.6, ease: 'power2.inOut', delay: 0.3 });
      }
    });
}

function scrollToTarget(el, lenisInstance) {
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: -80, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
