<script setup lang="ts">
import AppLayout from '~/layout/AppLayout.vue';
import ChatComponent from '~/components/internal/components/ChatComponent.vue';
</script>

<template>
    <AppLayout >
        <template #default>
            <!-- <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0"> -->
                <ChatComponent />
          <!-- </div> -->
        </template>
    </AppLayout>
</template>