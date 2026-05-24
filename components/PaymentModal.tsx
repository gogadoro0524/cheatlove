'use client';

import { useEffect, useState } from 'react';

export type PayPlan = 'single' | 'monthly';

const OPTIONS: {
  id: PayPlan;
  name: string;
  price: string;
  unit: string;
  blurb: string;
  badge?: string;
}[] = [
  {
    id: 'single',
    name: 'Single report',
    price: '$14.99',
    unit: 'one-time',
    blurb: 'The full report for this match — every platform, photo cross-match, and 14-day activity timeline. Delivered now.',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$29.99',
    unit: '/ month',
    blurb: 'Unlimited reports plus 30-day live monitoring on anyone. Cancel anytime.',
    badge: 'Best value',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onPay: (plan: PayPlan) => void;
}

export function PaymentModal({ open, onClose, onPay }: Props) {
  const [selected, setSelected] = useState<PayPlan>('single');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const chosen = OPTIONS.find((o) => o.id === selected)!;
  const payLabel = `${chosen.price}${chosen.id === 'monthly' ? '/mo' : ''}`;

  function pay() {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onPay(selected);
    }, 1600);
  }

  return (
    <div
      className="renewal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pm-title"
      onClick={onClose}
    >
      <div className="um-card" onClick={(e) => e.stopPropagation()}>
        <h3 id="pm-title">Unlock the full report</h3>
        <p className="um-sub">Pick how you&rsquo;d like to unlock.</p>

        <div className="pm-plans" role="radiogroup" aria-label="Choose a plan">
          {OPTIONS.map((o) => (
            <button
              type="button"
              key={o.id}
              role="radio"
              aria-checked={selected === o.id}
              className={`pm-plan${selected === o.id ? ' selected' : ''}`}
              onClick={() => setSelected(o.id)}
            >
              {o.badge && <span className="pm-badge">{o.badge}</span>}
              <span className="pm-plan-top">
                <span className="pm-plan-name">{o.name}</span>
                <span className="pm-plan-price">
                  {o.price}<small> {o.unit}</small>
                </span>
              </span>
              <span className="pm-plan-blurb">{o.blurb}</span>
            </button>
          ))}
        </div>

        <button type="button" className="um-submit" onClick={pay} disabled={submitting}>
          {submitting ? (
            <><span className="btn-spinner" aria-hidden /> Processing…</>
          ) : (
            <>🔒 Pay {payLabel} securely</>
          )}
        </button>

        <p className="pm-fine">
          Secure checkout · Cancel anytime · Billed discreetly as CHEATLENS*RPT
        </p>
      </div>
    </div>
  );
}
