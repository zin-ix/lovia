<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLetterStore } from '@/stores/letter/letter.store'
import { useTemplateStore } from '@/stores/template/template.store'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import LetterPreview from '@/components/letter/LetterPreview.vue'
import LetterQrModal from '@/components/common/LetterQrModal.vue'
import { Play, Pause, Music2, AlertCircle, RefreshCw, QrCode } from '@lucide/vue'
import type { Letter, LetterContent } from '@/types/letter.types'

const route = useRoute()
const letterStore = useLetterStore()
const templateStore = useTemplateStore()
const { initAudio, playAudio, toggleAudio, cleanupAudio, isPlaying, youtubeId } = useAudioPlayer()

const letter = ref<Letter | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showQrModal = ref(false)

// Fallback demo content if accessing sample directly
const contentData = computed<LetterContent>(() => {
  if (letter.value?.content) {
    return letter.value.content
  }
  return {
    whisper: 'a letter arrived for you',
    greeting: 'my love,',
    heroEyebrow: 'July 26th',
    heroTitle: 'Happy birthday, my love.',
    heroSubtitle: 'And happy monthsary — because with you, every 26th has always meant something.',
    letterEyebrow: 'a letter for you',
    letterBodyParagraphs: [
      'My love,',
      'Four years in, and somehow every month with you still feels like the first. From the moment I first saw your smile to every little everyday joke we share, you make my world brighter and warmer.',
      'Thank you for choosing me, again and again, through every high and low. You are my favorite memory, my safest place, and my favorite adventure.',
    ],
    signoff: 'yours, always',
    timelineTitle: 'our story so far',
    timelineSubtitle: 'A few chapters worth remembering',
    timelineItems: [
      { id: '1', date: 'July 2022', text: 'The day we first met — your eyes and your laugh instantly caught my attention.' },
      { id: '2', date: 'November 2022', text: 'Our first official date — talking for hours and realizing this was something special.' },
      { id: '3', date: 'Summer 2024', text: 'Our memorable road trip — watching the sunset and holding hands.' },
      { id: '4', date: 'Today', text: 'Still here, still yours, still counting the days to the next chapter.' },
    ],
    polaroids: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80', caption: 'the first time' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80', caption: 'that trip' },
    ],
    flipCardsTitle: 'Why I love you',
    flipCards: [
      { id: 'f1', frontNumber: 'i.', frontTitle: 'a little something she does', backText: 'The way you laugh uncontrollably at your own silly jokes before finishing them.' },
      { id: 'f2', frontNumber: 'ii.', frontTitle: 'how she treats people', backText: 'Your kindness and genuine empathy for everyone around you.' },
      { id: 'f3', frontNumber: 'iii.', frontTitle: 'how she makes you feel', backText: 'How safe, deeply seen, and unconditionally cherished I feel around you.' },
      { id: 'f4', frontNumber: 'iv.', frontTitle: 'the little things', backText: 'Your morning messages and the way your hand fits perfectly in mine.' },
    ],
    countdown: {
      targetDate: '2026-11-26',
      label: 'days until November 26th',
    },
    closingText: "Happy birthday, happy monthsary, and here's to every day between now and forever.",
    closingScript: 'I love you.',
  }
})

const recipientName = computed(() => {
  return letter.value?.recipient_name || '[Her Name]'
})

const musicTitle = computed(() => {
  return letter.value?.music_title || 'Background Music'
})

