'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import type { AuthState } from '@/lib/auth-actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ce-next" disabled={pending}>
      {pending ? 'Please wait…' : label}
    </button>
  );
}

interface Props {
  mode: 'signup' | 'login';
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  notice?: string;
}

export function AuthForm({ mode, action, notice }: Props) {
  const [state, formAction] = useFormState(action, {});
  const isSignup = mode === 'signup';

  return (
    <main className="auth-wrap">
      <Link href="/" className="auth-logo" aria-label="CheatLens home">
        <BrandMark size={28} />
        <span>CHEATLENS</span>
      </Link>

      <h1 className="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="auth-sub">
        {isSignup ? 'One step away from unlocking your report.' : 'Log in to view your report.'}
      </p>

      {notice && <p className="auth-notice">{notice}</p>}

      <form action={formAction} className="auth-form">
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="••••••••"
          />
        </label>

        {state?.error && <p className="auth-error">{state.error}</p>}

        <SubmitButton label={isSignup ? 'Create account & continue' : 'Log in'} />
      </form>

      <p className="auth-switch">
        {isSignup ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>No account yet? <Link href="/signup">Create one</Link></>
        )}
      </p>
    </main>
  );
}
