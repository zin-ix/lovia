<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  QrCode,
  UploadCloud,
  CheckCircle2,
  X,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Loader2,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    planName?: string
    amountText?: string
    accountName?: string
    accountNumber?: string
    qrImageUrl?: string
  }>(),
  {
    planName: 'Lovia Premium Keepsake Upgrade',
    amountText: '₱149.00',
    accountName: 'LOVIA KEEPSAKES (Maya / GCash)',
    accountNumber: '0917 123 4567',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=MAYA-PAYMENT-LOVIA-PREMIUM',
  },
)

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'submitted', payload: { refNumber: string; proofUrl: string }): void
}>()

const { toast } = useFeatherToast()

import { useAuthStore } from '@/stores/auth/auth.store'
import { PaymentService } from '@/services/payment/payment.services'
import { useImageCompressor } from '@/composables/useImageCompressor'

const authStore = useAuthStore()
const { compressImage } = useImageCompressor()

const computedQrUrl = computed(() => props.qrImageUrl || authStore.systemSettings?.qr_code_url)
const computedAccountName = computed(() => props.accountName || authStore.systemSettings?.payment_account_name || 'LOVIA KEEPSAKES (Maya / GCash)')
const computedAccountNumber = computed(() => props.accountNumber || authStore.systemSettings?.payment_account_number || '0917 123 4567')

const refNumber = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const submitting = ref(false)
const copied = ref(false)
const isSubmitted = ref(false)

function copyNumber() {
  navigator.clipboard.writeText(computedAccountNumber.value.replace(/\s+/g, ''))
  copied.value = true
  toast.success({ title: 'Account number copied!' })
  setTimeout(() => (copied.value = false), 2000)
}

async function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  // Show original preview immediately
  const reader = new FileReader()
  reader.onload = (event) => {
    previewUrl.value = event.target?.result as string
  }
  reader.readAsDataURL(file)
  // Compress before storing for upload
  try {
    const compressed = await compressImage(file, { quality: 0.8, maxWidth: 1920, maxHeight: 1920 })
    const blob = compressed as Blob
    selectedFile.value = compressed instanceof File ? compressed : new File([blob], file.name, { type: blob.type })
  } catch {
    selectedFile.value = file
  }
}

async function handleSubmit() {
  if (!refNumber.value.trim()) {
    toast.error({ title: 'Please enter the reference number from your payment receipt.' })
    return
  }
  if (!previewUrl.value) {
    toast.error({ title: 'Please upload a screenshot of your payment receipt.' })
    return
  }

  if (!authStore.user?.id) {
    toast.error({ title: 'Please sign in to submit payment proof.' })
    return
  }

  submitting.value = true
  try {
    let finalProofUrl = previewUrl.value || ''

    // Upload receipt image to Supabase Storage bucket "payment_proof"
    if (selectedFile.value) {
      try {
        finalProofUrl = await PaymentService.uploadProofImage(selectedFile.value, authStore.user.id)
      } catch (uploadErr: any) {
        console.warn('Storage upload warning, falling back to data URL:', uploadErr)
      }
    }

    const numericAmount = parseFloat(props.amountText.replace(/[^\d.]/g, '')) || 59.00
    await PaymentService.submitPaymentProof({
      userId: authStore.user.id,
      refNumber: refNumber.value.trim(),
      amount: numericAmount,
      planName: props.planName,
      proofUrl: finalProofUrl,
    })
    isSubmitted.value = true
    emit('submitted', { refNumber: refNumber.value, proofUrl: finalProofUrl })
    toast.success({ title: 'Payment proof submitted! Admin will verify and unlock your upgrade shortly.' })
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to submit payment proof' })
  } finally {
    submitting.value = false
  }
}

