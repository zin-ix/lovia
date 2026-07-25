<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import {
  ShieldCheck,
  Mail,
  Save,
  Loader2,
  Activity,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const authStore = useAuthStore()
const { toast } = useFeatherToast()

const loading = ref(false)
const saving = ref(false)

const form = ref({
  full_name: '',
  avatar_url: '',
  bio: '',
})

onMounted(async () => {
  loading.value = true
  if (authStore.user?.id) {
    try {
      const prof = await authStore.getProfile(authStore.user.id)
      if (prof) {
        form.value.full_name = prof.full_name || ''
        form.value.avatar_url = prof.avatar_url || ''
        form.value.bio = prof.bio || ''
      }
    } catch {
      /* ignore */
    } finally {
      loading.value = false
    }
  }
})

const adminInitial = computed(() => {
  if (form.value.full_name.trim()) return form.value.full_name.charAt(0).toUpperCase()
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase() || 'A'
})

const handleSaveAdminProfile = async () => {
  if (!authStore.user?.id) return
  saving.value = true

  try {
    await authStore.updateProfile(authStore.user.id, {
      full_name: form.value.full_name,
      avatar_url: form.value.avatar_url,
      bio: form.value.bio,
    })
    toast.success({ title: 'Admin profile updated successfully!' })
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to update admin profile' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Admin Profile</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full">
              Administrator
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Manage administrator credentials, privileges, and system audit settings.</p>
        </div>
      </div>

      <!-- Admin Identity Card (18px radius) -->
      <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs flex items-start gap-4">
        <div class="relative shrink-0">
          <img
            v-if="form.avatar_url"
            :src="form.avatar_url"
            alt="Admin Avatar"
            class="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
          />
          <div
            v-else
            class="w-16 h-16 rounded-full bg-rose-600 text-white font-bold text-xl flex items-center justify-center border-2 border-rose-200"
          >
            {{ adminInitial }}
          </div>
        </div>

        <div class="flex-1 space-y-1.5">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-gray-900">
              {{ form.full_name || 'System Administrator' }}
            </h2>
            <span class="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5" /> Level 1 Super Admin
            </span>
          </div>

          <p class="text-xs text-gray-500 flex items-center gap-1.5">
            <Mail class="w-3.5 h-3.5 text-gray-400" />
            {{ authStore.user?.email }}
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
              User Management Permission
            </span>
            <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
              Global Config Permission
            </span>
            <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
              System Audit Access
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Admin Profile Form (18px radius) -->
      <form @submit.prevent="handleSaveAdminProfile" class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-5">
        <h3 class="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
          Administrator Details
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Admin Display Name</label>
            <input
              v-model="form.full_name"
              type="text"
              placeholder="e.g. Chief Admin"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Avatar Image URL</label>
            <input
              v-model="form.avatar_url"
              type="url"
              placeholder="https://example.com/admin.jpg"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-gray-700">Admin Bio / Responsibility Scope</label>
          <textarea
            v-model="form.bio"
            rows="3"
            placeholder="e.g. System Administrator supervising letter generation quotas and platform integrity..."
            class="w-full p-3.5 rounded-[14px] border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition resize-none bg-[#f5f5f7] focus:bg-white"
          ></textarea>
        </div>

        <div class="flex items-center justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            <Save v-else class="w-3.5 h-3.5" />
            Save Admin Profile
          </button>
        </div>
      </form>

      <!-- Admin Audit Trail Preview -->
      <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-3">
        <div class="flex items-center gap-2 border-b border-gray-100 pb-2.5">
          <Activity class="w-4 h-4 text-rose-500" />
          <h3 class="text-sm font-semibold text-gray-900">Security & Audit Activity Log</h3>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between py-1.5 border-b border-gray-50 text-gray-600">
            <span class="font-medium text-gray-800">Admin Session Initiated</span>
            <span class="text-[11px] text-gray-400">Today</span>
          </div>
          <div class="flex items-center justify-between py-1.5 border-b border-gray-50 text-gray-600">
            <span class="font-medium text-gray-800">User Profile Permissions Audit Completed</span>
            <span class="text-[11px] text-gray-400">Today</span>
          </div>
          <div class="flex items-center justify-between py-1.5 text-gray-600">
            <span class="font-medium text-gray-800">System Configuration Loaded</span>
            <span class="text-[11px] text-gray-400">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
