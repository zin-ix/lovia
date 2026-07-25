<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { LetterContent } from '@/types/letter.types'
import type { Template } from '@/types/template.types'
import { useTemplateStore } from '@/stores/template/template.store'
import { BUILTIN_TEMPLATES } from '@/data/templates.data'
import { Lock, KeyRound, X, Sparkles } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    recipientName: string
    content: LetterContent
    templateId?: string
    template?: Template
    editable?: boolean
  }>(),
  {
    editable: false,
  },
)

const emit = defineEmits<{
  (e: 'update:recipientName', val: string): void
  (e: 'update:field', payload: { key: string; value: any; index?: number; subkey?: string }): void
  (e: 'delete:item', payload: { type: 'timeline' | 'polaroid' | 'flipCard'; index: number }): void
  (
    e: 'move:item',
    payload: {
      type: 'timeline' | 'polaroid' | 'flipCard'
      index: number
      direction: 'up' | 'down'
    },
  ): void
  (e: 'select:element', payload: { key: string; label: string }): void
  (e: 'open:envelope'): void
}>()

// ── Element selection for Canva-style editor ──
const selectedKey = ref<string | null>(null)
let blurTimer: ReturnType<typeof setTimeout> | null = null

function onFocusEl(key: string, label: string) {
  if (blurTimer) clearTimeout(blurTimer)
  selectedKey.value = key
  if (props.editable) emit('select:element', { key, label })
}

function onBlurEl() {
  blurTimer = setTimeout(() => {
    selectedKey.value = null
  }, 250)
}

function isSelected(key: string) {
  return props.editable && selectedKey.value === key
}

const templateStore = useTemplateStore()

const activeTemplate = computed<Template>(() => {
  if (props.template) return props.template
  return templateStore.getTemplate(props.templateId) || (BUILTIN_TEMPLATES[0] as Template)
})

const theme = computed(() => activeTemplate.value.theme_config)

const activeParticleType = computed(() => {
  return props.content.particleType || theme.value.particleType || 'rose'
})

const rootStyles = computed(() => ({
  '--bg': theme.value.bg || '#fff8f8',
  '--paper': theme.value.paper || '#ffffff',
  '--paper-shadow': theme.value.paperShadow || '#fce7e7',
  '--blossom': theme.value.blossom || '#fda4af',
  '--blossom-deep': theme.value.blossomDeep || '#f43f5e',
  '--ink': theme.value.ink || '#1d1d1f',
  '--ink-soft': theme.value.inkSoft || '#6e6e73',
  '--line': theme.value.line || '#fce7e7',
  '--accent': theme.value.accent || '#f43f5e',
  '--font-heading': theme.value.fontHeading || "'Playfair Display', serif",
  '--font-body': theme.value.fontBody || "'Cormorant Garamond', serif",
  '--font-script': theme.value.fontScript || "'Great Vibes', cursive",
}))

// ── Editable canvas helpers ──
function handleInput(key: string, e: Event, index?: number, subkey?: string) {
  if (!props.editable) return
  const text = (e.target as HTMLElement).innerText
  emit('update:field', { key, value: text, index, subkey })
}
function handleNameInput(e: Event) {
  if (!props.editable) return
  const text = (e.target as HTMLElement).innerText.replace(/^for\s+/i, '').trim()
  emit('update:recipientName', text)
}

function onBlurInput(key: string, e: Event, index?: number, subkey?: string) {
  handleInput(key, e, index, subkey)
  onBlurEl()
}
function onBlurName(e: Event) {
  handleNameInput(e)
  onBlurEl()
}

// ── Envelope Opening Animation State ──
const opened = ref(false)
const flapOpen = ref(false)
const stageHidden = ref(false)
const hintVisible = ref(true)

// ── Passcode Protection State ──
const showPasscodeModal = ref(false)
const inputPasscode = ref('')
const passcodeError = ref(false)
const isUnlocked = ref(false)

