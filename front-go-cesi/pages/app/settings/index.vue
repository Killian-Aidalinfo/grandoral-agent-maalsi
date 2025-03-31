<template>
    <AppLayout >
        <template #default>
            <KeyOpenaiForm />
        </template>
    </AppLayout>
</template>
<script setup lang="ts">
import AppLayout from '~/layout/AppLayout.vue';
import KeyOpenaiForm from '~/components/internal/components/KeyOpenaiForm.vue';
</script>