<template>
    <div class="flex flex-col h-screen max-h-screen pt-10">
      <!-- Zone d'affichage des messages -->
      <div ref="chatBox" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="max-w-2xl mx-auto"
        >
          <div
            :class="msg.role === 'user' ? 'text-right' : 'text-left'"
            class="whitespace-pre-wrap"
          >
            <div
              :class="[
                'inline-block px-4 py-2 rounded-lg',
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              ]"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>
  
      <!-- Input en bas -->
      <div class="border-t p-4 bg-background">
        <form @submit.prevent="sendMessage" class="flex gap-2 max-w-2xl mx-auto">
        <Select v-model="selectedValue">
    <SelectTrigger class="w-[180px]">
      <SelectValue placeholder="Modèle" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Modèle</SelectLabel>
        <SelectItem value="grandOralO4Mini">
          GPT 4o-Mini
        </SelectItem>
        <SelectItem value="grandOralO4">
          GPT 4o
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
          <Input
            v-model="input"
            placeholder="Pose ta question ici..."
            class="flex-1"
          />
          <Button type="submit">Envoyer</Button>
        </form>
      </div>
    </div>
  </template>
  <script setup lang="ts">
  import { ref, nextTick } from 'vue'
  import { useNuxtApp } from '#app'
  import { Input } from '@/components/ui/input'
  import { Button } from '@/components/ui/button'
  import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  const { $api } = useNuxtApp()
  const selectedValue = ref('grandOralO4Mini')
  const input = ref('')
  const messages = ref([
    {
      role: 'assistant',
      content: 'Bienvenue ! Pose-moi une question sur le grand oral :)'
    }
  ])
  
  const chatBox = ref<HTMLElement>()
    const extractReadableMessage = (rawData: string) => {
  const lines = rawData.split('\n')
  const contentLines = lines.filter(line => line.startsWith('0:'))

  const combined = contentLines
    .map(line => {
      const match = line.match(/^0:\s*"?(.*?)"?$/)
      return match ? match[1] : ''
    })
    .join('')

  return combined
} 
  const scrollToBottom = async () => {
    await nextTick()
    chatBox.value?.scrollTo({
      top: chatBox.value.scrollHeight,
      behavior: 'smooth'
    })
  }
  
  const sendMessage = async () => {
    if (!input.value.trim()) return
  
    // Ajoute le message utilisateur dans la liste
    messages.value.push({ role: 'user', content: input.value })
  
    const userMessage = input.value
    input.value = ''
  
    try {
      const response = await $api.post(
        `/mastra/agents/${selectedValue.value}/stream`,
        {
          messages: [
            { role: 'user', content: userMessage }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
  
      // On suppose que la réponse est de type JSON avec un champ `content`
      const assistantMessage = extractReadableMessage(response.data)
  
      messages.value.push({ role: 'assistant', content: assistantMessage })
      scrollToBottom()
    } catch (error: any) {
      messages.value.push({
        role: 'assistant',
        content: 'Erreur lors de la requête : ' + (error.response?.data?.message || error.message)
      })
    }
  }
  </script>
  