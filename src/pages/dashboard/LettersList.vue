<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import UserLayout from '@/layouts/UserLayout.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import PricingModal from '@/components/common/PricingModal.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLetterStore } from '@/stores/letter/letter.store'
import LetterQrModal from '@/components/common/LetterQrModal.vue'
import {
  PlusCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Trash2,
  Pencil,
  Mail,
  Sparkles,
  Loader2,
  Link as LinkIcon,
  QrCode,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const authStore = useAuthStore()
const letterStore = useLetterStore()
const { toast } = useFeatherToast()

const copiedSlug = ref<string | null>(null)
const letters = computed(() => letterStore.letters)
const loading = computed(() => letterStore.loading)
const activeCount = computed(() => letters.value.filter((l) => l.is_active).length)
const maxLimit = computed(() => authStore.profile?.letter_limit || 2)
const showUpgradeModal = ref(false)

// Landscape QR Keepsake Modal state
const showQrModal = ref(false)
const selectedQrLetter = ref<any>(null)

function openQrCard(letter: any) {
  selectedQrLetter.value = letter
  showQrModal.value = true
}

// Confirmation dialog state for deleting a letter
const deleteDialogOpen = ref(false)
const selectedDeleteId = ref<string | null>(null)
const deleting = ref(false)

import { PaymentService } from '@/services/payment/payment.services'

let profileUnsub: (() => void) | null = null

async function loadData() {
  if (!authStore.user?.id) return
  await letterStore.fetchUserLetters(authStore.user.id)
  try {
    await authStore.getProfile(authStore.user.id)
  } catch {
    /* keep default */
  }
}

onMounted(async () => {
  if (authStore.user?.id) {
    await loadData()
    profileUnsub = PaymentService.subscribeToUserProfile(authStore.user.id, () => {
      if (authStore.user?.id) authStore.getProfile(authStore.user.id)
      toast.success({ title: '🎉 Realtime: Your payment was approved! Your plan has been upgraded.' })
    })
  } else {
    // If auth is resolving asynchronously, get session then load
    try {
      await authStore.getSession()
      if (authStore.user?.id) {
        await loadData()
      }
    } catch {
      /* ignore */
    }
  }
})

watch(
  () => authStore.user?.id,
  async (newId) => {
    if (newId) {
      await loadData()
    }
  }
)

onUnmounted(() => {
  if (profileUnsub) profileUnsub()
})

const getShareUrl = (slug: string) => `${window.location.origin}/l/${slug}`

const copyShareUrl = async (slug: string) => {
  try {
    await navigator.clipboard.writeText(getShareUrl(slug))
    copiedSlug.value = slug
    toast.success({ title: 'Letter link copied to clipboard!' })
    setTimeout(() => (copiedSlug.value = null), 2000)
  } catch (err) {
    toast.error({ title: 'Failed to copy link' })
  }
}

const promptDelete = (id: string) => {
  selectedDeleteId.value = id
  deleteDialogOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!selectedDeleteId.value) return
  deleting.value = true
  try {
    await letterStore.deleteLetter(selectedDeleteId.value)
    toast.success({ title: 'Letter deleted successfully' })
    deleteDialogOpen.value = false
    selectedDeleteId.value = null
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to delete letter' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UserLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">My Letters</h1>
          <p class="text-xs text-gray-500 mt-1">Create and share interactive digital keepsake letters.</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full font-medium flex items-center gap-1.5"
          >
            <Sparkles class="w-3.5 h-3.5 text-rose-500" />
            {{ activeCount }} / {{ maxLimit }} Used
          </span>
          <router-link
            to="/dashboard/create"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full transition shadow-xs"
          >
            <PlusCircle class="w-4 h-4" />
            New Letter
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-20 flex flex-col items-center gap-2 text-gray-400">
        <Loader2 class="w-6 h-6 animate-spin text-rose-500" />
        <p class="text-xs font-medium text-gray-500">Loading your letters...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="letters.length === 0"
        class="bg-white border border-black/5 rounded-[18px] p-10 text-center max-w-md mx-auto mt-8 space-y-3"
      >
        <div
          class="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto"
        >
          <Mail class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-gray-900">No letters composed yet</h3>
        <p class="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
          Create your first interactive digital letter complete with 3D envelopes, timeline milestones, and background music.
        </p>
        <div class="flex items-center justify-center gap-2">
          <!-- Upgrade button -->
          <button
            @click="showUpgradeModal = true"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Upgrade Plan</span>
          </button>

          <router-link
            to="/dashboard/create"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-semibold shadow-2xs transition shrink-0"
            :class="{ 'opacity-50 pointer-events-none': activeCount >= maxLimit }"
          >
            <PlusCircle class="w-3.5 h-3.5" />
            <span>Create New Letter</span>
          </router-link>
        </div>
      </div>

      <!-- Apple-Inspired 18px Radius Grid Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="letter in letters"
          :key="letter.id"
          class="bg-white border border-black/5 rounded-[18px] hover:border-rose-200 transition-all duration-200 flex flex-col group overflow-hidden"
        >
          <div class="p-5 pb-3 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-rose-500">
                  RECIPIENT: {{ letter.recipient_name }}
                </span>
                <h3 class="text-base font-bold text-gray-900 truncate mt-0.5 group-hover:text-rose-500 transition">
                  {{ letter.title }}
                </h3>
              </div>
              <span
                class="text-[11px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-medium"
              >
                <Eye class="w-3 h-3 text-gray-400" /> {{ letter.view_count || 0 }}
              </span>
            </div>
          </div>

          <!-- Share Link Box -->
          <div class="px-5 pb-3">
            <div
              class="flex items-center bg-[#f5f5f7] border border-gray-200 rounded-full overflow-hidden"
            >
              <div class="flex items-center gap-1.5 px-3.5 py-1.5 min-w-0 flex-1">
                <LinkIcon class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span class="text-[11px] text-gray-600 font-mono truncate">{{
                  getShareUrl(letter.slug)
                }}</span>
              </div>
              <button
                @click="copyShareUrl(letter.slug)"
                class="px-3.5 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 border-l border-gray-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <component :is="copiedSlug === letter.slug ? Check : Copy" class="w-3.5 h-3.5" />
                {{ copiedSlug === letter.slug ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Card Actions Footer -->
          <div
            class="mt-auto px-5 py-3 border-t border-black/5 bg-[#f5f5f7]/50 flex items-center justify-between"
          >
            <router-link
              :to="`/l/${letter.slug}`"
              target="_blank"
              class="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1 transition"
            >
              <ExternalLink class="w-3.5 h-3.5" /> View Preview
            </router-link>
            <div class="flex items-center gap-1">
              <button
                @click="openQrCard(letter)"
                class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Landscape QR Card"
              >
                <QrCode class="w-3 h-3 text-rose-500" />
                <span>Landscape QR</span>
              </button>
              <router-link
                :to="`/dashboard/edit/${letter.id}`"
                class="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition"
                title="Edit Letter"
              >
                <Pencil class="w-4 h-4" />
              </router-link>
              <button
                @click="promptDelete(letter.id)"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                title="Delete Letter"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Landscape Letter QR Keepsake Modal -->
    <LetterQrModal
      v-model:open="showQrModal"
      :letter="selectedQrLetter"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      title="Delete Letter Keepsake?"
      description="Are you sure you want to delete this letter? This action cannot be undone."
      confirm-text="Delete Letter"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />

    <!-- Upgrade / Pricing Modal -->
    <PricingModal
      v-model:open="showUpgradeModal"
      :user-limit="maxLimit"
    />
  </UserLayout>
</template>