onMounted(async () => {
  await templateStore.fetchTemplates()

  const enableAutoplayFallback = () => {
    const enableAutoplay = () => {
      if (!isPlaying.value) {
        playAudio()
      }
      window.removeEventListener('click', enableAutoplay)
      window.removeEventListener('touchstart', enableAutoplay)
    }
    window.addEventListener('click', enableAutoplay, { once: true })
    window.addEventListener('touchstart', enableAutoplay, { once: true })
  }

  const slug = route.params.slug as string
  if (slug && slug !== 'demo') {
    loading.value = true
    const fetched = await letterStore.fetchLetterBySlug(slug)
    if (fetched) {
      letter.value = fetched
      if (fetched.music_url) {
        initAudio(fetched.music_url)
        playAudio()
        enableAutoplayFallback()
      }
    } else {
      error.value = 'This letter could not be found or has expired.'
    }
    loading.value = false
  } else {
    // Demo Mode
    const demoMusic = 'https://youtu.be/CgjknaWVChY?si=d5a0Oha9T-jps8I6'
    letter.value = {
      id: 'demo-letter',
      user_id: 'demo-user',
      slug: 'demo',
      title: 'Demo Keepsake',
      recipient_name: 'My Love',
      music_url: demoMusic,
      music_title: 'Romantic Song',
      content: contentData.value,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any

    initAudio(demoMusic)
    playAudio()
    enableAutoplayFallback()

    loading.value = false
  }
})

onUnmounted(() => {
  cleanupAudio()
})
</script>

<template>
  <div class="min-h-screen w-full bg-transparent overflow-x-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400 bg-[#F5F5F7]">
      <RefreshCw class="w-8 h-8 animate-spin text-rose-500" />
      <p class="text-sm font-medium text-gray-600">Opening letter keepsake...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto bg-[#F5F5F7]">
      <AlertCircle class="w-12 h-12 text-rose-500 mb-3" />
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Letter Not Found</h2>
      <p class="text-sm text-gray-500 mb-6">{{ error }}</p>
      <router-link to="/" class="px-6 py-2.5 bg-rose-500 text-white rounded-full text-xs font-medium shadow hover:bg-rose-600 transition">
        Return to Home
      </router-link>
    </div>

    <!-- Main Dynamic Letter View -->
    <div v-else class="relative">
      <!-- Hidden YouTube Audio Player Frame -->
      <iframe
        v-if="youtubeId && isPlaying"
        :src="'https://www.youtube-nocookie.com/embed/' + youtubeId + '?autoplay=1&loop=1&playlist=' + youtubeId"
        class="w-0 h-0 opacity-0 pointer-events-none absolute"
        allow="autoplay"
      />

      <!-- ── Floating Bottom Controls (Music + Card PNG) ── -->
      <div class="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl border border-black/10 dark:border-white/10 max-w-[calc(100vw-1.5rem)] w-auto">
        <!-- 1. Music Player Pill (if music present) -->
        <button
          v-if="letter?.music_url"
          @click="toggleAudio"
          class="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden text-xs font-semibold shrink min-w-0 active:scale-95"
          :class="isPlaying
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-rose-50'"
        >
          <span
            class="relative flex items-center justify-center w-5 h-5 rounded-full shrink-0"
            :class="isPlaying ? 'bg-white/20' : 'bg-rose-100 text-rose-500'"
          >
            <Music2 class="w-3 h-3" />
          </span>
          <span class="truncate max-w-[65px] sm:max-w-[120px] text-[11px] sm:text-xs">
            {{ isPlaying ? musicTitle : 'Music' }}
          </span>
          <span class="shrink-0 ml-0.5">
            <Pause v-if="isPlaying" class="w-3 h-3" />
            <Play v-else class="w-3 h-3 translate-x-px" />
          </span>
        </button>

        <!-- 2. Keepsake Card (PNG) Button -->
        <button
          @click="showQrModal = true"
          class="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full shadow-md text-[11px] sm:text-xs font-semibold transition active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
        >
          <QrCode class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span class="hidden sm:inline">Keepsake Card (PNG)</span>
          <span class="sm:hidden">Card PNG</span>
        </button>
      </div>

      <LetterQrModal
        :open="showQrModal"
        :letter="letter || {
          id: 'demo',
          title: contentData.heroTitle || 'Happy Birthday, My Love',
          recipient_name: recipientName || 'My Love',
          slug: route.params.slug as string || 'demo',
        }"
        @update:open="(val) => showQrModal = val"
      />

      <LetterPreview
        :recipient-name="recipientName"
        :content="contentData"
        :template-id="letter?.template_slug || letter?.template_id || letter?.content?.templateSlug || 'romantic-rose'"
        @open:envelope="playAudio"
      />
    </div>
  </div>
</template>
