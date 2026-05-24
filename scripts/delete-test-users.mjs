// Dev utility: lists and deletes auth users matching test-email patterns.
// Prints what it finds (handy as a check) before deleting. Reads keys from
// .env.local. Deleting an auth user cascades to its profile/orders.
//   node scripts/delete-test-users.mjs
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
const SEC = env.SUPABASE_SERVICE_ROLE_KEY;
const hdr = { apikey: SEC, Authorization: `Bearer ${SEC}`, 'Content-Type': 'application/json' };
const TEST = /uitest|cheatlens-qa|cheatlens-test|login-test|attempt-test/i;

const list = await (await fetch(`${URL}/auth/v1/admin/users?per_page=200`, { headers: hdr })).json();
const users = list.users || [];
const targets = users.filter((u) => TEST.test(u.email || ''));
console.log(`found ${targets.length} test user(s):`, targets.map((u) => u.email).join(', ') || '(none)');

for (const u of targets) {
  const r = await fetch(`${URL}/auth/v1/admin/users/${u.id}`, { method: 'DELETE', headers: hdr });
  console.log(`  deleted ${u.email}: ${r.status}`);
}
console.log('done. total users now:', (users.length - targets.length));