function closeModal() {
  emit('update:open', false)
  setTimeout(() => {
    isSubmitted.value = false
    refNumber.value = ''
    selectedFile.value = null
    previewUrl.value = null
  }, 300)
}
</script>
<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/20 backdrop-blur-xs overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="w-full max-w-3xl bg-white rounded-[24px] p-6 sm:p-8 shadow-2xl space-y-5 border border-rose-100 relative my-8 animate-in fade-in-0 zoom-in-95 duration-200">

        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- Submitted Success View -->
        <div v-if="isSubmitted" class="text-center py-8 space-y-4 max-w-md mx-auto">
          <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 class="w-8 h-8" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Payment Proof Submitted!</h3>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              Thank you! Your reference <span class="font-mono font-bold text-gray-800">{{ refNumber }}</span> is now pending admin verification. Your account will be upgraded as soon as confirmed.
            </p>
          </div>
          <button
            @click="closeModal"
            class="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>

        <!-- Main Payment & Upload Form (Landscape 2-Column Layout) -->
        <div v-else class="space-y-4">
          <!-- Header bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div class="space-y-0.5">
              <span class="px-3 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-full inline-flex items-center gap-1">
                <QrCode class="w-3 h-3" /> Landscape QR Payment Mode
              </span>
              <h3 class="text-lg font-bold text-gray-900">{{ planName }}</h3>
            </div>
            <div class="sm:text-right">
              <span class="text-[10px] text-gray-400 font-medium block">Total Amount</span>
              <span class="text-base font-extrabold text-rose-600">{{ amountText }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-1">
            <!-- Step 1: Scan QR Code (Landscape layout) -->
            <div class="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <p class="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Step 1: Scan QR with App</p>
                  <span class="text-[9px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Landscape Mode</span>
                </div>

                <!-- QR Code & Account Details Side-by-Side Horizontal Box -->
                <div class="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                  <!-- QR Code Image -->
                  <div class="shrink-0 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                    <img :src="computedQrUrl" alt="Maya / GCash Payment QR" class="w-32 h-32 object-contain mx-auto rounded-md" />
                  </div>

                  <!-- Account Info -->
                  <div class="space-y-2 text-left min-w-0 flex-1">
                    <div>
                      <span class="text-[10px] text-gray-400 uppercase font-semibold block">Merchant Account</span>
                      <p class="text-xs font-bold text-gray-800 leading-snug truncate">{{ computedAccountName }}</p>
                    </div>
                    <div>
                      <span class="text-[10px] text-gray-400 uppercase font-semibold block">Maya / GCash Number</span>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="font-mono font-bold text-gray-900 text-xs tracking-wider">{{ computedAccountNumber }}</span>
                        <button
                          @click="copyNumber"
                          class="p-1 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                          title="Copy Number"
                        >
                          <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-500" />
                          <Copy v-else class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-gray-400 text-center sm:text-left">Scan using GCash, Maya, or any QRPh banking app.</p>
            </div>

            <!-- Step 2: Upload Proof & Reference -->
            <div class="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div class="space-y-3">
                <p class="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Step 2: Submit Payment Details</p>

                <!-- Reference Number Input -->
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Reference Number</label>
                  <input
                    v-model="refNumber"
                    type="text"
                    placeholder="Enter Ref No. (e.g. 104829104)"
                    class="w-full text-xs px-3.5 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-rose-400 font-mono transition"
                  />
                </div>

                <!-- Screenshot File Drop / Upload Box -->
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Payment Screenshot</label>
                  <label class="block border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-xl p-3 text-center cursor-pointer bg-white hover:bg-rose-50/20 transition">
                    <input type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

                    <div v-if="previewUrl" class="space-y-1">
                      <img :src="previewUrl" alt="Receipt Preview" class="max-h-20 object-contain mx-auto rounded-lg border border-gray-200" />
                      <p class="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 class="w-3 h-3" /> Receipt attached
                      </p>
                    </div>

                    <div v-else class="space-y-1 py-1">
                      <UploadCloud class="w-5 h-5 text-gray-400 mx-auto" />
                      <p class="text-xs font-semibold text-gray-700">Upload payment receipt</p>
                      <p class="text-[10px] text-gray-400">PNG, JPG, or WebP</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                @click="handleSubmit"
                :disabled="submitting || !refNumber || !previewUrl"
                class="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
                <ShieldCheck v-else class="w-4 h-4" />
                <span>{{ submitting ? 'Submitting...' : 'Submit Payment Proof' }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>
