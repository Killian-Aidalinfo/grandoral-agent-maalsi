import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import axios from 'axios'
import { useToast } from '@/components/ui/toast/use-toast'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiUrl || 'http://localhost:8000'

  const api = axios.create({
    baseURL: apiBase,
  })
  api.interceptors.request.use((request) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return request
  })
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const is401 = error.response?.status === 401;
      const refreshToken = localStorage.getItem('refresh_token');
      console.log(error)
      // 🚨 Si le token est expiré, essaye de le rafraîchir
      if (is401 && refreshToken) {
        originalRequest._retry = true;
        console.log("Erreur lors du rafraîchissement du token :", error);
        try {
          const refreshResponse = await axios.post(
            `${apiBase}/token?grant_type=refresh_token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
  
          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token;
  
          // Sauvegarde les nouveaux tokens
          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
  
          // Réessaie la requête d’origine avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // ❌ Le refresh a échoué → déconnexion forcée
          // localStorage.removeItem('access_token');
          // localStorage.removeItem('refresh_token');
          // window.location.href = '/login'; // ou déclenche un logout propre
          return Promise.reject(refreshError);
        }
      }
  
      // 👉 Gestion classique de l'erreur (toast, etc.)
      const errorMessage = error.response?.data?.error || error.error || "Une erreur est survenue";
      const { toast } = useToast();
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
  
      return Promise.reject(error);
    }
  );
  

  return {
    provide: {
      api,
    },
  }
})