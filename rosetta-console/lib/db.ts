import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false } // uncomment if needed for cloud DBs
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

// Helper: try primary query; on error, fallback query
export async function queryWithFallback<T = any>(primary: string, fallback: string, params?: any[]) {
  try {
    return await query<T>(primary, params);
  } catch {
    return await query<T>(fallback, params);
  }
}
