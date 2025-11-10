// app.js — Secure Bank SPA with local JWT auth helpers.

/* =========================
   Auth helper (local JWT)
   ========================= */
const auth = (() => {
  const TOKEN_KEY = 'access_token';
  const PROFILE_KEY = 'user_profile';

  let accessToken = localStorage.getItem(TOKEN_KEY) || '';
  let profile;
  try {
    profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
  } catch {
    profile = null;
  }

  function persist(session) {
    if (session && session.accessToken) {
      accessToken = session.accessToken;
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      accessToken = '';
      localStorage.removeItem(TOKEN_KEY);
    }

    if (session && (session.name || session.email)) {
      profile = { name: session.name ?? '', email: session.email ?? '' };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
      profile = null;
      localStorage.removeItem(PROFILE_KEY);
    }
  }

async function send(path, payload) {
    const res = await fetch(`https://cloud-banking-project.onrender.com${path}`, {
// ...
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.message || data?.error || 'Request failed';
      throw new Error(message);
    }
    persist(data);
    return data;
  }

  async function signup(name, email, password) {
    return send('/auth/signup', { name, email, password });
  }

  async function signin(email, password) {
    return send('/auth/signin', { email, password });
  }

  function logout() {
    persist(null);
  }

  function getToken() {
    return accessToken;
  }

  function getProfile() {
    return profile;
  }

  function isAuthenticated() {
    return Boolean(accessToken);
  }

async function refreshProfile() {
    if (!accessToken) return null;
    const res = await fetch('https://cloud-banking-project.onrender.com/auth/me', {
// ...
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      logout();
      return null;
    }
    const data = await res.json();
    persist({ ...data, accessToken });
    return data;
  }

  return { signup, signin, logout, getToken, getProfile, isAuthenticated, refreshProfile };
})();

async function api(path, options = {}){
  const token = auth.getToken();
  const headers = { 'Content-Type':'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`https://cloud-banking-project.onrender.com${path}`, { ...options, headers });
  if (res.status === 401 || res.status === 403){
    auth.logout();
    history.pushState({}, '', '#signin');
    setView('#signin');
    throw new Error('Unauthorized');
  }
  return res;
}

function ensureSignedIn(){
  if (auth.isAuthenticated()) return true;
  history.pushState({}, '', '#signin');
  setView('#signin');
  return false;
}

/* =========================
   SPA router and UI plumbing
   ========================= */
const views = Array.from(document.querySelectorAll('[data-view]'));
const menu = document.getElementById('primaryMenu');
const navToggle = document.getElementById('navToggle');

function setView(hash) {
  const target = (hash || '#home').split('?')[0];
  views.forEach(v => v.classList.toggle('view--active', `#${v.id}` === target));
  document.getElementById('main').focus();
}

function toggleMenu(force) {
  const open = typeof force === 'boolean' ? force : menu.hasAttribute('hidden');
  if (open) {
    menu.removeAttribute('hidden');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    menu.querySelector('a')?.focus();
  } else {
    menu.setAttribute('hidden', '');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navToggle.focus();
  }
}

navToggle?.addEventListener('click', () => toggleMenu());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hasAttribute('hidden')) toggleMenu(false); });
menu?.addEventListener('click', (e) => { if (e.target.matches('[data-route]')) toggleMenu(false); });
window.addEventListener('hashchange', () => setView(location.hash));
document.addEventListener('click', (e) => { const a = e.target.closest('[data-route]'); if (!a) return; e.preventDefault(); history.pushState({}, '', a.getAttribute('href')); setView(location.hash); });

/* =========================
   Session restore + route gating
   ========================= */
window.addEventListener('DOMContentLoaded', async () => {
  await auth.refreshProfile();
  const protectedViews = new Set(['#dashboard','#statements','#alerts']);
  const target = (location.hash || '#home').split('?')[0];
  if (protectedViews.has(target) && !ensureSignedIn()) {
    return;
  }
  setView(location.hash);
});

/* =========================
   Demo data (front-end only)
   ========================= */
