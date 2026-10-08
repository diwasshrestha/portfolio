/* diwasstha.com.np. Small, dependency-free. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.remove('no-js');

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* top bar rule once you scroll */
  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const toggle = $('.menu-toggle');
  if (toggle) {
    const set = open => {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close ×' : 'Menu +';
    };
    toggle.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    $$('.menu a').forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  /* Kathmandu time + today's posting date */
  const tz = 'Asia/Kathmandu';
  const clock = $('[data-clock]');
  if (clock) {
    const f = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });
    const tick = () => { clock.textContent = f.format(new Date()); };
    tick(); setInterval(tick, 20000);
  }
  $$('[data-today]').forEach(el => {
    const p = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: tz }).format(new Date());
    el.textContent = p.replace(/\//g, '-');
  });

  /* fade things in as they arrive; draw the pen marks */
  const marks = $$('.mark');
  if ('IntersectionObserver' in window && !calm) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add(en.target.classList.contains('mark') ? 'drawn' : 'in');
      io.unobserve(en.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
    marks.forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
    marks.forEach(el => el.classList.add('drawn'));
  }

  /* F9 posts the page. Business Central people will get it. */
  const dlg = $('#post-dialog');
  if (dlg && dlg.showModal) {
    const msg = $('#post-msg'), sub = $('#post-sub'), btns = $('#post-btns'), bar = $('.bar', dlg);
    let posted = false;
    const reset = () => {
      msg.textContent = 'Do you want to post this page?';
      sub.textContent = 'Document No. DS-0001';
      bar.hidden = true; bar.firstElementChild.style.width = '0';
      btns.innerHTML = '<button class="primary" type="button" data-yes>Yes</button><button type="button" data-no>No</button>';
    };
    const open = () => { if (!dlg.open) { reset(); dlg.showModal(); $('[data-yes]', dlg).focus(); } };
    dlg.addEventListener('click', e => {
      if (e.target.matches('[data-no], [data-ok]')) dlg.close();
      if (!e.target.matches('[data-yes]')) return;
      btns.innerHTML = '';
      msg.textContent = 'Posting lines…';
      sub.textContent = 'Checking dimensions, VAT and good intentions.';
      bar.hidden = false;
      requestAnimationFrame(() => { bar.firstElementChild.style.width = '100%'; });
      setTimeout(() => {
        bar.hidden = true;
        msg.textContent = posted ? 'Document DS-0001 has already been posted.' : 'The page was posted successfully.';
        sub.textContent = posted ? 'Nice try. There is no undo in a ledger.' : 'Not really. But thanks for knowing the shortcut.';
        btns.innerHTML = '<button class="primary" type="button" data-ok>OK</button>';
        $('[data-ok]', dlg).focus();
        const print = $('.print');
        if (!posted && print) {
          const s = document.createElement('span');
          s.className = 'stamp posted'; s.setAttribute('aria-hidden', 'true'); s.textContent = 'Posted';
          print.appendChild(s);
        }
        posted = true;
      }, calm ? 50 : 1300);
    });
    addEventListener('keydown', e => { if (e.key === 'F9') { e.preventDefault(); open(); } });
    $$('[data-post]').forEach(b => b.addEventListener('click', open));
  }

  /* quote form → Web3Forms */
  const form = $('#contact-form');
  if (form && window.fetch) {
    const st = $('#form-status');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true; st.className = 'status'; st.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'failed');
        st.className = 'status ok'; st.textContent = 'Sent. I\'ll get back to you within a working day.'; form.reset();
      } catch {
        st.className = 'status err'; st.textContent = 'That didn\'t go through. Please email diwas668@gmail.com.';
      } finally { btn.disabled = false; }
    });
  }

  const copy = async (text, btn) => {
    try { await navigator.clipboard.writeText(text); btn.textContent = 'copied'; } catch { btn.textContent = 'press ctrl+c'; }
    setTimeout(() => { btn.textContent = 'copy'; }, 1600);
  };

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
    b.addEventListener('click', () => copy(code.textContent, b));
    pre.appendChild(b);
  });
})();
