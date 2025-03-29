<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GalleryVerticalEnd } from 'lucide-vue-next'
import { useNuxtApp } from '#app';

const { $api } = useNuxtApp();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const registerUser = async () => {
    try {
        const response = await $api.post('/auth/signup', {
            email: email.value,
            password: password.value,
        });
        console.log('Utilisateur enregistré avec succès:', response.data);
    } catch (error) {
        errorMessage.value = error.response?.data?.error || "Une erreur est survenue lors de l'inscription";
    }
};
</script>
<template>
    <div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div class="flex w-full max-w-sm flex-col gap-6">
            <a href="#" class="flex items-center gap-2 self-center font-medium">
                <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <GalleryVerticalEnd class="size-4" />
                </div>
                Acme Inc.
            </a>
            <Card class="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle class="text-xl">
                        Sign Up
                    </CardTitle>
                    <CardDescription>
                        Enter your information to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid gap-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="grid gap-2">
                                <Label for="first-name">First name</Label>
                                <Input id="first-name" placeholder="Max" required />
                            </div>
                            <div class="grid gap-2">
                                <Label for="last-name">Last name</Label>
                                <Input id="last-name" placeholder="Robinson" required />
                            </div>
                        </div>
                        <div class="grid gap-2">
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" v-model="email" placeholder="m@example.com" required />
                        </div>
                        <div class="grid gap-2">
                            <Label for="password">Password</Label>
                            <Input id="password" type="password" v-model="password" required />
                        </div>
                        <Button type="submit" class="w-full" @click="registerUser">
                            Create an account
                        </Button>
                        <Button variant="outline" class="w-full">
                            Sign up with GitHub
                        </Button>
                    </div>
                    <div class="mt-4 text-center text-sm">
                        Already have an account?
                        <a href="/" class="underline">
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>