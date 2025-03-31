import { pool } from '../helpers/dbTool';
import { userInfoToken } from '../helpers/jwtManagement';

export const addApiKeyHandler = async (c: any) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) return new Response('Unauthorized', { status: 401 });

        const { userId } = userInfoToken(authHeader);
        const { key, model } = await c.req.json();

        const result = await pool.query(
            `INSERT INTO api_key (key, model, user_id) VALUES ($1, $2, $3) RETURNING *`,
            [key, model, userId]
        );

        return new Response(JSON.stringify(result.rows[0]), { status: 201 });
    } catch (error) {
        console.error('Error adding API key:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
  
export const getApiKeysHandler = async (c: any) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) return new Response('Unauthorized', { status: 401 });

        const { userId } = userInfoToken(authHeader);

        const result = await pool.query(
            `SELECT * FROM api_key WHERE user_id = $1`,
            [userId]
        );

        return new Response(JSON.stringify(result.rows), { status: 200 });
    } catch (error) {
        console.error('Error retrieving API keys:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const updateApiKeyHandler = async (c: any) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) return new Response('Unauthorized', { status: 401 });

        const { userId } = userInfoToken(authHeader);
        const { id, key, model } = await c.req.json();  // On passe aussi l'ID ici

        const result = await pool.query(
            `UPDATE api_key SET key = $1, model = $2, updated_at = now() WHERE id = $3 AND user_id = $4 RETURNING *`,
            [key, model, id, userId]
        );

        if (result.rows.length === 0) {
            return new Response('API key not found', { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), { status: 200 });
    } catch (error) {
        console.error('Error updating API key:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const deleteApiKeyHandler = async (c: any) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) return new Response('Unauthorized', { status: 401 });

        const { userId } = userInfoToken(authHeader);
        const { id } = await c.req.json();  // On passe aussi l'ID ici

        const result = await pool.query(
            `DELETE FROM api_key WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return new Response('API key not found', { status: 404 });
        }

        return new Response('API key deleted successfully', { status: 200 });
    } catch (error) {
        console.error('Error deleting API key:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
