import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import axios from "axios";
import { useToast } from "@/components/ui/toast/use-toast";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiUrl || "http://localhost:8000";

  const api = axios.create({
    baseURL: apiBase,
  });

  // ➕ Ajout du token d'accès à chaque requête
  api.interceptors.request.use((request) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  });

  // 🔁 Gestion du rafraîchissement automatique
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const is401 = error.response?.status === 401;
      const refreshToken = localStorage.getItem("refresh_token");

      if (is401 && refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const res = await axios.post(
            `${apiBase}/auth/token`,
            new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: refreshToken,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const { access_token, refresh_token } = res.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          return api(originalRequest);
        } catch (refreshError) {
          console.log("Échec du refresh token", refreshError);

          // localStorage.removeItem("access_token");
          // localStorage.removeItem("refresh_token");
          // window.location.href = "/login";

          // return Promise.reject(refreshError);
        }
      }

      const { toast } = useToast();
      toast({
        title: "Erreur",
        description:
          error.response?.data?.error_description ||
          error.response?.data?.error ||
          error.message,
        variant: "destructive",
      });

      return Promise.reject(error);
    }
  );

  return {
    provide: {
      api,
    },
  };
});
