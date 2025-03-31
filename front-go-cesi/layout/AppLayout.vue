<template>
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <div class="flex w-full max-w-sm flex-col gap-6">
            <slot />
        </div>
      </main>
    </SidebarProvider>
  </template>
  <script setup lang="ts">
  import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
  import AppSidebar from "@/components/internal/components/AppSidebar.vue";
  </script>