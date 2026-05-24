// Read-only snapshot of signups (profiles) + payment attempts (orders).
//   node scripts/show-db.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import dns from 'node:dns';
import pg from 'pg';

dns.setDefaultResultOrder('ipv4first');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const profiles = await client.query(
  'select email, created_at from public.profiles order by created_at desc limit 25',
);
console.log(`\n=== SIGNUPS (profiles): ${profiles.rowCount} ===`);
for (const r of profiles.rows) console.log(`  ${r.created_at.toISOString()}  ${r.email || '—'}`);

const byStatus = await client.query(
  'select status, count(*)::int n from public.orders group by status order by status',
);
console.log('\n=== PAYMENT ATTEMPTS (orders) by status ===');
for (const r of byStatus.rows) console.log(`  ${r.status.padEnd(10)} ${r.n}`);

const orders = await client.query(
  'select created_at, status, plan_id, amount_cents, email from public.orders order by created_at desc limit 25',
);
console.log(`\n=== orders detail: ${orders.rowCount} ===`);
for (const r of orders.rows)
  console.log(`  ${r.created_at.toISOString()}  ${r.status.padEnd(10)} ${r.plan_id.padEnd(16)} $${(r.amount_cents / 100).toFixed(2)}  ${r.email || '—'}`);

await client.end();
