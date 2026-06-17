import { Pool } from "pg";

let pool: Pool | null = null;

export function getPostgresPool(connectionString = process.env.DATABASE_URL): Pool {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for PostgreSQL persistence.");
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
}
