// One-off admin script: applies a SQL migration to Supabase Postgres over a
// direct connection, then verifies the schema. Reads SUPABASE_DB_URL from
// .env.local. Never logs the connection string / password.
//
//   node scripts/run-migration.mjs [path/to/file.sql]

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import dns from 'node:dns';
import pg from 'pg';

// The direct host resolves to IPv6 too, which is intermittently unreachable
// from here — prefer IPv4 to stabilize the connection.
dns.setDefaultResultOrder('ipv4first');

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvLocal() {
  const text = readFileSync(join(root, '.env.local'), 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#')) out[m[1]] = m[2];
  }
  return out;
}

const env = loadEnvLocal();
const conn = env.SUPABASE_DB_URL;
if (!conn) {
  console.error('SUPABASE_DB_URL missing in .env.local');
  process.exit(1);
}

const sqlPath = process.argv[2] || 'supabase/migrations/0001_init.sql';
const sql = readFileSync(join(root, sqlPath), 'utf8');

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('connected ✓  applying', sqlPath, '…');
  await client.query(sql);
  console.log('migration applied ✓\n');

  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' order by table_name`,
  );
  console.log('public tables:', tables.rows.map((r) => r.table_name).join(', ') || '(none)');

  const policies = await client.query(
    `select tablename, policyname from pg_policies where schemaname='public' order by tablename`,
  );
  console.log('RLS policies:', policies.rows.map((r) => `${r.tablename}.${r.policyname}`).join(', ') || '(none)');

  const trig = await client.query(
    `select tgname from pg_trigger where tgname='on_auth_user_created'`,
  );
  console.log('signup trigger present:', trig.rowCount > 0 ? 'yes ✓' : 'NO');

  const counts = await client.query(
    `select
       (select count(*) from public.profiles) as profiles,
       (select count(*) from public.orders) as orders`,
  );
  console.log('row counts:', JSON.stringify(counts.rows[0]));
} catch (err) {
  console.error('FAILED:', err.code || '', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
