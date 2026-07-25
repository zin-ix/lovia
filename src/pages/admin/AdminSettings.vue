<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useImageCompressor } from '@/composables/useImageCompressor'
import {
  Shield,
  Sliders,
  Bell,
  Save,
  Loader2,
  QrCode,
  Upload,
  Image as ImageIcon,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const authStore = useAuthStore()
const { toast } = useFeatherToast()
const { compressImage } = useImageCompressor()

const settingsForm = ref({ ...authStore.systemSettings })
const saving = ref(false)

async function handleQrImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    try {
      const compressed = await compressImage(file, { quality: 0.85, maxWidth: 800, maxHeight: 800 })
      const reader = new FileReader()
      reader.onload = (evt) => {
        if (evt.target?.result) {
          settingsForm.value.qr_code_url = evt.target.result as string
          toast.success({ title: 'QR image compressed & selected! Click Save to update.' })
        }
      }
      reader.readAsDataURL(compressed)
    } catch {
      const reader = new FileReader()
      reader.onload = (evt) => {
        if (evt.target?.result) {
          settingsForm.value.qr_code_url = evt.target.result as string
          toast.success({ title: 'New QR Code image selected! Click Save to update.' })
        }
      }
      reader.readAsDataURL(file)
    }
  }
}

const handleSaveSettings = () => {
  saving.value = true
  authStore.updateSystemSettings(settingsForm.value)
  setTimeout(() => {
    saving.value = false
    toast.success({ title: 'Global system settings & payment QR code updated successfully!' })
  }, 300)
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Admin System Settings</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full">
              Global Control
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Configure global application defaults, maintenance mode, and registration access.</p>
        </div>
      </div>

      <form @submit.prevent="handleSaveSettings" class="space-y-6">
        <!-- Defaults & Quotas (18px radius) -->
        <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders class="w-4 h-4 text-rose-500" />
            <h3 class="text-sm font-semibold text-gray-900">Default Quotas & Defaults</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Default User Letter Creation Limit</label>
              <input
                v-model.number="settingsForm.default_letter_limit"
                type="number"
                min="1"
                max="100"
                class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
              />
              <p class="text-[11px] text-gray-400">Quota assigned automatically to newly registered accounts.</p>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-medium text-gray-700">Default Platform UI Theme</label>
              <select
                v-model="settingsForm.default_theme"
                class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs bg-[#f5f5f7] focus:bg-white text-gray-800 focus:outline-none focus:border-rose-500 transition"
              >
                <option value="light">Apple-Inspired Minimalist Light (Recommended)</option>
                <option value="dark">Apple-Inspired Minimalist Dark</option>
                <option value="system">System Auto Detect</option>
              </select>
              <p class="text-[11px] text-gray-400">Default visual theme applied for guests & new users.</p>
            </div>
          </div>
        </div>

        <!-- Feature Flags & Access Control (18px radius) -->
        <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Shield class="w-4 h-4 text-rose-500" />
            <h3 class="text-sm font-semibold text-gray-900">Access Control & Maintenance</h3>
          </div>

          <div class="space-y-4">
            <!-- Allow Registrations -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-gray-800">Allow New User Registrations</p>
                <p class="text-[11px] text-gray-400">If disabled, public sign-ups are paused.</p>
              </div>
              <input
                v-model="settingsForm.allow_registrations"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
              />
            </div>

            <!-- Maintenance Mode -->
            <div class="flex items-center justify-between border-t border-gray-50 pt-3">
              <div>
                <p class="text-xs font-medium text-red-700">Enable Maintenance Mode</p>
                <p class="text-[11px] text-gray-400">Prevents non-admin users from creating or viewing letter contents.</p>
              </div>
              <input
                v-model="settingsForm.maintenance_mode"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Maya & GCash QR Payment Management (18px radius) -->
        <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div class="flex items-center gap-2">
              <QrCode class="w-4 h-4 text-rose-500" />
              <h3 class="text-sm font-semibold text-gray-900">Maya / GCash Payment QR Code Management</h3>
            </div>
            <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">QR Payment Mode</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- QR Code Preview & File Picker (Landscape Layout) -->
            <div class="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl gap-4">
              <div class="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs shrink-0">
                <img
                  :src="settingsForm.qr_code_url"
                  alt="Payment QR Code"
                  class="w-32 h-32 object-contain rounded-lg"
                />
              </div>
              <div class="space-y-2 text-center sm:text-left flex-1 min-w-0">
                <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block">Landscape Layout (16:9)</span>
                <p class="text-xs font-semibold text-gray-800">Payment QR Code</p>
                <label class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-full transition cursor-pointer inline-flex items-center gap-1.5">
                  <Upload class="w-3.5 h-3.5 text-rose-500" />
                  <span>Upload QR Image</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleQrImageUpload" />
                </label>
                <p class="text-[10px] text-gray-400">Supported formats: PNG, JPG, WebP</p>
              </div>
            </div>

            <!-- Payment Account Details -->
            <div class="space-y-3">
              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700">Payment Account Name</label>
                <input
                  v-model="settingsForm.payment_account_name"
                  type="text"
                  placeholder="e.g. Meljun M. (Maya/GCash)"
                  class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 transition bg-[#f5f5f7] focus:bg-white"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700">Account / Mobile Number</label>
                <input
                  v-model="settingsForm.payment_account_number"
                  type="text"
                  placeholder="e.g. 0917 123 4567"
                  class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 transition bg-[#f5f5f7] focus:bg-white"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-medium text-gray-700">QR Image Direct URL</label>
                <input
                  v-model="settingsForm.qr_code_url"
                  type="url"
                  placeholder="https://..."
                  class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 transition bg-[#f5f5f7] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Global System Announcement (18px radius) -->
        <div class="bg-white border border-black/5 rounded-[18px] p-6 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell class="w-4 h-4 text-rose-500" />
            <h3 class="text-sm font-semibold text-gray-900">System Announcement Banner</h3>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-gray-700">Banner Announcement Message</label>
            <input
              v-model="settingsForm.announcement_banner"
              type="text"
              placeholder="e.g. Welcome to Lovia — Apple-Inspired Digital Keepsakes."
              class="w-full h-10 px-3.5 rounded-full border border-gray-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-[#f5f5f7] focus:bg-white"
            />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            <Save v-else class="w-3.5 h-3.5" />
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>
