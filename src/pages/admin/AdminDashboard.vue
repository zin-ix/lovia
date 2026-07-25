<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import InteractiveAreaChart from '@/components/admin/InteractiveAreaChart.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { LetterService } from '@/services/letter/letter.services'
import type { Letter } from '@/types/letter.types'
import {
  Users,
  ShieldCheck,
  Mail,
  Eye,
  CreditCard,
  Trash2,
  ExternalLink,
  Lock,
  Globe,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const authStore = useAuthStore()
const { toast } = useFeatherToast()

const loading = ref(false)
const platformLetters = ref<Letter[]>([])

// Delete Letter Dialog state
const deleteDialogOpen = ref(false)
const letterToDeleteId = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    await authStore.fetchAdminUsers()
    const data = await LetterService.getUserLetters('')
    platformLetters.value = data || []
  } catch {
    // Graceful fallback
  } finally {
    loading.value = false
  }
})

// ── Letter Columns for Overview DataTable ──
const letterColumns: ColumnDef[] = [
  { key: 'title', label: 'Keepsake Title & Recipient', sortable: true },
  { key: 'privacy', label: 'Privacy', align: 'center' },
  { key: 'views', label: 'Views', sortable: true, align: 'center' },
  { key: 'created_at', label: 'Created Date', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const totalUsersCount = computed(() => authStore.adminUsersList.length)
const adminCount = computed(() => authStore.adminUsersList.filter((u) => u.role === 'admin').length)
const totalLettersCount = computed(() => platformLetters.value.length)
const totalViewsCount = computed(() => platformLetters.value.reduce((acc, l) => acc + (l.view_count || 0), 0))
const recentLetters = computed(() => platformLetters.value.slice(0, 5))

const confirmDeleteLetter = (id: string) => {
  letterToDeleteId.value = id
  deleteDialogOpen.value = true
}

const handleDeleteLetter = async () => {
  if (!letterToDeleteId.value) return
  try {
    await LetterService.deleteLetter(letterToDeleteId.value)
    platformLetters.value = platformLetters.value.filter((l) => l.id !== letterToDeleteId.value)
    toast.success({ title: 'Letter removed from platform' })
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to delete letter' })
  } finally {
    deleteDialogOpen.value = false
    letterToDeleteId.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-6">
      <!-- Apple-style Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Dashboard Overview</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <ShieldCheck class="w-3 h-3 text-rose-600" /> Root Console
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">High-level platform activity, letter keepsakes, and performance metrics.</p>
        </div>

        <div class="flex items-center gap-2">
          <router-link
            to="/admin/users"
            class="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition"
          >
            <Users class="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </router-link>
          <router-link
            to="/admin/analytics"
            class="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full transition shadow-2xs"
          >
            <TrendingUp class="w-3.5 h-3.5" />
            <span>Analytics</span>
          </router-link>
        </div>
      </div>

      <!-- Overview Metric Cards (Apple-inspired 18px radius) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Users</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ totalUsersCount }}</h3>
            <p class="text-[10px] text-gray-400 mt-1">{{ adminCount }} admins</p>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
            <Users class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Keepsakes</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ totalLettersCount }}</h3>
            <p class="text-[10px] text-gray-400 mt-1">Created letters</p>
          </div>
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <Mail class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Guest Views</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ totalViewsCount }}</h3>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp class="w-3 h-3" /> High engagement
            </p>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <Eye class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Payment Gateway</p>
            <h3 class="text-base font-bold text-amber-600 mt-1">QR Code Payment Ready</h3>
            <p class="text-[10px] text-gray-400 mt-1">Maya / GCash Manual Proof</p>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <CreditCard class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- ── Visual Interactive Area Chart ── -->
      <InteractiveAreaChart />

      <!-- Quick Action Cards Banner -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Quick Nav Card 1 -->
        <router-link
          to="/admin/users"
          class="bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div class="flex items-center gap-3.5">
            <div class="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-105 transition-transform">
              <Users class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors">User Management</h4>
              <p class="text-xs text-gray-400 mt-0.5">Review registered users, update roles, and manage letter allowances.</p>
            </div>
          </div>
          <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
        </router-link>

        <!-- Quick Nav Card 2 -->
        <router-link
          to="/admin/analytics"
          class="bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div class="flex items-center gap-3.5">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-105 transition-transform">
              <Activity class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Analytics & Monetization</h4>
              <p class="text-xs text-gray-400 mt-0.5">View payment logs, keepsake performance, and conversion metrics.</p>
            </div>
          </div>
          <ArrowRight class="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
        </router-link>
      </div>

      <!-- Reusable DataTable: Recent Keepsakes -->
      <div class="space-y-2 pt-2">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-sm font-bold text-gray-900">Recent Platform Keepsakes</h2>
          <router-link to="/admin/analytics" class="text-xs text-rose-600 font-semibold hover:underline">View full analytics &rarr;</router-link>
        </div>

        <DataTable
          :columns="letterColumns"
          :items="platformLetters"
          :loading="loading"
          search-placeholder="Search letter title, recipient..."
          empty-text="No keepsakes created yet."
        >
          <!-- Title Cell -->
          <template #cell-title="{ item }">
            <div>
              <p class="font-bold text-gray-900 text-xs">{{ item.title || 'Untitled Letter' }}</p>
              <p class="text-[11px] text-gray-400">For: {{ item.recipient_name }}</p>
            </div>
          </template>

          <!-- Privacy Cell -->
          <template #cell-privacy="{ item }">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full"
              :class="item.content?.passcode ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'"
            >
              <component :is="item.content?.passcode ? Lock : Globe" class="w-3 h-3" />
              {{ item.content?.passcode ? 'Private' : 'Public' }}
            </span>
          </template>

          <!-- Views Cell -->
          <template #cell-views="{ value }">
            <span class="font-bold text-gray-800">{{ value || 0 }}</span>
          </template>

          <!-- Created Date Cell -->
          <template #cell-created_at="{ value }">
            <span class="text-gray-500 text-[11px]">
              {{ value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}
            </span>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="flex items-center justify-end gap-1.5">
              <router-link
                :to="`/l/${item.slug}`"
                target="_blank"
                class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
                title="View Letter Keepsake"
              >
                <ExternalLink class="w-3.5 h-3.5" />
              </router-link>
              <button
                @click="confirmDeleteLetter(item.id)"
                class="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                title="Delete Letter"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Delete Letter Dialog -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      title="Remove Platform Letter?"
      description="Are you sure you want to remove this letter keepsake from the platform? This action cannot be undone."
      confirm-text="Delete Letter"
      @update:open="deleteDialogOpen = $event"
      @confirm="handleDeleteLetter"
    />
  </AdminLayout>
</template>
