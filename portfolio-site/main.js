(function () {
  'use strict';

  /* ===== EDITE AQUI ===== */
  const LINKS = {
    email: 'pedropelk@gmail.com',        // ex.: 'voce@email.com'
    linkedin: 'www.linkedin.com/in/pedropaulorb',     // ex.: 'https://www.linkedin.com/in/seu-perfil'
    github: 'https://github.com/PedroPauloRB',       // ex.: 'https://github.com/seu-usuario'
    cv: 'assets/CV_PedroPaulo.pdf',           // ex.: 'assets/curriculo.pdf'
    repo_auth: '',    // link do repositório do auth-service
    repo_task: '',   // link do repositório do task-service
    whatsapp: 'https://wa.me/5581979020585'
  };
  // [nome, nível de 0 a 10]
  const SKILLS = {
    mastered: [
      ['Java', 7], ['Spring Boot', 7], ['Spring Security', 6],
      ['JPA / Hibernate', 6], ['REST', 7], ['JWT', 6], ['Git / GitHub', 6]
    ],
    learning: [
      ['Docker', 2], ['PostgreSQL', 3], ['JUnit / Mockito', 2], ['JavaScript', 4], ['Python', 5]
    ]
  };
  /* ======================= */

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignora */ }
    }
  };
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignora */ }
    }
  };
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lang = store.get('lang');
  if (lang !== 'pt' && lang !== 'en') {
    lang = (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }
  let bootDone = false;
  let bootTimer = null;

  const t = (k) => (window.I18N[lang] && window.I18N[lang][k]) || k;

  /* ----- efeito de flash (scanline) ----- */
  function flash() {
    if (reduce) return;
    const f = $('#flash');
    f.classList.remove('on');
    void f.offsetWidth;
    f.classList.add('on');
  }

  /* ----- idioma ----- */
  function applyLang(l, withFlash) {
    lang = l;
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.title = t('doc_title');
    const lb = $('#lang-btn');
    lb.textContent = l === 'pt' ? 'EN' : 'PT';
    lb.setAttribute('aria-label', t('lang_label'));
    $('#theme-btn').setAttribute('aria-label', t('theme_label'));
    renderSkills();
    if (bootDone) renderBootStatic();
    store.set('lang', l);
    if (withFlash) flash();
  }

  /* ----- tema ----- */
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    store.set('theme', next);
    flash();
  }

  /* ----- links ----- */
  function applyLinks() {
    $$('[data-link]').forEach((a) => {
      const key = a.dataset.link;
      const v = (LINKS[key] || '').trim();
      if (!v) { a.hidden = true; return; }
      a.hidden = false;
      a.href = key === 'email' ? 'mailto:' + v : v;
      if (/^https?:/.test(v)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    });
  }

  /* ----- skills (barras de XP) ----- */
  function fillSkills(sel, list) {
    const ul = $(sel);
    ul.textContent = '';
    list.forEach(([name, lv]) => {
      const li = document.createElement('li');
      li.className = 'skill';
      const n = document.createElement('span');
      n.textContent = name;
      const bar = document.createElement('span');
      bar.className = 'xp';
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', name + ' ' + lv + '/10');
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('i');
        if (i < lv) s.className = 'on';
        bar.appendChild(s);
      }
      const v = document.createElement('span');
      v.className = 'skill-lv';
      v.textContent = 'LV' + lv;
      li.append(n, bar, v);
      ul.appendChild(li);
    });
  }
  function renderSkills() {
    fillSkills('#skills-mastered', SKILLS.mastered);
    fillSkills('#skills-learning', SKILLS.learning);
  }

  /* ----- boot do hero ----- */
  const bootLines = () => ['boot_1', 'boot_2', 'boot_3'].map(t);
  function renderBootStatic() { $('#boot-out').textContent = bootLines().join('\n'); }
  function finishBoot() {
    bootDone = true;
    clearTimeout(bootTimer);
    renderBootStatic();
    $('#boot-out').classList.add('done');
    $('#hero-main').hidden = false;
    $('#skip-btn').hidden = true;
    session.set('booted', '1');
  }
  function startBoot() {
    if (reduce || session.get('booted')) { finishBoot(); return; }
    const out = $('#boot-out');
    const lines = bootLines();
    const total = lines.join('').length;
    const delay = Math.max(6, Math.floor(1700 / total));
    let i = 0, j = 0;
    $('#hero-main').hidden = true;
    out.textContent = '';
    (function step() {
      if (bootDone) return;
      if (i >= lines.length) { finishBoot(); return; }
      if (j < lines[i].length) {
        out.textContent += lines[i][j++];
        bootTimer = setTimeout(step, delay);
      } else {
        out.textContent += '\n';
        i++; j = 0;
        bootTimer = setTimeout(step, delay * 6);
      }
    })();
  }

  /* ----- entrada das seções ----- */
  function initReveal() {
    const els = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
  }

  /* ----- foto pixelada (assets/foto.jpg) ----- */
  function pixelPhoto() {
    const img = new Image();
    img.onload = function () {
      const c = $('#photo');
      const size = 48;
      c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
      c.hidden = false;
      $('#photo-ph').hidden = true;
    };
    img.src = 'assets/foto.jpg';
  }

  /* ----- início ----- */
  applyLang(lang, false);
  applyLinks();
  initReveal();
  pixelPhoto();
  startBoot();

  $('#lang-btn').addEventListener('click', () => applyLang(lang === 'pt' ? 'en' : 'pt', true));
  $('#theme-btn').addEventListener('click', toggleTheme);
  $('#skip-btn').addEventListener('click', finishBoot);
  $('#start-btn').addEventListener('click', flash);
})();
