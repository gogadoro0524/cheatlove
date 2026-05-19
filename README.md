# CheatLove — Stripe Checkout setup

The site (`index.html`, `pricing.html`, `start.html`, `styles.css`, `app.js`) is
served as-is, plus a tiny Express backend (`server.js`) that creates real Stripe
Checkout Sessions. The card form on `pricing.html` no longer fakes payment — it
redirects to Stripe-hosted Checkout, and a successful charge lands back on
`start.html?paid=1&session_id=...` (which the existing `app.js` already handles
to show the `paid-banner`).

## 1. Stop the Python dev server (if running)

The Python `http.server` and this Node server both want port 3600. The agent
was told **not** to kill it for you — do this yourself when you're ready:

```bash
# find the pid and kill it
lsof -ti :3600 | xargs kill
```

(Or run the Node server on a different port via `PORT=4000 npm start`.)

## 2. Install dependencies

```bash
cd /Users/godo/Desktop/projects/cheateye
npm install
```

## 3. Get a Stripe secret key

1. Go to https://dashboard.stripe.com/test/apikeys.
2. Copy the **Secret key** that starts with `sk_test_...` (test mode is fine
   for local development — it accepts card `4242 4242 4242 4242`, any future
   expiry, any CVC, any postal code).
3. For real charges later, use the live key (prefix `sk_live_`). Same env var.

## 4. Run the server

```bash
export STRIPE_SECRET_KEY="<YOUR_STRIPE_TEST_KEY>"   # sk_test_... from dashboard
npm start
```

You should see:

```
[cheateye] listening on http://localhost:3600
[cheateye] stripe configured: true
```

Open http://localhost:3600/pricing.html, pick a plan, fill in the form, and
click **Pay**. You will be redirected to Stripe Checkout. After paying with
the test card you'll land on `start.html?paid=1&session_id=cs_test_...`.

### Optional env vars

| Var               | Default                   | Purpose                                                                                  |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| `PORT`            | `3600`                    | Port for the Express server.                                                             |
| `PUBLIC_BASE_URL` | `http://localhost:$PORT`  | Used to build Stripe `success_url` / `cancel_url`. Set this in production to your domain. |
| `STRIPE_SECRET_KEY` | _(unset → /create-checkout-session returns 500)_ | Stripe API secret. **Never commit this.**                                                |

## 5. How it works

- `pricing.html` still renders the same card form (visually unchanged).
- On submit, `app.js` calls `POST /create-checkout-session` with `{ plan, email }`.
- `server.js` looks up the canonical price for that plan (cents, server-side
  source of truth — the client cannot tamper with the amount) and creates a
  Stripe Checkout Session.
- The browser is redirected to `session.url` (Stripe-hosted page).
- On success, Stripe sends the user back to `start.html?paid=1&session_id=...`.
- On cancel, back to `pricing.html`.

### Plan id mapping

`server.js` knows three plan ids. The front-end derives them from the selected
`.price-card` via `data-plan`:

| `data-plan`           | Plan id            | Amount (USD) |
| --------------------- | ------------------ | ------------ |
| `Quick Scan`          | `quick-scan`       | 14.99        |
| `Full Report`         | `full-report`      | 29.99        |
| `Premium + Monitor`   | `premium-monitor`  | 59.99        |

## 6. Security notes

- `STRIPE_SECRET_KEY` is read from `process.env` only — never hardcoded.
- The card number / CVC / expiry fields on `pricing.html` are now decorative.
  Real card data is collected by Stripe on their own domain. We do not POST
  card numbers anywhere.
- Price is set on the server, not derived from `data-price`. A user editing
  HTML in DevTools cannot change the charge amount.

## 7. Webhook (next step, not yet wired)

For production you almost certainly want a Stripe webhook on
`checkout.session.completed` to actually fulfill the order (send the report,
flip a DB row, etc.). That is intentionally out of scope here — the current
server just creates the session and trusts the success redirect for the UI.
