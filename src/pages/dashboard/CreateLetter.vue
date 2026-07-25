<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import EditorLayout from '@/layouts/EditorLayout.vue'
import LetterPreview from '@/components/letter/LetterPreview.vue'
import PricingModal from '@/components/common/PricingModal.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useLetterStore } from '@/stores/letter/letter.store'
import { useTemplateStore } from '@/stores/template/template.store'
import { LetterService } from '@/services/letter/letter.services'
import {
  Save,
  ArrowLeft,
  Heart,
  Music,
  Calendar,
  Sparkles,
  Briefcase,
  X,
  Lock,
  Home,
  KeyRound,
  Flower2,
  Flower,
  Mail,
  Ban,
  Type,
  Settings2,
  UserCheck,
  Users,
  FileText,
  User,
  Heading,
  PenTool,
  Stamp,
  ShieldCheck,
  Globe,
  LayoutTemplate,
} from '@lucide/vue'
import { BUILTIN_TEMPLATES } from '@/data/templates.data'
import type { Template } from '@/types/template.types'
import type { LetterContent, RelationshipType } from '@/types/letter.types'
import { useFeatherToast } from 'feather-toast-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const letterStore = useLetterStore()
const templateStore = useTemplateStore()
const { toast } = useFeatherToast()

const isEdit = computed(() => !!route.params.id)
const editId = computed(() => (route.params.id as string) || null)

const saving = ref(false)
const errorMsg = ref<string | null>(null)

// ── Canva Panel State ──
type PanelTab = 'templates' | 'text' | 'settings' | null
const activeTab = ref<PanelTab>('templates')
const panelOpen = computed(() => activeTab.value !== null)

function toggleTab(tab: PanelTab) {
  activeTab.value = activeTab.value === tab ? null : tab
}

// ── Canvas zoom / view ──
const zoom = ref(100)
const previewMode = ref<'desktop' | 'mobile'>('mobile')

function zoomIn() {
  zoom.value = Math.min(zoom.value + 10, 150)
}
function zoomOut() {
  zoom.value = Math.max(zoom.value - 10, 60)
}

function scrollToPage(pageNum: 1 | 2) {
  const targetId = pageNum === 1 ? 'page-1-envelope' : 'page-2-letter'
  const el = document.getElementById(targetId)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ── Selected element state ──
const selectedElement = ref<{ key: string; label: string } | null>(null)
let toolbarFocusTimer: ReturnType<typeof setTimeout> | null = null

function handleElementSelect(payload: { key: string; label: string }) {
  if (toolbarFocusTimer) clearTimeout(toolbarFocusTimer)
  selectedElement.value = payload
}

function clearSelection() {
  toolbarFocusTimer = setTimeout(() => {
    selectedElement.value = null
  }, 250)
}

function keepToolbarOpen() {
  if (toolbarFocusTimer) clearTimeout(toolbarFocusTimer)
}

// ── Template / theme state ──
const selectedTemplateId = ref('romantic-rose')
const selectedRelType = ref<RelationshipType>('lover')
const particleType = ref<'rose' | 'sakura' | 'stars' | 'hearts' | 'lavender' | 'none'>('rose')
const sealChar = ref('♡')

const particleOptions = [
  { value: 'rose', label: 'Rose Petals', icon: Flower2 },
  { value: 'sakura', label: 'Sakura', icon: Flower },
  { value: 'stars', label: 'Stars', icon: Sparkles },
  { value: 'hearts', label: 'Hearts', icon: Heart },
  { value: 'lavender', label: 'Lavender', icon: Flower2 },
  { value: 'none', label: 'None', icon: Ban },
] as const

const relTypeOptions = [
  { value: 'lover', label: 'Lover', icon: Heart },
  { value: 'best-friend', label: 'Best Friend', icon: UserCheck },
  { value: 'family', label: 'Family', icon: Home },
  { value: 'crush', label: 'Crush', icon: Sparkles },
  { value: 'friend', label: 'Friend', icon: Users },
  { value: 'colleague', label: 'Colleague', icon: Briefcase },
  { value: 'anyone', label: 'Anyone', icon: Mail },
] as const

const onRelTypeChange = (type: RelationshipType) => {
  selectedRelType.value = type
  whisper.value =
    {
      lover: 'a letter arrived for you',
      'best-friend': 'a letter from your person',
      family: 'a letter from home',
      crush: 'something arrived just for you',
      friend: 'a note for you',
      colleague: 'a note from a colleague',
      anyone: 'a message just for you',
    }[type] ?? whisper.value
  signoff.value =
    {
      lover: 'yours, always',
      'best-friend': 'your best friend, forever',
      family: 'with all my love',
      crush: 'someone who admires you',
      friend: 'your friend, always',
      colleague: 'warm regards',
      anyone: 'with care',
    }[type] ?? signoff.value
}

// ── Letter content fields ──
const title = ref('Happy Birthday, My Love')
const recipientName = ref('My Love')
const musicUrl = ref('')
const whisper = ref('a little something from my heart')
const greeting = ref('My love,')
const heroEyebrow = ref('with love')
const heroTitle = ref('Happy birthday, my love.')
const heroSubtitle = ref('Every moment with you feels like the beginning of something beautiful.')
const letterEyebrow = ref('a letter for you')
const letterBodyText = ref(
  'Four years in, and somehow every month with you still feels like the first. Thank you for choosing me, again and again.',
)
const signoff = ref('yours, always')
const passcode = ref('')

// ── Canvas field updates ──
const handleCanvasFieldUpdate = (payload: {
  key: string
  value: any
  index?: number
  subkey?: string
}) => {
  const { key, value, index } = payload
  if (key === 'whisper') whisper.value = value
  else if (key === 'greeting') greeting.value = value
  else if (key === 'heroEyebrow') heroEyebrow.value = value
  else if (key === 'heroTitle') heroTitle.value = value
  else if (key === 'heroSubtitle') heroSubtitle.value = value
  else if (key === 'letterEyebrow') letterEyebrow.value = value
  else if (key === 'signoff') signoff.value = value
  else if (key === 'letterBodyParagraphs' && typeof index === 'number') {
    const arr = [
      ...letterBodyText.value
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean),
    ]
    if (arr[index] !== undefined) arr[index] = value
    letterBodyText.value = arr.join('\n\n')
  }
}

