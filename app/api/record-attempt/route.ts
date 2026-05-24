import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { PLANS, type PlanId } from '@/lib/plans';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { sendTelegramAlert } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Records a payment ATTEMPT while real charging is disabled. Lets us measure
// purchase intent without a live payment provider.
//
// SECURITY: this endpoint must NEVER receive or store card data (PAN, CVC,
// expiry). It only accepts the chosen plan and a delivery email.
interface Body {
  plan?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // tolerate empty/invalid body
  }

  // Resolve the plan from either catalog: the /pricing PLANS ids, or the
  // in-scan PaymentModal options ('single' / 'monthly'). Amounts are decided
  // server-side — never trust a client-sent amount.
  const SCAN_PLANS: Record<string, { id: string; name: string; amount: number }> = {
    single: { id: 'single', name: 'Single report', amount: 1499 },
    monthly: { id: 'monthly', name: 'Monthly', amount: 2999 },
  };
  const rawPlan = String(body.plan || '').trim();
  const known = PLANS[rawPlan as PlanId];
  const plan = known
    ? { id: known.id, name: known.name, amount: known.amount }
    : SCAN_PLANS[rawPlan];
  if (!plan) {
    return NextResponse.json({ error: `Unknown plan "${rawPlan}"` }, { status: 400 });
  }

  // Delivery email only — never card data.
  let email = body.email && body.email.includes('@') ? body.email.trim() : undefined;

  // Attach the logged-in user if there is one (prefer their verified email).
  let userId: string | undefined;
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        userId = data.user.id;
        if (data.user.email) email = data.user.email;
      }
    } catch {
      // not logged in — anonymous attempt is fine
    }
  }

  if (isSupabaseAdminConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.from('orders').insert({
        user_id: userId ?? null,
        email: email ?? null,
        plan_id: plan.id,
        plan_name: plan.name,
        amount_cents: plan.amount,
        status: 'attempted',
        stripe_session_id: `mock-${randomUUID()}`,
      });
      if (error) console.error('[record-attempt] insert error:', error.message);
    } catch (e) {
      console.error('[record-attempt] insert failed:', e);
    }
  }

  await sendTelegramAlert(
    `🟡 <b>Payment attempt</b> (mock — charging disabled)\n` +
      `Plan: ${plan.name}\n` +
      `Amount: $${(plan.amount / 100).toFixed(2)}\n` +
      `Email: ${email || '—'}`,
  );

  // Always report success to the client — the UI shows the "unavailable" notice
  // regardless; recording is best-effort and must not block the flow.
  return NextResponse.json({ ok: true });
}
