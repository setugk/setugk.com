document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const sw = document.querySelector('.light-switch');
  if (sw) {
    const apply = (isLight) => {
      document.body.classList.toggle('light-mode', isLight);
      sw.setAttribute('aria-checked', String(isLight));
    };
    apply(localStorage.getItem('theme') !== 'dark');
    sw.addEventListener('click', () => {
      const isLight = !document.body.classList.contains('light-mode');
      apply(isLight);
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // Magnetic buttons — nav links + article back button
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.top-nav-links a, .article-back').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transition = 'color 0.15s, background 0.15s, border-color 0.15s';
      el.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), color 0.15s, background 0.15s, border-color 0.15s';
      el.style.transform = '';
      el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform') el.style.transition = '';
      }, { once: true });
    });
  });
});
