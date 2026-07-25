<script setup lang="ts">
import { ref } from 'vue'
import logoWithWord from '@/assets/images/logo_w_word.png'
import {
  Sparkles,
  ArrowRight,
  Mail,
  Shield,
  Layers,
  Play,
  Check,
  Heart,
  Music,
  Lock,
  Flower2,
  Palette,
  ChevronRight,
  Camera,
  Quote,
} from '@lucide/vue'

const activeFaq = ref<number | null>(null)

function toggleFaq(index: number) {
  activeFaq.value = activeFaq.value === index ? null : index
}

const templatesPreview = [
  {
    name: 'Romantic Rose',
    category: 'Romantic',
    bg: '#fff8f8',
    accent: '#f43f5e',
    seal: '♡',
    desc: 'Soft blush paper wrapped in rose petals & cursive script.',
    free: true,
  },
  {
    name: 'Cherry Blossom',
    category: 'Birthday',
    bg: '#fff5f7',
    accent: '#ec4899',
    seal: '🌸',
    desc: 'Joyful birthday letter with falling sakura petals.',
    free: false,
  },
  {
    name: 'Midnight Stars',
    category: 'Long Distance',
    bg: '#f8fafc',
    accent: '#d97706',
    seal: '✦',
    desc: 'Quiet starlit letter for long distance love.',
    free: false,
  },
  {
    name: 'Golden Proposal',
    category: 'Special',
    bg: '#fffbeb',
    accent: '#d97706',
    seal: '⚜',
    desc: 'Champagne gold elegance for major promises.',
    free: false,
  },
]

const features = [
  {
    icon: Mail,
    title: 'Interactive 3D Envelope',
    desc: 'Real animated envelope with a heart seal that recipients tap to unseal.',
  },
  {
    icon: Music,
    title: 'Background Soundtracks',
    desc: 'Set the mood with custom YouTube or audio music played on open.',
  },
  {
    icon: Lock,
    title: 'Passcode Protection',
    desc: 'Keep private letters secret with custom passcode unseal protection.',
  },
  {
    icon: Flower2,
    title: 'Falling Petal Effects',
    desc: 'Enchanting animations of rose petals, sakura, stars, or lavender.',
  },
  {
    icon: Camera,
    title: 'Polaroid & Timelines',
    desc: 'Embed photo polaroids, flip cards, and relationship milestone timelines.',
  },
  {
    icon: Palette,
    title: 'Aesthetic Themes',
    desc: 'Curated typography, color palettes, and Google fonts designed to wow.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Choose a Theme',
    desc: 'Select from Romantic Rose, Midnight Stars, Sakura, and 8+ curated templates.',
  },
  {
    number: '02',
    title: 'Personalize & Write',
    desc: 'Add your message, recipient name, polaroids, music soundtrack, and optional passcode.',
  },
  {
    number: '03',
    title: 'Share the Keepsake',
    desc: 'Send a private link or QR code to your loved one. Accessible anytime on any device.',
  },
]

