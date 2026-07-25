<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar, Layers, Smartphone, Monitor } from '@lucide/vue'

export interface ChartDataItem {
  date: Date | string
  desktop?: number
  mobile?: number
  registered?: number
  purchased?: number
}

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    series1Label?: string
    series2Label?: string
    data?: ChartDataItem[]
  }>(),
  {
    title: 'Platform Growth & Purchases',
    description: 'Showing user registrations and paying customer acquisitions over time',
    series1Label: 'User Registrations',
    series2Label: 'Purchases (Paid Users)',
    data: () => [
      { date: new Date('2026-04-01'), desktop: 12, mobile: 5, registered: 12, purchased: 5 },
      { date: new Date('2026-04-05'), desktop: 18, mobile: 8, registered: 18, purchased: 8 },
      { date: new Date('2026-04-10'), desktop: 14, mobile: 6, registered: 14, purchased: 6 },
      { date: new Date('2026-04-15'), desktop: 22, mobile: 11, registered: 22, purchased: 11 },
      { date: new Date('2026-04-20'), desktop: 29, mobile: 15, registered: 29, purchased: 15 },
      { date: new Date('2026-04-25'), desktop: 35, mobile: 19, registered: 35, purchased: 19 },
      { date: new Date('2026-04-30'), desktop: 42, mobile: 24, registered: 42, purchased: 24 },
      { date: new Date('2026-05-05'), desktop: 50, mobile: 30, registered: 50, purchased: 30 },
      { date: new Date('2026-05-10'), desktop: 41, mobile: 26, registered: 41, purchased: 26 },
      { date: new Date('2026-05-15'), desktop: 58, mobile: 34, registered: 58, purchased: 34 },
      { date: new Date('2026-05-20'), desktop: 49, mobile: 28, registered: 49, purchased: 28 },
      { date: new Date('2026-05-25'), desktop: 63, mobile: 39, registered: 63, purchased: 39 },
      { date: new Date('2026-05-30'), desktop: 72, mobile: 44, registered: 72, purchased: 44 },
      { date: new Date('2026-06-05'), desktop: 80, mobile: 52, registered: 80, purchased: 52 },
      { date: new Date('2026-06-10'), desktop: 75, mobile: 48, registered: 75, purchased: 48 },
      { date: new Date('2026-06-15'), desktop: 89, mobile: 59, registered: 89, purchased: 59 },
      { date: new Date('2026-06-20'), desktop: 96, mobile: 65, registered: 96, purchased: 65 },
      { date: new Date('2026-06-25'), desktop: 84, mobile: 58, registered: 84, purchased: 58 },
      { date: new Date('2026-06-30'), desktop: 105, mobile: 72, registered: 105, purchased: 72 },
      { date: new Date('2026-07-05'), desktop: 118, mobile: 84, registered: 118, purchased: 84 },
      { date: new Date('2026-07-10'), desktop: 130, mobile: 92, registered: 130, purchased: 92 },
      { date: new Date('2026-07-15'), desktop: 125, mobile: 88, registered: 125, purchased: 88 },
      { date: new Date('2026-07-20'), desktop: 142, mobile: 106, registered: 142, purchased: 106 },
      { date: new Date('2026-07-25'), desktop: 155, mobile: 118, registered: 155, purchased: 118 },
    ],
  },
)

const timeRange = ref('90d')
const activeIndex = ref<number | null>(null)

const filteredData = computed(() => {
  const all = props.data
  if (!all.length) return []
  const referenceDate = new Date('2026-07-25')
  let daysToSubtract = 90
  if (timeRange.value === '30d') daysToSubtract = 30
  else if (timeRange.value === '7d') daysToSubtract = 7

  const startDate = new Date(referenceDate)
  startDate.setDate(startDate.getDate() - daysToSubtract)

  return all.filter((item) => {
    const d = new Date(item.date)
    return d >= startDate
  })
})

const maxVal = computed(() => {
  if (!filteredData.value.length) return 100
  return Math.max(...filteredData.value.map((d) => Math.max(d.registered ?? d.desktop ?? 0, d.purchased ?? d.mobile ?? 0))) * 1.15
})

const svgWidth = 600
const svgHeight = 150

function getX(index: number) {
  const len = filteredData.value.length
  if (len <= 1) return 0
  return (index / (len - 1)) * svgWidth
}

function getY(val: number) {
  return svgHeight - (val / maxVal.value) * (svgHeight - 30) - 10
}

const desktopPoints = computed(() => {
  return filteredData.value.map((d, i) => `${getX(i)},${getY(d.registered ?? d.desktop ?? 0)}`).join(' ')
})

const mobilePoints = computed(() => {
  return filteredData.value.map((d, i) => `${getX(i)},${getY(d.purchased ?? d.mobile ?? 0)}`).join(' ')
})

const desktopAreaPath = computed(() => {
  if (!filteredData.value.length || !filteredData.value[0]) return ''
  const len = filteredData.value.length
  const firstX = getX(0)
  const lastX = getX(len - 1)
  const val = filteredData.value[0].registered ?? filteredData.value[0].desktop ?? 0
  return `M ${firstX},${getY(val)} L ${desktopPoints.value} L ${lastX},${svgHeight} L ${firstX},${svgHeight} Z`
})

const mobileAreaPath = computed(() => {
  if (!filteredData.value.length || !filteredData.value[0]) return ''
  const len = filteredData.value.length
  const firstX = getX(0)
  const lastX = getX(len - 1)
  const val = filteredData.value[0].purchased ?? filteredData.value[0].mobile ?? 0
  return `M ${firstX},${getY(val)} L ${mobilePoints.value} L ${lastX},${svgHeight} L ${firstX},${svgHeight} Z`
})

