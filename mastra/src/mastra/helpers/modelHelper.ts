import { openai, createOpenAI } from "@ai-sdk/openai";
import { store } from "./store";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getUserApiKey } from "./dbTool";

const dynamicOpenAI = createOpenAI({
  apiKey: "placeholder-will-be-replaced-at-runtime",
  baseURL: "https://api.openai.com/v1",
  fetch: async (url: any, options: any) => {
    try {
      store.ensureContext();
      store.ensureContext();
      const userId = store.get("userId");
      const apiKey = await getUserApiKey(userId, "openai");
      if (!apiKey) {
        throw new Error("No API key found for user");
      }
      if (apiKey && options.headers) {
        console.log("Modifying fetch request headers");
        const newHeaders = new Headers(options.headers);
        newHeaders.set("Authorization", `Bearer ${apiKey}`);
        options.headers = newHeaders;
      }
    } catch (error) {
      console.error("Error in fetch intercept:", error);
    }

    return fetch(url, options);
  },
});

const dynamicScaleway = createOpenAI({
  apiKey: "placeholder-will-be-replaced-at-runtime",
  baseURL: "https://api.scaleway.ai/1096840e-82cc-4d5d-a564-cc46e501afd6/v1",
  fetch: async (url: any, options: any) => {
    try {
      store.ensureContext();
      store.ensureContext();
      const userId = store.get("userId");
      const apiKey = await getUserApiKey(userId, "scaleway");
      if (!apiKey) {
        throw new Error("No API key found for user");
      }
      if (apiKey && options.headers) {
        console.log("Modifying fetch request headers");
        const newHeaders = new Headers(options.headers);
        newHeaders.set("Authorization", `Bearer ${apiKey}`);
        options.headers = newHeaders;
      }
    } catch (error) {
      console.error("Error in fetch intercept:", error);
    }

    return fetch(url, options);
  },
});

const dynamicScalewayEmbeddings = createOpenAI({
  apiKey: "placeholder-will-be-replaced-at-runtime",
  baseURL: "https://api.scaleway.ai/v1",
  fetch: async (url: any, options: any) => {
    try {
      store.ensureContext();
      store.ensureContext();
      const userId = store.get("userId");
      const apiKey = await getUserApiKey(userId, "scaleway");
      if (!apiKey) {
        throw new Error("No API key found for user");
      }
      if (apiKey && options.headers) {
        console.log("Modifying fetch request headers");
        const newHeaders = new Headers(options.headers);
        newHeaders.set("Authorization", `Bearer ${apiKey}`);
        options.headers = newHeaders;
      }
    } catch (error) {
      console.error("Error in fetch intercept:", error);
    }

    return fetch(url, options);
  },
});

const dynamicGoogle = createGoogleGenerativeAI({
  apiKey: "placeholder-will-be-replaced-at-runtime",
  fetch: async (url: any, options: any) => {
    try {
      store.ensureContext();
      const userId = store.get("userId");
      const googleApiKey = await getUserApiKey(userId, "google");

      if (googleApiKey) {
        console.log("Modifying fetch request for Google");
        const urlObj = new URL(url);
        urlObj.searchParams.set("key", googleApiKey);
        url = urlObj.toString();
        console.log("Modified URL:", url);
      }
    } catch (error) {
      console.error("Error in fetch intercept for Google:", error);
    }

    return fetch(url, options);
  },
});

export {
  dynamicOpenAI,
  dynamicGoogle,
  dynamicScaleway,
  dynamicScalewayEmbeddings,
};