// ── Rich text formatting ──
function execFormat(cmd: string) {
  window.document.execCommand(cmd)
}

// ── Template apply ──
const applyTemplateBySlug = (slug: string) => {
  const tpl =
    templateStore.templates.find((t) => t.slug === slug || t.id === slug) ||
    BUILTIN_TEMPLATES.find((t) => t.slug === slug || t.id === slug)
  if (!tpl) return
  selectedTemplateId.value = tpl.slug
  if (tpl.theme_config.particleType) particleType.value = tpl.theme_config.particleType as any
  if (tpl.theme_config.sealChar) sealChar.value = tpl.theme_config.sealChar
  if (tpl.preset_content) {
    const pc = tpl.preset_content
    if (pc.relationshipType) selectedRelType.value = pc.relationshipType
    if (pc.title) title.value = pc.title
    if (pc.recipientName) recipientName.value = pc.recipientName
    if (pc.whisper) whisper.value = pc.whisper
    if (pc.greeting) greeting.value = pc.greeting
    if (pc.heroEyebrow) heroEyebrow.value = pc.heroEyebrow
    if (pc.heroTitle) heroTitle.value = pc.heroTitle
    if (pc.heroSubtitle) heroSubtitle.value = pc.heroSubtitle
    if (pc.letterEyebrow) letterEyebrow.value = pc.letterEyebrow
    if (pc.letterBodyText) letterBodyText.value = pc.letterBodyText
    if (pc.signoff) signoff.value = pc.signoff
  }
}

const showPricingModal = ref(false)

const isPremiumUser = computed(() => {
  if (authStore.profile?.role === 'admin') return true
  if ((authStore.profile?.letter_limit || 2) > 2) return true
  if ((authStore.profile as any)?.is_premium) return true
  return false
})

const handleSelectTemplate = (tpl: Template) => {
  if (tpl.is_premium && !isPremiumUser.value) {
    showPricingModal.value = true
    toast.error({ title: `"${tpl.name}" is a Premium Template. Upgrade to unlock all templates!` })
    return
  }
  applyTemplateBySlug(tpl.slug)
  toast.success({ title: `Template "${tpl.name}" applied!` })
}

