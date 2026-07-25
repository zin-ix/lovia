<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useTemplateStore } from '@/stores/template/template.store'
import UserLayout from '@/layouts/UserLayout.vue'
import PricingModal from '@/components/common/PricingModal.vue'
import { BUILTIN_TEMPLATES } from '@/data/templates.data'
import type { Template } from '@/types/template.types'
import {
  Search,
  LayoutGrid,
  AlignJustify,
  Sparkles,
  ArrowRight,
  Eye,
  X,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const router = useRouter()
const authStore = useAuthStore()
const templateStore = useTemplateStore()
const { toast } = useFeatherToast()

const viewMode = ref<'grid' | 'table'>('grid')
const searchQuery = ref('')
const selectedCategory = ref('All')
const showPricingModal = ref(false)

const isPremiumUser = computed(() => {
  if (authStore.profile?.role === 'admin') return true
  if ((authStore.profile?.letter_limit || 2) > 2) return true
  if ((authStore.profile as any)?.is_premium) return true
  return false
})

const categories = ['All', 'Romantic', 'Birthday', 'Long Distance', 'Apology', 'Gratitude', 'Minimalist', 'Special']

onMounted(async () => {
  await templateStore.fetchTemplates()
})

const filtered = computed(() =>
  templateStore.templates.filter((t) => {
    const matchCat = selectedCategory.value === 'All' || t.category === selectedCategory.value
    const q = searchQuery.value.toLowerCase().trim()
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some((tag) => tag.toLowerCase().includes(q))
    return matchCat && matchSearch
  })
)

const preview = ref<Template | null>(null)

const useTemplate = (tpl: Template) => {
  if (tpl.is_premium && !isPremiumUser.value) {
    showPricingModal.value = true
    toast.error({ title: `"${tpl.name}" is a Premium Template. Upgrade to unlock!` })
    return
  }
  router.push({ path: '/dashboard/create', query: { template: tpl.slug } })
}

// Particle label helper
const particleLabel = (t?: string) => {
  if (t === 'rose') return 'Rose petals'
  if (t === 'sakura') return 'Sakura'
  if (t === 'stars') return 'Stars'
  if (t === 'hearts') return 'Hearts'
  if (t === 'lavender') return 'Lavender'
  return 'None'
}
</script>

<template>
  <UserLayout>
    <div class="space-y-6 pb-16">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/5 pb-5">
        <div>
          <p class="text-[10px] font-semibold text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Sparkles class="w-3 h-3" /> Template Library
          </p>
          <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">Letter Templates</h1>
          <p class="text-xs text-gray-500 mt-1">Pick a template, make it yours.</p>
        </div>
        <router-link
          to="/dashboard/create"
          class="inline-flex items-center gap-2 px-5 py-2 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-full transition shrink-0"
        >
          Start blank
        </router-link>
      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-black/5 rounded-[18px] p-3.5">
        <!-- Category pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer"
            :class="selectedCategory === cat ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >{{ cat }}</button>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <!-- Search -->
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              placeholder="Search..."
              class="pl-8 pr-3 py-1.5 bg-[#f5f5f7] border border-gray-200 rounded-full text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 w-40 transition"
            />
          </div>

          <!-- View toggle -->
          <div class="bg-gray-100 p-0.5 rounded-full flex items-center border border-gray-200">
            <button @click="viewMode = 'grid'" class="p-1.5 rounded-full transition cursor-pointer" :class="viewMode === 'grid' ? 'bg-white text-rose-500 shadow-xs' : 'text-gray-400'">
              <LayoutGrid class="w-3.5 h-3.5" />
            </button>
            <button @click="viewMode = 'table'" class="p-1.5 rounded-full transition cursor-pointer" :class="viewMode === 'table' ? 'bg-white text-rose-500 shadow-xs' : 'text-gray-400'">
              <AlignJustify class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="py-20 text-center bg-white rounded-[18px] border border-black/5">
        <p class="text-sm font-semibold text-gray-900 mb-1">No templates found</p>
        <p class="text-xs text-gray-400 mb-4">Try a different search or category.</p>
        <button @click="searchQuery = ''; selectedCategory = 'All'" class="text-xs text-rose-600 font-medium hover:underline cursor-pointer">Clear filters</button>
      </div>

      <!-- ── GRID VIEW ── -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div
          v-for="tpl in filtered"
          :key="tpl.id"
          class="bg-white border border-black/5 rounded-[22px] overflow-hidden flex flex-col hover:shadow-md hover:border-rose-200 transition-all duration-300 group"
        >
          <!-- Theme swatch banner -->
          <div class="h-32 relative overflow-hidden p-3 flex flex-col justify-between" :style="{ backgroundColor: tpl.theme_config.bg }">
            <!-- Simulated letter paper -->
            <div
              class="absolute inset-3 rounded-xl border flex flex-col justify-between p-3 shadow-xs transition-transform duration-300 group-hover:scale-[1.015]"
              :style="{ backgroundColor: tpl.theme_config.paper, borderColor: tpl.theme_config.line || '#eee', color: tpl.theme_config.ink }"
            >
              <div class="flex items-center justify-between">
                <span class="text-[9px] uppercase tracking-widest font-semibold" :style="{ color: tpl.theme_config.accent }">{{ tpl.category }}</span>
                <span class="text-xs" :style="{ color: tpl.theme_config.accent }">{{ tpl.theme_config.sealChar }}</span>
              </div>
              <div>
                <p class="text-xs font-semibold truncate" :style="{ fontFamily: tpl.theme_config.fontHeading }">
                  {{ tpl.preset_content?.heroTitle || tpl.name }}
                </p>
                <p class="text-[10px] opacity-60 truncate mt-0.5">{{ tpl.preset_content?.greeting }}</p>
              </div>
            </div>
          </div>

          <!-- Card body -->
          <div class="p-4 flex flex-col flex-1 justify-between gap-3">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1">
                <h3 class="text-sm font-bold text-[#1d1d1f] group-hover:text-rose-600 transition">{{ tpl.name }}</h3>
                <span class="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-500 rounded-full font-medium shrink-0">{{ tpl.category }}</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed line-clamp-2">{{ tpl.description }}</p>
            </div>

            <!-- Color swatches + particle -->
            <div class="flex items-center justify-between">
              <div class="flex -space-x-1">
                <span class="w-4 h-4 rounded-full border border-white shadow-xs" :style="{ backgroundColor: tpl.theme_config.bg }" />
                <span class="w-4 h-4 rounded-full border border-white shadow-xs" :style="{ backgroundColor: tpl.theme_config.paper }" />
                <span class="w-4 h-4 rounded-full border border-white shadow-xs" :style="{ backgroundColor: tpl.theme_config.accent }" />
                <span class="w-4 h-4 rounded-full border border-white shadow-xs" :style="{ backgroundColor: tpl.theme_config.ink }" />
              </div>
              <span class="text-[10px] text-gray-400 italic">{{ particleLabel(tpl.theme_config.particleType) }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                @click="preview = tpl"
                class="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Eye class="w-3 h-3" /> Preview
              </button>
              <button
                @click="useTemplate(tpl)"
                class="flex-1 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-full transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                Use <ArrowRight class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TABLE VIEW ── -->
      <div v-else class="bg-white rounded-[22px] border border-black/5 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#f5f5f7] border-b border-gray-200">
              <tr class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <th class="py-3 px-5">Template</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Palette</th>
                <th class="py-3 px-4">Animation</th>
                <th class="py-3 px-4">Typography</th>
                <th class="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="tpl in filtered" :key="tpl.id" class="hover:bg-rose-50/30 transition-colors group">
                <!-- Name -->
                <td class="py-4 px-5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border shrink-0"
                      :style="{ backgroundColor: tpl.theme_config.paper, borderColor: tpl.theme_config.line || '#eee', color: tpl.theme_config.accent }"
                    >
                      {{ tpl.theme_config.sealChar }}
                    </div>
                    <div>
                      <p class="font-bold text-[#1d1d1f] group-hover:text-rose-600 transition">{{ tpl.name }}</p>
                      <p class="text-gray-400 text-[10px] line-clamp-1 max-w-[200px]">{{ tpl.description }}</p>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="py-4 px-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600">{{ tpl.category }}</span>
                </td>

                <!-- Palette swatches -->
                <td class="py-4 px-4">
                  <div class="flex items-center gap-1">
                    <span class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: tpl.theme_config.bg }" />
                    <span class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: tpl.theme_config.paper }" />
                    <span class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: tpl.theme_config.accent }" />
                    <span class="w-4 h-4 rounded-full border border-gray-200" :style="{ backgroundColor: tpl.theme_config.ink }" />
                  </div>
                </td>

                <!-- Particle / Animation -->
                <td class="py-4 px-4 text-gray-600 text-[11px]">{{ particleLabel(tpl.theme_config.particleType) }}</td>

                <!-- Typography -->
                <td class="py-4 px-4 text-[10px] text-gray-400 font-mono max-w-[140px] truncate">
                  {{ tpl.theme_config.fontHeading?.replace(/['"]/g, '').split(',')[0] }}
                </td>

                <!-- Actions -->
                <td class="py-4 px-5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="preview = tpl" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer">
                      <Eye class="w-3.5 h-3.5" />
                    </button>
                    <button @click="useTemplate(tpl)" class="px-3 py-1.5 text-[11px] font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-full transition cursor-pointer shadow-xs">
                      Use Template
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── PREVIEW MODAL (SHADCN DIALOG POP) ── -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="preview"
          class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="preview = null"
        >
          <Transition
            appear
            enter-active-class="transition duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in transform"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div class="bg-white rounded-[24px] max-w-lg w-full max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col">
              <!-- Modal header -->
              <div class="flex items-center justify-between p-5 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border"
                    :style="{ backgroundColor: preview.theme_config.paper, borderColor: preview.theme_config.line || '#eee', color: preview.theme_config.accent }"
                  >
                    {{ preview.theme_config.sealChar }}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-[#1d1d1f]">{{ preview.name }}</h3>
                    <p class="text-[11px] text-gray-400">{{ preview.category }}</p>
                  </div>
                </div>
                <button @click="preview = null" class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Content preview scrollable box -->
              <div class="p-6 space-y-4 flex-1 overflow-y-auto">
                <div
                  class="rounded-2xl p-5 border space-y-3 relative overflow-hidden"
                  :style="{ backgroundColor: preview.theme_config.paper, borderColor: preview.theme_config.line || '#e5e7eb' }"
                >
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block" :style="{ color: preview.theme_config.accent, backgroundColor: `${preview.theme_config.accent}15` }">
                    {{ preview.category || 'Romantic Theme' }}
                  </span>
                  <p class="text-sm font-bold" :style="{ color: preview.theme_config.accent }">
                    Dear [Recipient Name],
                  </p>
                  <p class="text-xs leading-relaxed text-gray-700 font-serif whitespace-pre-line">
                    {{ preview.preset_content?.letterBodyText || 'You make every moment bright, beautiful, and meaningful. Forever grateful to have you in my life.' }}
                  </p>
                </div>

                <!-- Specs grid -->
                <div class="grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-gray-500 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <p class="text-[9px] uppercase font-bold text-gray-400 mb-1">Accent</p>
                    <div class="flex items-center gap-1.5 font-mono text-gray-700 justify-center">
                      <span class="w-3.5 h-3.5 rounded-full border" :style="{ backgroundColor: preview.theme_config.accent }" />
                      {{ preview.theme_config.accent }}
                    </div>
                  </div>
                  <div>
                    <p class="text-[9px] uppercase font-bold text-gray-400 mb-1">Animation</p>
                    <p class="text-gray-700">{{ particleLabel(preview.theme_config.particleType) }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] uppercase font-bold text-gray-400 mb-1">Font</p>
                    <p class="text-gray-700 truncate">{{ preview.theme_config.fontHeading?.replace(/['"]/g, '').split(',')[0] }}</p>
                  </div>
                </div>
              </div>

              <!-- Modal footer -->
              <div class="p-5 border-t border-gray-100 bg-[#f5f5f7]/50 rounded-b-[24px] flex items-center justify-between">
                <button @click="preview = null" class="text-xs text-gray-500 hover:text-gray-700 font-medium transition cursor-pointer">Cancel</button>
                <button @click="useTemplate(preview)" class="px-6 py-2.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-full transition shadow-xs flex items-center gap-2 cursor-pointer">
                  Use & Edit This Template <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

    </div>
    <!-- Pricing & Upgrade Modal -->
    <PricingModal v-model:open="showPricingModal" />
  </UserLayout>
</template>
