// mastra/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
});

export const getUserApiKey = async (userId: string, modelName: string): Promise<string | null> => {
  const result = await pool.query(
    `SELECT key FROM api_key WHERE user_id = $1 AND model = $2 LIMIT 1`,
    [userId, modelName]
  );

  return result.rows[0]?.key || null;
};

export const getUserThreads = async (userId: string) => {
  const result = await pool.query(
    `SELECT * FROM public.mastra_threads 
     WHERE "resourceId" = $1
     ORDER BY id ASC`,
    [userId]
  );
  return result.rows;
};

export const getThreadMessages = async (threadId: string) => {
  const result = await pool.query(
    `SELECT * FROM public.mastra_messages 
     WHERE "thread_id" = $1
     ORDER BY id ASC`,
    [threadId]
  );
  return result.rows;
};

export const aclThreadUser = async (threadId: string, userId: string) => {
  const result = await pool.query(
    `SELECT * FROM public.mastra_threads
     WHERE id = $1
     AND "resourceId" = $2`,
    [threadId, userId]
  );
  if (result.rows.length === 0) {
    return false;
  }else {
  return true;
  }
};

export default pool;
