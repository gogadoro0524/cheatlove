// Proves the exact SDK path signUpAction uses:
//   admin.auth.admin.createUser({ email_confirm: true })  → then
//   client.auth.signInWithPassword()  → must return a session.
// Then confirms the profiles row and cleans up. Never logs secrets/tokens.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = `cheatlens-uitest-${Date.now()}@gmail.com`;
const password = 'Testpass123!';

// 1) what signUpAction does — create an auto-confirmed user
const { data: created, error: cErr } = await admin.auth.admin.createUser({
  email, password, email_confirm: true,
});
console.log('createUser:', cErr ? `ERROR ${cErr.message}` : `ok (id ${created.user.id})`);

// 2) immediately sign in (sets the session in the real action via cookies)
const { data: sess, error: sErr } = await anon.auth.signInWithPassword({ email, password });
console.log('signInWithPassword:', sErr ? `ERROR ${sErr.message}` : `session=${sess.session ? 'YES ✓' : 'no'}`);

// 3) trigger created the profile?
const { data: prof } = await admin.from('profiles').select('email').eq('email', email);
console.log('profiles row:', JSON.stringify(prof));

// 4) cleanup
if (created?.user?.id) {
  const { error } = await admin.auth.admin.deleteUser(created.user.id);
  console.log('cleanup deleteUser:', error ? `ERROR ${error.message}` : 'ok');
}
