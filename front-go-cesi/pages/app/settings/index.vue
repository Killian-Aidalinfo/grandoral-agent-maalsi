<template>
    <AppLayout >
        <template #default>
            <KeyOpenaiForm />
            <KeyGoogleForm />
            <KeyScalewayForm />
        </template>
    </AppLayout>
</template>
<script setup lang="ts">
import AppLayout from '~/layout/AppLayout.vue';
import KeyOpenaiForm from '~/components/internal/components/KeyOpenaiForm.vue';
import KeyGoogleForm from '~/components/internal/components/KeyGoogleForm.vue';
import KeyScalewayForm from '~/components/internal/components/KeyScalewayForm.vue';
</script>