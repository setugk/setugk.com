/* ---- Filter tabs ---- */
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const rows = document.querySelectorAll('.project-row');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');

      const filter = tab.dataset.filter;
      rows.forEach(row => {
        const show = filter === 'all' || row.dataset.category === filter;
        row.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ---- Carousels ---- */
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots   = carousel.querySelectorAll('.dot');
    const prev   = carousel.querySelector('.carousel-prev');
    const next   = carousel.querySelector('.carousel-next');
    let index = 0;

    function goTo(n) {
      index = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${slides[index].offsetLeft}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    prev?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Swipe gestures — direction-locked so horizontal swipe never triggers page scroll
    const viewport = carousel.querySelector('.carousel-viewport');
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeAxis   = null; // 'h' | 'v' | null — locked after first 5px of movement

    viewport.addEventListener('touchstart', (e) => {
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
      swipeAxis   = null;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (swipeAxis === 'v') return;
      const dx = Math.abs(e.touches[0].clientX - swipeStartX);
      const dy = Math.abs(e.touches[0].clientY - swipeStartY);
      if (swipeAxis === null && (dx > 5 || dy > 5)) {
        swipeAxis = dx > dy ? 'h' : 'v';
      }
      if (swipeAxis === 'h') e.preventDefault();
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
      if (swipeAxis !== 'h') return;
      const dx = swipeStartX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 30) dx > 0 ? goTo(index + 1) : goTo(index - 1);
    }, { passive: true });
  });
}

/* ============================================================
   DUCK HUNT EASTER EGG
   - Trigger: small bird icon next to the nav name
   - 50 bullets per game (each click = 1 bullet used)
   - HUD replaces footer bar at the bottom
   - Stats tracked in localStorage (per-browser)
   ============================================================ */

const GAME_BIRD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="26" viewBox="0 0 52 26" style="overflow:visible">
  <g class="wing-left" style="transform-origin: 18px 12px">
    <path d="M2 14 C6 3 13 3 18 11" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  </g>
  <g class="wing-right" style="transform-origin: 18px 12px">
    <path d="M18 11 C23 3 30 3 34 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  </g>
  <circle cx="18" cy="12.5" r="2.8" fill="currentColor"/>
  <path d="M15.5 15 L12 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;

const INITIAL_BULLETS = 20;
const MAX_BULLETS     = 200;

let gameActive        = false;
let score             = 0;
let maxBulletsThisGame = INITIAL_BULLETS;
let bulletsLeft       = INITIAL_BULLETS;
let birdsMissed       = 0;
let birdsHit          = 0;
let gameBirdTimeout  = null;
let gameClickHandler = null;
let gameKeyHandler   = null;

/* -- localStorage metrics -- */
function bumpMetric(key) {
  const v = parseInt(localStorage.getItem(`dh_${key}`) || '0', 10);
  localStorage.setItem(`dh_${key}`, v + 1);
}

function getMetrics() {
  return {
    plays:    parseInt(localStorage.getItem('dh_plays')    || '0', 10),
    respawns: parseInt(localStorage.getItem('dh_respawns') || '0', 10),
  };
}

/* -- Game lifecycle -- */
function initGame() {
  // Desktop-only (requires fine pointer + hover)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const trigger = document.querySelector('.nav-game-trigger');
  if (trigger) trigger.addEventListener('click', () => startGame(false));
}

function startGame(isRespawn) {
  if (gameActive) return;
  gameActive         = true;
  score              = 0;
  maxBulletsThisGame = computeMaxBullets();
  bulletsLeft        = maxBulletsThisGame;
  birdsMissed        = 0;
  birdsHit           = 0;

  bumpMetric('plays');
  if (isRespawn) bumpMetric('respawns');

  document.querySelectorAll('.birds-layer .bird').forEach(b => b.remove());
  document.querySelectorAll('.filter-tab, .carousel-btn, .top-nav-links a').forEach(el => {
    el.style.transform = '';
    el.style.transition = '';
  });
  document.body.classList.add('game-mode');
  wrapTextForGame();
  renderHUD();

  gameBirdTimeout = setTimeout(spawnGameBird, 500);

  // All non-UI clicks count as shots (miss if no bird hit)
  gameClickHandler = (e) => {
    if (!gameActive) return;
    if (
      e.target.closest('.top-nav') ||
      e.target.closest('.game-hud') ||
      e.target.closest('.game-over-overlay')
    ) return;
    registerShot(e.clientX, e.clientY, false, e.target);
  };
  document.addEventListener('click', gameClickHandler);

  gameKeyHandler = (e) => { if (e.key === 'Escape') endGame(false); };
  document.addEventListener('keydown', gameKeyHandler);
}

