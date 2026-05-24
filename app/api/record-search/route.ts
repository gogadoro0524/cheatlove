import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { sendTelegramAlert } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Records a "Run search" event from the start flow so we can measure search
// intent and volume.
//
// SECURITY: this endpoint must NEVER receive or store the uploaded photos.
// It only accepts the typed search criteria + a photo count (a number, not
// the images themselves).
interface Body {
  gender?: string;
  name?: string;
  age?: string | number;
  city?: string;
  photoCount?: number;
  paid?: boolean;
}

export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // tolerate empty/invalid body
  }

  const gender = body.gender === 'woman' ? 'woman' : body.gender === 'man' ? 'man' : null;
  const targetName = typeof body.name === 'string' ? body.name.trim().slice(0, 120) || null : null;
  const ageNum = Number.parseInt(String(body.age ?? ''), 10);
  const targetAge = Number.isFinite(ageNum) ? ageNum : null;
  const targetCity = typeof body.city === 'string' ? body.city.trim().slice(0, 200) || null : null;
  const photoCount = Number.isFinite(Number(body.photoCount))
    ? Math.max(0, Math.min(20, Math.trunc(Number(body.photoCount))))
    : 0;
  const paid = body.paid === true;

  // Attach the logged-in user if there is one (prefer their verified email).
  let userId: string | undefined;
  let email: string | undefined;
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        userId = data.user.id;
        if (data.user.email) email = data.user.email;
      }
    } catch {
      // not logged in — anonymous search is fine
    }
  }

  if (isSupabaseAdminConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      const { error } = await admin.from('searches').insert({
        user_id: userId ?? null,
        email: email ?? null,
        gender,
        target_name: targetName,
        target_age: targetAge,
        target_city: targetCity,
        photo_count: photoCount,
        paid,
      });
      if (error) console.error('[record-search] insert error:', error.message);
    } catch (e) {
      console.error('[record-search] insert failed:', e);
    }
  }

  await sendTelegramAlert(
    `🔍 <b>Run search</b>\n` +
      `Name: ${targetName || '—'}\n` +
      `Age: ${targetAge ?? '—'}\n` +
      `City: ${targetCity || '—'}\n` +
      `Gender: ${gender || '—'}\n` +
      `Photos: ${photoCount}\n` +
      `Email: ${email || '—'}`,
  );

  // Always report success — recording is best-effort and must not block the scan.
  return NextResponse.json({ ok: true });
}