const openEnvelope = () => {
  if (opened.value) return
  if (props.content.passcode && !isUnlocked.value) {
    showPasscodeModal.value = true
    return
  }
  hintVisible.value = false
  setTimeout(() => {
    flapOpen.value = true
  }, 150)
  setTimeout(() => {
    opened.value = true
    emit('open:envelope')
    setTimeout(() => {
      const el = document.getElementById('page-2-letter')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }, 900)
  setTimeout(() => {
    stageHidden.value = true
  }, 1700)
}

function verifyPasscode() {
  if (inputPasscode.value.trim() === (props.content.passcode || '').trim()) {
    isUnlocked.value = true
    showPasscodeModal.value = false
    passcodeError.value = false
    openEnvelope()
  } else {
    passcodeError.value = true
  }
}

function testOpenEnvelope() {
  opened.value = false
  flapOpen.value = false
  stageHidden.value = false
  hintVisible.value = true
  isUnlocked.value = false
  setTimeout(() => openEnvelope(), 100)
}

// ── Particles ──
const particles = ref<
  { id: number; left: number; dur: number; sway: number; delay: number; size: number }[]
>([])
onMounted(() => {
  for (let i = 0; i < 20; i++) {
    particles.value.push({
      id: i,
      left: Math.random() * 100,
      dur: 9 + Math.random() * 7,
      sway: 2 + Math.random() * 3,
      delay: Math.random() * 14,
      size: 0.7 + Math.random() * 0.6,
    })
  }
})
</script>

<template>
  <div class="lp-root" :style="rootStyles">
    <!-- ── Passcode Protection Modal (Ultra Minimalist Shadcn Dialog Pop) ── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showPasscodeModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto"
        @click.self="showPasscodeModal = false"
      >
        <div
          class="w-full max-w-[320px] bg-white rounded-[28px] p-6 text-center shadow-2xl border border-black/5 relative animate-in fade-in-0 zoom-in-95 duration-200 space-y-4"
        >
          <!-- Close button -->
          <button
            @click="showPasscodeModal = false"
            class="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Minimal Icon & Header -->
          <div class="space-y-1.5 pt-1">
            <div class="w-12 h-12 rounded-full bg-rose-50/80 text-rose-500 flex items-center justify-center mx-auto shadow-2xs">
              <Lock class="w-5 h-5" />
            </div>
            <h3 class="text-base font-bold text-gray-900 tracking-tight">Protected Letter</h3>
            <p class="text-[11px] text-gray-500 leading-relaxed px-2">
              Enter the passcode set by the sender to open this letter.
            </p>
          </div>

          <!-- Passcode Input -->
          <div class="space-y-1.5">
            <input
              v-model="inputPasscode"
              type="password"
              placeholder="Passcode"
              class="w-full text-center text-sm font-mono tracking-widest px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
              :class="{ 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-100': passcodeError }"
              @keyup.enter="verifyPasscode"
            />
            <p v-if="passcodeError" class="text-[11px] font-medium text-rose-500 animate-bounce">
              Incorrect passcode. Try again!
            </p>
          </div>

          <!-- Unlock Button -->
          <button
            @click="verifyPasscode"
            class="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            Unlock Letter
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Falling Particles ── -->
    <div v-if="activeParticleType !== 'none'" class="lp-petals" aria-hidden="true">
      <span
        v-for="p in particles"
        :key="p.id"
        class="lp-particle"
        :class="{
          'lp-p-rose': activeParticleType === 'rose',
          'lp-p-sakura': activeParticleType === 'sakura',
          'lp-p-star': activeParticleType === 'stars',
          'lp-p-heart': activeParticleType === 'hearts',
          'lp-p-lavender': activeParticleType === 'lavender',
        }"
        :style="{
          left: p.left + '%',
          transform: `scale(${p.size})`,
          animationDuration: `${p.dur}s, ${p.sway}s`,
          animationDelay: `-${p.delay}s, -${p.delay}s`,
        }"
      />
    </div>

    <div class="lp-pages-wrapper" :class="{ 'lp-editor-mode': editable }">
      <div
        id="page-1-envelope"
        class="lp-page-card lp-page-1"
        :class="{ 'lp-stage-out': !editable && stageHidden }"
      >
        <!-- Canva Page Header Badge (Editor mode) -->
        <div v-if="editable" class="lp-page-label">
          <span class="lp-badge-num">PAGE 1</span>
          <span class="lp-badge-text">Envelope Cover</span>
          <button
            @click="testOpenEnvelope"
            class="lp-preview-anim-btn"
            title="Test envelope open animation"
          >
            ▶ Play Animation
          </button>
        </div>

        <div class="lp-stage">
          <!-- Whisper -->
          <div
            class="lp-whisper"
            :contenteditable="editable"
            @focus="onFocusEl('whisper', 'Whisper')"
            @blur="(e) => onBlurInput('whisper', e)"
            :class="{ 'lp-edit': editable, 'lp-selected': isSelected('whisper') }"
          >
            {{ content.whisper || 'a letter arrived for you' }}
          </div>

          <!-- Recipient -->
          <div
            class="lp-stage-name"
            :contenteditable="editable"
            @focus="onFocusEl('recipientName', 'Recipient Name')"
            @blur="onBlurName"
            :class="{ 'lp-edit': editable, 'lp-selected': isSelected('recipientName') }"
          >
            for {{ recipientName || '[name]' }}
          </div>

          <!-- ── Simple Pink Envelope with Heart ── -->
          <div
            class="lp-env-wrap"
            @click="openEnvelope"
            role="button"
            tabindex="0"
            @keydown.enter="openEnvelope"
          >
            <div class="lp-envelope">
              <!-- Back panel -->
              <div class="lp-env-body" />

              <!-- Bottom V-fold shadow lines -->
              <div class="lp-fold-left" />
              <div class="lp-fold-right" />
              <div class="lp-fold-bottom" />

              <!-- Flap -->
              <div class="lp-flap" :class="{ 'lp-flap-open': flapOpen }" />

              <!-- Paper peeking out -->
              <div class="lp-paper-peek" :class="{ 'lp-paper-rise': flapOpen }">
                <div
                  class="lp-peek-greeting"
                  :contenteditable="editable"
                  @focus="onFocusEl('greeting', 'Greeting')"
                  @blur="(e) => onBlurInput('greeting', e)"
                  :class="{ 'lp-edit': editable, 'lp-selected': isSelected('greeting') }"
                >
                  {{ content.greeting || 'My love,' }}
                </div>
                <div class="lp-peek-line" />
                <div class="lp-peek-line lp-peek-line-short" />
                <div class="lp-peek-snippet">
                  {{
                    (content.letterBodyParagraphs?.[0] || '').slice(0, 40) || 'the rest is inside…'
                  }}
                </div>
              </div>

              <!-- Heart seal — simple pink with heartbeat pulse -->
              <div class="lp-heart-seal" :class="{ 'lp-seal-gone': opened }">
                <svg viewBox="0 0 24 24" fill="currentColor" class="lp-heart-icon">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </div>
            </div>

            <!-- Tap hint -->
            <p class="lp-hint" :class="{ 'lp-hint-gone': !hintVisible }">
              tap heart seal to open letter
            </p>
          </div>
        </div>
      </div>
      <div
        id="page-2-letter"
        class="lp-page-card lp-page-2 grid transition-[grid-template-rows,opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'grid-rows-[0fr] opacity-0 translate-y-8 pointer-events-none border-none py-0 my-0': !editable && !opened,
          'grid-rows-[1fr] opacity-100 translate-y-0': editable || opened
        }"
      >
        <div class="overflow-hidden min-h-0 w-full">
          <!-- Canva Page Header Badge (Editor mode) -->
          <div v-if="editable" class="lp-page-label">
            <span class="lp-badge-num">PAGE 2</span>
            <span class="lp-badge-text">Love Letter</span>
          </div>

          <div class="lp-canvas">
            <!-- ── Hero Section ── -->
            <div class="lp-section">
              <div
                class="lp-eyebrow"
                :contenteditable="editable"
                @focus="onFocusEl('heroEyebrow', 'Eyebrow')"
                @blur="(e) => onBlurInput('heroEyebrow', e)"
                :class="{ 'lp-edit': editable, 'lp-selected': isSelected('heroEyebrow') }"
              >
                {{ content.heroEyebrow || 'with love' }}
              </div>
              <h1
                class="lp-hero-title"
                :contenteditable="editable"
                @focus="onFocusEl('heroTitle', 'Heading')"
                @blur="(e) => onBlurInput('heroTitle', e)"
                :class="{ 'lp-edit': editable, 'lp-selected': isSelected('heroTitle') }"
              >
                {{ content.heroTitle || 'Happy birthday, my love.' }}
              </h1>
              <p
                class="lp-hero-sub"
                :contenteditable="editable"
                @focus="onFocusEl('heroSubtitle', 'Subtitle')"
                @blur="(e) => onBlurInput('heroSubtitle', e)"
                :class="{ 'lp-edit': editable, 'lp-selected': isSelected('heroSubtitle') }"
              >
                {{
                  content.heroSubtitle ||
                  'Every moment with you feels like the beginning of something beautiful.'
                }}
              </p>
            </div>

            <!-- Soft pink divider line -->
            <div class="lp-divider" />

            <!-- ── Letter Body Section ── -->
            <div class="lp-section">
              <div
                class="lp-eyebrow"
                :contenteditable="editable"
                @focus="onFocusEl('letterEyebrow', 'Section Label')"
                @blur="(e) => onBlurInput('letterEyebrow', e)"
                :class="{ 'lp-edit': editable, 'lp-selected': isSelected('letterEyebrow') }"
              >
                {{ content.letterEyebrow || 'a letter for you' }}
              </div>

              <div
                class="lp-greeting"
                :contenteditable="editable"
                @focus="onFocusEl('greeting', 'Greeting')"
                @blur="(e) => onBlurInput('greeting', e)"
                :class="{ 'lp-edit': editable, 'lp-selected': isSelected('greeting') }"
              >
                {{ content.greeting || 'My love,' }}
              </div>

              <div class="lp-body-text">
                <p
                  v-for="(para, i) in content.letterBodyParagraphs"
                  :key="i"
                  :contenteditable="editable"
                  @focus="onFocusEl('letterBodyParagraphs-' + i, 'Letter Body')"
                  @blur="(e) => onBlurInput('letterBodyParagraphs', e, i)"
                  :class="{
                    'lp-edit': editable,
                    'lp-selected': isSelected('letterBodyParagraphs-' + i),
                  }"
                >
                  {{ para }}
                </p>
              </div>

              <div
                class="lp-signoff"
                :contenteditable="editable"
                @focus="onFocusEl('signoff', 'Sign-off')"
                @blur="(e) => onBlurInput('signoff', e)"
                :class="{ 'lp-edit': editable, 'lp-selected': isSelected('signoff') }"
              >
                {{ content.signoff || 'yours, always' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');

/* ── Root ── */
.lp-root {
  position: relative;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  overflow-x: hidden;
  min-height: 100vh;
  width: 100%;
  transition: background 0.5s ease;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* ── Canva Pages Wrapper ── */
.lp-pages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 3rem 1rem 4rem;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}
.lp-pages-wrapper.lp-editor-mode {
  gap: 3rem;
  min-height: auto;
}

/* ── Canva Page Cards ── */
.lp-page-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: var(--paper);
  border-radius: 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--line);
  overflow: hidden;
  transition: all 0.3s ease;
}

