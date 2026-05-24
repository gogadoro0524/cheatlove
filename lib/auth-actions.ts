'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { sendTelegramAlert } from '@/lib/telegram';

export interface AuthState {
  error?: string;
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: 'Accounts are not configured yet. Add the Supabase keys to enable signup.' };
  }
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email.includes('@')) return { error: 'Enter a valid email address.' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

  // We want instant signup with NO email-confirmation step (fast funnel).
  // The project has "Confirm email" ON, so the normal client signUp would leave
  // the user unconfirmed and unable to log in. Instead we create the user
  // server-side via the admin API with email_confirm:true (auto-confirmed),
  // then immediately sign them in to set the session cookie.
  if (!isSupabaseAdminConfigured()) {
    return { error: 'Server is missing the Supabase service-role key.' };
  }

  const admin = createSupabaseAdminClient();
  const { error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr) {
    // Already registered → guide them to log in (don't silently overwrite).
    if (/registered|already|exists/i.test(createErr.message)) {
      return { error: 'This email is already registered — please log in instead.' };
    }
    return { error: createErr.message };
  }

  await sendTelegramAlert(`🆕 <b>New signup</b>\nEmail: ${email}`);

  // Sign in to set the auth cookie, then continue to checkout.
  const supabase = createSupabaseServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) return { error: signInErr.message };

  redirect('/pricing');
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: 'Accounts are not configured yet. Add the Supabase keys to enable login.' };
  }
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/pricing');
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect('/');
}
