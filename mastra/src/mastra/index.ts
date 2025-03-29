
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { grandOralO4Mini, grandOralO4 } from './agents';
import {initVector} from './helpers/vectorManagement';
import { PgVector } from '@mastra/pg';


const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);
export const mastra = new Mastra({
  agents: { grandOralO4Mini, grandOralO4 },
  vectors: { pgVector },
  logger: createLogger({
    name: 'Mastra',
    level: 'debug',
  }),
});

if(process.env.INIT_VECTOR) await initVector();