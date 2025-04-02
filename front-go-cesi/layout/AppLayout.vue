<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <main class="flex w-full min-h-screen">
      <SidebarTrigger />
      <div class="flex justify-center w-full">
        <div class="w-full max-w-4xl">
          <slot />
        </div>
      </div>
    </main>
    </SidebarInset>
  </SidebarProvider>
</template>

  <script setup lang="ts">
  import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
  import AppSidebar from "@/components/internal/components/AppSidebar.vue";
  </script>