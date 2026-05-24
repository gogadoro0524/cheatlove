import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { signInAction } from '@/lib/auth-actions';

export const metadata: Metadata = {
  title: 'Log in — CheatLens',
  robots: { index: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { check_email?: string };
}) {
  const notice = searchParams.check_email
    ? 'Account created — check your email to confirm, then log in.'
    : undefined;
  return <AuthForm mode="login" action={signInAction} notice={notice} />;
}
