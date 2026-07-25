import { ref } from 'vue'

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentSrc = ref<string | null>(null)
const youtubeId = ref<string | null>(null)

function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  return match && match[1] ? match[1] : null
}

export function useAudioPlayer() {
  const initAudio = (src: string) => {
    if (!src) return
    currentSrc.value = src
    const ytid = extractYoutubeId(src)
    if (ytid) {
      youtubeId.value = ytid
    } else {
      youtubeId.value = null
      if (!audio.value) {
        audio.value = new Audio(src)
        audio.value.loop = true
        audio.value.volume = 0.5
      } else if (audio.value.src !== src) {
        audio.value.src = src
      }
    }
  }

  const playAudio = async () => {
    if (youtubeId.value) {
      isPlaying.value = true
      return
    }
    if (!audio.value) return
    try {
      await audio.value.play()
      isPlaying.value = true
    } catch (err) {
      console.warn('Autoplay prevented or audio error:', err)
      isPlaying.value = false
    }
  }

  const pauseAudio = () => {
    if (audio.value) {
      audio.value.pause()
    }
    isPlaying.value = false
  }

  const toggleAudio = () => {
    if (isPlaying.value) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  const cleanupAudio = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value = null
    }
    isPlaying.value = false
    currentSrc.value = null
    youtubeId.value = null
  }

  return {
    initAudio,
    playAudio,
    pauseAudio,
    toggleAudio,
    cleanupAudio,
    isPlaying,
    youtubeId,
    currentSrc,
  }
}
