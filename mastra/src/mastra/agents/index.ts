import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { PGVECTOR_PROMPT } from "@mastra/rag";
import { vectorQueryTool } from "../helpers/vectorManagement";
import { Memory } from "@mastra/memory";

const prompt = `
Process queries using the provided context. Structure responses to be concise and relevant.
${PGVECTOR_PROMPT}
`
const

memory = new Memory();

export const grandOralO4Mini = new Agent({
  name: 'grand-oral-o4-mini',
  instructions: prompt,
  model: openai('gpt-4o-mini'),
  tools: { vectorQueryTool },
  memory: memory,
});

export const grandOralO4 = new Agent({
  name: 'grand-oral-o4',
  instructions: prompt,
  model: openai('gpt-4o'),
  tools: { vectorQueryTool },
  memory: memory,
});
