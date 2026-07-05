import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