const activeItem = computed(() => {
  if (activeIndex.value === null || !filteredData.value[activeIndex.value]) return null
  return filteredData.value[activeIndex.value]
})

function handleMouseMove(e: MouseEvent) {
  const svg = e.currentTarget as SVGElement
  const rect = svg.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const ratio = Math.max(0, Math.min(1, mouseX / rect.width))
  const index = Math.round(ratio * (filteredData.value.length - 1))
  activeIndex.value = index
}

function handleMouseLeave() {
  activeIndex.value = null
}

function formatDateLabel(d: Date | string) {
  const dateObj = new Date(d)
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bg-white border border-black/5 rounded-[18px] p-5 shadow-2xs space-y-4">
    <!-- Card Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
      <div>
        <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <Layers class="w-4 h-4 text-rose-500" />
          {{ title }}
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">{{ description }}</p>
      </div>

      <!-- Time Range Select Dropdown -->
      <div class="flex items-center gap-2">
        <select
          v-model="timeRange"
          class="text-xs font-semibold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-rose-400 transition cursor-pointer"
        >
          <option value="90d">Last 3 months</option>
          <option value="30d">Last 30 days</option>
          <option value="7d">Last 7 days</option>
        </select>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="relative pt-2">
      <!-- Active Hover Tooltip Card -->
      <div
        v-if="activeItem"
        class="absolute top-2 right-2 z-20 bg-gray-900/90 backdrop-blur-md text-white text-xs p-3 rounded-xl shadow-xl space-y-1 border border-white/10 pointer-events-none animate-fade-in"
      >
        <p class="font-bold text-[11px] text-gray-300 flex items-center gap-1">
          <Calendar class="w-3 h-3 text-rose-400" />
          {{ formatDateLabel(activeItem.date) }}
        </p>
        <div class="flex items-center justify-between gap-4">
          <span class="text-rose-300 font-semibold flex items-center gap-1">
            <Monitor class="w-3 h-3" /> {{ series1Label }}:
          </span>
          <span class="font-mono font-bold">{{ activeItem.registered ?? activeItem.desktop }}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-indigo-300 font-semibold flex items-center gap-1">
            <Smartphone class="w-3 h-3" /> {{ series2Label }}:
          </span>
          <span class="font-mono font-bold">{{ activeItem.purchased ?? activeItem.mobile }}</span>
        </div>
      </div>

      <!-- SVG Chart Canvas -->
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="w-full h-44 overflow-visible cursor-crosshair"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <defs>
          <!-- Desktop Gradient (Rose) -->
          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stop-color="#e11d48" stop-opacity="0.45" />
            <stop offset="95%" stop-color="#e11d48" stop-opacity="0.0" />
          </linearGradient>
          <!-- Mobile Gradient (Indigo) -->
          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stop-color="#6366f1" stop-opacity="0.45" />
            <stop offset="95%" stop-color="#6366f1" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Grid Lines -->
        <line x1="0" y1="20" :x2="svgWidth" y2="20" stroke="#f1f5f9" stroke-dasharray="4" />
        <line x1="0" y1="75" :x2="svgWidth" y2="75" stroke="#f1f5f9" stroke-dasharray="4" />
        <line x1="0" y1="130" :x2="svgWidth" y2="130" stroke="#f1f5f9" stroke-dasharray="4" />

        <!-- Area Fills -->
        <path :d="desktopAreaPath" fill="url(#fillDesktop)" />
        <path :d="mobileAreaPath" fill="url(#fillMobile)" />

        <!-- Area Lines -->
        <polyline
          fill="none"
          stroke="#e11d48"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="desktopPoints"
        />
        <polyline
          fill="none"
          stroke="#6366f1"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="mobilePoints"
        />

        <!-- Active Hover Crosshair Line -->
        <g v-if="activeIndex !== null && activeItem">
          <line
            :x1="getX(activeIndex)"
            y1="0"
            :x2="getX(activeIndex)"
            :y2="svgHeight"
            stroke="#94a3b8"
            stroke-width="1.5"
            stroke-dasharray="3 3"
          />
          <circle
            :cx="getX(activeIndex)"
            :cy="getY(activeItem.registered ?? activeItem.desktop ?? 0)"
            r="5"
            fill="#ffffff"
            stroke="#e11d48"
            stroke-width="2.5"
          />
          <circle
            :cx="getX(activeIndex)"
            :cy="getY(activeItem.purchased ?? activeItem.mobile ?? 0)"
            r="5"
            fill="#ffffff"
            stroke="#6366f1"
            stroke-width="2.5"
          />
        </g>
      </svg>

      <!-- X-Axis Labels -->
      <div class="flex justify-between text-[10px] text-gray-400 font-semibold px-1 pt-2 border-t border-gray-100">
        <span v-for="(item, i) in filteredData" :key="i" class="truncate" v-show="i % Math.ceil(filteredData.length / 6) === 0 || i === filteredData.length - 1">
          {{ formatDateLabel(item.date) }}
        </span>
      </div>

      <!-- Legend Footer -->
      <div class="flex items-center justify-center gap-6 pt-4 text-xs font-semibold">
        <div class="flex items-center gap-2 text-rose-600">
          <span class="w-3 h-3 rounded-md bg-rose-500 shadow-xs inline-block" />
          <span>{{ series1Label }}</span>
        </div>
        <div class="flex items-center gap-2 text-indigo-600">
          <span class="w-3 h-3 rounded-md bg-indigo-500 shadow-xs inline-block" />
          <span>{{ series2Label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
