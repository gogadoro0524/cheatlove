import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PLANS, type PlanId } from '@/lib/plans';

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
  const email = body.email ? String(body.email).trim() : undefined;
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
              name: `CheatLove — ${plan.name}`,
              description: plan.description,
            },
          },
        },
      ],
      customer_email: email && email.includes('@') ? email : undefined,
      success_url: `${origin}/start?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cheatlove] stripe error:', msg);
    return NextResponse.json(
      { error: 'Could not create checkout session. Check function logs.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 });
}
