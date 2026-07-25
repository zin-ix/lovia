<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    activityData?: { label: string; views: number; letters: number }[]
    templateStats?: { name: string; count: number; color: string }[]
  }>(),
  {
    activityData: () => [
      { label: 'Mon', views: 42, letters: 5 },
      { label: 'Tue', views: 68, letters: 8 },
      { label: 'Wed', views: 105, letters: 12 },
      { label: 'Thu', views: 89, letters: 9 },
      { label: 'Fri', views: 140, letters: 15 },
      { label: 'Sat', views: 210, letters: 22 },
      { label: 'Sun', views: 185, letters: 18 },
    ],
    templateStats: () => [
      { name: 'Romantic Rose', count: 48, color: '#e11d48' },
      { name: 'Cherry Blossom', count: 32, color: '#f43f5e' },
      { name: 'Midnight Stars', count: 24, color: '#6366f1' },
      { name: 'Golden Proposal', count: 18, color: '#eab308' },
    ],
  },
)

// SVG Trend Path Calculation
const maxViews = computed(() => Math.max(...props.activityData.map((d) => d.views), 1))
const svgWidth = 500
const svgHeight = 160

const points = computed(() => {
  const data = props.activityData
  if (!data.length) return ''
  const step = svgWidth / (data.length - 1)
  return data
    .map((d, i) => {
      const x = i * step
      const y = svgHeight - (d.views / maxViews.value) * (svgHeight - 30) - 15
      return `${x},${y}`
    })
    .join(' ')
})

const areaPath = computed(() => {
  if (!points.value) return ''
  const pts = points.value.split(' ')
  const firstX = pts[0]?.split(',')[0] ?? '0'
  const lastX = pts[pts.length - 1]?.split(',')[0] ?? '0'
  return `M ${pts[0]} L ${pts.join(' L ')} L ${lastX},${svgHeight} L ${firstX},${svgHeight} Z`
})

const totalTemplateCount = computed(() =>
  props.templateStats.reduce((sum, t) => sum + t.count, 0)
)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Trend Line Chart Card (2 cols) -->
    <div class="lg:col-span-2 bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-gray-900">Activity Trends</h3>
          <p class="text-[11px] text-gray-400">Daily guest opens and engagement activity</p>
        </div>
        <div class="flex items-center gap-3 text-[11px]">
          <span class="flex items-center gap-1.5 font-medium text-rose-600">
            <span class="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Views
          </span>
        </div>
      </div>

      <!-- SVG Chart Canvas -->
      <div class="relative w-full pt-2">
        <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full h-40 overflow-visible">
          <defs>
            <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e11d48" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#e11d48" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line x1="0" y1="20" :x2="svgWidth" y2="20" stroke="#f1f5f9" stroke-dasharray="4" />
          <line x1="0" y1="80" :x2="svgWidth" y2="80" stroke="#f1f5f9" stroke-dasharray="4" />
          <line x1="0" y1="140" :x2="svgWidth" y2="140" stroke="#f1f5f9" stroke-dasharray="4" />

          <!-- Filled Gradient Area -->
          <path :d="areaPath" fill="url(#roseGradient)" />

          <!-- Smooth Trend Line -->
          <polyline
            fill="none"
            stroke="#e11d48"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            :points="points"
          />

          <!-- Data Points -->
          <circle
            v-for="(d, i) in activityData"
            :key="i"
            :cx="(i * (svgWidth / (activityData.length - 1)))"
            :cy="svgHeight - (d.views / maxViews) * (svgHeight - 30) - 15"
            r="4"
            fill="#ffffff"
            stroke="#e11d48"
            stroke-width="2"
            class="transition-all hover:r-6 cursor-pointer"
          />
        </svg>

        <!-- X-Axis Labels -->
        <div class="flex justify-between text-[10px] text-gray-400 font-medium px-1 pt-1 border-t border-gray-100">
          <span v-for="d in activityData" :key="d.label">{{ d.label }}</span>
        </div>
      </div>
    </div>

    <!-- Template Popularity Bar Chart Card (1 col) -->
    <div class="bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs space-y-4">
      <div>
        <h3 class="text-sm font-bold text-gray-900">Top Templates</h3>
        <p class="text-[11px] text-gray-400">Most popular designs selected by users</p>
      </div>

      <div class="space-y-3 pt-1">
        <div v-for="tpl in templateStats" :key="tpl.name" class="space-y-1">
          <div class="flex items-center justify-between text-xs font-medium">
            <span class="text-gray-700 font-semibold">{{ tpl.name }}</span>
            <span class="text-gray-400 text-[11px]">
              {{ totalTemplateCount ? Math.round((tpl.count / totalTemplateCount) * 100) : 0 }}% ({{ tpl.count }})
            </span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: totalTemplateCount ? (tpl.count / totalTemplateCount) * 100 + '%' : '0%',
                backgroundColor: tpl.color,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
