import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { PGVECTOR_PROMPT } from "@mastra/rag";
import { vectorQueryTool } from "./exampledoc";

import { Memory } from "@mastra/memory";
 
const memory = new Memory();
export const weatherAgent = new Agent({
  name: 'RAG',
  instructions: `
Process queries using the provided context. Structure responses to be concise and relevant.
${PGVECTOR_PROMPT}
`,
  model: openai('gpt-4o-mini'),
  tools: { vectorQueryTool },
  memory: memory,
});
