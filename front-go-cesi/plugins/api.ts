import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import axios from 'axios'
import { useToast } from '@/components/ui/toast/use-toast'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiUrl || 'http://localhost:8000'

  const api = axios.create({
    baseURL: apiBase,
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("error", error);
      const errorMessage = error.response?.data?.error || error.error || "Une erreur est survenue"

      // if (process) {
      const { toast } = useToast()
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
        })
      // }

      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api,
    },
  }
})