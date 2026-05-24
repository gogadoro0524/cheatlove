import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';
import { signUpAction } from '@/lib/auth-actions';

export const metadata: Metadata = {
  title: 'Create account — CheatLens',
  robots: { index: false },
};

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUpAction} />;
}
