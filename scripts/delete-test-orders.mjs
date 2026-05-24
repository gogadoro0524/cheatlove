// Dev utility: remove obvious test rows from orders (does not touch real data).
//   node scripts/delete-test-orders.mjs
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
const res = await client.query(
  `delete from public.orders
   where email in ('attempt-test@gmail.com') or email like 'cheatlens-qa+%@gmail.com'`,
);
console.log('deleted test order rows:', res.rowCount);
const left = await client.query('select count(*)::int n from public.orders');
console.log('orders remaining:', left.rows[0].n);
await client.end();