.lp-editor-mode .lp-page-card {
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);
}

/* Page Header Label Badge */
.lp-page-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--line);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #6b7280;
}
.lp-badge-num {
  background: var(--accent);
  color: white;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  font-size: 9px;
}
.lp-badge-text {
  color: var(--ink);
}
.lp-preview-anim-btn {
  margin-left: auto;
  font-size: 9px;
  color: var(--accent);
  background: var(--paper);
  border: 1px solid var(--accent);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.lp-preview-anim-btn:hover {
  background: var(--accent);
  color: white;
}

/* ── Particles ── */
.lp-petals {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}
.lp-particle {
  position: absolute;
  top: -16px;
  animation-name: lp-fall, lp-sway;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
}
.lp-p-rose {
  width: 7px;
  height: 5px;
  background: var(--blossom);
  border-radius: 0 70% 0 70%;
  opacity: 0.6;
}
.lp-p-sakura {
  width: 6px;
  height: 6px;
  background: #fbcfe8;
  border-radius: 50% 0 50% 50%;
  box-shadow: 0 0 3px #ec4899;
  opacity: 0.7;
}
.lp-p-star {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--blossom);
  box-shadow: 0 0 5px var(--accent);
  opacity: 0.75;
}
.lp-p-heart {
  width: 5px;
  height: 5px;
  background: var(--blossom-deep);
  transform: rotate(-45deg);
  border-radius: 1px;
  opacity: 0.55;
}
.lp-p-lavender {
  width: 5px;
  height: 8px;
  background: #c4b5fd;
  border-radius: 50%;
  box-shadow: 0 0 4px #8b5cf6;
  opacity: 0.65;
}

