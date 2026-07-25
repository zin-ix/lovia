<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import UserLayout from '@/layouts/UserLayout.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Mail, Calendar, Heart, Shield, Loader2, Save } from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const authStore = useAuthStore()
const { toast } = useFeatherToast()

const loading = ref(false)
const saving = ref(false)

const form = ref({
  full_name: '',
  avatar_url: '',
  bio: '',
  partner_name: '',
  anniversary_date: '',
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
        // form.value.partner_name = prof.partner_name || ''
        // form.value.anniversary_date = prof.anniversary_date || ''
      }
    } catch {
      // fallback
    } finally {
      loading.value = false
    }
  }
})

const userInitial = computed(() => {
  if (form.value.full_name.trim()) return form.value.full_name.charAt(0).toUpperCase()
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase() || 'U'
})

const handleSaveProfile = async () => {
  if (!authStore.user?.id) return
  saving.value = true

  try {
    await authStore.updateProfile(authStore.user.id, {
      full_name: form.value.full_name,
      avatar_url: form.value.avatar_url,
      bio: form.value.bio,
      // partner_name: form.value.partner_name,
      // anniversary_date: form.value.anniversary_date,
    })
    toast.success({ title: 'Profile updated successfully!' })
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to update profile' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UserLayout>
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">User Profile</h1>
          <p class="text-xs text-gray-500 mt-1">
            Manage your account information, partner info, and personal bio.
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
          :class="
            authStore.isAdmin
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-gray-100 border-gray-200 text-gray-700'
          "
        >
          <Shield class="w-3.5 h-3.5" />
          {{ authStore.isAdmin ? 'Administrator' : 'Standard Member' }}
        </span>
      </div>

      <!-- Card Summary (18px radius) -->
      <div
        class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-4"
      >
        <!-- Avatar Display -->
        <div class="relative shrink-0">
          <img
            v-if="form.avatar_url"
            :src="form.avatar_url"
            alt="Avatar"
            class="w-16 h-16 rounded-full object-cover border border-gray-200"
          />
          <div
            v-else
            class="w-16 h-16 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold text-xl"
          >
            {{ userInitial }}
          </div>
        </div>

        <!-- Info Summary -->
        <div class="flex-1 text-center sm:text-left space-y-1">
          <h2 class="text-base font-bold text-gray-900">
            {{ form.full_name || 'Lovia Member' }}
          </h2>
          <p
            class="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5"
          >
            <Mail class="w-3.5 h-3.5 text-gray-400" />
            {{ authStore.user?.email }}
          </p>
          <div
            class="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 pt-1"
          >
            <span
              v-if="form.partner_name"
              class="flex items-center gap-1 text-rose-600 font-medium"
            >
              <Heart class="w-3.5 h-3.5 fill-rose-100" /> With {{ form.partner_name }}
            </span>
            <span v-if="form.anniversary_date" class="flex items-center gap-1 text-gray-400">
              <Calendar class="w-3.5 h-3.5" /> Anniversary: {{ form.anniversary_date }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit Form (18px radius) -->
      <form
        @submit.prevent="handleSaveProfile"
        class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-5"
      >
        <h3 class="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
          Personal Information
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Full Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Display / Full Name</label>
            <input
              v-model="form.full_name"
              type="text"
              placeholder="e.g. Alex Morgan"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>

          <!-- Avatar URL -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Avatar Image URL</label>
            <input
              v-model="form.avatar_url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>
        </div>

        <!-- Bio -->
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-gray-700">Short Bio / Love Note</label>
          <textarea
            v-model="form.bio"
            rows="3"
            placeholder="Write a brief personal note or romantic motto..."
            class="w-full p-3.5 rounded-[14px] border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition resize-none bg-[#f5f5f7] focus:bg-white"
          ></textarea>
        </div>

        <!-- <h3 class="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 pt-2">
          Relationship Details
        </h3> -->

        <!-- <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Partner's Name</label>
            <input
              v-model="form.partner_name"
              type="text"
              placeholder="e.g. Taylor"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Special Anniversary Date</label>
            <input
              v-model="form.anniversary_date"
              type="date"
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>
        </div> -->

        <!-- Action Submit -->
        <div class="flex items-center justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            <Save v-else class="w-3.5 h-3.5" />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  </UserLayout>
</template>
