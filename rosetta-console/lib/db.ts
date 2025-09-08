import { Pool, PoolClient } from "pg";
import { DatabaseError, TransactionClient } from "@/types/database";

// Enhanced connection pool with proper sizing (v4 spec lines 748-798)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost/elire_ops_1",
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // ssl: { rejectUnauthorized: false } // uncomment if needed for cloud DBs
});

// Basic query function with enhanced error handling
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } catch (error: any) {
    throw new DatabaseError(
      error.message || 'Database query failed',
      error.code,
      error.detail
    );
  } finally {
    client.release();
  }
}

// Transaction support for multi-table operations (v4 spec requirement)
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw new DatabaseError(
      error.message || 'Transaction failed',
      error.code,
      error.detail
    );
  } finally {
    client.release();
  }
}

// Retry logic with exponential backoff (v4 spec lines 763-798)
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error.code === '23503' || error.code === '23502') {
        throw new DatabaseError(
          'Validation error',
          error.code,
          error.detail
        );
      }
      
      // Exponential backoff for connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Helper: try primary query; on error, fallback query
export async function queryWithFallback<T = any>(
  primary: string, 
  fallback: string, 
  params?: any[]
): Promise<T[]> {
  try {
    return await query<T>(primary, params);
  } catch {
    return await query<T>(fallback, params);
  }
}

// Validate foreign key exists
export async function validateForeignKey(
  table: string,
  column: string,
  value: any,
  client?: PoolClient
): Promise<boolean> {
  const queryFn = client ? client.query.bind(client) : query;
  const result = await queryFn(
    `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`,
    [value]
  );
  return result.length > 0 || (result as any).rowCount > 0;
}

// Get a client for manual transaction control
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
}
