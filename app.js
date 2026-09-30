const app = document.getElementById('app');
const root = document.documentElement;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = id => SOCIETIES.find(s => s.id === id);
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, v) => localStorage.setItem(key, JSON.stringify(v));
const applied = () => load('applications', {});
const saved = () => load('saved', []);
const color = s => CATEGORIES[s.category].color;

// --- theme ---
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;
document.getElementById('theme').onclick = () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
};

// --- helpers ---
const daysLeft = iso => Math.ceil((new Date(iso + 'T23:59:59') - Date.now()) / 864e5);
const dueText = iso => { const d = daysLeft(iso); return d < 0 ? 'Closed' : d === 0 ? 'Closes tonight' : d === 1 ? 'Closes tomorrow' : `${d} days left`; };
const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
const shortDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
let toastTimer;
const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 2600); };
const updateNav = () => { const n = saved().length + Object.keys(applied()).length; document.getElementById('me-count').textContent = n ? n : ''; };

const toggleSave = id => {
  const list = saved(); const i = list.indexOf(id);
  i < 0 ? list.push(id) : list.splice(i, 1);
  save('saved', list); updateNav();
  toast(i < 0 ? `Saved ${byId(id).name} to your list` : `Removed ${byId(id).name} from your list`);
  document.querySelectorAll(`[data-save="${id}"]`).forEach(b => { b.setAttribute('aria-pressed', i < 0); b.textContent = i < 0 ? '♥' : '♡'; });
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-save]'); if (!b) return;
  e.preventDefault(); toggleSave(b.dataset.save);
});

const cardHTML = (s, extra = '') => {
  const d = daysLeft(s.deadline), isSaved = saved().includes(s.id);
  return `<a class="card" href="#/society/${s.id}" style="--c:${color(s)}">
    <div class="card-top">
      <div class="icon" aria-hidden="true">${s.icon}</div>
      <div class="card-tools">
        ${applied()[s.id] ? '<span class="applied">Applied</span>' : ''}
        <button class="save" type="button" data-save="${s.id}" aria-pressed="${isSaved}" aria-label="Save ${esc(s.name)}">${isSaved ? '♥' : '♡'}</button>
      </div>
    </div>
    <h3>${esc(s.name)}</h3>
    <div class="cat">${s.category} · ${s.roles.length} roles</div>
    <p>${esc(s.tagline)}</p>
    <div class="due ${d <= 3 && d >= 0 ? 'soon' : ''} ${d < 0 ? 'closed' : ''}">${dueText(s.deadline)}</div>
    ${extra}
  </a>`;
};

// --- views ---
const state = { q: '', cat: 'All', sort: 'deadline', loaded: false };

