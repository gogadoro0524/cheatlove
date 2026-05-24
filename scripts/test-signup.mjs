// E2E backend check: signs up a throwaway user via Supabase Auth, confirms the
// profiles trigger fired, then deletes the test user (FK cascade removes the
// profile). Reads keys from .env.local. Never logs secrets.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const PUB = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SEC = env.SUPABASE_SERVICE_ROLE_KEY;
const email = `cheatlens-qa+${Date.now()}@gmail.com`;
const password = `Tt!${Math.random().toString(36).slice(2)}9`;

const j = (r) => r.json().catch(() => ({}));

// 1) create the user via the admin API (no email sent — proves the same
//    auth.users insert + trigger path the real signup uses, without the
//    confirmation-email rate limit).
const su = await fetch(`${URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { apikey: SEC, Authorization: `Bearer ${SEC}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const suBody = await j(su);
const userId = suBody.id || suBody.user?.id;
console.log('create user:', su.status, 'userId:', userId || '(none)', '| email:', email);

// 2) did the trigger create a profile row?
const prof = await fetch(
  `${URL}/rest/v1/profiles?select=id,email,created_at&id=eq.${userId}`,
  { headers: { apikey: SEC, Authorization: `Bearer ${SEC}` } },
);
console.log('profiles row after signup:', JSON.stringify(await j(prof)));

// 3) cleanup — delete the test auth user (cascades to profiles)
if (userId) {
  const del = await fetch(`${URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { apikey: SEC, Authorization: `Bearer ${SEC}` },
  });
  console.log('cleanup delete user:', del.status);
}

// 4) confirm clean
const after = await fetch(`${URL}/rest/v1/profiles?select=id`, {
  headers: { apikey: SEC, Authorization: `Bearer ${SEC}` },
});
console.log('profiles total rows now:', (await j(after)).length);