// ── Computed preview content ──
const previewContent = computed<LetterContent>(() => {
  const paragraphs = letterBodyText.value
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return {
    whisper: whisper.value,
    greeting: greeting.value,
    heroEyebrow: heroEyebrow.value,
    heroTitle: heroTitle.value,
    heroSubtitle: heroSubtitle.value,
    letterEyebrow: letterEyebrow.value,
    letterBodyParagraphs: paragraphs,
    signoff: signoff.value,
    recipientType: selectedRelType.value,
    particleType: particleType.value,
    sealChar: sealChar.value,
    passcode: passcode.value || undefined,
  }
})

// Active template computed
const activeTemplate = computed<Template | undefined>(
  () =>
    templateStore.templates.find(
      (t) => t.slug === selectedTemplateId.value || t.id === selectedTemplateId.value,
    ) || BUILTIN_TEMPLATES.find((t) => t.slug === selectedTemplateId.value),
)

// ── Lifecycle ──
onMounted(async () => {
  await templateStore.fetchTemplates()
  if (isEdit.value && editId.value) {
    try {
      const letter = await LetterService.getLetterById(editId.value)
      if (letter) {
        title.value = letter.title
        recipientName.value = letter.recipient_name
        musicUrl.value = letter.music_url || ''
        selectedTemplateId.value =
          letter.template_slug ||
          letter.template_id ||
          letter.content?.templateSlug ||
          'romantic-rose'
        selectedRelType.value = letter.recipient_type || 'lover'
        const c = letter.content || {}
        if (c.whisper) whisper.value = c.whisper
        if (c.greeting) greeting.value = c.greeting
        if (c.heroEyebrow) heroEyebrow.value = c.heroEyebrow
        if (c.heroTitle) heroTitle.value = c.heroTitle
        if (c.heroSubtitle) heroSubtitle.value = c.heroSubtitle
        if (c.letterEyebrow) letterEyebrow.value = c.letterEyebrow
        if (c.letterBodyParagraphs?.length)
          letterBodyText.value = c.letterBodyParagraphs.join('\n\n')
        if (c.signoff) signoff.value = c.signoff
        if (c.particleType) particleType.value = c.particleType as any
        if (c.sealChar) sealChar.value = c.sealChar
        if (c.passcode) passcode.value = c.passcode
      }
    } catch (err: any) {
      errorMsg.value = err.message || 'Failed to load letter'
    }
  } else if (route.query.template) {
    applyTemplateBySlug(route.query.template as string)
    toast.success({ title: 'Template loaded!' })
  }
})