function endGame(showGameOver) {
  gameActive = false;
  clearTimeout(gameBirdTimeout);
  document.body.classList.remove('game-mode');
  document.querySelectorAll('.birds-layer .bird').forEach(b => b.remove());
  unwrapTextAfterGame();
  document.querySelector('.game-hud')?.remove();
  document.removeEventListener('click', gameClickHandler);
  document.removeEventListener('keydown', gameKeyHandler);
  if (showGameOver) renderGameOver();
}

/* -- HUD -- */
function renderHUD() {
  document.querySelector('.game-hud')?.remove();
  const hud = document.createElement('div');
  hud.className = 'game-hud';
  hud.innerHTML = `
    <div class="hud-left">
      <span class="hud-score">Score: <strong>${score}</strong></span>
      <span class="hud-bullets">
        <div class="hud-bullet-bar"><div class="hud-bullet-fill" style="width:100%"></div></div>
        <span class="hud-bullet-count">${bulletsLeft} shots remaining</span>
      </span>
    </div>
    <div class="hud-right">ESC to quit</div>
  `;
  document.body.appendChild(hud);
}

function updateHUD() {
  const scoreEl  = document.querySelector('.game-hud .hud-score strong');
  const fill     = document.querySelector('.hud-bullet-fill');
  const countEl  = document.querySelector('.hud-bullet-count');
  if (scoreEl)  scoreEl.textContent = score;
  if (fill)     fill.style.width    = `${(bulletsLeft / maxBulletsThisGame) * 100}%`;
  if (countEl)  countEl.textContent = `${bulletsLeft} shot${bulletsLeft === 1 ? '' : 's'} remaining`;
}

/* -- Game over -- */
function renderGameOver() {
  const m = getMetrics();
  const shotsFired = maxBulletsThisGame - bulletsLeft;
  const accuracy = shotsFired > 0 ? Math.round((birdsHit / shotsFired) * 100) : 0;

  const el = document.createElement('div');
  el.className = 'game-over-overlay';
  el.innerHTML = `
    <div class="game-over-title">Game over</div>
    <div class="game-over-stats">
      Score: <strong>${score}</strong> &nbsp;·&nbsp; Missed: <strong>${birdsMissed}</strong> &nbsp;·&nbsp; Accuracy: <strong>${accuracy}%</strong><br>
      <span class="stat-hint">every 60 seconds on the site earns you +10 shots (max 200)</span>
      <button class="game-over-reset">reset bank</button><br>
      <span class="stat-label">You've started ${m.plays} game${m.plays === 1 ? '' : 's'} · replayed ${m.respawns} time${m.respawns === 1 ? '' : 's'}</span>
    </div>
    <div class="game-over-actions">
      <button class="game-over-btn" data-action="replay">Play again</button>
      <button class="game-over-btn" data-action="exit">Exit</button>
    </div>
  `;
  document.body.appendChild(el);

  el.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    el.remove();
    if (action === 'replay') startGame(true);
  });

  el.querySelector('.game-over-reset')?.addEventListener('click', function() {
    localStorage.removeItem('dh_active_seconds');
    const hint = el.querySelector('.stat-hint');
    if (hint) hint.textContent = 'shot bank reset — starts at 20 next game';
    this.remove();
  });
}

/* -- Birds -- */
function spawnGameBird() {
  if (!gameActive) return;
  const layer = document.querySelector('.birds-layer');
  if (!layer) return;

  const ltr      = Math.random() > 0.5;
  const top      = 12 + Math.random() * 60;
  const duration = 3 + Math.random() * 3;
  const scale    = 0.9 + Math.random() * 0.7;

  const bird = document.createElement('div');
  bird.className = 'bird game-bird';
  bird.style.cssText = `
    top: ${top}vh; left: 0;
    animation: ${ltr ? 'fly-ltr' : 'fly-rtl'} ${duration}s linear forwards;
    opacity: 1; pointer-events: auto;
  `;

  const inner = document.createElement('div');
  inner.innerHTML = GAME_BIRD_SVG;
  inner.style.transformOrigin = 'left center';
  inner.style.transform = ltr ? `scale(${scale})` : `scaleX(-1) scale(${scale})`;
  bird.appendChild(inner);

  bird.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!gameActive || bulletsLeft === 0) return;
    hitBird(bird);
  });

  layer.appendChild(bird);
  bird.addEventListener('animationend', () => {
    if (bird.parentNode) {
      if (gameActive) birdsMissed++;
      bird.remove();
    }
  }, { once: true });

  gameBirdTimeout = setTimeout(spawnGameBird, 900 + Math.random() * 1200);
}

