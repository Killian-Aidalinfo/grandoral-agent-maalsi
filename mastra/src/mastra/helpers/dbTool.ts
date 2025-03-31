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

// Fonction pour récupérer la clé API Google d'un utilisateur
export const getUserGoogleApiKey = async (userId: string): Promise<string | null> => {
  const result = await pool.query(
    `SELECT key FROM api_key WHERE user_id = $1 AND model = 'google' LIMIT 1`,
    [userId]
  );

  return result.rows[0]?.key || null;
};

export default pool;