@keyframes lp-fall {
  to {
    transform: translateY(110vh) rotate(400deg);
  }
}
@keyframes lp-sway {
  0%,
  100% {
    margin-left: 0;
  }
  50% {
    margin-left: 28px;
  }
}

/* ── Editable states ── */
.lp-edit {
  border-radius: 4px;
  transition:
    outline 0.2s,
    background 0.2s;
  cursor: text;
  min-width: 4px;
}
.lp-edit:hover {
  outline: 1.5px dashed rgba(244, 63, 94, 0.5);
  background: rgba(255, 255, 255, 0.25);
}
.lp-edit:focus {
  outline: none;
  background: transparent;
}

/* Canva-style blue selection ring */
.lp-selected {
  outline: 2px solid #3b82f6 !important;
  background: rgba(59, 130, 246, 0.04) !important;
  border-radius: 4px;
  outline-offset: 1px;
}

/* ── Envelope Stage ── */
.lp-stage {
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  text-align: center;
  transition:
    opacity 0.8s ease,
    visibility 0.8s ease,
    max-height 0.8s ease;
  z-index: 3;
}
.lp-stage-out {
  opacity: 0 !important;
  transform: translateY(-20px) scale(0.96) !important;
  max-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  border: none !important;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.lp-whisper {
  font-size: 0.65rem;
  font-style: italic;
  color: var(--ink-soft);
  letter-spacing: 0.05em;
  margin-bottom: 0.3rem;
}
.lp-stage-name {
  font-family: var(--font-script);
  font-size: 1.5rem;
  color: var(--accent);
  margin-bottom: 1.75rem;
  line-height: 1.3;
}

/* ── Simple Pink Envelope ── */
.lp-env-wrap {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  outline: none;
}
.lp-env-wrap:focus-visible .lp-envelope {
  box-shadow: 0 0 0 3px var(--accent);
}

.lp-envelope {
  position: relative;
  width: 220px;
  height: 155px;
  overflow: hidden;
  border-radius: 6px;
  filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.12));
  transition:
    filter 0.3s ease,
    transform 0.2s ease;
}
.lp-envelope:hover {
  filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.16));
  transform: translateY(-2px);
}

