<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import logo from '@/assets/images/logo_w_word.png'
import { ArrowLeft } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const error = ref('')
const resetSent = ref(false)

const handleResetRequest = async () => {
  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }
  error.value = ''
  try {
    await authStore.resetPasswordForEmail(email.value)
    resetSent.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to send password reset email'
  }
}
</script>

<template>
  <div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <form @submit.prevent="handleResetRequest">
          <FieldGroup>
            <div class="flex flex-col items-center gap-2 text-center">
              <router-link
                to="/auth/login"
                class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary self-start mb-1"
              >
                <ArrowLeft class="size-4" /> Back to sign in
              </router-link>
              <a href="#" class="flex flex-col items-center gap-2 font-medium">
                <div class="flex items-center justify-center">
                  <img :src="logo" alt="Lovia" class="h-10 w-auto" />
                </div>
              </a>
              <h1 class="text-xl font-bold">Reset your password</h1>
              <FieldDescription>
                Enter your email address and we'll send you a password reset link.
              </FieldDescription>
            </div>

            <div
              v-if="error || authStore.error"
              class="text-destructive text-sm font-normal text-center"
            >
              {{ error || authStore.error }}
            </div>

            <div
              v-if="resetSent"
              class="bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm text-center font-medium"
            >
              Password reset link sent to <strong>{{ email }}</strong>! Please check your email inbox.
            </div>

            <template v-if="!resetSent">
              <Field>
                <FieldLabel for="email"> Email address </FieldLabel>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" class="w-full" :disabled="authStore.loading">
                  {{ authStore.loading ? 'Sending...' : 'Send Reset Link' }}
                </Button>
              </Field>
            </template>
            <template v-else>
              <Field>
                <router-link to="/auth/login" class="w-full">
                  <Button type="button" variant="outline" class="w-full">
                    Back to Sign In
                  </Button>
                </router-link>
              </Field>
            </template>
          </FieldGroup>
        </form>

        <FieldDescription class="px-6 text-center">
          By clicking continue, you agree to our <a href="#">Terms of Service</a> and
          <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </div>
  </div>
</template>
