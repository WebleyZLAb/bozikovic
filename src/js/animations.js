import { gsap } from 'gsap';

export function initAnimations() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);

        const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'));
        const indexInGroup = siblings.indexOf(el);

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay: indexInGroup * 0.1,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          onComplete: () => el.classList.add('is-visible'),
        });
      });
    },
    { rootMargin: '0px 0px -12% 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
}
