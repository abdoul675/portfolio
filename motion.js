'use strict';

// Content is visible in the base HTML. Animation is progressive enhancement.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const controls = [...document.querySelectorAll('[data-motion-toggle]')];
  const running = new Set();
  const revealed = new WeakSet();
  let optedOut = false;
  try { optedOut = localStorage.getItem('portfolio-motion') === 'off'; } catch {}
  let enabled = !preference.matches && !optedOut;
  const canAnimate = typeof Element.prototype.animate === 'function';

  function play(element, frames, options = {}) {
    if (!enabled || !canAnimate || !element) return;
    const animation = element.animate(frames, {duration: 600, easing: 'cubic-bezier(.18,.7,.25,1)', fill: 'both', ...options});
    running.add(animation);
    animation.finished.then(() => animation.cancel(), () => {}).finally(() => running.delete(animation));
  }
  function setPreference() {
    enabled = canAnimate && !preference.matches && !optedOut;
    document.documentElement.dataset.motion = enabled ? 'on' : 'off';
    controls.forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(enabled));
      button.disabled = preference.matches || !canAnimate;
      const text = preference.matches ? 'Animations réduites (système)' : enabled ? 'Animations activées' : 'Animations désactivées';
      button.querySelector('[data-motion-label]').textContent = text;
    });
    if (!enabled) {
      running.forEach(animation => animation.cancel());
      running.clear();
      document.querySelectorAll('.project-cover').forEach(cover => {
        cover.style.removeProperty('--art-x');
        cover.style.removeProperty('--art-y');
      });
    }
  }
  controls.forEach(button => button.addEventListener('click', () => {
    optedOut = !optedOut;
    try {localStorage.setItem('portfolio-motion', optedOut ? 'off' : 'on');} catch {}
    setPreference();
  }));
  preference.addEventListener('change', setPreference);
  setPreference();

  // The entry takes less than a second and never blocks interaction.
  const intro = document.querySelector('.hero .intro');
  if (intro) {
    [...intro.children].forEach((element, index) => {
      play(element, [{opacity: 0, transform: 'translate3d(0,20px,0)'}, {opacity: 1, transform: 'translate3d(0,0,0)'}], {duration: 650, delay: Math.min(index * 55, 280)});
      revealed.add(element);
    });
  }
  play(document.querySelector('.portrait-area'), [{opacity: 0, transform: 'translate3d(0,24px,0) scale(.97)'}, {opacity: 1, transform: 'translate3d(0,0,0) scale(1)'}], {duration: 850, delay: 100});

  if ('IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.about-section .section-top, .about-grid, .process-heading, .process-step, #projets>.section-top, .kori-project, .portfolio-projects>.project, .future-grid>.project, .academic-heading, .project.featured, .project-grid>.project, .skills-section .section-top, .skills-grid>div, .timeline article, .contact-inner>h2');
    const observer = new IntersectionObserver(entries => {
      let stagger = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting || revealed.has(entry.target)) return;
        revealed.add(entry.target);
        observer.unobserve(entry.target);
        play(entry.target, [{opacity: 0, transform: 'translate3d(0,22px,0)'}, {opacity: 1, transform: 'translate3d(0,0,0)'}], {duration: 560, delay: Math.min(stagger++ * 55, 165)});
        if (entry.target.classList.contains('kori-project')) {
          const route = entry.target.querySelector('.transport-route path');
          if (route && enabled) {
            const length = route.getTotalLength();
            route.style.strokeDasharray = String(length);
            play(route, [{strokeDashoffset: length}, {strokeDashoffset: 0}], {duration: 1100, delay: 150});
          }
        }
      });
    }, {threshold: 0, rootMargin: '0px 0px -35px 0px'});
    targets.forEach(element => observer.observe(element));
  }

  // One update per frame; no scroll hijacking or artificial scroll speed.
  const progress = document.querySelector('.read-progress');
  if (progress) {
    progress.hidden = false;
    const indicator = progress.querySelector('span');
    let queued = false;
    function paintProgress() {
      const height = document.documentElement.scrollHeight - innerHeight;
      const ratio = height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0;
      indicator.style.transform = `scaleX(${ratio})`;
      queued = false;
    }
    function queueProgress() {if (!queued) {queued = true; requestAnimationFrame(paintProgress);}}
    addEventListener('scroll', queueProgress, {passive: true});
    addEventListener('resize', queueProgress, {passive: true});
    paintProgress();
  }

  // Small decorative feedback for a precise pointer; touch remains unchanged.
  document.querySelectorAll('.project-cover').forEach(cover => {
    let bounds = null;
    let pending = 0;
    let x = 0;
    let y = 0;
    cover.addEventListener('pointerenter', () => {bounds = cover.getBoundingClientRect();});
    cover.addEventListener('pointermove', event => {
      if (!enabled || !finePointer.matches || !bounds) return;
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      if (!pending) pending = requestAnimationFrame(() => {
        pending = 0;
        if (!enabled) return;
        cover.style.setProperty('--art-x', `${x * 6}px`);
        cover.style.setProperty('--art-y', `${y * 6}px`);
      });
    }, {passive: true});
    cover.addEventListener('pointerleave', () => {
      if (pending) cancelAnimationFrame(pending);
      pending = 0;
      bounds = null;
      cover.style.removeProperty('--art-x');
      cover.style.removeProperty('--art-y');
    });
  });
})();
