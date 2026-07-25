<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  QrCode,
  X,
  Copy,
  Check,
  Printer,
  Sparkles,
  Heart,
  ExternalLink,
  Download,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'
import { toPng } from 'html-to-image'

const props = defineProps<{
  open: boolean
  letter?: {
    id: string
    title: string
    recipient_name: string
    slug: string
    created_at?: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const { toast } = useFeatherToast()
const copiedLink = ref(false)
const copiedQr = ref(false)
const downloadingPng = ref(false)

const letterUrl = computed(() => {
  if (!props.letter?.slug) return ''
  return `${window.location.origin}/l/${props.letter.slug}`
})

const qrImageUrl = computed(() => {
  if (!letterUrl.value) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(letterUrl.value)}`
})

function closeModal() {
  emit('update:open', false)
}

async function copyLetterLink() {
  if (!letterUrl.value) return
  try {
    await navigator.clipboard.writeText(letterUrl.value)
    copiedLink.value = true
    toast.success({ title: 'Letter link copied!' })
    setTimeout(() => (copiedLink.value = false), 2000)
  } catch {
    toast.error({ title: 'Failed to copy link' })
  }
}

async function copyQrUrl() {
  if (!qrImageUrl.value) return
  try {
    await navigator.clipboard.writeText(qrImageUrl.value)
    copiedQr.value = true
    toast.success({ title: 'Landscape QR Image link copied!' })
    setTimeout(() => (copiedQr.value = false), 2000)
  } catch {
    toast.error({ title: 'Failed to copy QR link' })
  }
}

function handlePrint() {
  window.print()
}

async function downloadPngCard() {
  const cardElement = document.getElementById('landscape-card-frame')
  if (!cardElement || downloadingPng.value) return
  downloadingPng.value = true
  try {
    const dataUrl = await toPng(cardElement, {
      pixelRatio: 3,
      cacheBust: true,
    })

    const link = document.createElement('a')
    link.download = `lovia-keepsake-card-${(props.letter?.recipient_name || 'letter').toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = dataUrl
    link.click()

    toast.success({ title: 'Landscape PNG Card saved!' })
  } catch (err) {
    console.error('PNG capture error:', err)
    toast.error({ title: 'Failed to save PNG card' })
  } finally {
    downloadingPng.value = false
  }
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
      v-if="open && letter"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl bg-white rounded-[24px] p-6 sm:p-8 shadow-2xl space-y-6 border border-rose-100 relative my-8 print:shadow-none print:border-none print:w-full print:max-w-none animate-in fade-in-0 zoom-in-95 duration-200">
        <!-- Close Button (Hidden on Print) -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer print:hidden"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- Modal Header (Hidden on Print) -->
        <div class="flex items-center justify-between border-b border-gray-100 pb-3 print:hidden">
          <div class="space-y-0.5">
            <span class="px-3 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-full inline-flex items-center gap-1">
              <QrCode class="w-3 h-3" /> Landscape QR Keepsake
            </span>
            <h3 class="text-lg font-bold text-gray-900">Letter QR Keepsake Card</h3>
          </div>
          <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Landscape Mode (16:9)
          </span>
        </div>

        <!-- LANDSCAPE KEEPSAKE CARD FRAME (Exact 16:9 Aspect Ratio Card Node for PNG Export) -->
        <div
          id="landscape-card-frame"
          class="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-[20px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-rose-400/30 print:border-gray-300 print:shadow-none"
        >
          <!-- Background Decorative Hearts -->
          <div class="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Heart class="w-64 h-64 text-white" />
          </div>
          <div class="absolute -left-6 -top-6 opacity-10 pointer-events-none">
            <Sparkles class="w-48 h-48 text-white" />
          </div>

          <!-- Left Column: Letter Info & Romantic Branding -->
          <div class="space-y-4 text-center sm:text-left relative z-10 flex-1 min-w-0">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wide text-rose-100 border border-white/20">
              <Heart class="w-3 h-3 text-rose-200 fill-rose-200" />
              <span>LOVIA DIGITAL KEEPSAKE</span>
            </div>

            <div class="space-y-1">
              <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white line-clamp-2 leading-tight">
                {{ letter.title }}
              </h2>
              <p class="text-xs sm:text-sm font-medium text-rose-100">
                Prepared with love for: <span class="font-bold text-white underline decoration-rose-300 decoration-2">{{ letter.recipient_name }}</span>
              </p>
            </div>

            <div class="pt-2 border-t border-white/20 text-[10px] text-rose-100 space-y-1">
              <p class="flex items-center justify-center sm:justify-start gap-1 font-mono">
                <span>Link:</span>
                <span class="truncate max-w-[200px] font-bold text-white">{{ letterUrl }}</span>
              </p>
              <p class="opacity-80">Scan QR code to view digital keepsake</p>
            </div>
          </div>

          <!-- Right Column: QR Code Box (Landscape Placement) -->
          <div class="shrink-0 bg-white p-4 rounded-2xl shadow-lg border border-white/40 text-center space-y-2 relative z-10">
            <img
              :src="qrImageUrl"
              alt="Letter QR Code"
              class="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto rounded-xl"
              crossOrigin="anonymous"
            />
            <p class="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center justify-center gap-1">
              <QrCode class="w-3 h-3 text-rose-500" /> Scan QR Code
            </p>
          </div>
        </div>

        <!-- Footer Action Buttons (Hidden on Print) -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
          <div class="flex items-center gap-2">
            <button
              @click="copyLetterLink"
              class="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <component :is="copiedLink ? Check : Copy" class="w-3.5 h-3.5 text-rose-500" />
              <span>{{ copiedLink ? 'Link Copied!' : 'Copy Link' }}</span>
            </button>

            <button
              @click="copyQrUrl"
              class="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <component :is="copiedQr ? Check : QrCode" class="w-3.5 h-3.5 text-rose-500" />
              <span>{{ copiedQr ? 'QR Link Copied!' : 'Copy QR Image' }}</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="downloadPngCard"
              :disabled="downloadingPng"
              class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download class="w-3.5 h-3.5" />
              <span>{{ downloadingPng ? 'Saving PNG...' : 'Download PNG Card' }}</span>
            </button>

            <button
              @click="handlePrint"
              class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>Print Landscape Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
