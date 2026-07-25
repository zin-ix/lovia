<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import { PaymentService, type PaymentRecord } from '@/services/payment/payment.services'
import {
  CreditCard,
  QrCode,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Filter,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const { toast } = useFeatherToast()
const loading = ref(false)
const rawPayments = ref<PaymentRecord[]>([])
const activeScreenshotUrl = ref<string | null>(null)
const selectedFilter = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')

let realtimeUnsub: (() => void) | null = null

async function loadPayments() {
  loading.value = true
  try {
    const data = await PaymentService.fetchAllPayments()
    rawPayments.value = data || []
  } catch (err: any) {
    console.error('Error fetching payments:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPayments()
  realtimeUnsub = PaymentService.subscribeToPayments((payload) => {
    loadPayments()
    if (payload.eventType === 'INSERT') {
      toast.success({ title: `⚡ Realtime: New payment proof submitted (${payload.new?.ref_number})!` })
    }
  })
})

onUnmounted(() => {
  if (realtimeUnsub) realtimeUnsub()
})

const columns: ColumnDef[] = [
  { key: 'ref_no', label: 'Ref No. / ID', sortable: true },
  { key: 'customer', label: 'Customer Email', sortable: true },
  { key: 'plan', label: 'Requested Plan', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { key: 'gateway', label: 'Method', align: 'center' },
  { key: 'proof_url', label: 'Receipt Proof', align: 'center' },
  { key: 'status', label: 'Verification', align: 'center' },
  { key: 'created_at', label: 'Date Submitted', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const formattedPayments = computed(() => {
  return rawPayments.value
    .filter((p) => selectedFilter.value === 'all' || p.status === selectedFilter.value)
    .map((p) => ({
      id: p.id,
      user_id: p.user_id,
      ref_no: p.ref_number,
      customer: p.profiles?.email || 'User ID: ' + p.user_id.slice(0, 8),
      plan: p.plan_name,
      amount: '₱' + Number(p.amount).toFixed(2),
      raw_amount: p.amount,
      gateway: p.payment_method,
      status: p.status,
      proof_url: p.proof_url,
      created_at: new Date(p.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))
})

const pendingCount = computed(() => rawPayments.value.filter((p) => p.status === 'pending').length)
const approvedCount = computed(() => rawPayments.value.filter((p) => p.status === 'approved').length)
const rejectedCount = computed(() => rawPayments.value.filter((p) => p.status === 'rejected').length)
const totalApprovedRevenue = computed(() =>
  rawPayments.value
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0)
)

async function handleApprove(item: any) {
  try {
    await PaymentService.approvePayment(item.id, item.user_id, item.plan, item.raw_amount || 59.0)
    toast.success({ title: `Payment ${item.ref_no} approved! User upgraded successfully.` })
    await loadPayments()
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to approve payment' })
  }
}

async function handleReject(item: any) {
  try {
    await PaymentService.rejectPayment(item.id, 'Receipt verification failed by admin')
    toast.error({ title: `Payment ${item.ref_no} rejected.` })
    await loadPayments()
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to reject payment' })
  }
}
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Payment Verification & Receipts</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <QrCode class="w-3 h-3" /> Live Realtime Sync
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Review QR code receipts uploaded by customers and approve upgrades in real time.</p>
        </div>

        <button
          @click="loadPayments"
          class="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-full transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" /> Refresh
        </button>
      </div>

      <!-- KPI Stat Badges Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <DollarSign class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Verified Revenue</p>
            <h3 class="text-xl font-bold text-gray-900">₱{{ totalApprovedRevenue.toFixed(2) }}</h3>
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-amber-50 text-amber-600 rounded-full shrink-0">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Pending Review</p>
            <h3 class="text-xl font-bold text-gray-900">{{ pendingCount }} {{ pendingCount === 1 ? 'Proof' : 'Proofs' }}</h3>
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-rose-50 text-rose-600 rounded-full shrink-0">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Approved Payments</p>
            <h3 class="text-xl font-bold text-gray-900">{{ approvedCount }}</h3>
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-gray-100 text-gray-500 rounded-full shrink-0">
            <XCircle class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Rejected Submissions</p>
            <h3 class="text-xl font-bold text-gray-900">{{ rejectedCount }}</h3>
          </div>
        </div>
      </div>

      <!-- Verification Queue Table Container -->
      <div class="space-y-3 pt-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-gray-900">Payment Verification Queue</h2>
            <span class="text-xs text-gray-400">({{ formattedPayments.length }} submissions)</span>
          </div>

          <!-- Status Filter Pills -->
          <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-full text-xs font-semibold shrink-0">
            <button
              @click="selectedFilter = 'all'"
              class="px-3 py-1 rounded-full transition cursor-pointer"
              :class="selectedFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
            >
              All ({{ rawPayments.length }})
            </button>
            <button
              @click="selectedFilter = 'pending'"
              class="px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1"
              :class="selectedFilter === 'pending' ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
            >
              <Clock class="w-3 h-3" /> Pending ({{ pendingCount }})
            </button>
            <button
              @click="selectedFilter = 'approved'"
              class="px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1"
              :class="selectedFilter === 'approved' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
            >
              <CheckCircle2 class="w-3 h-3" /> Approved ({{ approvedCount }})
            </button>
          </div>
        </div>

        <DataTable
          :columns="columns"
          :items="formattedPayments"
          :loading="loading"
          search-placeholder="Search Reference No, Customer Email..."
          empty-text="No payment proofs match your current filter."
        >
          <!-- Ref No Cell -->
          <template #cell-ref_no="{ value }">
            <span class="font-mono font-bold text-gray-900 text-xs">{{ value }}</span>
          </template>

          <!-- Customer Cell -->
          <template #cell-customer="{ value }">
            <span class="font-medium text-gray-800 text-xs">{{ value }}</span>
          </template>

          <!-- Plan Cell -->
          <template #cell-plan="{ value }">
            <span class="font-semibold text-rose-600 text-xs">{{ value }}</span>
          </template>

          <!-- Amount Cell -->
          <template #cell-amount="{ value }">
            <span class="font-bold text-gray-900 text-xs">{{ value }}</span>
          </template>

          <!-- Gateway Cell -->
          <template #cell-gateway="{ value }">
            <span class="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded-full">
              {{ value }}
            </span>
          </template>

          <!-- Receipt Proof Cell -->
          <template #cell-proof_url="{ item }">
            <button
              @click="activeScreenshotUrl = item.proof_url"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition cursor-pointer"
            >
              <ImageIcon class="w-3.5 h-3.5 text-rose-500" />
              <span>View Receipt</span>
            </button>
          </template>

          <!-- Verification Cell -->
          <template #cell-status="{ value }">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase"
              :class="{
                'bg-amber-100 text-amber-700': value === 'pending',
                'bg-emerald-100 text-emerald-700': value === 'approved',
                'bg-red-100 text-red-700': value === 'rejected',
              }"
            >
              <Clock v-if="value === 'pending'" class="w-3 h-3" />
              <CheckCircle2 v-else-if="value === 'approved'" class="w-3 h-3" />
              <XCircle v-else class="w-3 h-3" />
              {{ value }}
            </span>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <div class="flex items-center justify-end gap-1.5" v-if="item.status === 'pending'">
              <button
                @click="handleApprove(item)"
                class="flex items-center gap-1 px-3 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition shadow-2xs cursor-pointer"
              >
                <Check class="w-3 h-3" /> Approve
              </button>
              <button
                @click="handleReject(item)"
                class="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition cursor-pointer"
                title="Reject Payment"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <span v-else class="text-[11px] text-gray-400 font-medium capitalize">{{ item.status }}</span>
          </template>
        </DataTable>
      </div>

    </div>

    <!-- Receipt Screenshot Full View Modal -->
    <!-- Receipt Screenshot Modal (Shadcn Dialog Pop) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activeScreenshotUrl"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        @click.self="activeScreenshotUrl = null"
      >
        <Transition
          appear
          enter-active-class="transition duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in transform"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div class="w-full max-w-lg bg-white rounded-2xl p-4 space-y-3 relative shadow-2xl">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 class="text-xs font-bold text-gray-900">Payment Receipt Screenshot</h4>
              <button @click="activeScreenshotUrl = null" class="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer">
                <X class="w-4 h-4" />
              </button>
            </div>
            <img :src="activeScreenshotUrl" alt="Payment Proof Full" class="w-full max-h-[70vh] object-contain rounded-xl border border-gray-200" />
          </div>
        </Transition>
      </div>
    </Transition>
  </AdminLayout>
</template>
