/* diwasstha.com.np — interactions. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onHome = !!$('#hero-title');

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Header state + scroll progress ---------- */
  const header = $('.site-header');
  const bar = $('.progress');
  const onScroll = () => {
    const y = window.scrollY;
    header && header.classList.toggle('scrolled', y > 20);
    if (bar) {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(y / h, 1) : 0})`;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  if (menuBtn) {
    const setMenu = open => {
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav-links a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const a = map.get(en.target.id);
          a && a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- Card spotlight ---------- */
  document.addEventListener('pointermove', e => {
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  /* ---------- Typed rotator ---------- */
  const typed = $('.typed[data-words]');
  if (typed && !reduceMotion) {
    const words = typed.dataset.words.split('|');
    let wi = 0, ci = words[0].length, deleting = true;
    const tick = () => {
      const w = words[wi];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
      } else {
        ci++;
        if (ci >= words[wi].length) { deleting = true; typed.textContent = words[wi]; return setTimeout(tick, 2200); }
      }
      typed.textContent = (deleting ? w : words[wi]).slice(0, Math.max(ci, 0));
      setTimeout(tick, deleting ? 28 : 55);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- IDE tabs ---------- */
  const ide = $('.ide');
  if (ide) {
    const tabs = $$('.ide-tab', ide);
    const status = $('#ide-status-text');
    let current = 0, auto = !reduceMotion, timer;
    const animate = pre => {
      $$('.l', pre).forEach((l, i) => { l.style.animationDelay = `${i * 70}ms`; });
      ide.classList.remove('animating'); void ide.offsetWidth; ide.classList.add('animating');
    };
    const select = (i, focus) => {
      current = i;
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const pane = document.getElementById(t.getAttribute('aria-controls'));
        pane.hidden = !on;
        if (on) { status && (status.textContent = pane.dataset.status || ''); if (!reduceMotion) animate(pane); }
      });
      focus && tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { auto = false; clearInterval(timer); select(i); });
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          auto = false; clearInterval(timer);
          select((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true);
        }
      });
    });
    if (reduceMotion) ide.classList.remove('animating'); else animate($('pre:not([hidden])', ide));
    if (auto) timer = setInterval(() => { if (auto && !document.hidden) select((current + 1) % tabs.length); }, 8000);
  }

  /* ---------- Kathmandu clock ---------- */
  const clock = $('#clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kathmandu' });
    const upd = () => { clock.textContent = fmt.format(new Date()); };
    upd(); setInterval(upd, 15000);
  }

  /* ---------- Particle network background ---------- */
  const canvas = $('#net');
  if (canvas && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w, h, pts = [], raf, dpr = Math.min(devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 18000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        c: Math.random() < .5 ? '34,228,255' : '139,92,255'
      }));
    };
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = dxm * dxm + dym * dym;
        if (dm < 22000) { p.x += dxm * .004; p.y += dym * .004; }
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 16000) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - d / 16000) * .22})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${p.c},.7)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    resize();
    addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); step(); });
    addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) step(); });
    step();
  }

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); toast(msg || 'Copied ✓'); } catch { toast('Copy failed'); }
  };

  /* ---------- Command palette ---------- */
  const palette = $('#palette');
  if (palette) {
    const input = $('#palette-input'), list = $('#palette-list');
    const go = hash => () => {
      if (onHome && document.getElementById(hash)) document.getElementById(hash).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      else location.href = '/#' + hash;
    };
    const nav = url => () => { location.href = url; };
    const ext = url => () => { window.open(url, '_blank', 'noopener'); };
    const cmds = [
      { t: 'Go to About', k: 'section', run: go('about') },
      { t: 'Go to Services', k: 'section', run: go('services') },
      { t: 'Go to Tech Stack', k: 'section', run: go('stack') },
      { t: 'Go to Case Files', k: 'section', run: go('work') },
      { t: 'Go to Testimonials', k: 'section', run: go('testimonials') },
      { t: 'Go to FAQ', k: 'section', run: go('faq') },
      { t: 'Contact / Hire Diwas', k: 'section', run: go('contact') },
      { t: 'Blog — all articles', k: 'page', run: nav('/blog/') },
      { t: 'Read: NAV to Business Central upgrade guide', k: 'article', run: nav('/blog/nav-to-business-central-upgrade-guide/') },
      { t: 'Read: Business Central API from .NET', k: 'article', run: nav('/blog/business-central-api-dotnet-integration/') },
      { t: 'Read: AL extension best practices', k: 'article', run: nav('/blog/al-extension-development-best-practices/') },
      { t: 'Copy email address', k: 'action', run: () => copy('diwas668@gmail.com', 'Email copied ✓') },
      { t: 'Open LinkedIn', k: 'link', run: ext('https://www.linkedin.com/in/diwas-cresta/') },
      { t: 'Open GitHub', k: 'link', run: ext('https://github.com/diwasshrestha') },
      { t: 'Home', k: 'page', run: nav('/') }
    ];
    let filtered = cmds, sel = 0, lastFocus;
    const render = () => {
      list.innerHTML = '';
      filtered.forEach((c, i) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'option');
        b.className = i === sel ? 'sel' : '';
        b.setAttribute('aria-selected', String(i === sel));
        b.innerHTML = `<span></span><small>${c.k}</small>`;
        b.firstChild.textContent = c.t;
        b.addEventListener('click', () => { close(); c.run(); });
        b.addEventListener('mousemove', () => { if (sel !== i) { sel = i; render(); } });
        li.appendChild(b); list.appendChild(li);
      });
      if (!filtered.length) list.innerHTML = '<li><button type="button" disabled><span>No results</span></button></li>';
      const s = $('.sel', list); s && s.scrollIntoView({ block: 'nearest' });
    };
    const open = () => {
      lastFocus = document.activeElement;
      palette.classList.add('open'); input.value = ''; filtered = cmds; sel = 0; render();
      input.focus();
    };
    const close = () => { palette.classList.remove('open'); lastFocus && lastFocus.focus && lastFocus.focus(); };
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      filtered = cmds.filter(c => (c.t + ' ' + c.k).toLowerCase().includes(q)); sel = 0; render();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === 'Enter' && filtered[sel]) { const c = filtered[sel]; close(); c.run(); }
    });
    palette.addEventListener('click', e => { if (e.target === palette) close(); });
    addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.classList.contains('open') ? close() : open(); }
      else if (e.key === 'Escape' && palette.classList.contains('open')) close();
    });
    $$('[data-palette-open]').forEach(b => b.addEventListener('click', open));
    if (/Mac|iPhone|iPad/.test(navigator.platform)) $$('kbd').forEach(k => { k.textContent = k.textContent.replace('Ctrl', '⌘'); });
  }

  /* ---------- Contact form (Web3Forms) ---------- */
  const form = $('#contact-form');
  if (form && window.fetch) {
    const st = $('#form-status');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; st.className = 'form-status'; st.textContent = '> sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const json = await res.json();
        if (res.ok && json.success) {
          st.className = 'form-status ok'; st.textContent = '✓ message sent — I\'ll reply soon.'; form.reset();
        } else throw new Error(json.message || 'Request failed');
      } catch (err) {
        st.className = 'form-status err'; st.textContent = '✗ could not send — please email diwas668@gmail.com';
      } finally { btn.disabled = false; }
    });
  }

  /* ---------- Blog: syntax highlighting + copy buttons ---------- */
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const LANGS = {
    al: {
      re: /(\/\/.*$|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|("(?:[^"])*")|(\b\d+(?:\.\d+)?\b)|(\b(?:begin|end|if|then|else|exit|var|procedure|local|internal|trigger|codeunit|table|page|report|query|xmlport|tableextension|pageextension|enum|enumextension|interface|implements|extends|field|fields|keys|key|layout|area|repeater|group|actions|action|dataset|dataitem|column|column|record|repeat|until|not|and|or|xor|div|mod|true|false|with|do|for|to|downto|while|case|of|label|temporary)\b)|(\b(?:Subtype|Caption|DataClassification|PageType|SourceTable|APIPublisher|APIGroup|APIVersion|EntityName|EntitySetName|ODataKeyFields|DelayedInsert|Editable|ApplicationArea|ToolTip|Access|ObjectType|Database|Codeunit|Page|Table)\b)|(\[[A-Za-z]+(?:\([^\]]*\))?\])|(\b[A-Z][A-Za-z]+(?=\())/gim,
      cls: ['c', 's', 't', 'n', 'k', 'p', 'f', 'f']
    },
    csharp: {
      re: /(\/\/.*$|\/\*[\s\S]*?\*\/)|(\$?@?"(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)')|(\b\d+(?:\.\d+)?[mMfFdDlL]?\b)|(\b(?:using|namespace|public|private|protected|internal|static|readonly|sealed|abstract|override|virtual|async|await|class|record|struct|interface|new|var|return|if|else|foreach|for|while|in|is|null|true|false|this|base|string|int|bool|void|object|decimal|double|const|get|set|init|required|throw|try|catch|finally|yield|default|out|ref|params|using)\b)|(\b[a-zA-Z_]\w*(?=\())|(\b[A-Z][A-Za-z0-9]*(?=[\s(<>?,.\])]))/gm,
      cls: ['c', 's', 's', 'n', 'k', 'f', 't']
    },
    powershell: {
      re: /(#.*$)|('(?:[^']|'')*'|"(?:[^"`]|`.)*")|(\$[\w:]+)|(\b[A-Z][a-z]+-[A-Za-z]+\b)|(\s-[A-Za-z_]+\b)/gm,
      cls: ['c', 's', 'p', 'f', 'k']
    },
    json: {
      re: /("(?:[^"\\]|\\.)*")(\s*:)?|(\b-?\d+(?:\.\d+)?\b)|(\b(?:true|false|null)\b)/gm,
      cls: null
    }
  };
  const highlight = (code, lang) => {
    const L = LANGS[lang];
    if (!L) return esc(code);
    let out = '', last = 0;
    code.replace(L.re, (m, ...g) => {
      const idx = g[g.length - 2];
      out += esc(code.slice(last, idx));
      let cls = null;
      if (lang === 'json') cls = g[0] ? (g[1] ? 'p' : 's') : g[2] ? 'n' : 'k';
      else for (let i = 0; i < L.cls.length; i++) if (g[i] !== undefined) { cls = L.cls[i]; break; }
      out += cls ? `<span class="${cls}">${esc(m)}</span>` : esc(m);
      last = idx + m.length;
      return m;
    });
    return out + esc(code.slice(last));
  };
  $$('.prose pre > code[class*="language-"]').forEach(code => {
    const lang = (code.className.match(/language-(\w+)/) || [])[1];
    const pre = code.parentElement;
    pre.dataset.lang = { csharp: 'C#', al: 'AL', powershell: 'PowerShell', json: 'JSON' }[lang] || lang;
    code.innerHTML = highlight(code.textContent, lang);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'copy';
    b.addEventListener('click', () => copy(code.textContent, 'Code copied ✓'));
    pre.appendChild(b);
  });
})();
