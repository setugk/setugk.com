document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.top-nav');
  if (!nav) return;

  const path           = window.location.pathname;
  const onPage         = (name) => path.endsWith(name) ? ' class="nav-current"' : '';
  const isHome         = path === '/' || path.endsWith('index.html');
  const isWritingList  = path.endsWith('writing.html') || path.endsWith('/writing') || path === '/writing';
  const isLevel1       = isHome || isWritingList;
  const isWritingDeep  = !isLevel1 && path.includes('/writing');
  const crumbHref      = isWritingDeep ? '/writing.html' : '/';
  const crumbLabel     = isWritingDeep ? '/ Writing' : '/ Projects';

  const logoSVG = `<svg class="nav-logo" width="28" height="28" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#sk-nav-clip)">
            <rect width="96" height="96" rx="16" fill="var(--color-bg-primary)"/>
            <rect width="96" height="96" fill="var(--color-accent)"/>
            <path d="M103 48C103 78.3757 84.0938 103 48 103C9.04167 103 -7 78.3757 -7 48C-7 17.6243 17.6243 -7 48 -7C78.3757 -7 103 17.6243 103 48Z" fill="var(--color-bg-primary)"/>
            <path d="M99.0615 65C99.0615 83.7777 83.8392 99 65.0615 99H30.998C12.2204 99 -3.00195 83.7777 -3.00195 65V31C-3.00195 12.2223 12.2204 -3 30.998 -3H65.0615C83.8392 -3 99.0615 12.2223 99.0615 31V65ZM85.2061 14.4121C82.165 13.283 78.7847 14.833 77.6553 17.874L72.838 30.8452C70.1563 38.0663 63.2661 42.8574 55.5631 42.8574H41.6855C35.8252 42.8574 31.7093 37.0852 33.619 31.5448L33.7813 31.074C34.8705 27.9138 37.8449 25.793 41.1874 25.793H47.5809C49.8711 25.793 51.4722 28.0591 50.707 30.2178C49.6238 33.2753 51.2238 36.6321 54.2812 37.7158C57.3388 38.7991 60.6965 37.199 61.7803 34.1416L65.2383 24.3838C67.0257 19.3399 63.2848 14.0453 57.9336 14.0449H35.498C30.7024 14.045 26.4183 16.9926 24.6885 21.4316L24.5293 21.8662L18.5469 39.2227C15.9502 46.7565 21.5467 54.6055 29.5156 54.6055H30.4532C36.3135 54.6055 40.4294 60.3776 38.5197 65.9181L38.2578 66.6777C37.2282 69.665 34.4165 71.6699 31.2567 71.6699H28.0847C24.3479 71.6699 21.799 67.8873 23.2021 64.4238C24.4199 61.4173 22.969 57.9927 19.9629 56.7744C16.956 55.5565 13.5304 57.0068 12.3125 60.0137L7.15039 72.7588C5.08707 77.8539 8.83682 83.418 14.334 83.418H36.6406C41.5907 83.4177 45.9961 80.2765 47.6094 75.5967L52.6121 61.0826C53.9481 57.2067 57.5962 54.6055 61.6959 54.6055C65.7122 54.6055 69.3047 57.1036 70.7029 60.8686L77.6553 79.5889C78.7848 82.6297 82.1651 84.1799 85.2061 83.0508C88.247 81.9214 89.7969 78.54 88.668 75.499L83.1231 60.5679C80.2874 52.9317 80.2873 44.5312 83.1231 36.895L88.668 21.9639C89.7972 18.9228 88.2469 15.5416 85.2061 14.4121Z" fill="var(--color-accent)"/>
          </g>
          <defs>
            <clipPath id="sk-nav-clip">
              <rect width="96" height="96" rx="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>`;

  nav.innerHTML = `
    <div class="nav-inner">
      <div class="nav-brand">
        <a href="/" class="nav-logo-link">${logoSVG}</a>
        ${isLevel1
          ? `<span class="top-nav-name">Setu Kathawate</span>`
          : `<a class="top-nav-name top-nav-crumb" href="${crumbHref}">${crumbLabel}</a>`
        }
      </div>
      <button class="light-switch" role="switch" aria-checked="false" aria-label="Toggle light mode" title="Toggle light mode">
        <span class="light-switch-paddle"></span>
      </button>
    </div>
  `;

  const footer = document.querySelector('.contact-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-contact-group">
          <span class="footer-label">Contact</span>
          <svg class="footer-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <nav class="footer-links" aria-label="Contact links">
            <a href="mailto:hi@setugk.com">Email</a>
            <a href="https://linkedin.com/in/setukathawate" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="/Setu%20Kathawate%20-%20Product%20Designer%20Resume.pdf" target="_blank" rel="noopener">Resume</a>
          </nav>
        </div>
      </div>
    `;
  }

  const sw = nav.querySelector('.light-switch');
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
});
