
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { grandOralO4Mini, grandOralO4 } from './agents';
import {initVector} from './helpers/vectorManagement';
import { PgVector } from '@mastra/pg';
import { verifyToken } from './helpers/jwtManagement';

const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);
export const mastra = new Mastra({
  agents: { grandOralO4Mini, grandOralO4 },
  vectors: { pgVector },
  logger: createLogger({
    name: 'Mastra',
    level: 'debug',
  }),
  serverMiddleware: [
    {
      handler: async (c, next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response('Unauthorized', { status: 401 });
        }
        console.log(authHeader);
        if(verifyToken(authHeader)) await next();
        else return new Response('Unauthorized', { status: 401 });
      },
      path: '/api/*',
    },
  ]
});

if(process.env.INIT_VECTOR) await initVector();