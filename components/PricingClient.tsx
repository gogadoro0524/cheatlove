'use client';

import { useState, FormEvent } from 'react';
import { PLAN_LIST, PLANS, type PlanId } from '@/lib/plans';

const POPULAR_PLAN: PlanId = 'full-report';

function maskCard(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
function maskExp(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
}

export function PricingClient() {
  const [selected, setSelected] = useState<PlanId>('full-report');
  const [email, setEmail] = useState('');
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('United States');
  const [zip, setZip] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const plan = PLANS[selected];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected, email: email.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const { url } = await res.json();
      if (!url) throw new Error('No checkout URL returned.');
      window.location.href = url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(
        'Payment could not start: ' + msg +
        '\n\nMake sure STRIPE_SECRET_KEY is set on the server. See README.md.',
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="hero" style={{ padding: '60px 0 30px' }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 36 }}>
            <div className="section-eyebrow">Pricing</div>
            <h1 className="section-title">Pay only when you have results.</h1>
            <p className="section-sub">No subscription. No hidden fees. 100% refund if no profile is found.</p>
          </div>

          <div className="price-grid">
            {PLAN_LIST.map((p) => {
              const isPopular = p.id === POPULAR_PLAN;
              const isSelected = selected === p.id;
              return (
                <div
                  key={p.id}
                  className={`price-card${isPopular ? ' popular' : ''}${isSelected ? ' selected' : ''}`}
                  onClick={() => setSelected(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(p.id);
                    }
                  }}
                >
                  <h3>{p.name}</h3>
                  <p className="tag-line">{p.tagline}</p>
                  <div className="strike">{p.strikePrice}</div>
                  <div className="price">
                    {p.displayPrice}<small>/ {p.id === 'premium-monitor' ? 'once' : 'search'}</small>
                  </div>
                  <ul>
                    {p.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="pay-layout">

            <div className="pay-card">
              <h3>Checkout</h3>
              <form id="pay-form" onSubmit={onSubmit}>
                <div className="form-row">
                  <label htmlFor="email">Email (for report delivery)</label>
                  <input
                    type="email" id="email" required placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="card-number">Card number</label>
                  <input
                    type="text" id="card-number" required inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={card} onChange={(e) => setCard(maskCard(e.target.value))}
                  />
                </div>

                <div className="form-2col">
                  <div className="form-row">
                    <label htmlFor="card-exp">Expiry</label>
                    <input
                      type="text" id="card-exp" required placeholder="MM/YY"
                      value={exp} onChange={(e) => setExp(maskExp(e.target.value))}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="card-cvc">CVC</label>
                    <input
                      type="text" id="card-cvc" required placeholder="123"
                      inputMode="numeric"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="card-name">Cardholder name</label>
                  <input
                    type="text" id="card-name" required placeholder="Jane Doe"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-2col">
                  <div className="form-row">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country" required value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Germany</option>
                      <option>France</option>
                      <option>Korea, Republic of</option>
                      <option>Japan</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label htmlFor="zip">Postal code</label>
                    <input
                      type="text" id="zip" required placeholder="10001"
                      value={zip} onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  type="submit"
                  style={{ marginTop: 8 }}
                  disabled={submitting}
                >
                  {submitting ? 'Redirecting to Stripe…' : <>🔒 Pay {plan.displayPrice} securely</>}
                </button>

                <p style={{ fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center', margin: '14px 0 0' }}>
                  By clicking Pay you agree to the <a href="#">Terms</a> and <a href="#">Refund Policy</a>.
                  Charge appears on your statement as <strong>CHEATLOVE*REPORT</strong>.
                </p>
              </form>
            </div>

            <aside>
              <div className="pay-card" style={{ position: 'sticky', top: 90 }}>
                <h3>Order summary</h3>
                <div className="summary-row"><span>Plan</span><strong>{plan.name}</strong></div>
                <div className="summary-row"><span>Cross-platform scan</span><strong>Included</strong></div>
                <div className="summary-row"><span>Subscription detection</span><strong>Included</strong></div>
                <div className="summary-row"><span>Photo change history</span><strong>Included</strong></div>
                <div className="summary-row"><span>Subtotal</span><strong>{plan.displayPrice}</strong></div>
                <div className="summary-row"><span>Discount (autoapplied)</span><strong style={{ color: 'var(--green)' }}>−{plan.strikePrice.replace('$', '$').slice(0, -3)}.00</strong></div>
                <div className="summary-row total"><span>Total today</span><span>{plan.displayPrice}</span></div>

                <div className="badges">
                  <span className="badge">🔒 SSL encrypted</span>
                  <span className="badge">💳 Stripe</span>
                  <span className="badge">↩ Refund if no match</span>
                  <span className="badge">🕶 Discreet billing</span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '18px 0 0' }}>
                  Need help? <a href="#">support@cheatlove.example</a><br />
                  Live chat 24/7 · Avg response 4 min.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <div className="section-eyebrow">Money-back promise</div>
            <h2 className="section-title">If we don't find them, you don't pay.</h2>
            <p className="section-sub">If CheatLove returns no active profile across all supported platforms, we refund 100% of your purchase within 24 hours. No forms, no hold music.</p>
          </div>
        </div>
      </section>
    </>
  );
}
