import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { sendTelegramAlert } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe sends events here. Register this URL in the Stripe dashboard
// (Developers → Webhooks) for the `checkout.session.completed` event and
// copy the signing secret into STRIPE_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return NextResponse.json(
      { error: 'STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not configured' },
      { status: 500 },
    );
  }

  const stripe = new Stripe(key);
  const sig = req.headers.get('stripe-signature') || '';
  // Raw body is required for signature verification.
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[stripe-webhook] signature verification failed:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email || '';
    const planName = session.metadata?.plan_name || session.metadata?.plan_id || 'Unknown plan';
    const amount = (session.amount_total ?? 0) / 100;

    // Mark the matching order paid (best-effort; never block the 200 response).
    if (isSupabaseAdminConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            ...(email ? { email } : {}),
          })
          .eq('stripe_session_id', session.id);
        if (error) console.error('[stripe-webhook] orders update error:', error.message);
      } catch (err) {
        console.error('[stripe-webhook] supabase update failed:', err);
      }
    }

    await sendTelegramAlert(
      `💰 <b>New payment</b>\n` +
        `Plan: ${planName}\n` +
        `Amount: $${amount.toFixed(2)}\n` +
        `Email: ${email || '—'}`,
    );
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 });
}
