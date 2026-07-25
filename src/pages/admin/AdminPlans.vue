<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { PlanService, type Plan, type PlanUpsert } from '@/services/plan/plan.services'
import { useImageCompressor } from '@/composables/useImageCompressor'
import { useFeatherToast } from 'feather-toast-vue'
import {
  PackagePlus,
  Pencil,
  Trash2,
  RefreshCw,
  QrCode,
  Upload,
  X,
  Check,
  Loader2,
  Infinity as InfinityIcon,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  ToggleRight as ActiveIcon,
} from '@lucide/vue'

const { toast } = useFeatherToast()
const { compressImage } = useImageCompressor()

// ── State ──────────────────────────────────────────────────────────────────
const plans = ref<Plan[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingPlan = ref<Plan | null>(null)
const deleteTarget = ref<Plan | null>(null)
const deletingId = ref<string | null>(null)
const saving = ref(false)
const brokenQrIds = ref(new Set<string>())   // tracks plans with broken/missing QR image URLs

// Filter state
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

// QR image state during edit/create
const qrPreviewUrl = ref<string | null>(null)
const qrFile = ref<File | null>(null)
const qrUploading = ref(false)

// ── DataTable columns ──────────────────────────────────────────────────────
const columns: ColumnDef[] = [
  { key: 'qr_preview', label: 'QR', align: 'center', width: '60px' },
  { key: 'name', label: 'Plan Name', sortable: true },
  { key: 'slug', label: 'Slug' },
  { key: 'price_display', label: 'Price', sortable: true, align: 'right' },
  { key: 'limit_display', label: 'Letter Limit', align: 'center' },
  { key: 'account_name', label: 'Account Name' },
  { key: 'account_number', label: 'Account No.' },
  { key: 'sort_order', label: 'Order', sortable: true, align: 'center' },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

// ── Blank form ─────────────────────────────────────────────────────────────
const blankForm = (): PlanUpsert => ({
  slug: '',
  name: '',
  description: '',
  price: 0,
  letter_limit: 1,
  is_unlimited: false,
  qr_code_url: '',
  account_name: '',
  account_number: '',
  is_active: true,
  sort_order: 0,
})
const form = ref<PlanUpsert>(blankForm())

// ── Computed rows for DataTable ────────────────────────────────────────────
const filteredPlans = computed(() => {
  return plans.value
    .filter((p) => {
      if (filterStatus.value === 'active') return p.is_active
      if (filterStatus.value === 'inactive') return !p.is_active
      return true
    })
    .map((p) => ({
      ...p,
      price_display: `₱${Number(p.price).toFixed(2)}`,
      limit_display: p.is_unlimited ? '∞ Unlimited' : `${p.letter_limit} letters`,
    }))
})

const activePlansCount = computed(() => plans.value.filter((p) => p.is_active).length)
const totalRevPotential = computed(() => plans.value.reduce((s, p) => s + Number(p.price), 0))

// ── Load ───────────────────────────────────────────────────────────────────
async function loadPlans() {
  loading.value = true
  try {
    plans.value = await PlanService.fetchAllPlans()
  } finally {
    loading.value = false
  }
}
onMounted(loadPlans)

// ── Open create / edit modal ───────────────────────────────────────────────
function openCreate() {
  editingPlan.value = null
  form.value = blankForm()
  qrPreviewUrl.value = null
  qrFile.value = null
  showModal.value = true
}

function openEdit(plan: Plan) {
  editingPlan.value = plan
  form.value = {
    slug: plan.slug,
    name: plan.name,
    description: plan.description ?? '',
    price: plan.price,
    letter_limit: plan.letter_limit,
    is_unlimited: plan.is_unlimited,
    qr_code_url: plan.qr_code_url,
    account_name: plan.account_name,
    account_number: plan.account_number,
    is_active: plan.is_active,
    sort_order: plan.sort_order,
  }
  qrPreviewUrl.value = plan.qr_code_url || null
  qrFile.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPlan.value = null
  qrPreviewUrl.value = null
  qrFile.value = null
}

// ── QR Image: compress + preview locally, upload to Supabase on Save ──────
async function handleQrFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  qrUploading.value = true
  try {
    // Immediate local preview (original)
    const reader = new FileReader()
    reader.onload = (evt) => { qrPreviewUrl.value = evt.target?.result as string }
    reader.readAsDataURL(file)

    // Compress and keep for upload
    const compressed = await compressImage(file, { quality: 0.85, maxWidth: 800, maxHeight: 800 })
    const blob = compressed as Blob
    qrFile.value = compressed instanceof File
      ? compressed
      : new File([blob], file.name, { type: blob.type })

    toast.success({ title: 'QR image ready — will upload to Supabase Storage on save.' })
  } catch {
    qrFile.value = file
  } finally {
    qrUploading.value = false
  }
}

// ── Save (create / update) — uploads QR to Supabase Storage first ─────────
async function handleSave() {
  if (!form.value.name.trim() || !form.value.slug.trim()) {
    toast.error({ title: 'Plan name and slug are required.' })
    return
  }
  saving.value = true
  try {
    let qrUrl = form.value.qr_code_url

    // Upload compressed QR image to Supabase Storage if a file was selected
    if (qrFile.value) {
      qrUploading.value = true
      try {
        qrUrl = await PlanService.uploadPlanQrImage(qrFile.value, form.value.slug)
      } catch (err: any) {
        toast.error({ title: `QR upload failed: ${err.message}` })
        return
      } finally {
        qrUploading.value = false
      }
    }

    const payload: PlanUpsert = {
      ...form.value,
      qr_code_url: qrUrl,
      letter_limit: form.value.is_unlimited ? null : form.value.letter_limit,
    }

    if (editingPlan.value) {
      await PlanService.updatePlan(editingPlan.value.id, payload)
      toast.success({ title: `Plan "${form.value.name}" updated!` })
    } else {
      await PlanService.createPlan(payload)
      toast.success({ title: `Plan "${form.value.name}" created!` })
    }
    closeModal()
    await loadPlans()
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to save plan.' })
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
function requestDelete(plan: Plan) { deleteTarget.value = plan }

async function confirmDelete() {
  if (!deleteTarget.value) return
  deletingId.value = deleteTarget.value.id
  try {
    await PlanService.deletePlan(deleteTarget.value.id)
    toast.success({ title: `Plan "${deleteTarget.value.name}" deleted.` })
    deleteTarget.value = null
    await loadPlans()
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to delete plan.' })
  } finally {
    deletingId.value = null
  }
}

// ── Auto-slugify on name change (create mode only) ─────────────────────────
watch(() => form.value.name, (name) => {
  if (!editingPlan.value) {
    form.value.slug = name.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
})

function toggleUnlimited() {
  form.value.is_unlimited = !form.value.is_unlimited
  form.value.letter_limit = form.value.is_unlimited ? null : 1
}
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-6">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Plan Management</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
              <Sparkles class="w-3 h-3" /> Supabase DB
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Manage payment plans. QR images are stored in Supabase Storage. Changes reflect instantly in the user-facing Pricing modal.
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="loadPlans"
            class="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-full transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" /> Refresh
          </button>
          <button
            @click="openCreate"
            class="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PackagePlus class="w-3.5 h-3.5" /> Add Plan
          </button>
        </div>
      </div>

      <!-- KPI Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-rose-50 text-rose-500 rounded-full shrink-0">
            <PackagePlus class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Plans</p>
            <h3 class="text-xl font-bold text-gray-900">{{ plans.length }}</h3>
          </div>
        </div>
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <Check class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Active Plans</p>
            <h3 class="text-xl font-bold text-gray-900">{{ activePlansCount }}</h3>
          </div>
        </div>
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-amber-50 text-amber-600 rounded-full shrink-0">
            <DollarSign class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Revenue Potential</p>
            <h3 class="text-xl font-bold text-gray-900">₱{{ totalRevPotential.toFixed(2) }}</h3>
          </div>
        </div>
      </div>

      <!-- Plans DataTable -->
      <DataTable
        :columns="columns"
        :items="filteredPlans"
        :loading="loading"
        search-placeholder="Search plan name, slug, account…"
        empty-text="No plans found. Click 'Add Plan' to create one."
      >
        <!-- Filter pills in actions slot -->
        <template #actions>
          <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-full text-xs font-semibold shrink-0">
            <button
              @click="filterStatus = 'all'"
              class="px-3 py-1 rounded-full transition cursor-pointer"
              :class="filterStatus === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
            >All ({{ plans.length }})</button>
            <button
              @click="filterStatus = 'active'"
              class="px-3 py-1 rounded-full transition cursor-pointer"
              :class="filterStatus === 'active' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
            >Active ({{ activePlansCount }})</button>
            <button
              @click="filterStatus = 'inactive'"
              class="px-3 py-1 rounded-full transition cursor-pointer"
              :class="filterStatus === 'inactive' ? 'bg-gray-600 text-white shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
            >Inactive ({{ plans.length - activePlansCount }})</button>
          </div>
        </template>

        <!-- QR thumbnail -->
        <template #cell-qr_preview="{ item }">
          <div class="flex justify-center">
            <div class="w-9 h-9 bg-rose-50 border border-rose-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                v-if="item.qr_code_url && !brokenQrIds.has(item.id)"
                :src="item.qr_code_url"
                alt="QR"
                class="w-full h-full object-contain p-0.5"
                @error="brokenQrIds.add(item.id)"
              />
              <QrCode v-else class="w-4 h-4 text-rose-300" />
            </div>
          </div>
        </template>

        <!-- Plan name -->
        <template #cell-name="{ value }">
          <span class="font-semibold text-gray-900 text-xs">{{ value }}</span>
        </template>

        <!-- Slug -->
        <template #cell-slug="{ value }">
          <span class="font-mono text-[11px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">{{ value }}</span>
        </template>

        <!-- Price -->
        <template #cell-price_display="{ value }">
          <span class="font-bold text-rose-600 text-xs">{{ value }}</span>
        </template>

        <!-- Limit display -->
        <template #cell-limit_display="{ item, value }">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            :class="item.is_unlimited ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'"
          >
            <InfinityIcon v-if="item.is_unlimited" class="w-3 h-3" />
            {{ value }}
          </span>
        </template>

        <!-- Account name -->
        <template #cell-account_name="{ value }">
          <span class="text-xs text-gray-700 font-medium truncate max-w-[140px] block">{{ value }}</span>
        </template>

        <!-- Account number -->
        <template #cell-account_number="{ value }">
          <span class="font-mono text-xs text-gray-700">{{ value }}</span>
        </template>

        <!-- Sort order -->
        <template #cell-sort_order="{ value }">
          <span class="text-xs text-gray-500 font-medium">{{ value }}</span>
        </template>

        <!-- Status badge -->
        <template #cell-status="{ item }">
          <span
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
            :class="item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active ? 'bg-emerald-500' : 'bg-gray-400'" />
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </span>
        </template>

        <!-- Actions -->
        <template #cell-actions="{ item }">
          <div class="flex items-center justify-end gap-1.5">
            <button
              @click="openEdit(item)"
              class="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition cursor-pointer"
            >
              <Pencil class="w-3 h-3" /> Edit
            </button>
            <button
              @click="requestDelete(item)"
              class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition cursor-pointer"
              title="Delete plan"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- ── Create / Edit Modal ──────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="w-full max-w-xl bg-white rounded-[24px] shadow-2xl border border-rose-100 relative my-8 animate-in fade-in-0 zoom-in-95 duration-200">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 class="text-base font-bold text-gray-900">
                {{ editingPlan ? 'Edit Plan' : 'Create New Plan' }}
              </h2>
              <p class="text-[11px] text-gray-400 mt-0.5">
                QR images compress &amp; upload to Supabase Storage on save.
              </p>
            </div>
            <button @click="closeModal" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form -->
          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            <!-- Name & Slug -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Plan Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="e.g. Single Keepsake Pass"
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition bg-gray-50 focus:bg-white"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Slug * <span class="normal-case font-normal text-gray-400">(auto)</span></label>
                <input
                  v-model="form.slug"
                  type="text"
                  placeholder="single-keepsake-pass"
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Short description shown to users…"
                class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            <!-- Price & Letter Limit -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Price (₱)</label>
                <input
                  v-model.number="form.price"
                  type="number" min="0" step="0.01" placeholder="59.00"
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 transition bg-gray-50 focus:bg-white"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Letter Limit</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="form.letter_limit"
                    type="number" min="1" placeholder="1"
                    :disabled="form.is_unlimited"
                    class="flex-1 h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 transition bg-gray-50 focus:bg-white disabled:opacity-40"
                  />
                  <button
                    type="button" @click="toggleUnlimited"
                    :title="form.is_unlimited ? 'Switch to limited' : 'Switch to unlimited'"
                    class="shrink-0 h-9 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    :class="form.is_unlimited ? 'bg-rose-500 text-white border-rose-500' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
                  >
                    <InfinityIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p v-if="form.is_unlimited" class="text-[10px] text-rose-500 font-semibold">Unlimited letters mode</p>
              </div>
            </div>

            <!-- Account Name & Number -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Account Name</label>
                <input
                  v-model="form.account_name" type="text" placeholder="LOVIA KEEPSAKES (Maya)"
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 transition bg-gray-50 focus:bg-white"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Mobile / Account No.</label>
                <input
                  v-model="form.account_number" type="text" placeholder="0917 123 4567"
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 transition bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <!-- Sort Order & Status -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Display Order</label>
                <input
                  v-model.number="form.sort_order" type="number" min="0" placeholder="0"
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 transition bg-gray-50 focus:bg-white"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Status</label>
                <button
                  type="button" @click="form.is_active = !form.is_active"
                  class="w-full h-9 px-3.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-2"
                  :class="form.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'"
                >
                  <ToggleRight v-if="form.is_active" class="w-4 h-4 text-emerald-500" />
                  <ToggleLeft v-else class="w-4 h-4 text-gray-400" />
                  {{ form.is_active ? 'Active (visible to users)' : 'Inactive (hidden)' }}
                </button>
              </div>
            </div>

            <!-- QR Code Image Upload ──────────────────────────────────────── -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                QR Code Image
                <span class="normal-case font-normal text-gray-400 ml-1">— compressed &amp; saved to Supabase Storage on save</span>
              </label>

              <div class="flex items-center gap-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                <!-- QR Preview -->
                <div class="shrink-0 w-20 h-20 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                  <img v-if="qrPreviewUrl" :src="qrPreviewUrl" alt="QR Preview" class="w-full h-full object-contain p-1" />
                  <QrCode v-else class="w-7 h-7 text-gray-300" />
                </div>
                <div class="flex-1 space-y-2">
                  <label class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition cursor-pointer">
                    <Upload class="w-3.5 h-3.5" />
                    <span>{{ qrUploading ? 'Compressing…' : 'Upload QR Image' }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="handleQrFileChange" :disabled="qrUploading" />
                  </label>
                  <p class="text-[10px] text-gray-400">PNG, JPG, WebP · Auto-compressed · Uploaded to Supabase Storage</p>
                  <p v-if="qrFile" class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check class="w-3 h-3" /> File ready — will upload on Save
                  </p>
                </div>
              </div>

              <!-- URL fallback -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Or paste a QR Image URL directly</label>
                <input
                  v-model="form.qr_code_url" type="url" placeholder="https://..."
                  class="w-full h-9 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-400 transition bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-6 pb-6 pt-4 border-t border-gray-100">
            <button
              @click="closeModal"
              class="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >Cancel</button>
            <button
              @click="handleSave"
              :disabled="saving || qrUploading"
              class="px-5 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Loader2 v-if="saving || qrUploading" class="w-3.5 h-3.5 animate-spin" />
              <Check v-else class="w-3.5 h-3.5" />
              {{ saving ? (qrUploading ? 'Uploading QR…' : 'Saving…') : editingPlan ? 'Save Changes' : 'Create Plan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      :open="!!deleteTarget"
      title="Delete Plan?"
      :description="`Permanently delete '${deleteTarget?.name}'? This cannot be undone.`"
      confirm-text="Delete"
      variant="destructive"
      :loading="!!deletingId"
      @update:open="(v) => { if (!v) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </AdminLayout>
</template>
