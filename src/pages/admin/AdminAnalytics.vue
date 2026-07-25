<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import InteractiveAreaChart from '@/components/admin/InteractiveAreaChart.vue'
import { LetterService } from '@/services/letter/letter.services'
import { PaymentService, type PaymentRecord } from '@/services/payment/payment.services'
import type { Letter } from '@/types/letter.types'
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CreditCard,
  Sparkles,
  Eye,
  Lock,
  Globe,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from '@lucide/vue'
import { BUILTIN_TEMPLATES } from '@/data/templates.data'

const loading = ref(false)
const platformLetters = ref<Letter[]>([])
const paymentLogs = ref<PaymentRecord[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const [lettersData, paymentsData] = await Promise.all([
      LetterService.getUserLetters(''),
      PaymentService.fetchAllPayments(),
    ])
    platformLetters.value = lettersData || []
    paymentLogs.value = paymentsData || []
  } catch (err: any) {
    console.error('Error fetching admin analytics:', err)
  } finally {
    loading.value = false
  }
})

// ── Computed Analytics Metrics ──
const totalRevenue = computed(() =>
  paymentLogs.value
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0)
)

const pendingPaymentsCount = computed(() =>
  paymentLogs.value.filter((p) => p.status === 'pending').length
)

const totalLettersCount = computed(() => platformLetters.value.length)

const totalViewsCount = computed(() =>
  platformLetters.value.reduce((sum, l) => sum + (l.view_count || 0), 0)
)

const privateLettersCount = computed(() =>
  platformLetters.value.filter((l) => l.content?.passcode).length
)

const publicLettersCount = computed(() =>
  platformLetters.value.filter((l) => !l.content?.passcode).length
)

// Template Usage Statistics
const templateStats = computed(() => {
  const counts: Record<string, number> = {}
  platformLetters.value.forEach((l) => {
    const slug = l.template_slug || l.template_id || l.content?.templateSlug || 'romantic-rose'
    counts[slug] = (counts[slug] || 0) + 1
  })

  return BUILTIN_TEMPLATES.map((tpl) => ({
    name: tpl.name,
    color: tpl.theme_config.accent || '#f43f5e',
    count: counts[tpl.slug] || 0,
  })).sort((a, b) => b.count - a.count)
})

const maxTemplateCount = computed(() => {
  const max = Math.max(...templateStats.value.map((t) => t.count))
  return max > 0 ? max : 1
})
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-6">
      
      <!-- Analytics Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Analytics & Revenue Intelligence</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <BarChart3 class="w-3 h-3" /> Live Insights
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Real-time keepsake engagement, template performance, and revenue overview.</p>
        </div>

        <!-- Quick Action: Go to Payment Verification Page -->
        <router-link
          to="/admin/payments"
          class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-semibold shadow-2xs transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <CreditCard class="w-4 h-4" />
          <span>Verify Payments</span>
          <span
            v-if="pendingPaymentsCount > 0"
            class="px-1.5 py-0.5 bg-white text-rose-600 text-[10px] font-extrabold rounded-full animate-pulse"
          >
            {{ pendingPaymentsCount }}
          </span>
          <ArrowUpRight class="w-3.5 h-3.5 opacity-80" />
        </router-link>
      </div>

      <!-- KPI Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Verified Revenue</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">₱{{ totalRevenue.toFixed(2) }}</h3>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp class="w-3 h-3" /> Maya & GCash QR
            </p>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <DollarSign class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Keepsakes</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ totalLettersCount }}</h3>
            <p class="text-[10px] text-gray-400 mt-1">Created letters</p>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
            <Layers class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Guest Views</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ totalViewsCount }}</h3>
            <p class="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-0.5">
              <Eye class="w-3 h-3" /> Public & Private
            </p>
          </div>
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <Eye class="w-5 h-5" />
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p class="text-[11px] font-medium text-gray-400">Passcode Protected</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-0.5">{{ privateLettersCount }}</h3>
            <p class="text-[10px] text-gray-400 mt-1">Private keepsakes</p>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <Lock class="w-5 h-5" />
          </div>
        </div>

      </div>

      <!-- ── Visual Interactive Area Chart ── -->
      <InteractiveAreaChart />

      <!-- Analytics Breakdown Grid (Template Popularity & Privacy Ratio) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Template Popularity Breakdown -->
        <div class="bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 class="text-sm font-bold text-gray-900">Template Popularity</h3>
              <p class="text-[11px] text-gray-400">Most selected love letter designs</p>
            </div>
            <Sparkles class="w-4 h-4 text-rose-500" />
          </div>

          <div class="space-y-3">
            <div v-for="tpl in templateStats" :key="tpl.name" class="space-y-1">
              <div class="flex items-center justify-between text-xs font-medium">
                <span class="text-gray-700 font-semibold">{{ tpl.name }}</span>
                <span class="text-gray-400 text-[11px]">
                  {{ totalLettersCount ? Math.round((tpl.count / totalLettersCount) * 100) : 0 }}% ({{ tpl.count }})
                </span>
              </div>
              <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: (tpl.count / maxTemplateCount) * 100 + '%',
                    backgroundColor: tpl.color,
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy & Access Security Stats -->
        <div class="bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div class="space-y-1 border-b border-gray-100 pb-3">
            <h3 class="text-sm font-bold text-gray-900">Keepsake Privacy Distribution</h3>
            <p class="text-[11px] text-gray-400">Ratio of public vs password protected letters</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center space-y-1">
              <Globe class="w-5 h-5 text-emerald-600 mx-auto" />
              <p class="text-xs font-bold text-gray-800">Public Letters</p>
              <h4 class="text-xl font-extrabold text-emerald-700">{{ publicLettersCount }}</h4>
              <p class="text-[10px] text-gray-400">Direct URL access</p>
            </div>

            <div class="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-center space-y-1">
              <Lock class="w-5 h-5 text-amber-600 mx-auto" />
              <p class="text-xs font-bold text-gray-800">Private Letters</p>
              <h4 class="text-xl font-extrabold text-amber-700">{{ privateLettersCount }}</h4>
              <p class="text-[10px] text-gray-400">Passcode protected</p>
            </div>
          </div>

          <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-gray-500" />
              <span class="font-medium text-gray-600">Average Views Per Letter</span>
            </div>
            <span class="font-bold text-gray-900">
              {{ totalLettersCount ? (totalViewsCount / totalLettersCount).toFixed(1) : '0' }} views
            </span>
          </div>
        </div>

      </div>

    </div>
  </AdminLayout>
</template>