function home() {
  const cats = ['All', ...Object.keys(CATEGORIES)];
  const soon = SOCIETIES.filter(s => daysLeft(s.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  const openRoles = SOCIETIES.reduce((n, s) => n + s.roles.length, 0);
  app.innerHTML = `<section class="view">
    <div class="hero">
      <h1 id="hero-h">Join something this year.</h1>
      <p>${SOCIETIES.length} societies, ${openRoles} open roles, one fortnight. Pick one, read what they want, and apply in under two minutes.</p>
    </div>
    <div class="soon-strip" aria-label="Closing soon">
      <span class="soon-label">Closing soon</span>
      ${soon.map(s => `<a href="#/society/${s.id}" class="soon-item" style="--c:${color(s)}"><b>${esc(s.name)}</b><span>${dueText(s.deadline)}</span></a>`).join('')}
    </div>
    <div class="controls">
      <input class="search" id="q" type="search" placeholder="Search societies or roles  (press /)" value="${esc(state.q)}" aria-label="Search societies">
      <div class="chips" role="group" aria-label="Filter by category">
        ${cats.map(c => `<button class="chip" type="button" data-cat="${c}" aria-pressed="${state.cat === c}" style="--c:${CATEGORIES[c]?.color || 'var(--ink)'}">${c}</button>`).join('')}
      </div>
      <select id="sort" class="sort" aria-label="Sort societies">
        <option value="deadline">Deadline first</option><option value="name">A to Z</option><option value="size">Biggest first</option>
      </select>
    </div>
    <p class="count" id="count"></p>
    <div class="grid" id="grid"></div>
  </section>`;

  const grid = document.getElementById('grid');
  document.getElementById('sort').value = state.sort;
  const render = () => {
    const q = state.q.trim().toLowerCase();
    const list = SOCIETIES.filter(s => (state.cat === 'All' || s.category === state.cat) &&
      (!q || [s.name, s.tagline, s.category, ...s.roles].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => state.sort === 'name' ? a.name.localeCompare(b.name) : state.sort === 'size' ? b.size - a.size : a.deadline.localeCompare(b.deadline));
    root.style.setProperty('--accent', CATEGORIES[state.cat]?.color || 'var(--ink)');
    document.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === state.cat));
    document.getElementById('count').textContent = list.length ? `${list.length} of ${SOCIETIES.length} societies` : '';
    grid.innerHTML = list.length ? list.map(s => cardHTML(s)).join('')
      : `<div class="empty" style="grid-column:1/-1"><strong>No societies match “${esc(state.q)}”${state.cat !== 'All' ? ' in ' + state.cat : ''}.</strong>Try a different word, or <a href="#/quiz">let the quiz pick one for you</a>.</div>`;
  };

  if (!state.loaded) {
    grid.innerHTML = '<div class="sk"><i></i><i></i><i></i><i></i></div>'.repeat(6);
    setTimeout(() => { state.loaded = true; render(); }, 500); // ponytail: fake fetch delay so the skeleton is visible; replace with real fetch when a backend exists
  } else render();

  document.getElementById('q').oninput = e => { state.q = e.target.value; if (state.loaded) render(); };
  document.getElementById('sort').onchange = e => { state.sort = e.target.value; render(); };
  document.querySelectorAll('.chip').forEach(b => b.onclick = () => { state.cat = b.dataset.cat; if (state.loaded) render(); });
}

function detail(id) {
  const s = byId(id); if (!s) return notFound();
  const c = color(s), d = daysLeft(s.deadline), closed = d < 0, a = applied()[s.id], isSaved = saved().includes(s.id);
  root.style.setProperty('--accent', c);
  const similar = SOCIETIES.filter(o => o.id !== s.id)
    .map(o => [o, Object.keys(s.traits).reduce((sum, t) => sum + Math.abs(s.traits[t] - o.traits[t]), 0)])
    .sort((x, y) => x[1] - y[1]).slice(0, 2).map(x => x[0]);
  app.innerHTML = `<section class="view">
    <a class="back" href="#/">← All societies</a>
    <div class="detail" style="--c:${c}">
      <div class="detail-head">
        <div class="watermark" aria-hidden="true">${s.icon}</div>
        <div class="icon" aria-hidden="true">${s.icon}</div>
        <h1>${esc(s.name)}</h1>
        <div class="cat">${s.category}</div>
        <p class="desc">${esc(s.description)}</p>
        <dl class="facts">
          <div><dt>Meets</dt><dd>${esc(s.meets)}</dd></div>
          <div><dt>Members</dt><dd>${s.size}</dd></div>
          <div><dt>Open roles</dt><dd>${s.roles.length}</dd></div>
        </dl>
        <div class="cta-row sticky-cta">
          ${a ? `<button class="btn" disabled>Applied as ${esc(a.role)}</button>`
            : closed ? `<button class="btn" disabled>Applications closed</button>`
            : `<a class="btn" href="#/apply/${s.id}">Apply to ${esc(s.name)}</a>`}
          <button class="btn ghost save-btn" type="button" data-save="${s.id}" aria-pressed="${isSaved}">${isSaved ? '♥' : '♡'}</button>
          <button class="btn ghost" type="button" id="share">Share</button>
        </div>
      </div>
      <div>
        <div class="panel"><h2>Deadline</h2>
          <div class="countdown ${closed ? 'closed' : ''}">
            ${closed ? `<div><b>Closed</b><small>${fmtDate(s.deadline)}</small></div>` : `<div><b>${d}</b><small>${d === 1 ? 'day' : 'days'} left</small></div><div><b>${fmtDate(s.deadline).split(' ')[0]}</b><small>${fmtDate(s.deadline).split(' ')[1]}, midnight</small></div>`}
          </div>
        </div>
        <div class="panel"><h2>How recruitment runs</h2>
          <ol class="timeline">${s.timeline.map(([label, date]) => `<li class="${daysLeft(date) < 0 ? 'past' : ''}"><span>${shortDate(date)}</span>${esc(label)}</li>`).join('')}</ol>
        </div>
        <div class="panel"><h2>What they look for</h2><ul>${s.criteria.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div class="panel"><h2>Open roles</h2><div class="roles">${s.roles.map(r => `<span>${esc(r)}</span>`).join('')}</div></div>
      </div>
    </div>
    <h2 class="section-h">If you like ${esc(s.name)}, look at</h2>
    <div class="grid">${similar.map(o => cardHTML(o)).join('')}</div>
  </section>`;
  document.getElementById('share').onclick = async () => {
    const data = { title: s.name, text: s.tagline, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else { await navigator.clipboard.writeText(location.href); toast('Link copied'); }
  };
}

function apply(id) {
  const s = byId(id); if (!s) return notFound();
  const c = color(s);
  root.style.setProperty('--accent', c);
  const opt = a => a.map(x => `<option>${esc(x)}</option>`).join('');
  app.innerHTML = `<section class="view">
    <a class="back" href="#/society/${s.id}">← ${esc(s.name)}</a>
    <form class="form" id="f" novalidate style="--c:${c}">
      <h1>Apply to ${esc(s.name)}</h1>
      <p class="sub">Five questions. Closes ${fmtDate(s.deadline)}.</p>
      <div class="field"><label for="name">Full name</label><input id="name" name="name" autocomplete="name" required minlength="2"><div class="err"></div></div>
      <div class="row">
        <div class="field"><label for="year">Year</label><select id="year" name="year" required><option value="">Choose</option>${opt(['1st year', '2nd year', '3rd year', '4th year'])}</select><div class="err"></div></div>
        <div class="field"><label for="branch">Branch</label><input id="branch" name="branch" required placeholder="e.g. CSE, ECE, Mech"><div class="err"></div></div>
      </div>
      <div class="field"><label for="role">Role you want</label><select id="role" name="role" required><option value="">Choose</option>${opt(s.roles)}</select><div class="err"></div></div>
      <div class="field"><label for="why">Why you?</label><textarea id="why" name="why" required minlength="40" maxlength="400" placeholder="What would you bring, and what do you want out of it?"></textarea><div class="hint" id="count">0 / 400</div><div class="err"></div></div>
      <button class="btn" type="submit">Send application</button>
    </form>
  </section>`;

  const f = document.getElementById('f');
  const rules = {
    name: v => v.trim().length < 2 ? 'Enter your full name.' : /\d/.test(v) ? 'Names do not contain digits.' : '',
    year: v => v ? '' : 'Pick your year.',
    branch: v => v.trim().length < 2 ? 'Enter your branch.' : '',
    role: v => v ? '' : 'Pick a role.',
    why: v => v.trim().length < 40 ? `Write at least 40 characters (${Math.max(0, 40 - v.trim().length)} more).` : '',
  };
  const check = el => {
    const msg = rules[el.name](el.value);
    el.closest('.field').classList.toggle('invalid', !!msg);
    el.closest('.field').querySelector('.err').textContent = msg;
    el.setAttribute('aria-invalid', !!msg);
    return !msg;
  };
  const draftKey = 'draft:' + s.id;
  const draft = load(draftKey, null);
  if (draft) { Object.entries(draft).forEach(([k, v]) => { if (f[k]) f[k].value = v; }); }
  f.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('blur', () => check(el));
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('invalid')) check(el); save(draftKey, Object.fromEntries(new FormData(f))); });
  });
  const count = () => document.getElementById('count').textContent = `${f.why.value.length} / 400`;
  f.why.addEventListener('input', count); count();
  f.onsubmit = e => {
    e.preventDefault();
    const fields = [...f.querySelectorAll('input, select, textarea')];
    const bad = fields.filter(el => !check(el));
    if (bad.length) { bad[0].focus(); return; }
    const data = { society: s.id, ...Object.fromEntries(new FormData(f)), at: new Date().toISOString() };
    console.log('Application submitted', data);
    save('applications', { ...applied(), [s.id]: data });
    localStorage.removeItem(draftKey);
    updateNav();
    location.hash = `#/done/${s.id}`;
  };
}

