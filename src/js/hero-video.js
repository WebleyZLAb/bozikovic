const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initHeroVideo(lenisInstance) {
  const hero = document.getElementById('hero');
  const wrap = document.getElementById('heroVideoWrap');
  const video = document.getElementById('heroVideo');
  if (!hero || !wrap || !video) return;

  let done = false;

  function finish() {
    if (done) return;
    done = true;

    hero.classList.remove('is-video-playing');
    document.body.classList.remove('video-intro-active');
    wrap.classList.add('is-hidden');
    if (lenisInstance) lenisInstance.start();

    setTimeout(() => wrap.remove(), 700);
  }

  if (prefersReducedMotion()) {
    wrap.remove();
    return;
  }

  hero.classList.add('is-video-playing');
  document.body.classList.add('video-intro-active');
  if (lenisInstance) lenisInstance.stop();

  video.addEventListener('ended', finish);
  video.addEventListener('error', finish);
  wrap.addEventListener('click', finish);
  wrap.addEventListener('touchend', finish);

  video.playbackRate = 1.4;
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(finish);
  }
}
