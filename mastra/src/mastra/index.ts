import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { grandOralO4, grandOralO4Mini } from "./agents";
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

          const userApiKey = await getUserApiKey(userId, "openai");
          if (userApiKey) {
            store.set("apiKey", userApiKey);
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
