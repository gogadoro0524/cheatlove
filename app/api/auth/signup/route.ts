import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { sendTelegramAlert } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Instant signup with NO confirmation email. The project has "Confirm email"
// ON, so a client-side auth.signUp() would try to send a confirmation mail and
// hit the email rate limit. Instead we create the user server-side as
// already-confirmed (admin API, no email), then sign them in to set the cookie.
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Accounts are not configured on the server.' }, { status: 500 });
  }

  let body: { email?: string; password?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // tolerate invalid body
  }
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (!email.includes('@')) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (createErr) {
    if (/registered|already|exists/i.test(createErr.message)) {
      return NextResponse.json(
        { error: 'This email is already registered — please log in instead.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: createErr.message }, { status: 400 });
  }

  await sendTelegramAlert(`🆕 <b>New signup</b>\nEmail: ${email}`);

  // Sign in (sets the auth cookie on the response).
  const supabase = createSupabaseServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) return NextResponse.json({ error: signInErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
