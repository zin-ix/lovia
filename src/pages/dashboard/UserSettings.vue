<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserLayout from '@/layouts/UserLayout.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLetterStore } from '@/stores/letter/letter.store'
import {
  Lock,
  Bell,
  HardDrive,
  AlertTriangle,
  Loader2,
  LogOut,
  Save,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const router = useRouter()
const authStore = useAuthStore()
const letterStore = useLetterStore()
const { toast } = useFeatherToast()

// Password State
const passwordForm = ref({
  newPassword: '',
  confirmPassword: '',
})
const passwordSaving = ref(false)

// Preferences State
const prefs = ref({ ...authStore.userSettings })

// Confirm Dialog State for Sign Out
const showSignOutConfirm = ref(false)

const userLimit = computed(() => authStore.profile?.letter_limit || 2)
const letterCount = computed(() => letterStore.letters.length)
const quotaPercentage = computed(() => Math.min(100, Math.round((letterCount.value / userLimit.value) * 100)))

const handlePasswordChange = async () => {
  if (passwordForm.value.newPassword.length < 6) {
    toast.error({ title: 'Password must be at least 6 characters long' })
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error({ title: 'Passwords do not match' })
    return
  }

  passwordSaving.value = true
  try {
    await authStore.updatePassword(passwordForm.value.newPassword)
    toast.success({ title: 'Password updated successfully!' })
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to update password' })
  } finally {
    passwordSaving.value = false
  }
}

const handleSavePreferences = () => {
  authStore.updateUserSettings(prefs.value)
  toast.success({ title: 'Preferences saved!' })
}

const handleConfirmSignOut = async () => {
  showSignOutConfirm.value = false
  await authStore.signOut()
  toast.success({ title: 'Signed out successfully' })
  router.push('/auth/login')
}
</script>

<template>
  <UserLayout>
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Page Header -->
      <div class="border-b border-black/5 pb-4">
        <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Account & App Settings</h1>
        <p class="text-xs text-gray-500 mt-1">
          Manage security, preferences, themes, and letter creation limits.
        </p>
      </div>

      <!-- Quota Card (18px radius) -->
      <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="p-2.5 bg-rose-50 text-rose-600 rounded-full">
              <HardDrive class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-gray-900">Letter Storage Quota</h3>
              <p class="text-[11px] text-gray-400">Your current account creation allowance</p>
            </div>
          </div>
          <span class="text-xs font-semibold text-gray-700">
            {{ letterCount }} / {{ userLimit }} Letters Used
          </span>
        </div>

        <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            class="bg-rose-500 h-full transition-all duration-300 rounded-full"
            :style="{ width: `${quotaPercentage}%` }"
          />
        </div>
      </div>

      <!-- Preferences Section (18px radius) -->
      <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-5">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-2">
            <Bell class="w-4 h-4 text-rose-500" />
            <h3 class="text-sm font-semibold text-gray-900">Application Preferences</h3>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Notification Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-800">Email Notifications</p>
              <p class="text-[11px] text-gray-400">Receive alerts when someone views or interacts with your letter.</p>
            </div>
            <input
              v-model="prefs.email_notifications"
              type="checkbox"
              @change="handleSavePreferences"
              class="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          <!-- Anniversary Reminders Toggle -->
          <div class="flex items-center justify-between border-t border-gray-50 pt-3">
            <div>
              <p class="text-xs font-medium text-gray-800">Anniversary Reminders</p>
              <p class="text-[11px] text-gray-400">Automated reminder emails 3 days prior to your special date.</p>
            </div>
            <input
              v-model="prefs.anniversary_reminders"
              type="checkbox"
              @change="handleSavePreferences"
              class="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          <!-- Default Privacy -->
          <div class="flex items-center justify-between border-t border-gray-50 pt-3">
            <div>
              <p class="text-xs font-medium text-gray-800">Default Letter Visibility</p>
              <p class="text-[11px] text-gray-400">Default sharing privacy for newly composed letters.</p>
            </div>
            <select
              v-model="prefs.default_privacy"
              @change="handleSavePreferences"
              class="h-8 px-3 rounded-full border border-gray-200 text-xs bg-[#f5f5f7] text-gray-800 focus:outline-none focus:border-rose-500"
            >
              <option value="private">Private (Link with password/secret)</option>
              <option value="public">Public (Direct link accessible)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Password Security Section (18px radius) -->
      <form @submit.prevent="handlePasswordChange" class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-4">
        <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Lock class="w-4 h-4 text-rose-500" />
          <h3 class="text-sm font-semibold text-gray-900">Security & Password</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="At least 6 characters"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Confirm New Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="passwordSaving || !passwordForm.newPassword"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="passwordSaving" class="w-3.5 h-3.5 animate-spin" />
            <Save v-else class="w-3.5 h-3.5" />
            Update Password
          </button>
        </div>
      </form>

      <!-- Danger Zone -->
      <div class="bg-red-50/50 border border-red-100 rounded-[18px] p-6 space-y-4">
        <div class="flex items-center gap-2 border-b border-red-100 pb-3 text-red-700">
          <AlertTriangle class="w-4 h-4" />
          <h3 class="text-sm font-semibold">Danger Zone</h3>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-900">Sign Out of Session</p>
            <p class="text-[11px] text-gray-500">Safely terminate your current active session on this device.</p>
          </div>
          <button
            @click="showSignOutConfirm = true"
            class="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-medium rounded-full transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut class="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Sign Out Modal -->
    <ConfirmDialog
      v-model:open="showSignOutConfirm"
      title="Sign Out Confirmation"
      description="Are you sure you want to log out of your Lovia account session?"
      confirm-text="Sign Out"
      variant="destructive"
      @confirm="handleConfirmSignOut"
    />
  </UserLayout>
</template>