const accounts = [
  { id: 'CHK-2381', name: 'Checking', balance: 2350.42, currency: 'USD' },
  { id: 'SAV-7712', name: 'Savings', balance: 10890.00, currency: 'USD' },
  { id: 'CRD-9901', name: 'Credit Card', balance: -423.19, currency: 'USD' }
];
let budgets = [];
const statements = [
  { month: '2025-09', file: 'statement-2025-09.pdf' },
  { month: '2025-08', file: 'statement-2025-08.pdf' },
  { month: '2025-07', file: 'statement-2025-07.pdf' }
];
let transactions = [
  { when: '2025-10-01', desc: 'Groceries', category: 'Groceries', amount: -64.29 },
  { when: '2025-09-29', desc: 'Payroll', category: 'Income', amount: 2450.00 },
  { when: '2025-09-27', desc: 'Electric Bill', category: 'Utilities', amount: -92.15 },
  { when: '2025-09-25', desc: 'Coffee', category: 'Dining', amount: -3.75 }
];
const locations = [
  { type:'branch', name:'MG Road Branch', addr:'12 MG Road, Bengaluru', zip:'560001', city:'Bengaluru', phone:'+91 80 1234 5678' },
  { type:'atm', name:'MG Road ATM',   addr:'14 MG Road, Bengaluru', zip:'560001', city:'Bengaluru' },
  { type:'branch', name:'Andheri Branch', addr:'21 Metro Rd, Mumbai', zip:'400069', city:'Mumbai', phone:'+91 22 3456 7890' },
  { type:'atm', name:'Andheri ATM',   addr:'19 Metro Rd, Mumbai', zip:'400069', city:'Mumbai' }
];

function money(n){ return (n < 0 ? '-' : '') + '$' + Math.abs(n).toFixed(2); }

/* =========================
   Rendering functions
   ========================= */
function renderDashboard(){
  const acctList = document.getElementById('accountsList');
  const txList = document.getElementById('transactionsList');
  const dashTitle = document.getElementById('dash-title');
  const profile = auth.getProfile();
  if (dashTitle) {
    dashTitle.textContent = profile ? `Dashboard • ${profile.name || profile.email}` : 'Dashboard';
  }
  if (!acctList || !txList) return;
  acctList.innerHTML = '';
  accounts.forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${a.name} • ${a.id}</span><span>${money(a.balance)} ${a.currency}</span>`;
    acctList.appendChild(li);
  });
  txList.innerHTML = '';
  transactions.slice(0,10).forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${t.when} • ${t.desc}</span><span>${money(t.amount)}</span>`;
    txList.appendChild(li);
  });
  ['from','to'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select…</option>';
    accounts.forEach(a => {
      const o = document.createElement('option');
      o.value = a.id; o.textContent = `${a.name} (${a.id})`;
      sel.appendChild(o);
    });
  });
}

