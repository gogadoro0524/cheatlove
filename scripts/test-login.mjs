// Verifies the real login path: checks the project's email-confirmation
// setting, then tries password login for a CONFIRMED and an UNCONFIRMED user.
// Cleans up both. Reads keys from .env.local. Never logs secrets/tokens.
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
const j = (r) => r.json().catch(() => ({}));
const adminHdr = { apikey: SEC, Authorization: `Bearer ${SEC}`, 'Content-Type': 'application/json' };

// 0) project auth settings — is email auto-confirm on?
const settings = await j(await fetch(`${URL}/auth/v1/settings`, { headers: { apikey: PUB } }));
console.log('mailer_autoconfirm:', settings.mailer_autoconfirm, '| disable_signup:', settings.disable_signup);
console.log('  → email confirmation required for self-serve signup:', settings.mailer_autoconfirm === false ? 'YES' : 'no');

async function makeUser(confirmed) {
  const email = `login-test-${confirmed ? 'ok' : 'unconf'}-${Date.now()}@gmail.com`;
  const password = `Tt!${Math.random().toString(36).slice(2)}9`;
  const r = await j(await fetch(`${URL}/auth/v1/admin/users`, {
    method: 'POST', headers: adminHdr,
    body: JSON.stringify({ email, password, email_confirm: confirmed }),
  }));
  return { id: r.id, email, password };
}
async function login(email, password) {
  const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: PUB, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const b = await j(res);
  return { status: res.status, ok: Boolean(b.access_token), err: b.error_code || b.error || b.msg };
}
async function del(id) {
  if (id) await fetch(`${URL}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: adminHdr });
}

const confirmed = await makeUser(true);
const unconf = await makeUser(false);

const a = await login(confirmed.email, confirmed.password);
console.log(`\nlogin (confirmed user):   HTTP ${a.status}  session=${a.ok ? 'YES ✓' : 'no'}  ${a.err || ''}`);

const b = await login(unconf.email, unconf.password);
console.log(`login (unconfirmed user): HTTP ${b.status}  session=${b.ok ? 'YES' : 'no'}  ${b.err || ''}`);

await del(confirmed.id);
await del(unconf.id);
console.log('\ncleanup done.');