/* Envelope back body — dynamic theme background */
.lp-env-body {
  position: absolute;
  inset: 0;
  background: var(--paper-shadow);
  border: 1.5px solid var(--line);
  border-radius: 6px;
  z-index: 1;
}

/* Bottom fold triangles — dynamic theme colors */
.lp-fold-left {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 77px 0 0 110px;
  border-color: transparent transparent transparent var(--blossom);
  opacity: 0.6;
  z-index: 3;
}
.lp-fold-right {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 77px 110px 0 0;
  border-color: transparent var(--blossom) transparent transparent;
  opacity: 0.6;
  z-index: 3;
}
.lp-fold-bottom {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 110px 62px 110px;
  border-color: transparent transparent var(--blossom-deep) transparent;
  opacity: 0.4;
  z-index: 3;
}

/* Flap — top theme triangle */
.lp-flap {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 80px 110px 0 110px;
  border-color: var(--blossom-deep) transparent transparent transparent;
  opacity: 0.8;
  transform-origin: top center;
  transition:
    transform 0.9s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s;
  z-index: 4;
}
.lp-flap-open {
  transform: rotateX(180deg);
  opacity: 0.2;
  z-index: 1;
}

/* Paper peeking out of envelope */
.lp-paper-peek {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 10px;
  height: 88px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 0.5rem 0.65rem 0.35rem;
  z-index: 2;
  transition:
    transform 0.9s 0.35s cubic-bezier(0.2, 0.85, 0.3, 1),
    box-shadow 0.4s;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}