function done(id) {
  const s = byId(id); if (!s) return notFound();
  const a = applied()[id];
  app.innerHTML = `<section class="view done" style="--c:${color(s)}">
    <div class="check" aria-hidden="true">✓</div>
    <h1>Application sent</h1>
    <p>${esc(s.name)} has your application${a ? ` for <b>${esc(a.role)}</b>` : ''}. They will reach out on your college email before ${fmtDate(s.deadline)}.</p>
    <div class="actions"><a class="btn" href="#/">Browse more societies</a><a class="btn ghost" href="#/me">See your list</a></div>
  </section>`;
}

function me() {
  root.style.setProperty('--accent', 'var(--ink)');
  const apps = Object.values(applied()).sort((a, b) => b.at.localeCompare(a.at));
  const picks = saved().map(byId).filter(Boolean);
  app.innerHTML = `<section class="view me">
    <h1>Your list</h1>
    <h2 class="section-h">Applications</h2>
    ${apps.length ? `<div class="apps">${apps.map(a => { const s = byId(a.society); return `<div class="app-row" style="--c:${color(s)}">
        <div class="icon" aria-hidden="true">${s.icon}</div>
        <div class="app-body"><a href="#/society/${s.id}"><b>${esc(s.name)}</b></a><span>${esc(a.role)} · sent ${shortDate(a.at.slice(0, 10))}</span></div>
        <span class="status">Under review</span>
        <button class="link" type="button" data-withdraw="${s.id}">Withdraw</button>
      </div>`; }).join('')}</div>`
      : `<div class="empty"><strong>Nothing sent yet.</strong>Apply to a society and it shows up here.</div>`}
    <h2 class="section-h">Saved for later</h2>
    ${picks.length ? `<div class="grid">${picks.map(s => cardHTML(s)).join('')}</div>`
      : `<div class="empty"><strong>No saved societies.</strong>Tap the heart on any society to keep it here.</div>`}
  </section>`;
  app.querySelectorAll('[data-withdraw]').forEach(b => b.onclick = () => {
    const s = byId(b.dataset.withdraw);
    if (!confirm(`Withdraw your application to ${s.name}?`)) return;
    const all = applied(); delete all[s.id]; save('applications', all); updateNav();
    toast(`Withdrew application to ${s.name}`); me();
  });
}

