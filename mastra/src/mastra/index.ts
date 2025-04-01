import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import {
  grandOralO4,
  grandOralO4Mini,
  googleGeminiAgent,
  deepseekScw,
} from "./agents";
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
import { getUserThreads } from "./helpers/dbTool";

const pgVector = new PgVector(process.env.POSTGRES_CONNECTION_STRING!);

export const mastra = new Mastra({
  agents: { grandOralO4Mini, grandOralO4, googleGeminiAgent, deepseekScw },
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

          await next();
        } else return new Response("Unauthorized", { status: 401 });
      },
      path: "/api/*",
    },
    {
      handler: async (c, next) => {
        const authHeader = c.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        if (verifyToken(authHeader)) {
          const { userId } = userInfoToken(authHeader);
          try {
            const threads = await getUserThreads(userId);
            return new Response(JSON.stringify(threads), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.error("Error fetching threads:", error);
            return new Response("Internal Server Error", { status: 500 });
          }
        }
      },
      path: "/api/threads/user",
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