.lp-paper-rise {
  transform: translateY(-55px);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.12);
}

.lp-peek-greeting {
  font-family: var(--font-script);
  font-size: 0.72rem;
  color: var(--accent);
  margin-bottom: 0.28rem;
}
.lp-peek-line {
  height: 1px;
  background: var(--line);
  margin: 0.25rem 0;
}
.lp-peek-line-short {
  width: 60%;
}
.lp-peek-snippet {
  font-size: 0.43rem;
  font-style: italic;
  color: var(--ink-soft);
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-top: 0.35rem;
}

/* ── Heart / Custom Seal ── */
.lp-heart-seal {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  background: var(--paper);
  border-radius: 50%;
  border: 2px solid var(--blossom);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.15),
    0 0 0 4px var(--paper);
  transition:
    transform 0.4s ease,
    opacity 0.3s ease;
  animation: lp-heartbeat 2.6s ease-in-out infinite;
}
.lp-heart-seal.lp-seal-gone {
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  animation: none;
}

.lp-heart-icon {
  width: 22px;
  height: 22px;
  color: #f43f5e;
}

@keyframes lp-heartbeat {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  14% {
    transform: translate(-50%, -50%) scale(1.08);
  }
  28% {
    transform: translate(-50%, -50%) scale(1);
  }
  42% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  70% {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Tap hint */
.lp-hint {
  font-size: 0.6rem;
  font-style: italic;
  color: var(--ink-soft);
  letter-spacing: 0.03em;
  transition: opacity 0.4s;
}
.lp-hint-gone {
  opacity: 0;
}

/* ── Letter Canvas Page ── */
.lp-canvas {
  position: relative;
  z-index: 3;
  padding: 2.5rem 2rem 3rem;
  max-width: 100%;
}

/* Eyebrow */
.lp-eyebrow {
  font-size: 0.65rem;
  font-style: italic;
  color: var(--accent);
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}

/* Hero Title */
.lp-hero-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.25;
  margin: 0 0 0.5rem;
}
.lp-hero-sub {
  font-size: 0.78rem;
  color: var(--ink-soft);
  line-height: 1.7;
  margin: 0;
}

/* Soft Divider Line */
.lp-divider {
  height: 1px;
  background: var(--line);
  margin: 1.75rem 0;
  opacity: 0.75;
}

/* Greeting */
.lp-greeting {
  font-size: 0.85rem;
  color: var(--ink);
  font-weight: 500;
  margin-top: 0.5rem;
  margin-bottom: 0.9rem;
}

/* Body text */
.lp-body-text p {
  font-size: 0.78rem;
  line-height: 1.9;
  color: var(--ink);
  margin: 0 0 0.8rem;
  white-space: pre-wrap;
}
.lp-signoff {
  text-align: right;
  font-family: var(--font-script);
  font-size: 1.35rem;
  color: var(--accent);
  margin-top: 1rem;
}

/* Typography baseline */
.lp-root h1,
.lp-root h2 {
  font-family: var(--font-heading);
  font-weight: 600;
  margin: 0;
}
.lp-root ::selection {
  background: var(--blossom);
  color: var(--paper);
}
</style>
