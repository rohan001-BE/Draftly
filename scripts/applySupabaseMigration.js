const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const { Client } = require('pg');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const migrationPath = path.resolve(__dirname, '../supabase/migrations/001_init.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

function resolveHost() {
  if (process.env.SUPABASE_DB_HOST) {
    return process.env.SUPABASE_DB_HOST;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const hostname = supabaseUrl.replace(/^https?:\/\//, '').split('/')[0];
  return `db.${hostname}`;
}

async function resolveDatabaseHost(hostname) {
  const candidates = [hostname];

  try {
    const ipv6Records = await dns.resolve6(hostname);
    if (ipv6Records.length > 0) {
      candidates.push(ipv6Records[0]);
    }
  } catch {
    // Ignore DNS failures; hostname fallback remains available.
  }

  try {
    const ipv4Records = await dns.resolve4(hostname);
    if (ipv4Records.length > 0) {
      candidates.push(ipv4Records[0]);
    }
  } catch {
    // Ignore DNS failures; hostname fallback remains available.
  }

  return [...new Set(candidates)];
}

async function connectAndMigrate(config) {
  const client = new Client({
    ...config,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    return true;
  } finally {
    await client.end();
  }
}

async function run() {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (connectionString) {
    try {
      await connectAndMigrate({ connectionString });
      console.log('Migration applied successfully using SUPABASE_DB_URL.');
      return;
    } catch (error) {
      console.error('Migration error (connection string):', error.message || error);
      process.exit(1);
    }
  }

  const hostname = resolveHost();
  const port = Number(process.env.SUPABASE_DB_PORT || 5432);
  const database = process.env.SUPABASE_DB_NAME || 'postgres';
  const user = process.env.SUPABASE_DB_USER || 'postgres';
  const password = process.env.SUPABASE_DATABASE_PASSWORD;

  if (!hostname) {
    console.error('Missing database host. Set SUPABASE_DB_HOST or NEXT_PUBLIC_SUPABASE_URL.');
    process.exit(1);
  }

  if (!password) {
    console.error('Missing SUPABASE_DATABASE_PASSWORD in .env.local');
    process.exit(1);
  }

  const hosts = await resolveDatabaseHost(hostname);
  let lastError = null;

  for (const host of hosts) {
    const family = host.includes(':') ? 6 : undefined;

    try {
      console.log(`Connecting to host=${host} port=${port} database=${database}`);
      await connectAndMigrate({
        host,
        port,
        database,
        user,
        password,
        family,
      });
      console.log('Migration applied successfully.');
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Connection failed for ${host}:`, error.message || error);
    }
  }

  console.error('Migration error:', lastError?.message || lastError || 'Unable to connect');
  process.exit(1);
}

run();
