<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNuxtApp } from '#app'

const { $api } = useNuxtApp()
const apiKey = ref('')
const apiKeyId = ref<number | null>(null) // pour détecter si une clé existe déjà
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await $api.get('/mastra/keys/list')
    const keys = response.data as Array<{ id: number; key: string; model: string }>
    const AiKey = keys.find(k => k.model === 'scaleway')
    if (AiKey) {
      apiKey.value = AiKey.key
      apiKeyId.value = AiKey.id
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des clés API :', error)
  } finally {
    isLoading.value = false
  }
})

const addKey = async () => {
  try {
    if (apiKeyId.value !== null) {
      // Clé déjà existante → mise à jour
      const response = await $api.put('/mastra/keys/update', {
        id: apiKeyId.value,
        key: apiKey.value,
        model: 'scaleway',
      })
      console.log('Clé mise à jour :', response.data)
    } else {
      // Nouvelle clé
      const response = await $api.post('/mastra/keys/add', {
        key: apiKey.value,
        model: 'scaleway',
      })
      apiKeyId.value = response.data.id // enregistrer l’ID pour une prochaine modif
      console.log('Clé ajoutée :', response.data)
    }
  } catch (error) {
    console.error('Erreur lors de l’enregistrement de la clé API :', error)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">Scaleway API Key</CardTitle>
        <CardDescription>
          Enter your Scaleway API key to use the deepseek-r1-distill-llama-70b
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="addKey">
          <div class="grid gap-6">
            <div class="grid gap-2">
              <Label>API Key</Label>
              <Input v-model="apiKey" :disabled="isLoading" required />
            </div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
