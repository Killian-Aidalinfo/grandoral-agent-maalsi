<script setup lang='ts'>
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNuxtApp } from '#app'
const { $api } = useNuxtApp()


const initVector = async () => {
  try {
    const response = await $api.post('/mastra/vector/init')
    console.log('Vector initiliasé :', response.data)
  } catch (error) {
    console.error('Erreur lors de l\'initilialisation du vector :', error)
  }
}
</script>

<template>
  <Card class="w-[350px]">
    <CardHeader>
      <CardTitle>Vector paramètres</CardTitle>
      <CardDescription>Vector fiche de chris</CardDescription>
    </CardHeader>
    <!-- <CardContent>
      <form>
        <div class="grid items-center w-full gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Name</Label>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="framework">Framework</Label>
          </div>
        </div>
      </form>
    </CardContent> -->
    <CardFooter class="flex justify-between px-6 pb-6">
      <Button @click="initVector">Initiliasé le vector</Button>
    </CardFooter>
  </Card>
</template>