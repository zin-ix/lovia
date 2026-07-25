<script setup lang="ts">
import { ref } from 'vue'
import { Share2, Download, Copy, Check, X, Sparkles } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  recipientName: string
  title?: string
  whisper?: string
  snippet?: string
  themeColor?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)
const generating = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

const shareToFacebook = () => {
  const currentUrl = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`, '_blank', 'width=600,height=500')
}

const nativeShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title || 'A Letter for You — Lovia',
        text: `A digital keepsake letter arrived for ${props.recipientName || 'you'}.`,
        url: window.location.href,
      })
    } catch (err) {
      // User cancelled or share failed
    }
  } else {
    copyLink()
  }
}

// ── Generate HD 1080x1920 Facebook / IG Story Card PNG ──
const downloadStoryCard = () => {
  generating.value = true

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    generating.value = false
    return
  }

  // 1. Background Soft Luxury Vertical Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920)
  bgGrad.addColorStop(0, '#fff5f7')
  bgGrad.addColorStop(0.5, '#fce7f3')
  bgGrad.addColorStop(1, '#fff1f2')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1080, 1920)

  // 2. Decorative Floating Sparkles / Petals in Background
  ctx.fillStyle = 'rgba(244, 63, 94, 0.15)'
  const dots = [
    { x: 150, y: 300, r: 18 },
    { x: 920, y: 450, r: 24 },
    { x: 200, y: 1400, r: 20 },
    { x: 880, y: 1650, r: 16 },
    { x: 540, y: 150, r: 12 },
  ]
  dots.forEach((d) => {
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // 3. Central Card Frame (900x1200)
  const cardX = 90
  const cardY = 320
  const cardW = 900
  const cardH = 1260
  const cardR = 48

  // Card Shadow
  ctx.shadowColor = 'rgba(244, 63, 94, 0.15)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 20

  // Card Background
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, cardW, cardH, cardR)
  ctx.fill()

  // Reset shadow for crisp inner elements
  ctx.shadowColor = 'transparent'

  // Card Border
  ctx.strokeStyle = '#fce7e7'
  ctx.lineWidth = 4
  ctx.stroke()

  // 4. Header Eyebrow / Whisper
  ctx.textAlign = 'center'
  ctx.fillStyle = '#9ca3af'
  ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(props.whisper || 'a letter arrived for you', 540, 440)

  // 5. Recipient Name
  ctx.fillStyle = '#f43f5e'
  ctx.font = 'bold 56px "Great Vibes", "Playfair Display", serif'
  ctx.fillText(`for ${props.recipientName || 'My Love'}`, 540, 520)

  // 6. Styled Envelope Illustration
  const envX = 290
  const envY = 590
  const envW = 500
  const envH = 340
  const envR = 24

  // Envelope Body
  ctx.fillStyle = '#fce7f3'
  ctx.strokeStyle = '#fbcfe8'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(envX, envY, envW, envH, envR)
  ctx.fill()
  ctx.stroke()

  // Envelope Folds (V shape)
  ctx.fillStyle = 'rgba(249, 168, 212, 0.4)'
  ctx.beginPath()
  ctx.moveTo(envX, envY + envH)
  ctx.lineTo(envX + envW / 2, envY + envH / 2 + 30)
  ctx.lineTo(envX + envW, envY + envH)
  ctx.closePath()
  ctx.fill()

  // Envelope Flap
  ctx.fillStyle = 'rgba(244, 63, 94, 0.25)'
  ctx.beginPath()
  ctx.moveTo(envX, envY)
  ctx.lineTo(envX + envW / 2, envY + envH / 2 - 20)
  ctx.lineTo(envX + envW, envY)
  ctx.closePath()
  ctx.fill()

  // Heart Seal on Envelope
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(540, envY + envH / 2, 45, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fbcfe8'
  ctx.lineWidth = 4
  ctx.stroke()

  // Heart Icon
  ctx.fillStyle = '#f43f5e'
  ctx.font = '40px serif'
  ctx.fillText('♥', 540, envY + envH / 2 + 14)

  // 7. Letter Title
  ctx.fillStyle = '#1d1d1f'
  ctx.font = 'bold 52px "Playfair Display", Georgia, serif'
  const titleText = props.title || 'Happy Birthday, My Love'
  ctx.fillText(titleText, 540, 1050)

  // 8. Excerpt Snippet
  ctx.fillStyle = '#6e6e73'
  ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif'
  const snippetText = `"${props.snippet || 'Every moment with you feels like something beautiful.'}"`
  ctx.fillText(snippetText, 540, 1140)

  // 9. Decorative Divider Line inside Card
  ctx.strokeStyle = '#fce7e7'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(340, 1220)
  ctx.lineTo(740, 1220)
  ctx.stroke()

  // 10. Watermark & Branding Signature
  ctx.fillStyle = '#f43f5e'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText('LOVIA', 540, 1470)

  ctx.fillStyle = '#9ca3af'
  ctx.font = '28px sans-serif'
  ctx.fillText('Digital Keepsakes & Letters', 540, 1515)

  // Download Trigger
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `lovia-keepsake-${(props.recipientName || 'letter').toLowerCase().replace(/\s+/g, '-')}.png`
  link.href = dataUrl
  link.click()

  generating.value = false
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-[360px] bg-white dark:bg-slate-900 rounded-[28px] p-6 text-center shadow-2xl border border-black/5 dark:border-white/10 relative animate-in fade-in-0 zoom-in-95 duration-200 space-y-5"
      >
        <!-- Close button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- Header -->
        <div class="space-y-1 pt-1">
          <div class="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto shadow-2xs">
            <Share2 class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            Share & Save Card
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-2">
            Save as a Facebook Story card or share the letter link with your love.
          </p>
        </div>

        <!-- Action Buttons Grid -->
        <div class="space-y-3 pt-1">
          <!-- 1. Download Story Card PNG -->
          <button
            @click="downloadStoryCard"
            :disabled="generating"
            class="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl text-xs font-semibold shadow-md flex items-center justify-center gap-2.5 transition transform active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Download class="w-4 h-4" />
            {{ generating ? 'Generating Card...' : 'Save Facebook Story Card (PNG)' }}
          </button>

          <!-- 2. Share on Facebook -->
          <button
            @click="shareToFacebook"
            class="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share to Facebook
          </button>

          <!-- 3. Native Share (Mobile) / Copy Link -->
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="nativeShare"
              class="py-2.5 px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles class="w-3.5 h-3.5 text-rose-500" />
              More Options
            </button>

            <button
              @click="copyLink"
              class="py-2.5 px-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-green-500" />
              <Copy v-else class="w-3.5 h-3.5 text-gray-500" />
              {{ copied ? 'Copied!' : 'Copy Link' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
