import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mobile browsers fire a resize event when the address bar hides/shows on
// scroll (roughly 1-2s after load), which would otherwise make ScrollTrigger
// re-measure everything and can look like reveals replaying.
ScrollTrigger.config({ ignoreMobileResize: true });

export function initAnimations() {
  const revealEls = document.querySelectorAll('.reveal');

  revealEls.forEach((el, i) => {
    // Group siblings in same parent for stagger
    const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'));
    const indexInGroup = siblings.indexOf(el);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay: indexInGroup * 0.1,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          onComplete: () => el.classList.add('is-visible'),
        });
      },
    });
  });
}

export function killAnimations() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