function renderStatements(){
  const list = document.getElementById('statementList');
  if (!list) return;
  list.innerHTML = '';
  statements.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${s.month}</span><span><button class="btn btn--small" data-dl="${s.file}">Download</button></span>`;
    list.appendChild(li);
  });
}

function renderBudgets(){
  const list = document.getElementById('budgetsList');
  if (!list) return;
  list.innerHTML = '';
  budgets.forEach(b => {
    const spent = transactions.filter(t => t.category === b.category && t.amount < 0)
      .reduce((sum,t)=> sum + Math.abs(t.amount), 0);
    const pct = b.limit ? Math.min(100, Math.round(100*spent/b.limit)) : 0;
    const li = document.createElement('li');
    li.innerHTML = `<span>${b.category}: spent ${money(spent)} of ${money(b.limit)} (${pct}%)</span>`;
    list.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderStatements();
  renderBudgets();
});

/* =========================
   Auth validation helpers
   ========================= */
function setError(id,msg){ const el = document.getElementById(id); if (el) el.textContent = msg || ''; }
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

/* =========================
  Attach auth — local JWT
  ========================= */
function attachAuth(){
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');

  signinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email')?.value || '';
    const pass  = document.getElementById('signin-password')?.value || '';
    let valid = true;
    if (!validEmail(email)){ setError('signin-email-error','Enter a valid email.'); valid = false; } else setError('signin-email-error','');
    if (!(pass && pass.length>=8)){ setError('signin-password-error','Password must be at least 8 characters.'); valid = false; } else setError('signin-password-error','');
    if (!valid) return;
    try {
      await auth.signin(email, pass);
      await auth.refreshProfile();
      history.pushState({}, '', '#dashboard');
      setView('#dashboard');
      renderDashboard();
      signinForm.reset();
    } catch (err) {
      setError('signin-password-error', err.message);
    }
  });

  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    const confirm = document.getElementById('confirm')?.value || '';
    let valid = true;
    if (!name.trim()) { setError('name-error','Enter full name.'); valid = false; } else setError('name-error','');
    if (!validEmail(email)) { setError('email-error','Enter a valid email.'); valid = false; } else setError('email-error','');
    if (!(password && password.length>=8)) { setError('password-error','Use at least 8 characters.'); valid = false; } else setError('password-error','');
    if (confirm !== password) { setError('confirm-error','Passwords do not match.'); valid = false; } else setError('confirm-error','');
    if (!valid) return;
    try {
      await auth.signup(name, email, password);
      history.pushState({}, '', '#dashboard');
      setView('#dashboard');
      renderDashboard();
      signupForm.reset();
    } catch (err) {
      setError('confirm-error', err.message);
    }
  });

  signupForm?.addEventListener('input', () => {
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    const confirm = document.getElementById('confirm')?.value || '';
    if (!name.trim()) setError('name-error','Enter full name.'); else setError('name-error','');
    if (!validEmail(email)) setError('email-error','Enter a valid email.'); else setError('email-error','');
    if (!(password && password.length>=8)) setError('password-error','Use at least 8 characters.'); else setError('password-error','');
    if (confirm !== password) setError('confirm-error','Passwords do not match.'); else setError('confirm-error','');
  });

  signinForm?.addEventListener('input', () => {
    const email = document.getElementById('signin-email')?.value || '';
    const password = document.getElementById('signin-password')?.value || '';
    if (!validEmail(email)) setError('signin-email-error','Enter a valid email.'); else setError('signin-email-error','');
    if (!(password && password.length>=8)) setError('signin-password-error','Password must be at least 8 characters.'); else setError('signin-password-error','');
  });
}

/* =========================
   Transfers with step-up (AAL2)
   ========================= */
function attachTransfers(){
  const form = document.getElementById('transferForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const from = form.from.value, to = form.to.value, amt = parseFloat(form.amount.value);
    let ok = true;
    if (!from){ setError('from-error','Select source.'); ok=false; } else setError('from-error','');
    if (!to){ setError('to-error','Select destination.'); ok=false; } else setError('to-error','');
    if (from && to && from === to){ setError('to-error','Choose a different destination.'); ok=false; }
    if (!(amt > 0)){ setError('amount-error','Enter amount > 0.'); ok=false; } else setError('amount-error','');
    if (!ok) return;

    if (!ensureSignedIn()) return;

    // DEMO: local mutation. PROD: await api('/api/transfer', {method:'POST', body: JSON.stringify({from,to,amount:amt})});
    const src = accounts.find(a => a.id === from);
    const dst = accounts.find(a => a.id === to);
    src.balance -= amt; dst.balance += amt;
    transactions.unshift({ when: new Date().toISOString().slice(0,10), desc:`Transfer ${src.id}→${dst.id}`, category:'Transfer', amount: -amt });
    transactions.unshift({ when: new Date().toISOString().slice(0,10), desc:`Transfer ${src.id}→${dst.id}`, category:'Transfer', amount: +amt });
    renderDashboard();
    document.getElementById('transferStatus').textContent = `Transferred ${money(amt)} from ${src.id} to ${dst.id}.`;
    form.reset();
  });
}

/* =========================
   Card controls with step-up
   ========================= */
function attachCards(){
  const lock = document.getElementById('cardLock');
  const status = document.getElementById('cardStatus');

  document.getElementById('cardReplace')?.addEventListener('click', () => {
    if (!ensureSignedIn()) return;
    status.textContent = 'Replacement card requested (demo).';
  });

  document.getElementById('travelNotice')?.addEventListener('click', () => {
    if (!ensureSignedIn()) return;
    status.textContent = 'Travel notice added (demo).';
  });

  lock?.addEventListener('change', () => {
    if (!ensureSignedIn()){ lock.checked = !lock.checked; return; }
    status.textContent = lock.checked ? 'Card locked.' : 'Card unlocked.';
  });
}

/* =========================
   PFM budgets
   ========================= */
function attachBudgets(){
  const form = document.getElementById('budgetForm');
  const status = document.getElementById('budgetStatus');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('cat').value;
    const limit = parseFloat(document.getElementById('limit').value);
    if (!(limit > 0)){ status.textContent = 'Enter a valid limit.'; return; }
    const existing = budgets.find(b => b.category === category);
    if (existing) existing.limit = limit; else budgets.push({ category, limit });
    renderBudgets();
    status.textContent = `Budget set for ${category} at ${money(limit)}.`;
    form.reset();
  });
}

/* =========================
   Alerts preferences
   ========================= */
function attachAlerts(){
  const form = document.getElementById('alertForm');
  const status = document.getElementById('alertStatus');
  form?.addEventListener('submit', (e) => { e.preventDefault(); status.textContent = 'Alert preferences saved (demo).'; });
}

/* =========================
   Statements download with step-up
   ========================= */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-dl]');
  if (!btn) return;
  if (!ensureSignedIn()) return;
  const file = btn.getAttribute('data-dl');
  alert(`Downloading ${file} (stub)`);
});

/* =========================
   Calculators (local)
   ========================= */
function attachCalculators(){
  document.getElementById('loanCalc')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const P = parseFloat(document.getElementById('loan-amount').value);
    const annual = parseFloat(document.getElementById('loan-rate').value)/100;
    const years = parseInt(document.getElementById('loan-term').value,10);
    if (!(P>0) || !(annual>=0) || !(years>0)) return;
    const r = annual/12; const n = years*12;
    const pmt = r === 0 ? P/n : (r*P)/(1 - Math.pow(1+r,-n));
    document.getElementById('loan-result').textContent = `Estimated monthly payment: ${money(pmt)}.`;
  });
  document.getElementById('saveCalc')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const FV = parseFloat(document.getElementById('save-target').value);
    const years = parseInt(document.getElementById('save-years').value,10);
    const apy = parseFloat(document.getElementById('save-apy').value)/100;
    if (!(FV>0) || !(years>0) || !(apy>=0)) return;
    const r = apy/12; const n = years*12;
    const pmt = r === 0 ? FV/n : FV * r / (Math.pow(1+r, n) - 1);
    document.getElementById('save-result').textContent = `Required monthly savings: ${money(pmt)}.`;
  });
  document.getElementById('debtCalc')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let B = parseFloat(document.getElementById('debt-balance').value);
    const apr = parseFloat(document.getElementById('debt-rate').value)/100;
    const pay = parseFloat(document.getElementById('debt-pay').value);
    if (!(B>0) || !(apr>=0) || !(pay>0)) return;
    const r = apr/12;
    if (r>0 && pay <= B*r){ document.getElementById('debt-result').textContent = 'Payment too low to reduce balance.'; return; }
    let months=0; const maxMonths=1200;
    while (B > 0 && months < maxMonths){
      const interest = B*r; B = Math.max(0, B + interest - pay); months++;
    }
    document.getElementById('debt-result').textContent = months>=maxMonths ? 'Will not pay off at this payment.' : `Estimated payoff time: ${months} months.`;
  });
}

/* =========================
   Locator (local filter)
   ========================= */
function attachLocator(){
  const form = document.getElementById('locForm');
  const results = document.getElementById('locResults');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('loc-query').value.trim().toLowerCase();
    const t = document.getElementById('loc-type').value;
    const found = locations.filter(l => l.type===t && (l.zip.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)));
    results.innerHTML = found.length ? '' : '<li>No results found.</li>';
    found.forEach(l => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${l.name} • ${l.addr}</span><span>${l.phone || ''}</span>`;
      results.appendChild(li);
    });
  });
}

/* =========================
   Chat stub
   ========================= */
function attachChat(){
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const log = document.getElementById('chatLog');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = input.value.trim(); if (!msg) return;
    const user = document.createElement('div'); user.textContent = `You: ${msg}`; log.appendChild(user);
    const bot = document.createElement('div'); bot.textContent = 'Agent: Thanks for reaching out. This is a demo.'; log.appendChild(bot);
    log.scrollTop = log.scrollHeight;
    input.value = '';
  });
}

/* =========================
   Startup wiring
   ========================= */
window.addEventListener('DOMContentLoaded', () => {
  attachAuth();
  attachTransfers();
  attachCards();
  attachBudgets();
  attachAlerts();
  attachCalculators();
  attachLocator();
  attachChat();
});