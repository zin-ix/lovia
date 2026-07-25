<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import logo from '@/assets/images/logo_w_word.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await authStore.signUp(email.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <form @submit.prevent="handleRegister">
          <FieldGroup>
            <div class="flex flex-col items-center gap-2 text-center">
              <a href="#" class="flex flex-col items-center gap-2 font-medium">
                <div class="flex items-center justify-center">
                  <img :src="logo" alt="Lovia" class="h-10 w-auto" />
                </div>
              </a>
              <FieldDescription> Create your Lovia account </FieldDescription>
            </div>

            <Field>
              <FieldLabel for="email">Email</FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>

            <Field>
              <FieldLabel for="password">Password</FieldLabel>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="Create a password"
                required
              />
            </Field>

            <div v-if="error" class="text-destructive text-sm text-center">
              {{ error }}
            </div>

            <Button type="submit" class="w-full" :disabled="loading">
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </Button>

            <div class="text-center text-xs text-muted-foreground mt-2">
              Already have an account?
              <router-link to="/auth/login" class="underline underline-offset-4 text-primary">
                Sign in
              </router-link>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  </div>
</template>