/* -- Shot mechanics -- */
function useBullet() {
  bulletsLeft = Math.max(0, bulletsLeft - 1);
  updateHUD();
  if (bulletsLeft === 0) {
    gameActive = false; // stop accepting further input immediately
    clearTimeout(gameBirdTimeout);
    setTimeout(() => endGame(true), 500);
  }
}

function hitBird(bird) {
  score += 3;
  birdsHit++;
  useBullet();

  // Freeze bird at its current screen position, then animate fall
  const rect = bird.getBoundingClientRect();
  bird.remove();

  showScorePop(rect.left + rect.width / 2, rect.top + rect.height / 2, '+3', 'pos');

  const frozen = document.createElement('div');
  frozen.style.cssText = `
    position: fixed; left: ${rect.left}px; top: ${rect.top}px;
    opacity: 1; color: var(--color-gold);
    pointer-events: none; z-index: 15; transform-origin: center center;
  `;
  frozen.innerHTML = bird.innerHTML;
  document.body.appendChild(frozen);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    frozen.style.transition = 'transform 0.5s ease-in, opacity 0.4s ease-in 0.1s';
    frozen.style.transform  = 'translateY(100px) rotate(100deg)';
    frozen.style.opacity    = '0';
  }));

  setTimeout(() => frozen.remove(), 620);
}

function isHarmfulTarget(el) {
  const harmful = ['P', 'H1', 'H2', 'H3', 'SPAN', 'A', 'BUTTON', 'LABEL'];
  let node = el;
  while (node && node !== document.body) {
    if (harmful.includes(node.tagName)) {
      if (node.closest('.game-hud, .game-over-overlay, .birds-layer')) return null;
      if (node.classList.contains('vaporized')) return null;
      if (node.querySelector('.game-char')) return null;
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function showScorePop(x, y, text, cls) {
  const el = document.createElement('div');
  el.className = `score-pop ${cls}`;
  el.textContent = text;
  el.style.cssText = `left: ${x}px; top: ${y}px;`;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

function registerShot(x, y, isHit, target) {
  if (!isHit) {
    const harmfulEl = isHarmfulTarget(target || document.elementFromPoint(x, y));
    if (harmfulEl) {
      score -= 1;
      useBullet();
      showScorePop(x, y, '-1', 'neg');
      harmfulEl.classList.add('vaporized');
    } else {
      useBullet();
      const indicator = document.createElement('div');
      indicator.className = 'miss-indicator';
      indicator.textContent = 'miss';
      indicator.style.cssText = `left: ${x}px; top: ${y}px;`;
      document.body.appendChild(indicator);
      indicator.addEventListener('animationend', () => indicator.remove(), { once: true });
    }
  }
}

/* ---- Shot budget ---- */
function computeMaxBullets() {
  const secs  = parseInt(localStorage.getItem('dh_active_seconds') || '0', 10);
  const bonus = Math.floor(secs / 60) * 10;
  return Math.min(INITIAL_BULLETS + bonus, MAX_BULLETS);
}

/* ---- Text wrapping for letter-level targets ---- */
function wrapTextForGame() {
  const sel = '.project-title, .project-desc, .about-bio, .filter-tab, .tag, .project-date';
  document.querySelectorAll(sel).forEach(el => {
    if (el.dataset.gameWrapped) return;
    el.dataset.origHtml    = el.innerHTML;
    el.dataset.gameWrapped = '1';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes  = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(textNode => {
      const frag = document.createDocumentFragment();
      for (const ch of textNode.textContent) {
        if (/\s/.test(ch)) {
          frag.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement('span');
          span.className = 'game-char';
          span.textContent = ch;
          frag.appendChild(span);
        }
      }
      textNode.parentNode.replaceChild(frag, textNode);
    });
  });
}

function unwrapTextAfterGame() {
  document.querySelectorAll('[data-orig-html]').forEach(el => {
    el.innerHTML = el.dataset.origHtml;
    delete el.dataset.origHtml;
    delete el.dataset.gameWrapped;
  });
}

/* ---- Active time tracking ---- */
let _activeTick = null;

function _startTick() {
  if (_activeTick) return;
  _activeTick = setInterval(() => {
    const n = parseInt(localStorage.getItem('dh_active_seconds') || '0', 10);
    localStorage.setItem('dh_active_seconds', n + 1);
  }, 1000);
}

function _stopTick() {
  clearInterval(_activeTick);
  _activeTick = null;
}

function initActiveTracking() {
  if (!document.hidden && document.hasFocus()) _startTick();
  document.addEventListener('visibilitychange', () => {
    document.hidden ? _stopTick() : (document.hasFocus() && _startTick());
  });
  window.addEventListener('focus', _startTick);
  window.addEventListener('blur',  _stopTick);
}

/* ---- Magnetic buttons ---- */
function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.filter-tab, .carousel-btn, .top-nav-links a').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('game-mode')) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transition = 'color 0.15s, background 0.15s';
      el.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), color 0.15s, background 0.15s';
      el.style.transform = '';
      el.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'transform') el.style.transition = '';
      }, { once: true });
    });
  });
}

