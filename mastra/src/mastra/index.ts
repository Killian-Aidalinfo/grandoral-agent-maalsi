import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { grandOralO4, grandOralO4Mini, createAgentWithUserApiKey } from "./agents";
import { initVector } from "./helpers/vectorManagement";
import { PgVector } from "@mastra/pg";
import { verifyToken, userInfoToken } from "./helpers/jwtManagement";
import {
  addApiKeyHandler,
  getApiKeysHandler,
  updateApiKeyHandler,
  deleteApiKeyHandler,
} from "./api/tokenManagement";
import { store } from "./helpers/store";
import { getUserApiKey } from "./helpers/dbTool";
const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);
export const mastra = new Mastra({
  agents: { grandOralO4Mini, grandOralO4 },
  vectors: { pgVector },
  logger: createLogger({
    name: "Mastra",
    level: "debug",
  }),
  serverMiddleware: [
    {
      handler: async (c, next) => {
        const authHeader = c.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        if (verifyToken(authHeader)) {
          const { userId } = userInfoToken(authHeader);
          store.ensureContext();
          store.set("userId", userId);

          // Récupérer l'API key de l'utilisateur depuis la base de données
          const userApiKey = await getUserApiKey(userId, "openai");
          if (userApiKey) {
            // Définir l'API key dans le store pour être utilisée par les agents
            store.set("apiKey", userApiKey);
            console.log("Using custom API key for user:", userId);
          }

          // Si c'est une requête à un agent spécifique, on stocke la clé API pour qu'elle soit
          // utilisée par createAgentWithUserApiKey() à l'intérieur de l'agent
          const url = new URL(c.req.url);
          if (url.pathname.includes('/agents/grandOralO4Mini')) {
            console.log("Detected request to grandOralO4Mini, API key is set in store");
            // Pas besoin de remplacer l'agent directement ici
            // La clé API est déjà dans le store et sera utilisée par l'agent
            // via la fonction getApiKey lorsque l'agent fera appel à OpenAI
          }

          await next();
        } else return new Response("Unauthorized", { status: 401 });
      },
      path: "/api/*",
    },
    {
      handler: addApiKeyHandler,
      path: "/api/keys/add",
    },
    {
      handler: getApiKeysHandler,
      path: "/api/keys/list",
    },
    {
      handler: updateApiKeyHandler,
      path: "/api/keys/update",
    },
    {
      handler: deleteApiKeyHandler,
      path: "/api/keys/delete",
    },
  ],
});

if (process.env.INIT_VECTOR) await initVector();