// ── Save ──
const handleSave = async () => {
  if (!authStore.user?.id) return
  saving.value = true
  errorMsg.value = null
  try {
    const payload = {
      title: title.value,
      recipient_name: recipientName.value,
      template_id: selectedTemplateId.value,
      recipient_type: selectedRelType.value,
      music_url: musicUrl.value || undefined,
      content: previewContent.value,
    }
    if (isEdit.value && editId.value) {
      await letterStore.updateLetter(editId.value, payload)
      toast.success({ title: 'Letter updated!' })
    } else {
      await letterStore.createLetter(authStore.user.id, payload)
      toast.success({ title: 'Letter published!' })
    }
    router.push('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to save'
    toast.error({ title: errorMsg.value || 'Error saving' })
  } finally {
    saving.value = false
  }
}

// Panel category filter for templates
const templateCategory = ref('All')
const templateCategories = [
  'All',
  'Romantic',
  'Birthday',
  'Long Distance',
  'Apology',
  'Gratitude',
  'Minimalist',
  'Special',
]
const filteredTemplates = computed(() =>
  templateStore.templates.filter(
    (t) => templateCategory.value === 'All' || t.category === templateCategory.value,
  ),
)

const contextLabel = computed(() => selectedElement.value?.label || null)
const sealOptions = ['♡', '✦', '🌸', '🪻', '🌿', '★', 'L', 'A', 'S', 'M']
</script>

<template>
  <EditorLayout>
    <div class="flex flex-col h-full bg-white">
      <!-- ═══════════════════════════════════════════════════════
           TOP BAR — Canva-style
      ═══════════════════════════════════════════════════════ -->
      <div
        class="flex items-center h-12 px-3 border-b border-gray-200 bg-white z-20 shrink-0 gap-2"
      >
        <!-- Back -->
        <router-link
          to="/dashboard"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft class="w-4 h-4" />
        </router-link>

        <div class="w-px h-5 bg-gray-200 shrink-0" />

        <!-- Title input -->
        <input
          v-model="title"
          type="text"
          class="flex-1 min-w-0 text-sm font-semibold text-gray-800 bg-transparent focus:outline-none focus:bg-gray-50 rounded-lg px-2 py-1 transition truncate"
          placeholder="Untitled Letter"
        />

        <!-- Page Jump Switcher -->
        <div
          class="hidden md:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs gap-0.5"
        >
          <button
            @click="scrollToPage(1)"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-gray-600 hover:text-gray-900 transition cursor-pointer hover:bg-white"
          >
            <Mail class="w-3.5 h-3.5 text-rose-500" />
            <span>Page 1: Envelope</span>
          </button>
          <span class="text-gray-300">|</span>
          <button
            @click="scrollToPage(2)"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-gray-600 hover:text-gray-900 transition cursor-pointer hover:bg-white"
          >
            <FileText class="w-3.5 h-3.5 text-rose-500" />
            <span>Page 2: Letter</span>
          </button>
        </div>

        <div class="flex items-center gap-1 ml-auto shrink-0">
          <!-- Zoom controls -->
          <div class="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              @click="zoomOut"
              class="p-1.5 rounded-md hover:bg-white transition text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <ZoomOut class="w-3.5 h-3.5" />
            </button>
            <span class="text-xs font-semibold text-gray-600 px-1 min-w-[36px] text-center"
              >{{ zoom }}%</span
            >
            <button
              @click="zoomIn"
              class="p-1.5 rounded-md hover:bg-white transition text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <ZoomIn class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- View mode -->
          <div class="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              @click="previewMode = 'mobile'"
              class="p-1.5 rounded-md transition cursor-pointer"
              :class="
                previewMode === 'mobile'
                  ? 'bg-white text-rose-500 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              "
            >
              <Smartphone class="w-3.5 h-3.5" />
            </button>
            <button
              @click="previewMode = 'desktop'"
              class="p-1.5 rounded-md transition cursor-pointer"
              :class="
                previewMode === 'desktop'
                  ? 'bg-white text-rose-500 shadow-xs'
                  : 'text-gray-400 hover:text-gray-600'
              "
            >
              <Monitor class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="w-px h-5 bg-gray-200" />

          <!-- Save -->
          <button
            @click="handleSave"
            :disabled="saving"
            class="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            <Save v-else class="w-3.5 h-3.5" />
            {{ saving ? 'Saving...' : isEdit ? 'Update' : 'Publish' }}
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           EDITOR BODY
      ═══════════════════════════════════════════════════════ -->
      <div class="flex flex-1 overflow-hidden">
        <!-- ── LEFT TOOL STRIP ──────────────────────────────── -->
        <div
          class="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 shrink-0 overflow-y-auto z-10"
        >
          <!-- Templates tab -->
          <button
            @click="toggleTab('templates')"
            class="flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-xl transition-all cursor-pointer"
            :class="
              activeTab === 'templates'
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            "
            title="Templates"
          >
            <LayoutTemplate class="w-5 h-5" />
            <span class="text-[9px] font-semibold leading-tight">Templates</span>
          </button>

          <!-- Text tab -->
          <button
            @click="toggleTab('text')"
            class="flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-xl transition-all cursor-pointer"
            :class="
              activeTab === 'text'
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            "
            title="Text"
          >
            <Type class="w-5 h-5" />
            <span class="text-[9px] font-semibold leading-tight">Text</span>
          </button>

          <!-- Settings tab -->
          <button
            @click="toggleTab('settings')"
            class="flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-xl transition-all cursor-pointer"
            :class="
              activeTab === 'settings'
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            "
            title="Settings"
          >
            <Settings2 class="w-5 h-5" />
            <span class="text-[9px] font-semibold leading-tight">Style</span>
          </button>
        </div>

        <!-- ── LEFT TOOL PANEL (Slides open) ────────────────── -->
        <Transition name="panel-slide">
          <div
            v-if="panelOpen"
            class="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0 z-10"
          >
            <!-- Panel header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 class="text-xs font-bold text-gray-800 capitalize">{{ activeTab }}</h3>
              <button
                @click="activeTab = null"
                class="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Panel content -->
            <div class="flex-1 overflow-y-auto">
              <!-- ─────── TEMPLATES PANEL ─────── -->
              <div v-if="activeTab === 'templates'" class="p-3 space-y-3">
                <!-- Category pills -->
                <div class="flex gap-1.5 flex-wrap">
                  <button
                    v-for="cat in templateCategories"
                    :key="cat"
                    @click="templateCategory = cat"
                    class="px-2.5 py-1 rounded-full text-[10px] font-medium transition cursor-pointer whitespace-nowrap"
                    :class="
                      templateCategory === cat
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    "
                  >
                    {{ cat }}
                  </button>
                </div>

                <!-- Template grid (2 col) -->
                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="tpl in filteredTemplates"
                    :key="tpl.id"
                    @click="handleSelectTemplate(tpl)"
                    class="cursor-pointer rounded-xl overflow-hidden border-2 transition hover:border-rose-400 hover:shadow-md group"
                    :class="
                      selectedTemplateId === tpl.slug
                        ? 'border-rose-500 shadow-xs'
                        : 'border-gray-200'
                    "
                  >
                    <!-- Swatch -->
                    <div
                      class="h-20 p-2 flex flex-col justify-between relative"
                      :style="{ backgroundColor: tpl.theme_config.bg }"
                    >
                      <div
                        class="absolute inset-1.5 rounded-lg border flex flex-col justify-between p-1.5"
                        :style="{
                          backgroundColor: tpl.theme_config.paper,
                          borderColor: tpl.theme_config.line || '#eee',
                        }"
                      >
                        <span
                          class="text-[8px] font-bold"
                          :style="{ color: tpl.theme_config.accent }"
                          >{{ tpl.category }}</span
                        >
                        <span
                          class="text-[9px] font-semibold truncate leading-snug"
                          :style="{
                            fontFamily: tpl.theme_config.fontHeading,
                            color: tpl.theme_config.ink,
                          }"
                          >{{ tpl.name }}</span
                        >
                      </div>
                      <!-- Active check / Premium lock -->
                      <div
                        v-if="selectedTemplateId === tpl.slug"
                        class="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center"
                      >
                        <Check class="w-2.5 h-2.5 text-white" />
                      </div>
                      <div
                        v-else-if="tpl.is_premium && !isPremiumUser"
                        class="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-md flex items-center gap-0.5 shadow-xs"
                      >
                        <Lock class="w-2 h-2" /> PRO
                      </div>
                    </div>
                    <div
                      class="px-2 py-1.5 flex items-center justify-between"
                      :style="{ backgroundColor: tpl.theme_config.paper }"
                    >
                      <p class="text-[10px] font-semibold text-gray-800 truncate">{{ tpl.name }}</p>
                      <Lock
                        v-if="tpl.is_premium && !isPremiumUser"
                        class="w-3 h-3 text-amber-500 shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- ─────── TEXT PANEL ─────── -->
              <div v-else-if="activeTab === 'text'" class="p-3 space-y-3">
                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <User class="w-3 h-3 text-rose-500" /> Recipient Name
                  </p>
                  <input
                    v-model="recipientName"
                    type="text"
                    placeholder="Recipient name"
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Sparkles class="w-3 h-3 text-rose-500" /> Eyebrow Header
                  </p>
                  <input
                    v-model="heroEyebrow"
                    type="text"
                    placeholder="e.g. with love"
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Heading class="w-3 h-3 text-rose-500" /> Main Title
                  </p>
                  <input
                    v-model="heroTitle"
                    type="text"
                    placeholder="e.g. Happy birthday, my love."
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Type class="w-3 h-3 text-rose-500" /> Subtitle
                  </p>
                  <input
                    v-model="heroSubtitle"
                    type="text"
                    placeholder="e.g. Every moment with you..."
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Heart class="w-3 h-3 text-rose-500" /> Greeting
                  </p>
                  <input
                    v-model="greeting"
                    type="text"
                    placeholder="e.g. My love,"
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <FileText class="w-3 h-3 text-rose-500" /> Letter Body
                  </p>
                  <textarea
                    v-model="letterBodyText"
                    rows="6"
                    placeholder="Write your letter here..."
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide flex items-center gap-1"
                  >
                    <PenTool class="w-3 h-3 text-rose-500" /> Sign-off
                  </p>
                  <input
                    v-model="signoff"
                    type="text"
                    placeholder="e.g. yours, always"
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>
              </div>

              <!-- ─────── SETTINGS / STYLE PANEL ─────── -->
              <div v-else-if="activeTab === 'settings'" class="p-3 space-y-4">
                <!-- Who is this for -->
                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Users class="w-3 h-3 text-rose-500" /> Who is this for?
                  </p>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button
                      v-for="opt in relTypeOptions"
                      :key="opt.value"
                      @click="onRelTypeChange(opt.value as RelationshipType)"
                      class="flex items-center gap-2 px-2.5 py-2 rounded-xl border transition text-xs font-medium cursor-pointer"
                      :class="
                        selectedRelType === opt.value
                          ? 'bg-rose-50 border-rose-400 text-rose-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      "
                    >
                      <component
                        :is="opt.icon"
                        class="w-3.5 h-3.5 shrink-0"
                        :class="selectedRelType === opt.value ? 'text-rose-500' : 'text-gray-400'"
                      />
                      {{ opt.label }}
                    </button>
                  </div>
                </div>

                <!-- Particles -->
                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Sparkles class="w-3 h-3 text-rose-500" /> Floating Animation
                  </p>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button
                      v-for="opt in particleOptions"
                      :key="opt.value"
                      @click="particleType = opt.value as any"
                      class="flex items-center gap-2 px-2.5 py-2 rounded-xl border transition text-xs font-medium cursor-pointer"
                      :class="
                        particleType === opt.value
                          ? 'bg-rose-50 border-rose-400 text-rose-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      "
                    >
                      <component
                        :is="opt.icon"
                        class="w-3.5 h-3.5 shrink-0"
                        :class="particleType === opt.value ? 'text-rose-500' : 'text-gray-400'"
                      />
                      {{ opt.label }}
                    </button>
                  </div>
                </div>

                <!-- Seal -->
                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Stamp class="w-3 h-3 text-rose-500" /> Envelope Seal Symbol
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="s in sealOptions"
                      :key="s"
                      @click="sealChar = s"
                      class="w-9 h-9 rounded-xl border text-base flex items-center justify-center transition cursor-pointer"
                      :class="
                        sealChar === s
                          ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      "
                    >
                      {{ s }}
                    </button>
                  </div>
                </div>

                <!-- Music URL -->
                <div>
                  <p
                    class="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1"
                  >
                    <Music class="w-3 h-3 text-rose-500" /> Background Music URL
                    <span
                      v-if="!isPremiumUser"
                      class="ml-auto text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                    >
                      <Lock class="w-2.5 h-2.5" /> PRO
                    </span>
                  </p>

                  <div
                    v-if="!isPremiumUser"
                    class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1.5"
                  >
                    <p class="text-[11px] font-semibold text-amber-800">
                      Background Music is a Premium Feature
                    </p>
                    <p class="text-[10px] text-amber-600">
                      Upgrade to Single Pass (₱59) or Unlimited Pass (₱149) to add custom music
                      URLs.
                    </p>
                    <button
                      @click="showPricingModal = true"
                      class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition shadow-2xs cursor-pointer"
                    >
                      Unlock Music via QR
                    </button>
                  </div>

                  <input
                    v-else
                    v-model="musicUrl"
                    type="url"
                    placeholder="Paste Spotify / YouTube URL"
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-rose-400 transition"
                  />
                </div>

                <!-- Private Passcode & Privacy Status Badge -->
                <div class="pt-2.5 border-t border-gray-100 space-y-2">
                  <div class="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span class="flex items-center gap-1">
                      <Lock class="w-3 h-3 text-rose-400" /> Letter Privacy
                    </span>
                    <span
                      class="text-[9px] px-2 py-0.5 rounded-full font-semibold transition-all"
                      :class="passcode ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                    >
                      {{ passcode ? 'Private' : 'Public' }}
                    </span>
                  </div>

                  <!-- Sleek minimal compact status badge -->
                  <div
                    class="px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5 border transition-all"
                    :class="passcode
                      ? 'bg-rose-50/50 border-rose-200/80 text-rose-800'
                      : 'bg-emerald-50/50 border-emerald-200/80 text-emerald-800'"
                  >
                    <component :is="passcode ? Lock : Globe" class="w-3.5 h-3.5 shrink-0" />
                    <span class="font-medium text-[11px] truncate">
                      {{ passcode ? 'Requires passcode to unseal' : 'Anyone with link can view' }}
                    </span>
                  </div>

                  <!-- Compact input -->
                  <input
                    v-model="passcode"
                    type="text"
                    placeholder="Set secret passcode (optional)…"
                    class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/80 focus:bg-white focus:outline-none focus:border-rose-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- ── CANVAS AREA ────────────────────────────────── -->
        <div
          id="editor-canvas"
          class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center canvas-bg py-8 px-4 relative"
          @click.self="selectedElement = null"
        >
          <!-- Context toolbar — appears when element is selected -->
          <Transition name="toolbar-pop">
            <div
              v-if="selectedElement"
              class="sticky top-0 z-30 w-full flex justify-center mb-5 pointer-events-none"
            >
              <div
                class="flex items-center gap-1.5 bg-[#1d1d1f] rounded-2xl px-3 py-2 shadow-2xl pointer-events-auto"
                @mousedown.prevent="keepToolbarOpen"
              >
                <!-- Element label badge -->
                <span
                  class="text-[10px] font-semibold text-gray-400 border-r border-gray-700 pr-2.5 mr-0.5"
                >
                  Editing: <span class="text-white">{{ contextLabel }}</span>
                </span>

                <!-- Formatting actions -->
                <button
                  class="p-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition cursor-pointer"
                  title="Bold (select text first)"
                  @click="execFormat('bold')"
                >
                  <Bold class="w-3.5 h-3.5" />
                </button>
                <button
                  class="p-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition cursor-pointer"
                  title="Italic"
                  @click="execFormat('italic')"
                >
                  <Italic class="w-3.5 h-3.5" />
                </button>
                <button
                  class="p-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition cursor-pointer"
                  title="Align Left"
                  @click="execFormat('justifyLeft')"
                >
                  <AlignLeft class="w-3.5 h-3.5" />
                </button>

                <div class="w-px h-4 bg-gray-700" />

                <button
                  class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-900/40 hover:text-rose-300 transition cursor-pointer"
                  title="Deselect"
                  @click="selectedElement = null"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Transition>

          <!-- Letter Canvas Container (Scrollable) -->
          <div
            class="w-full relative transition-all duration-300 flex flex-col items-center"
            :class="previewMode === 'desktop' ? 'max-w-2xl' : 'max-w-md'"
            :style="{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }"
          >
            <!-- Canvas tip -->
            <div class="mb-4 text-center pointer-events-none">
              <div
                class="inline-flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/80 backdrop-blur-sm px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs"
              >
                <span>Click text to edit inline</span>
                <span class="text-gray-300">·</span>
                <span>Scroll down for Page 2</span>
              </div>
            </div>

            <!-- The 2-page letter component -->
            <LetterPreview
              :recipient-name="recipientName"
              :content="previewContent"
              :template-id="selectedTemplateId"
              :template="activeTemplate"
              :editable="true"
              @update:recipient-name="recipientName = $event"
              @update:field="handleCanvasFieldUpdate"
              @select:element="handleElementSelect"
              @blur.capture="clearSelection"
            />
          </div>

          <!-- Add content buttons floating at the bottom of canvas -->
          <div class="sticky bottom-4 flex items-center gap-2 mt-8 flex-wrap justify-center">
            <button
              @click="scrollToPage(1)"
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-xs transition cursor-pointer"
            >
              <Mail class="w-3.5 h-3.5 text-rose-500" />
              <span>Page 1: Envelope</span>
            </button>
            <button
              @click="scrollToPage(2)"
              class="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-xs transition cursor-pointer"
            >
              <FileText class="w-3.5 h-3.5 text-rose-500" />
              <span>Page 2: Letter</span>
            </button>
            <button
              @click="handleSave"
              :disabled="saving"
              class="flex items-center gap-1.5 px-5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[11px] font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              <span>{{ saving ? 'Saving...' : 'Publish Letter' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Pricing & Upgrade Modal -->
    <PricingModal v-model:open="showPricingModal" />
  </EditorLayout>
</template>

<style scoped>
/* Canvas background — design canvas gray */
.canvas-bg {
  background-color: #e8e8e8;
  background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
}

/* Letter paper card */
.letter-paper {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 24px 64px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: width 0.3s ease;
}

/* Panel slide animation */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
  overflow: hidden;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  width: 0 !important;
  opacity: 0;
}
.panel-slide-enter-to,
.panel-slide-leave-from {
  width: 288px;
  opacity: 1;
}

/* Toolbar pop animation */
.toolbar-pop-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toolbar-pop-leave-active {
  transition: all 0.15s ease;
}
.toolbar-pop-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.toolbar-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
