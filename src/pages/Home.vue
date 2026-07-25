<script setup lang="ts">
import logoWithWord from '@/assets/images/logo_w_word.png'
import { Sparkles, ArrowRight, Mail, Shield, Layers, Play } from '@lucide/vue'
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
    <!-- Apple Frosted Glass Navbar -->
    <header class="w-full bg-white/80 backdrop-blur-[20px] border-b border-black/5 sticky top-0 z-50 h-12">
      <div class="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2">
          <img :src="logoWithWord" alt="Lovia" class="h-6 w-auto object-contain" />
        </router-link>
        <div class="flex items-center gap-3">
          <router-link
            to="/auth/login"
            class="text-xs font-medium text-gray-700 hover:text-rose-500 transition"
          >
            Sign In
          </router-link>
          <router-link
            to="/auth/register"
            class="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full transition shadow-xs"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </header>

    <!-- Apple-Style Hero Section -->
    <main class="flex-1 flex items-center justify-center px-6 py-20">
      <div class="max-w-2xl text-center space-y-8">
        <!-- Eyebrow Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-black/5 rounded-full text-xs font-medium text-gray-800 shadow-2xs">
          <Sparkles class="w-3.5 h-3.5 text-rose-500" />
          <span>Interactive Keepsake Platform</span>
        </div>

        <!-- Apple Headline: Large, bold, tight letter-spacing -->
        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-[#1d1d1f] leading-[1.08]"
        >
          Craft Unforgettable Digital Keepsakes
        </h1>

        <!-- Body text -->
        <p class="text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
          Compose minimal 3D letters with interactive wax seals, milestone timelines, polaroid galleries, flip cards, and embedded soundtrack audio.
        </p>

        <!-- Apple Full Pill Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <router-link
            to="/auth/register"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm rounded-full transition shadow-xs"
          >
            Create Your First Letter <ArrowRight class="w-4 h-4" />
          </router-link>
          <router-link
            to="/l/demo"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-gray-100 text-[#1d1d1f] font-medium text-sm rounded-full border border-black/5 transition shadow-2xs"
          >
            <Play class="w-4 h-4 text-rose-500 fill-rose-500" /> View Demo
          </router-link>
        </div>

        <!-- Feature Chips -->
        <div class="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-gray-500 font-medium">
          <span class="flex items-center gap-1.5">
            <Mail class="w-4 h-4 text-rose-500" /> 3D Wax Seal Envelope
          </span>
          <span class="flex items-center gap-1.5">
            <Layers class="w-4 h-4 text-rose-500" /> Flip Cards
          </span>
          <span class="flex items-center gap-1.5">
            <Shield class="w-4 h-4 text-rose-500" /> Password Privacy
          </span>
        </div>
      </div>
    </main>

    <!-- Apple-Style Footer -->
    <footer
      class="w-full bg-white border-t border-black/5 py-6 text-center text-xs text-gray-500"
    >
      <div class="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>&copy; 2026 Lovia. Apple-Inspired Minimalist Keepsakes.</p>
        <div class="flex items-center gap-4">
          <router-link to="/auth/login" class="hover:text-rose-500 transition">Sign In</router-link>
          <router-link to="/auth/register" class="hover:text-rose-500 transition">Register</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>