const faqs = [
  {
    q: 'How do recipients view the letter?',
    a: 'Recipients simply open the unique link or scan the QR code you share with them. No app installation or sign-up is required for guests.',
  },
  {
    q: 'Can I add custom background music?',
    a: 'Yes! You can paste any YouTube or audio track link to automatically play when the letter opens.',
  },
  {
    q: 'Is my letter private?',
    a: 'Absolutely. You can set a secret passcode so only your intended recipient can unseal and read your letter.',
  },
  {
    q: 'How long do keepsakes stay online?',
    a: 'Your letters remain saved securely online so your loved ones can revisit their keepsake anytime.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#fafafc] text-[#1d1d1f] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
    <!-- Apple Frosted Glass Navbar -->
    <header class="w-full bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-50 h-14">
      <div class="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2">
          <img :src="logoWithWord" alt="Lovia" class="h-5.5 w-auto object-contain" />
        </router-link>

        <nav class="hidden md:flex items-center gap-7 text-xs font-medium text-gray-500">
          <a href="#features" class="hover:text-rose-500 transition">Features</a>
          <a href="#templates" class="hover:text-rose-500 transition">Templates</a>
          <a href="#how-it-works" class="hover:text-rose-500 transition">How It Works</a>
          <a href="#about" class="hover:text-rose-500 transition">About</a>
          <a href="#faq" class="hover:text-rose-500 transition">FAQ</a>
        </nav>

        <div class="flex items-center gap-2.5">
          <router-link
            to="/auth/login"
            class="text-xs font-semibold text-gray-600 hover:text-rose-500 transition px-3 py-1.5"
          >
            Sign In
          </router-link>
          <router-link
            to="/auth/register"
            class="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full transition shadow-2xs"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </header>

    <!-- ── 1. Hero Section (Airy, Light, Minimalist) ───────────────────────── -->
    <section class="relative pt-16 pb-16 px-6 overflow-hidden">
      <!-- Soft ambient background light -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-rose-100/50 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div class="max-w-3xl mx-auto text-center space-y-6">
        <!-- Eyebrow Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-rose-100 rounded-full text-[11px] font-semibold text-rose-500 shadow-2xs">
          <Sparkles class="w-3 h-3 text-rose-400" />
          <span>Interactive Digital Keepsakes</span>
        </div>

        <!-- Hero Headline -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
          Say It in a Letter They Will <span class="text-rose-500">Keep Forever</span>.
        </h1>

        <!-- Subtitle -->
        <p class="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Compose minimal 3D letters with interactive wax seals, background music, polaroid photo galleries, and password privacy protection.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <router-link
            to="/auth/register"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-full transition shadow-xs cursor-pointer"
          >
            Create Your First Letter <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
          <router-link
            to="/l/demo"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs rounded-full border border-gray-200 transition shadow-2xs cursor-pointer"
          >
            <Play class="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> View Live Demo
          </router-link>
        </div>

        <!-- Trust Chips -->
        <div class="flex flex-wrap items-center justify-center gap-5 pt-4 text-[11px] text-gray-400 font-medium">
          <span class="flex items-center gap-1.5"><Check class="w-3.5 h-3.5 text-rose-400" /> Free Standard Letter</span>
          <span class="flex items-center gap-1.5"><Check class="w-3.5 h-3.5 text-rose-400" /> No App Required</span>
          <span class="flex items-center gap-1.5"><Check class="w-3.5 h-3.5 text-rose-400" /> Mobile &amp; Desktop</span>
        </div>
      </div>

      <!-- Hero Interactive Card Preview Mockup -->
      <div class="max-w-2xl mx-auto mt-12">
        <div class="bg-white border border-gray-200/80 rounded-[24px] p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-center gap-5 relative z-10">
            <!-- Simulated Envelope Card -->
            <div class="w-full sm:w-56 bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center space-y-2.5 shrink-0">
              <span class="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Sample Keepsake</span>
              <div class="w-10 h-10 bg-white rounded-full border border-rose-200 text-rose-500 flex items-center justify-center mx-auto shadow-2xs">
                <Heart class="w-5 h-5 fill-rose-400 text-rose-400 animate-pulse" />
              </div>
              <div>
                <p class="text-[11px] text-gray-400 italic">a letter arrived for you</p>
                <p class="text-sm font-bold text-rose-600 mt-0.5">for My Love</p>
              </div>
              <p class="text-[9px] text-gray-400">tap heart seal to unseal</p>
            </div>

            <!-- Letter Snippet -->
            <div class="space-y-2.5 text-left flex-1">
              <span class="px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-semibold uppercase rounded-full border border-rose-100">
                Romantic Rose Theme
              </span>
              <h3 class="text-base font-bold text-gray-900 leading-snug">
                "Every moment with you feels like the beginning of something beautiful."
              </h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                Written with custom background music, polaroid gallery, and passcode protection.
              </p>
              <div class="flex items-center gap-3 text-[11px] font-semibold text-rose-500 pt-1">
                <span class="flex items-center gap-1"><Music class="w-3 h-3" /> Audio Track</span>
                <span class="flex items-center gap-1"><Lock class="w-3 h-3" /> Passcode Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 2. Features Section (Light Cards) ───────────────────────────────── -->
    <section id="features" class="py-16 px-6 bg-white border-y border-gray-100">
      <div class="max-w-4xl mx-auto space-y-10">
        <div class="text-center space-y-2 max-w-md mx-auto">
          <span class="text-[11px] font-bold uppercase tracking-widest text-rose-500">Why Choose Lovia</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Designed for Meaningful Moments
          </h2>
          <p class="text-xs text-gray-500">
            Everything you need to craft an unforgettable digital letter keepsake.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="(feat, i) in features"
            :key="i"
            class="bg-[#fafafc] border border-gray-100 rounded-2xl p-5 space-y-2.5 hover:border-rose-200 transition duration-200"
          >
            <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
              <component :is="feat.icon" class="w-4 h-4" />
            </div>
            <h3 class="text-sm font-bold text-gray-900">{{ feat.title }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 3. Template Showcase (Light Aesthetic Cards) ──────────────────────── -->
    <section id="templates" class="py-16 px-6">
      <div class="max-w-4xl mx-auto space-y-10">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gray-200/60 pb-4">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-widest text-rose-500">Template Catalog</span>
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Curated Aesthetic Themes</h2>
          </div>
          <router-link
            to="/auth/register"
            class="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            Explore All Templates <ChevronRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(tpl, i) in templatesPreview"
            :key="i"
            class="bg-white border border-gray-200/70 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div
              class="h-32 p-3.5 flex flex-col justify-between border-b border-gray-100"
              :style="{ backgroundColor: tpl.bg }"
            >
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-gray-700 shadow-2xs">
                  {{ tpl.category }}
                </span>
                <span class="w-5 h-5 rounded-full bg-white text-xs font-bold flex items-center justify-center shadow-2xs" :style="{ color: tpl.accent }">
                  {{ tpl.seal }}
                </span>
              </div>
              <h4 class="text-xs font-bold text-gray-900">{{ tpl.name }}</h4>
            </div>
            <div class="p-3.5 space-y-2 bg-white">
              <p class="text-[11px] text-gray-500 leading-normal">{{ tpl.desc }}</p>
              <span
                class="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md"
                :class="tpl.free ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'"
              >
                {{ tpl.free ? 'Free Template' : 'Pro Template' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 4. How It Works Section ─────────────────────────────────────────── -->
    <section id="how-it-works" class="py-16 px-6 bg-white border-y border-gray-100">
      <div class="max-w-4xl mx-auto space-y-10">
        <div class="text-center space-y-2 max-w-sm mx-auto">
          <span class="text-[11px] font-bold uppercase tracking-widest text-rose-500">Simple Process</span>
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">How Lovia Works</h2>
          <p class="text-xs text-gray-500">Three easy steps to compose and share your keepsake.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="bg-[#fafafc] border border-gray-100 rounded-2xl p-6 space-y-3 relative"
          >
            <span class="text-2xl font-bold text-rose-400/40 font-mono">{{ step.number }}</span>
            <h3 class="text-sm font-bold text-gray-900">{{ step.title }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 5. About Section (Light Cream Banner, Not Bulky) ────────────────── -->
    <section id="about" class="py-16 px-6 bg-[#fdfaf8] border-b border-gray-100 relative">
      <div class="max-w-2xl mx-auto text-center space-y-4">
        <div class="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Quote class="w-5 h-5" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-snug">
          "In a fast-paced world, handwritten feelings deserve a timeless digital home."
        </h2>
        <p class="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
          Lovia brings back the thoughtful magic of love letters, birthday notes, and milestone keepsakes — elevated with music, interactive wax seals, and aesthetic design.
        </p>
      </div>
    </section>

    <!-- ── 6. FAQ Accordion ────────────────────────────────────────────────── -->
    <section id="faq" class="py-16 px-6 bg-white border-b border-gray-100">
      <div class="max-w-2xl mx-auto space-y-8">
        <div class="text-center space-y-1.5">
          <span class="text-[11px] font-bold uppercase tracking-widest text-rose-500">FAQ</span>
          <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="border border-gray-200/80 rounded-xl overflow-hidden"
          >
            <button
              @click="toggleFaq(i)"
              class="w-full px-4 py-3 text-left text-xs font-bold text-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
            >
              <span>{{ faq.q }}</span>
              <span class="text-rose-500 text-base leading-none">{{ activeFaq === i ? '−' : '+' }}</span>
            </button>
            <div v-if="activeFaq === i" class="px-4 pb-3.5 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2.5">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 7. Call to Action Banner (Light & Airy) ─────────────────────────── -->
    <section class="py-16 px-6 text-center">
      <div class="max-w-xl mx-auto bg-rose-50/50 border border-rose-100 rounded-[28px] p-8 sm:p-10 space-y-5">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Ready to Create Something Unforgettable?
        </h2>
        <p class="text-xs text-gray-500 leading-relaxed">
          Craft your digital letter keepsake in minutes. Free forever for standard letters.
        </p>
        <router-link
          to="/auth/register"
          class="inline-flex items-center gap-2 px-7 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-full transition shadow-xs cursor-pointer"
        >
          Get Started for Free <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>
    </section>

    <!-- Apple-Style Minimal Footer -->
    <footer class="w-full bg-white border-t border-gray-100 py-6 text-xs text-gray-400">
      <div class="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <img :src="logoWithWord" alt="Lovia" class="h-4.5 w-auto object-contain opacity-75" />
          <span class="text-gray-200">|</span>
          <p>&copy; 2026 Lovia. Apple-Inspired Keepsakes.</p>
        </div>
        <div class="flex items-center gap-4 text-[11px] font-medium text-gray-500">
          <a href="#features" class="hover:text-rose-500 transition">Features</a>
          <a href="#templates" class="hover:text-rose-500 transition">Templates</a>
          <router-link to="/auth/login" class="hover:text-rose-500 transition">Sign In</router-link>
          <router-link to="/auth/register" class="hover:text-rose-500 transition">Register</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>
