'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  email?: string;
  onClose: () => void;
}

export function RenewalModal({ open, email, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
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

  const notifyTarget = email && email.includes('@') ? email : 'you';

  return (
    <div
      className="renewal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="renewal-title"
      onClick={onClose}
    >
      <div className="renewal-card" onClick={(e) => e.stopPropagation()}>
        <div className="renewal-icon" aria-hidden>🚧</div>
        <h3 id="renewal-title">We&rsquo;re renewing the service</h3>
        <p className="renewal-body">
          CheatLens is being upgraded right now — we&rsquo;re adding new dating platforms
          so your searches come back even more accurate. Payments are paused while we
          finish the renewal.
        </p>
        <div className="renewal-note">
          <strong>You have not been charged.</strong>
          <span>
            We&rsquo;ve saved your spot — we&rsquo;ll email <b>{notifyTarget}</b> the moment
            it&rsquo;s back online, usually within a few days.
          </span>
        </div>
        <button ref={closeRef} type="button" className="renewal-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
