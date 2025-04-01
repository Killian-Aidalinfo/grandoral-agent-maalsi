import { Agent } from "@mastra/core/agent";
import { PGVECTOR_PROMPT } from "@mastra/rag";
import {
  vectorQueryTool,
  vectorQueryToolScaleway,
} from "../helpers/vectorManagement";
import { Memory } from "@mastra/memory";
import {
  dynamicOpenAI,
  dynamicGoogle,
  dynamicScaleway,
} from "../helpers/modelHelper";
import { PostgresStore } from "@mastra/pg";

const prompt = `
Process queries using the provided context. Structure responses to be concise and relevant.
${PGVECTOR_PROMPT}
`;
const memory = new Memory({
  storage: new PostgresStore({
    host: "db",
    port: 5432,
    user: "postgres",
    database: "cesi",
    password: "password",
  }),
});

export const grandOralO4Mini = new Agent({
  name: "grand-oral-o4-mini",
  instructions: prompt,
  model: dynamicOpenAI("gpt-4o-mini"),
  tools: { vectorQueryTool },
  memory: memory,
});

export const grandOralO4 = new Agent({
  name: "grand-oral-o4",
  instructions: prompt,
  model: dynamicOpenAI("gpt-4o"),
  tools: { vectorQueryTool },
  memory: memory,
});

export const googleGeminiAgent = new Agent({
  name: "google-gemini",
  instructions: prompt,
  model: dynamicGoogle("gemini-2.5-pro-exp-03-25"),
  tools: { vectorQueryTool },
  memory: memory,
});

export const deepseekScw = new Agent({
  name: "deepseek-scw",
  instructions: prompt,
  model: dynamicScaleway("deepseek-r1-distill-llama-70b"),
  tools: { vectorQueryToolScaleway },
  memory: memory,
});
