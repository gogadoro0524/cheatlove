/**
 * Vercel Serverless Function — POST /api/create-checkout-session
 *
 * Mirrors the local Express handler in /server.js so the front-end (app.js)
 * can hit the same logical endpoint in both environments.
 *
 * Required env on Vercel:
 *   STRIPE_SECRET_KEY  set in Project Settings → Environment Variables
 *
 * Successful response:
 *   { url: "https://checkout.stripe.com/...", id: "cs_..." }
 */

// Canonical plan catalog — server is the source of truth on price.
// The client only passes a plan id; never trust client-side amounts.
const PLANS = Object.freeze({
  'quick-scan': {
    name: 'Quick Scan',
    description: 'One platform · Standard report',
    unit_amount: 1499, // $14.99
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(500).json({
      error:
        'STRIPE_SECRET_KEY is not configured on the server. ' +
        'Add it in Vercel → Project Settings → Environment Variables, then redeploy.',
    });
  }

  // Vercel auto-parses JSON bodies for application/json content-type.
  // Be defensive in case it arrives as a raw string.
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const planId = String(body.plan || '').trim();
  const email  = body.email ? String(body.email).trim() : undefined;

  const plan = PLANS[planId];
  if (!plan) {
    return res.status(400).json({
      error: `Unknown plan "${planId}". Valid: ${Object.keys(PLANS).join(', ')}.`,
    });
  }

  // Determine the public base URL from the inbound request so success/cancel
  // URLs work across preview deployments, prod, and custom domains alike.
  const proto = (req.headers['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
  const host  = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  const origin = `${proto}://${host}`;

  try {
    const stripe = require('stripe')(key);
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
      customer_email: email && email.includes('@') ? email : undefined,
      success_url: `${origin}/start.html?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing.html`,
      metadata: {
        plan_id: planId,
        plan_name: plan.name,
      },
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('[cheatlove] stripe error:', err && err.message ? err.message : err);
    return res.status(500).json({
      error: 'Could not create checkout session. Check function logs.',
    });
  }
};
