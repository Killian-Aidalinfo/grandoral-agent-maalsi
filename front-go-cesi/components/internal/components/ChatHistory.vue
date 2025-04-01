<script setup lang="ts">
import { useNuxtApp } from '#app'
import {
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
const { $api } = useNuxtApp()
const threads = ref([])
const error = ref(null)
const isLoading = ref(true)

const fetchThreads = async () => {
    try {
        const response = await $api.get('/mastra/threads/user')
        threads.value = response.data
    } catch (err: any) {
        error.value = err.message
        console.error('Erreur lors de la récupération des threads:', err)
    } finally {
        isLoading.value = false
    }
}

onBeforeMount(() => {
    fetchThreads()
})
</script>

<template>
    <SidebarMenuItem v-for="item in threads" :key="item.id">
        <SidebarMenuButton asChild>
            <a :href="'/app/chat/' + item.id">
                {{ item.title }}
            </a>
        </SidebarMenuButton>
    </SidebarMenuItem>
</template>