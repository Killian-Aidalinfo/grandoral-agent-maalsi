<template>
  <AppLayout>
    <template #default>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="aspect-video rounded-xl">
            <KeyOpenaiForm />
          </div>
          <div class="aspect-video rounded-xl">
            <KeyGoogleForm />
          </div>
          <div class="aspect-video rounded-xl">
            <KeyScalewayForm />
          </div>
        </div>
        <VectorInit />
      </div>
    </template>
  </AppLayout>
</template>
<script setup lang="ts">
import AppLayout from "~/layout/AppLayout.vue";
import KeyOpenaiForm from "~/components/internal/components/KeyOpenaiForm.vue";
import KeyGoogleForm from "~/components/internal/components/KeyGoogleForm.vue";
import KeyScalewayForm from "~/components/internal/components/KeyScalewayForm.vue";
import VectorInit from "~/components/internal/components/VectorInit.vue";
</script>
