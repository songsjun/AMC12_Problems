import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const migrationsDirectory = fileURLToPath(new URL('../migrations/', import.meta.url));

export async function runMigrations(pool) {
  const client = await pool.connect();
  try {
    // This lock must precede even CREATE SCHEMA IF NOT EXISTS. PostgreSQL's
    // conditional DDL is not a concurrency primitive: simultaneous empty-db
    // bootstraps can otherwise race on pg_namespace's unique index.
    await client.query("SELECT pg_advisory_lock(hashtext('amc_practice_migrations'))");
    // Bootstrap only the migration ledger. Once it exists, every numbered SQL
    // migration (including 001) is immutable and is skipped after recording.
    await client.query('CREATE SCHEMA IF NOT EXISTS amc_practice');
    await client.query(`CREATE TABLE IF NOT EXISTS amc_practice.schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const names = (await readdir(migrationsDirectory)).filter((name) => name.endsWith('.sql')).sort();
    for (const name of names) {
      try {
        await client.query('BEGIN');
        const applied = await client.query('SELECT 1 FROM amc_practice.schema_migrations WHERE filename = $1', [name]);
        if (applied.rowCount) {
          await client.query('COMMIT');
          continue;
        }
        const sql = await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
        await client.query(sql);
        await client.query('INSERT INTO amc_practice.schema_migrations(filename) VALUES ($1)', [name]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('amc_practice_migrations'))").catch(() => {});
    client.release();
  }
}
