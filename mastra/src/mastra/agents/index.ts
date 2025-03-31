import { openai, createOpenAI } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { PGVECTOR_PROMPT } from "@mastra/rag";
import { vectorQueryTool } from "../helpers/vectorManagement";
import { Memory } from "@mastra/memory";
import { store } from "../helpers/store";
import { getUserApiKey } from "../helpers/dbTool";
const prompt = `
Process queries using the provided context. Structure responses to be concise and relevant.
${PGVECTOR_PROMPT}
`
const memory = new Memory();

const openaiCtx = createOpenAI({ apiKey: "custom-api-key" });

// Fonction pour créer un agent configuré dynamiquement
export async function createGrandOralO4MiniAgent() {
  store.ensureContext();
  let id = store.get('userId');
  console.log('id', id);
  let apiKey = await getUserApiKey(id, 'openai') ?? "";
  console.log('apiKey', apiKey);
  const openaiCtx = createOpenAI({ apiKey: apiKey });
  
  // Retourner une nouvelle instance d'agent avec le modèle configuré
  return new Agent({
    name: 'grand-oral-o4-mini',
    instructions: prompt,
    model: openaiCtx('gpt-4o-mini'),
    tools: { vectorQueryTool },
    memory: memory,
  });
}


async function getApiKey() {
  store.ensureContext();
  let id = store.get('userId');
  console.log('id', id);
  let apiKey = await getUserApiKey(id, 'openai') ?? "";
  const openaiCtx = createOpenAI({ apiKey: apiKey });
  return openaiCtx('gpt-4o-mini');
}

// export const grandOralO4Mini = new Agent({
//   name: 'grand-oral-o4-mini',
//   instructions: prompt,
//   model: await getApiKey(),
//   tools: { vectorQueryTool },
//   memory: memory,
// });

export const grandOralO4 = new Agent({
  name: 'grand-oral-o4',
  instructions: prompt,
  model: openai('gpt-4o'),
  tools: { vectorQueryTool },
  memory: memory,
});
