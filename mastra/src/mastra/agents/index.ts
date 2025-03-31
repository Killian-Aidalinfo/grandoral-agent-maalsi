import { openai, createOpenAI } from "@ai-sdk/openai";
import { google, createGoogle } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { PGVECTOR_PROMPT } from "@mastra/rag";
import { vectorQueryTool } from "../helpers/vectorManagement";
import { Memory } from "@mastra/memory";
import { store } from "../helpers/store";
import { getUserApiKey } from "../helpers/dbTool";

const prompt = `
Process queries using the provided context. Structure responses to be concise and relevant.
${PGVECTOR_PROMPT}
`;
const memory = new Memory();

// Fonction qui modifie chaque requête vers OpenAI pour utiliser la clé API de l'utilisateur
const prepareRequestWithUserApiKey = async (req) => {
  try {
    store.ensureContext();
    const userId = store.get("userId");
    const apiKey = store.get("apiKey");

    if (apiKey) {
      console.log(
        `Using API key from store for user ${userId} (${apiKey.slice(-5)})`
      );
      // Modifier l'en-tête d'autorisation avec la clé API de l'utilisateur
      req.headers.set("Authorization", `Bearer ${apiKey}`);
    } else if (userId) {
      // Si pas dans le store, essayer de récupérer depuis la base de données
      const dbApiKey = await getUserApiKey(userId, "openai");
      if (dbApiKey) {
        console.log(
          `Using API key from database for user ${userId} (${dbApiKey.slice(
            -5
          )})`
        );
        store.set("apiKey", dbApiKey);
        req.headers.set("Authorization", `Bearer ${dbApiKey}`);
      } else {
        console.warn("No API key found for user", userId);
      }
    } else {
      console.warn("No user ID found in store");
    }

    // Afficher l'en-tête d'autorisation pour débogage
    console.log(
      "Authorization header:",
      req.headers
        .get("Authorization")
        ?.replace(/Bearer sk-\w{5}/, "Bearer sk-*****")
    );
  } catch (error) {
    console.error("Error in prepareRequest:", error);
  }

  return req;
};

// Créer un client OpenAI avec notre fonction de préparation personnalisée
const dynamicOpenAI = createOpenAI({
  apiKey: "placeholder-will-be-replaced-at-runtime",
  baseURL: "https://api.openai.com/v1",
  fetch: async (url, options) => {
    // Intercepter fetch avant chaque requête
    try {
      store.ensureContext();
      const apiKey = store.get("apiKey");

      if (apiKey && options.headers) {
        console.log("Modifying fetch request headers");
        // Créer une nouvelle instance de Headers
        const newHeaders = new Headers(options.headers);
        // Remplacer l'en-tête d'autorisation
        newHeaders.set("Authorization", `Bearer ${apiKey}`);
        console.log("New headers:", newHeaders);
        // Mettre à jour les options avec les nouveaux en-têtes
        options.headers = newHeaders;
      }
    } catch (error) {
      console.error("Error in fetch intercept:", error);
    }

    return fetch(url, options);
  },
  prepareRequest: prepareRequestWithUserApiKey,
});

// Utiliser le modèle avec notre client personnalisé
export const grandOralO4Mini = new Agent({
  name: "grand-oral-o4-mini",
  instructions: prompt,
  model: dynamicOpenAI("gpt-4o-mini"),
  tools: { vectorQueryTool },
  memory: memory,
});

// Agent statique (clé API standard)
export const grandOralO4 = new Agent({
  name: "grand-oral-o4",
  instructions: prompt,
  model: dynamicOpenAI("gpt-4o"),
  tools: { vectorQueryTool },
  memory: memory,
});

// Fonction qui modifie chaque requête vers Google pour utiliser la clé API de l'utilisateur
const prepareRequestWithUserGoogleApiKey = async (req) => {
  try {
    store.ensureContext();
    const userId = store.get("userId");
    const googleApiKey = store.get("googleApiKey");

    if (googleApiKey) {
      console.log(
        `Using Google API key from store for user ${userId} (${googleApiKey.slice(-5)})`
      );
      // Google utilise un paramètre 'key' dans l'URL de la requête au lieu d'un en-tête Authorization
      const url = new URL(req.url);
      url.searchParams.set('key', googleApiKey);
      
      // Construire une nouvelle requête avec l'URL modifiée
      const newReq = new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
        cache: req.cache,
        credentials: req.credentials,
        integrity: req.integrity,
        mode: req.mode,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
      });
      
      return newReq;
    } else if (userId) {
      // Si pas dans le store, essayer de récupérer depuis la base de données
      const dbGoogleApiKey = await getUserGoogleApiKey(userId);
      if (dbGoogleApiKey) {
        console.log(
          `Using Google API key from database for user ${userId} (${dbGoogleApiKey.slice(-5)})`
        );
        store.set("googleApiKey", dbGoogleApiKey);
        
        // Modifier l'URL avec la clé API Google
        const url = new URL(req.url);
        url.searchParams.set('key', dbGoogleApiKey);
        
        // Construire une nouvelle requête avec l'URL modifiée
        const newReq = new Request(url.toString(), {
          method: req.method,
          headers: req.headers,
          body: req.body,
          cache: req.cache,
          credentials: req.credentials,
          integrity: req.integrity,
          mode: req.mode,
          redirect: req.redirect,
          referrer: req.referrer,
          referrerPolicy: req.referrerPolicy,
        });
        
        return newReq;
      } else {
        console.warn("No Google API key found for user", userId);
      }
    } else {
      console.warn("No user ID found in store");
    }
  } catch (error) {
    console.error("Error in prepareRequestWithUserGoogleApiKey:", error);
  }
  
  return req;
};

// Créer un client Google avec notre fonction de préparation personnalisée
const dynamicGoogle = createGoogle({
  apiKey: "placeholder-will-be-replaced-at-runtime",
  fetch: async (url, options) => {
    try {
      store.ensureContext();
      const googleApiKey = store.get("googleApiKey");
      
      if (googleApiKey) {
        console.log("Modifying fetch request for Google");
        // Pour Google, la clé API est généralement passée comme paramètre d'URL
        const urlObj = new URL(url);
        urlObj.searchParams.set('key', googleApiKey);
        url = urlObj.toString();
        console.log("Modified URL:", url.replace(googleApiKey, '***'));
      }
    } catch (error) {
      console.error("Error in fetch intercept for Google:", error);
    }
    
    return fetch(url, options);
  },
  prepareRequest: prepareRequestWithUserGoogleApiKey
});

// Agent utilisant Google Gemini avec une clé API dynamique
export const googleGeminiAgent = new Agent({
  name: "google-gemini",
  instructions: prompt,
  model: dynamicGoogle("gemini-1.5-pro"),
  tools: { vectorQueryTool },
  memory: memory,
});