/* ---- Copy toast ---- */
function showCopyToast(text) {
  let toast = document.querySelector('.copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('visible');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 5000);
}

/* ---- Theme toggle ---- */
function initTheme() {
  const sw = document.querySelector('.light-switch');
  if (!sw) return;

  const apply = (isLight) => {
    document.body.classList.toggle('light-mode', isLight);
    sw.setAttribute('aria-checked', String(isLight));
  };

  apply(localStorage.getItem('theme') === 'light');

  sw.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light-mode');
    apply(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

/* ---- Lightbox ---- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const inner    = lightbox.querySelector('.lightbox-inner');
  const dotsRow  = lightbox.querySelector('.lightbox-dots-row');
  const prevBtn  = lightbox.querySelector('.lightbox-prev');
  const nextBtn  = lightbox.querySelector('.lightbox-next');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  let slides = [];
  let idx    = 0;

  function render() {
    const slide = slides[idx];
    const img   = slide.querySelector('img');
    inner.innerHTML = '';
    if (img) {
      const el  = document.createElement('img');
      el.src    = img.src;
      el.alt    = img.alt || '';
      el.className = 'lightbox-image';
      inner.appendChild(el);
    } else {
      const el  = document.createElement('div');
      el.className = 'lightbox-placeholder';
      inner.appendChild(el);
    }

    dotsRow.innerHTML = '';
    if (slides.length > 1) {
      slides.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'dot' + (i === idx ? ' active' : '');
        d.addEventListener('click', () => { idx = i; render(); });
        dotsRow.appendChild(d);
      });
    }

    const hasMult = slides.length > 1;
    prevBtn.style.visibility = hasMult ? '' : 'hidden';
    nextBtn.style.visibility = hasMult ? '' : 'hidden';
  }

  function open(carouselSlides, startIndex) {
    slides = carouselSlides;
    idx    = startIndex;
    render();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.carousel').forEach(carousel => {
    const carouselSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    carouselSlides.forEach((slide, i) => {
      slide.addEventListener('click', () => {
        if (document.body.classList.contains('game-mode')) return;
        open(carouselSlides, i);
      });
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  prevBtn.addEventListener('click', () => { idx = (idx - 1 + slides.length) % slides.length; render(); });
  nextBtn.addEventListener('click', () => { idx = (idx + 1) % slides.length; render(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  { idx = (idx - 1 + slides.length) % slides.length; render(); }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % slides.length; render(); }
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      idx = dx > 0
        ? (idx + 1) % slides.length
        : (idx - 1 + slides.length) % slides.length;
      render();
    }
  }, { passive: true });
}

/* ---- Contact links ---- */
function initContactLinks() {
  const emailLink = document.querySelector('.footer-links a[href^="mailto:"]');
  if (!emailLink) return;
  emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailLink.href.replace('mailto:', '');
    navigator.clipboard.writeText(email)
      .then(() => showCopyToast(`${email} copied`))
      .catch(() => showCopyToast(email));
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initCarousels();
  initLightbox();
  initGame();
  initMagnetic();
  initActiveTracking();
  initContactLinks();
  initTheme();
});
