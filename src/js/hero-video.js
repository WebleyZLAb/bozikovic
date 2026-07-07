const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Max time to wait for enough buffering before playing anyway — a very slow
// connection shouldn't leave visitors staring at the poster indefinitely.
const BUFFER_TIMEOUT_MS = 4000;

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

  // Pick the source in JS instead of <source media="">: iOS WebKit (both
  // Safari and Chrome run the same engine there) has been unreliable about
  // honoring the media query on <video><source>, silently falling back to
  // the desktop file on phones. Reading matchMedia ourselves is unambiguous.
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  video.src = isMobile
    ? '/hero-video/hero-video-mobile.mp4'
    : '/hero-video/hero-video-desktop.mp4';
  // The desktop poster photo doesn't match the mobile video's framing, so on
  // mobile drop it — the sand background + centered logo (CSS) shows
  // instead while the video buffers.
  if (isMobile) video.removeAttribute('poster');
  video.load();

  video.addEventListener('ended', finish);
  video.addEventListener('error', finish);
  wrap.addEventListener('click', finish);
  wrap.addEventListener('touchend', finish);

  function startPlayback() {
    video.playbackRate = 1.4;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(finish);
    }
  }

  // Wait for enough of the video to buffer to play through without
  // stalling, so slow connections don't outrun the download mid-playback
  // (that's what looked like a "zoom"/stutter on a weak signal).
  let started = false;
  let bufferTimeout;
  const begin = () => {
    if (started) return;
    started = true;
    clearTimeout(bufferTimeout);
    startPlayback();
  };

  if (video.readyState >= 4 /* HAVE_ENOUGH_DATA */) {
    begin();
  } else {
    video.addEventListener('canplaythrough', begin, { once: true });
    bufferTimeout = setTimeout(begin, BUFFER_TIMEOUT_MS);
  }
}
