<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import logo from '@/assets/images/logo_w_word.png'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const authStore = useAuthStore()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)

const handleUpdatePassword = async () => {
  if (!newPassword.value) {
    error.value = 'Please enter a new password'
    return
  }
  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  error.value = ''
  try {
    await authStore.updatePassword(newPassword.value)
    success.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update password'
  }
}
</script>

<template>
  <div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <form @submit.prevent="handleUpdatePassword">
          <FieldGroup>
            <div class="flex flex-col items-center gap-2 text-center">
              <a href="#" class="flex flex-col items-center gap-2 font-medium">
                <div class="flex items-center justify-center">
                  <img :src="logo" alt="Lovia" class="h-10 w-auto" />
                </div>
              </a>
              <h1 class="text-xl font-bold">Set new password</h1>
              <FieldDescription>
                Enter your new password below to update your account password.
              </FieldDescription>
            </div>

            <div
              v-if="error || authStore.error"
              class="text-destructive text-sm font-normal text-center"
            >
              {{ error || authStore.error }}
            </div>

            <div
              v-if="success"
              class="bg-green-500/10 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm text-center font-medium"
            >
              Password successfully updated! Redirecting to dashboard...
            </div>

            <template v-if="!success">
              <Field>
                <FieldLabel for="newPassword"> New Password </FieldLabel>
                <Input
                  id="newPassword"
                  v-model="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="confirmPassword"> Confirm New Password </FieldLabel>
                <Input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" class="w-full" :disabled="authStore.loading">
                  {{ authStore.loading ? 'Updating Password...' : 'Update Password' }}
                </Button>
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
