'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// When the Supabase keys are absent (local demo), the modal accepts any valid
// input so the unlock flow stays demoable without a backend.
const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function LoginModal({ open, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    emailRef.current?.focus();
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

  const isSignup = mode === 'signup';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const mail = email.trim();
    if (!mail.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setSubmitting(true);
    try {
      if (SUPABASE_READY) {
        if (isSignup) {
          // Server-side signup: creates an auto-confirmed user (no confirmation
          // email → no "email rate limit") and sets the session cookie.
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: mail, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error || 'Could not create account.');
            setSubmitting(false);
            return;
          }
        } else {
          const sb = createSupabaseBrowserClient();
          const { error: authError } = await sb.auth.signInWithPassword({ email: mail, password });
          if (authError) {
            setError(authError.message);
            setSubmitting(false);
            return;
          }
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setSubmitting(false);
      onSuccess(mail);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div
      className="renewal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="um-login-title"
      onClick={onClose}
    >
      <div className="um-card" onClick={(e) => e.stopPropagation()}>
        <h3 id="um-login-title">{isSignup ? 'Create your account' : 'Log in to unlock'}</h3>
        <p className="um-sub">
          {isSignup
            ? 'One step away from your full report.'
            : 'Log in to unlock the full report for this match.'}
        </p>

        <form className="um-form" onSubmit={submit}>
          <label>
            Email
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="um-error">{error}</p>}

          <button type="submit" className="um-submit" disabled={submitting}>
            {submitting ? (
              <><span className="btn-spinner" aria-hidden /> Please wait…</>
            ) : isSignup ? (
              'Create account'
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="um-switch">
          {isSignup ? (
            <>Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); }}>Log in</button>
            </>
          ) : (
            <>No account yet?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(null); }}>Sign up</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
