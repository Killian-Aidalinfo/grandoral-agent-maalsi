<template>
  <div class="flex flex-col h-screen max-h-screen">
    <!-- Zone d'affichage des messages -->
    <div
      ref="chatBox"
      class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="max-w-2xl mx-auto">
        <div
          :class="msg.role === 'user' ? 'text-right' : 'text-left'"
          class="whitespace-pre-wrap">
          <div
            :class="[
              'inline-block px-4 py-2 rounded-lg',
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground',
            ]">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="border-t p-4 bg-background">
      <form
        @submit.prevent="sendMessage"
        class="flex gap-2 max-w-2xl mx-auto">
        <Select v-model="selectedModel">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Modèle" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Modèle</SelectLabel>
              <SelectItem 
                v-for="model in availableModels" 
                :key="model.value" 
                :value="model.value"
              >
                {{ model.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          v-model="userInput"
          placeholder="Pose ta question ici..."
          class="flex-1" />
        <Button type="submit">Envoyer</Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from "#app";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIModel {
  value: string;
  label: string;
}

interface HistoricalMessage {
  id: string;
  thread_id: string;
  content: string;
  role: string;
  type?: string;
  createdAt: string;
}

// Constants
const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Bienvenue ! Pose-moi une question sur le grand oral :)",
};

const availableModels: AIModel[] = [
  { value: "grandOralO4Mini", label: "GPT 4o-Mini" },
  { value: "grandOralO4", label: "GPT 4o" },
  { value: "googleGeminiAgent", label: "Gemini (gemini-2.5-pro-exp-03-25)" },
  { value: "deepseekScw", label: "Scaleway (deepseek-r1-distill-llama-70b)" }
];

// Composables
const { $api } = useNuxtApp();
const route = useRoute();

// Refs
const selectedModel = ref("grandOralO4Mini");
const userInput = ref("");
const messages = ref<Message[]>([WELCOME_MESSAGE]);
const resourceId = ref('');
const chatBox = ref<HTMLElement>();
const threadId = ref<string>(crypto.randomUUID());

// Helpers
const scrollToBottom = async () => {
  await nextTick();
  chatBox.value?.scrollTo({
    top: chatBox.value.scrollHeight,
    behavior: "smooth",
  });
};

const extractReadableMessage = (rawData: string): string => {
  const lines = rawData.split("\n");
  const contentLines = lines.filter((line) => line.startsWith("0:"));

  return contentLines
    .map((line) => {
      const match = line.match(/^0:\s*"?(.*?)"?$/);
      return match ? match[1] : "";
    })
    .join("");
};
const parseHistoricalMessages = (messages: HistoricalMessage[]): Message[] => {
  return messages
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(msg => {
      if (msg.content && typeof msg.content === 'string') {
        try {
          const parsed = JSON.parse(msg.content);
          
          // Si c'est un tableau, cherche les éléments de type "text"
          if (Array.isArray(parsed)) {
            const textContent = parsed
              .filter(item => item.type === 'text')
              .map(item => item.text)
              .join('\n');

            if (textContent) {
              return {
                role: 'assistant',
                content: textContent
              };
            }
          }

          // Si ce n'est pas un message de type "text", on retourne null
          return null;

        } catch (e) {
          // Si ce n'est pas du JSON, c'est probablement un message utilisateur
          if (msg.role === 'user') {
            return {
              role: 'user',
              content: msg.content
            };
          }
          return null;
        }
      }

      return null;
    })
    .filter((msg): msg is Message => msg !== null && msg.content.trim() !== '');
};
// API calls
const fetchUserInfo = async () => {
  try {
    const response = await $api.get('/auth/user');
    resourceId.value = response.data.id;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des infos utilisateur:", error);
  }
};

const loadThreadHistory = async () => {
  if (!route.params.id) return;
  
  try {
    threadId.value = route.params.id as string;
    const response = await $api.get(`/mastra/messages/custom/${threadId.value}`);
    const historicalMessages = parseHistoricalMessages(response.data);
    
    // Trie les messages par date si nécessaire
    messages.value = [
      WELCOME_MESSAGE,
      ...historicalMessages
    ];
    await scrollToBottom();
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
  }
};
const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  // Ajoute le message de l'utilisateur
  messages.value.push({ role: "user", content: userInput.value });
  const userMessage = userInput.value;
  userInput.value = "";

  try {
    const payload = {
      messages: [{ role: "user", content: userMessage }],
      threadId: threadId.value,
      resourceId: resourceId.value,
    };

    const response = await $api.post(
      `/mastra/agents/${selectedModel.value}/stream`,
      payload,
    );

    const assistantMessage = extractReadableMessage(response.data);
    messages.value.push({ role: "assistant", content: assistantMessage });
    await scrollToBottom();
  } catch (error: any) {
    messages.value.push({
      role: "assistant",
      content: `Erreur lors de la requête : ${error.response?.data?.message || error.message}`,
    });
  }
};

// Lifecycle
onMounted(async () => {
  await fetchUserInfo();
  await loadThreadHistory();
});
</script>