import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PLANS, type PlanId } from '@/lib/plans';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  plan?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          'STRIPE_SECRET_KEY is not configured on the server. ' +
          'Add it in Vercel → Project Settings → Environment Variables, then redeploy.',
      },
      { status: 500 },
    );
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // tolerate empty/invalid body
  }

  const planId = String(body.plan || '').trim() as PlanId;
  let email = body.email ? String(body.email).trim() : undefined;
  const plan = PLANS[planId];
  if (!plan) {
    return NextResponse.json(
      { error: `Unknown plan "${planId}". Valid: ${Object.keys(PLANS).join(', ')}.` },
      { status: 400 },
    );
  }

  const proto =
    (req.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const origin = `${proto}://${host}`;

  // Link the checkout to the logged-in user (if any) so the webhook can match
  // the payment back to an account. Prefer the authenticated email.
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
      // not logged in / Supabase unreachable — continue as guest checkout
    }
  }

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: plan.amount,
            product_data: {
              name: `CheatLens — ${plan.name}`,
              description: plan.description,
            },
          },
        },
      ],
      customer_email: email && email.includes('@') ? email : undefined,
      client_reference_id: userId,
      success_url: `${origin}/start?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        user_id: userId ?? '',
      },
    });

    // Record a pending order so the dashboard shows intent even before payment.
    // The Stripe webhook flips it to 'paid'. Service-role write bypasses RLS.
    if (isSupabaseAdminConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin.from('orders').insert({
          user_id: userId ?? null,
          email: email ?? null,
          plan_id: plan.id,
          plan_name: plan.name,
          amount_cents: plan.amount,
          status: 'pending',
          stripe_session_id: session.id,
        });
        if (error) console.error('[cheatlens] pending order insert error:', error.message);
      } catch (e) {
        console.error('[cheatlens] pending order insert failed:', e);
      }
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cheatlens] stripe error:', msg);
    return NextResponse.json(
      { error: 'Could not create checkout session. Check function logs.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 });
}
