// Shared interactivity for CheatLove

// --- FAQ accordion ---
document.querySelectorAll('.faq-item').forEach((item) => {
  const q = item.querySelector('.faq-q');
  if (!q) return;
  q.addEventListener('click', () => {
    item.classList.toggle('open');
  });
});

// --- Hero gender toggle ---
document.querySelectorAll('.gender-toggle').forEach((wrap) => {
  wrap.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// --- Pricing selection ---
document.querySelectorAll('.price-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.price-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    const price = card.dataset.price;
    const plan = card.dataset.plan;
    const sumPrice = document.getElementById('sum-price');
    const sumPlan = document.getElementById('sum-plan');
    const sumTotal = document.getElementById('sum-total');
    if (sumPrice) sumPrice.textContent = `$${price}`;
    if (sumPlan) sumPlan.textContent = plan;
    if (sumTotal) sumTotal.textContent = `$${price}`;
  });
});

// --- Card number masking ---
const cardInput = document.getElementById('card-number');
if (cardInput) {
  cardInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
}
const expInput = document.getElementById('card-exp');
if (expInput) {
  expInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    e.target.value = v;
  });
}
const cvcInput = document.getElementById('card-cvc');
if (cvcInput) {
  cvcInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  });
}

// Map the human-readable data-plan value on .price-card to the canonical
// plan id the server (server.js) expects.
const PLAN_ID_BY_LABEL = {
  'Quick Scan': 'quick-scan',
  'Full Report': 'full-report',
  'Premium + Monitor': 'premium-monitor',
};

const payForm = document.getElementById('pay-form');
if (payForm) {
  payForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = payForm.querySelector('button[type="submit"]');
    const originalLabel = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Redirecting to Stripe…';

    const selectedCard = document.querySelector('.price-card.selected') ||
                         document.querySelector('.price-card');
    const planLabel = selectedCard && selectedCard.dataset.plan
      ? selectedCard.dataset.plan
      : 'Full Report';
    const planId = PLAN_ID_BY_LABEL[planLabel] || 'full-report';

    const emailEl = document.getElementById('email');
    const email = emailEl ? emailEl.value.trim() : '';

    try {
      const res = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, email }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (!url) throw new Error('No checkout URL returned.');
      window.location.href = url;
    } catch (err) {
      console.error('[cheateye] checkout error:', err);
      alert('Payment could not start: ' + (err.message || err) +
        '\n\nIs the Node server running with STRIPE_SECRET_KEY set? See README.md.');
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }
  });
}

// --- Start flow (multi-step) ---
const startSteps = document.querySelectorAll('.start-step');
const startPips = document.querySelectorAll('.progress .pip');
let curStep = 0;

function goStep(i) {
  startSteps.forEach((s, idx) => s.classList.toggle('active', idx === i));
  startPips.forEach((p, idx) => {
    p.classList.toggle('active', idx === i);
    p.classList.toggle('done', idx < i);
  });
  curStep = i;
  if (startSteps[i] && startSteps[i].dataset.onenter === 'scan') {
    runScan();
  }
}

document.querySelectorAll('[data-next]').forEach((b) =>
  b.addEventListener('click', (e) => {
    e.preventDefault();
    if (curStep < startSteps.length - 1) goStep(curStep + 1);
  })
);
document.querySelectorAll('[data-prev]').forEach((b) =>
  b.addEventListener('click', (e) => {
    e.preventDefault();
    if (curStep > 0) goStep(curStep - 1);
  })
);

document.querySelectorAll('.gender-choice button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.gender-choice button').forEach((x) => x.classList.remove('selected'));
    b.classList.add('selected');
    setTimeout(() => goStep(curStep + 1), 220);
  });
});

const scanLogs = [
  'Initializing secure tunnel…',
  'Connecting to dating servers…',
  'Indexing nearby profiles…',
  'Cross-referencing photo hashes…',
  'Checking last-seen timestamps…',
  'Reading subscription tier…',
  'Verifying account activity…',
  'Compiling encrypted report…',
];
let scanRunning = false;

function runScan() {
  if (scanRunning) return;
  scanRunning = true;
  const bar = document.querySelector('.scan-bar .fill');
  const log = document.querySelector('.scan-log');
  const status = document.querySelector('.scan-status');
  const result = document.querySelector('.scan-result');
  if (result) result.style.display = 'none';
  let p = 0;
  let i = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 9 + 3);
    if (bar) bar.style.width = p + '%';
    if (log && scanLogs[i]) log.textContent = scanLogs[i];
    i = (i + 1) % scanLogs.length;
    if (p >= 100) {
      clearInterval(tick);
      if (status) status.textContent = 'Match found.';
      if (log) log.textContent = 'Report ready. Unlock to view.';
      if (result) result.style.display = 'block';
    }
  }, 520);
}

// auto-trigger scan if URL says paid=1 and start has the scan step rendered
if (new URLSearchParams(location.search).get('paid') === '1') {
  const banner = document.getElementById('paid-banner');
  if (banner) banner.style.display = 'block';
}
