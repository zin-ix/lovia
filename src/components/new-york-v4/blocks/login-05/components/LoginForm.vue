<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import logo from '@/assets/images/logo_w_word.png'
import { ArrowLeft } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const step = ref(1) // 1: email, 2: password

const handleNext = () => {
  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }
  error.value = ''
  step.value = 2
}

const handleLogin = async () => {
  error.value = ''
  try {
    await authStore.signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  }
}

const handleBack = () => {
  step.value = 1
  password.value = ''
  error.value = ''
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <!-- Email step -->
    <form v-if="step === 1" @submit.prevent="handleNext">
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <a href="#" class="flex flex-col items-center gap-2 font-medium">
            <div class="flex items-center justify-center">
              <img :src="logo" alt="Lovia" class="h-10 w-auto" />
            </div>
          </a>
          <div class="gap-5"></div>
          <FieldDescription> Sign in with your Lovia credentials </FieldDescription>
        </div>

        <div
          v-if="error || authStore.error"
          class="text-destructive text-sm font-normal text-center"
        >
          {{ error || authStore.error }}
        </div>

        <Field>
          <div class="flex items-center">
            <FieldLabel for="email"> Email </FieldLabel>
            <router-link
              to="/auth/forgot-password"
              class="ml-auto text-xs underline-offset-4 text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot password?
            </router-link>
          </div>
          <Input id="email" v-model="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <Button type="submit"> Continue </Button>
        </Field>
        <FieldSeparator>Or</FieldSeparator>
        <Field class="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" type="button" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                fill="currentColor"
              />
            </svg>
            Continue with Apple
          </Button>
          <Button variant="outline" type="button" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>
        </Field>

        <div class="text-center text-xs text-muted-foreground mt-2">
          Don't have an account?
          <router-link to="/auth/register" class="underline underline-offset-4 text-primary font-medium">
            Sign up
          </router-link>
        </div>
      </FieldGroup>
    </form>

    <!-- Password step -->
    <form v-else-if="step === 2" @submit.prevent="handleLogin">
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            @click="handleBack"
            class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary self-start"
          >
            <ArrowLeft class="size-4" /> Back
          </button>
          <a href="#" class="flex flex-col items-center gap-2 font-medium">
            <div class="flex items-center justify-center">
              <img :src="logo" alt="Lovia Logo" class="h-10 w-auto" />
            </div>
            <span class="sr-only">Lovia</span>
          </a>
          <FieldDescription>
            Logging in as <strong>{{ email }}</strong>
          </FieldDescription>
        </div>

        <div
          v-if="error || authStore.error"
          class="text-destructive text-sm font-normal text-center"
        >
          {{ error || authStore.error }}
        </div>

        <Field>
          <div class="flex items-center">
            <FieldLabel for="password"> Password </FieldLabel>
            <router-link
              to="/auth/forgot-password"
              class="ml-auto text-sm underline-offset-4 text-primary hover:underline"
            >
              Forgot your password?
            </router-link>
          </div>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autoFocus
          />
        </Field>
        <Field>
          <Button type="submit" :disabled="authStore.loading">
            {{ authStore.loading ? 'Logging in...' : 'Login' }}
          </Button>
        </Field>
      </FieldGroup>
    </form>

    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="#">Terms of Service</a> and
      <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
