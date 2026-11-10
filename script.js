document.getElementById('year').textContent = new Date().getFullYear();

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('main-nav');
const mobileLayout = window.matchMedia('(max-width: 760px)');
menuButton.hidden = false;
document.documentElement.classList.add('nav-js');
function closeMenu(restoreFocus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('is-open', expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
mobileLayout.addEventListener('change', () => closeMenu());
if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(link => {
      if (link.hash === '#' + visible.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, {rootMargin: '-15% 0px -55% 0px', threshold: 0});
  links.forEach(link => {const section=document.querySelector(link.hash);if(section)observer.observe(section);});
  const introduction = document.querySelector('.hero');
  if (introduction) observer.observe(introduction);
}
const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('.copy-status');
if (navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('koneabdoulkarim388@gmail.com');
      copyStatus.textContent = 'Adresse e-mail copiée.';
    } catch {
      copyStatus.textContent = 'Copie indisponible. Sélectionnez l’adresse ci-dessus ou cliquez pour écrire un e-mail.';
    }
  });
}
