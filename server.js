/**
 * CheatLove — Stripe Checkout backend
 *
 * Serves the static site (index.html, pricing.html, start.html, styles.css, app.js)
 * and exposes a single endpoint, POST /create-checkout-session, which creates a
 * Stripe Checkout Session for the chosen plan and returns its URL.
 *
 * The front-end (pricing.html) redirects the browser to that URL. Stripe handles
 * the card collection, 3DS, receipts, etc. After success, Stripe sends the user
 * back to start.html?paid=1&session_id={CHECKOUT_SESSION_ID}, which keeps the
 * existing paid-banner behavior in app.js working.
 *
 * Run:
 *   STRIPE_SECRET_KEY="<your-stripe-key>" node server.js
 *
 * Required env:
 *   STRIPE_SECRET_KEY  Stripe secret key (test mode prefix sk_test_, live prefix sk_live_)
 *
 * Optional env:
 *   PORT               default 3600
 *   PUBLIC_BASE_URL    default http://localhost:3600 — used for Stripe success/cancel URLs
 */

const path = require('path');
const express = require('express');

const PORT = Number(process.env.PORT) || 3600;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  // We do NOT crash here — the static site should still serve so the user can
  // see pages while wiring keys. /create-checkout-session will return a 500
  // with a clear message until a key is supplied.
  console.warn(
    '[cheateye] WARNING: STRIPE_SECRET_KEY is not set. ' +
      '/create-checkout-session will fail until you export it. ' +
      'See README.md for setup.'
  );
}

const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null;

// Canonical plan catalog — server is the source of truth on price.
// Never trust the client-sent price; only the plan id is honored.
const PLANS = Object.freeze({
  'quick-scan': {
    name: 'Quick Scan',
    description: 'One platform · Standard report',
    unit_amount: 1499, // $14.99 in cents
  },
  'full-report': {
    name: 'Full Report',
    description: 'All platforms · Deep cross-match',
    unit_amount: 2999, // $29.99
  },
  'premium-monitor': {
    name: 'Premium + Monitor',
    description: 'Everything in Full + 30-day watch',
    unit_amount: 5999, // $59.99
  },
});

const app = express();
app.use(express.json());

// --- Serve the static site from this same origin so fetch('/create-checkout-session')
// --- works without CORS. The existing python http.server on :3600 should be stopped
// --- before starting this server, OR this server can be run on a different PORT.
app.use(express.static(__dirname, { extensions: ['html'] }));

app.post('/create-checkout-session', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      error:
        'Stripe is not configured. Set STRIPE_SECRET_KEY and restart the server. See README.md.',
    });
  }

  const planId = String(req.body && req.body.plan ? req.body.plan : '').trim();
  const email = req.body && req.body.email ? String(req.body.email).trim() : undefined;

  const plan = PLANS[planId];
  if (!plan) {
    return res.status(400).json({
      error: `Unknown plan "${planId}". Valid: ${Object.keys(PLANS).join(', ')}.`,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: plan.unit_amount,
            product_data: {
              name: `CheatLove — ${plan.name}`,
              description: plan.description,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      // After a successful charge, send users back to the existing start flow.
      // start.html?paid=1 triggers the paid-banner in app.js.
      success_url: `${PUBLIC_BASE_URL}/start.html?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_BASE_URL}/pricing.html`,
      metadata: {
        plan_id: planId,
        plan_name: plan.name,
      },
    });

    return res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('[cheateye] stripe error:', err && err.message ? err.message : err);
    return res.status(500).json({
      error: 'Could not create checkout session. Check server logs.',
    });
  }
});

// Lightweight health probe — handy during deploys.
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, stripe_configured: Boolean(stripe) });
});

app.listen(PORT, () => {
  console.log(`[cheateye] listening on ${PUBLIC_BASE_URL}`);
  console.log(`[cheateye] stripe configured: ${Boolean(stripe)}`);
});
