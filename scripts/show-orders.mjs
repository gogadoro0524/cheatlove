// Quick read-only view of recent orders. Reads SUPABASE_DB_URL from .env.local.
//   node scripts/show-orders.mjs
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

const summary = await client.query(
  `select status, count(*)::int as n, sum(amount_cents)::int as cents
   from public.orders group by status order by status`,
);
console.log('— orders by status —');
for (const r of summary.rows) console.log(`  ${r.status.padEnd(10)} ${r.n}  ($${((r.cents || 0) / 100).toFixed(2)})`);

const recent = await client.query(
  `select created_at, status, plan_id, email, coalesce(user_id::text,'(anon)') as user_id
   from public.orders order by created_at desc limit 15`,
);
console.log('\n— 15 most recent —');
for (const r of recent.rows) {
  console.log(`  ${r.created_at.toISOString()}  ${r.status.padEnd(10)} ${r.plan_id.padEnd(16)} ${r.email || '—'}`);
}
console.log(`\ntotal: ${recent.rowCount === 0 ? 0 : (await client.query('select count(*)::int n from public.orders')).rows[0].n}`);

await client.end();