function quiz() {
  let i = 0; const score = { build: 0, team: 0, stage: 0, quiet: 0 };
  root.style.setProperty('--accent', 'var(--ink)');
  const step = () => {
    if (i >= QUIZ.length) return result();
    const q = QUIZ[i];
    app.innerHTML = `<section class="view quiz">
      <div class="progress"><i style="width:${(i / QUIZ.length) * 100}%"></i></div>
      <p class="sub">Question ${i + 1} of ${QUIZ.length}</p>
      <h1>${esc(q.q)}</h1>
      <div class="opts">${q.a.map((a, k) => `<button class="opt" type="button" data-k="${k}">${esc(a[0])}</button>`).join('')}</div>
    </section>`;
    app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      Object.entries(q.a[b.dataset.k][1]).forEach(([t, n]) => score[t] += n);
      i++; step();
    });
  };
  const result = () => {
    const ranked = SOCIETIES.map(s => {
      const dot = Object.keys(score).reduce((a, t) => a + score[t] * s.traits[t], 0);
      const mag = Math.hypot(...Object.values(s.traits)) * Math.hypot(...Object.values(score)) || 1;
      return [s, dot / mag];
    }).sort((a, b) => b[1] - a[1]).slice(0, 3);
    app.innerHTML = `<section class="view quiz">
      <div class="progress"><i style="width:100%"></i></div>
      <h1>Start with these three.</h1>
      <p class="sub">Ranked by how your answers line up with what each society is like day to day.</p>
      <div class="result">${ranked.map(([s, m]) => cardHTML(s, `<div class="match"><i style="width:${Math.round(m * 100)}%"></i><span>${Math.round(m * 100)}% match</span></div>`)).join('')}</div>
      <p style="margin-top:24px"><button class="btn ghost" type="button" id="retake">Retake</button></p>
    </section>`;
    document.getElementById('retake').onclick = quiz;
  };
  step();
}

const notFound = () => { app.innerHTML = `<section class="view empty" style="margin-top:40px"><strong>That page does not exist.</strong><a href="#/">Back to all societies</a></section>`; };

// --- router ---
function route() {
  const [view = '', id] = location.hash.replace(/^#\/?/, '').split('/');
  window.scrollTo(0, 0);
  ({ '': home, society: () => detail(id), apply: () => apply(id), done: () => done(id), quiz, me }[view] || notFound)();
}
addEventListener('hashchange', route);
addEventListener('keydown', e => { if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName)) { const q = document.getElementById('q'); if (q) { e.preventDefault(); q.focus(); } } });
updateNav();
route();

// --- pointer spotlight: sets --mx/--my (glow origin) and --rx/--ry (tilt) on hovered cards ---
if (matchMedia('(hover: hover)').matches) {
  app.addEventListener('pointermove', e => {
    const card = e.target.closest('.card'); if (!card) return;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    card.classList.add('lit'); card.style.setProperty('--mx', x + 'px'); card.style.setProperty('--my', y + 'px');
    card.style.setProperty('--ry', ((x / r.width) - .5) * 6 + 'deg');
    card.style.setProperty('--rx', (.5 - (y / r.height)) * 6 + 'deg');
  });
  app.addEventListener('pointerout', e => {
    const card = e.target.closest('.card'); if (card && !card.contains(e.relatedTarget)) { card.classList.remove('lit'); card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); }
  });
}

// --- dot grid follows the pointer (--px/--py are viewport coords; body::after masks a bright patch there) ---
let raf;
addEventListener('pointermove', e => {
  if (raf) return;
  raf = requestAnimationFrame(() => { root.style.setProperty('--px', e.clientX + 'px'); root.style.setProperty('--py', e.clientY + 'px'); raf = 0; });
}, { passive: true });
