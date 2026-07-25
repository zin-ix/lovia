<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
} from '@lucide/vue'

export interface ColumnDef {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

const props = withDefaults(
  defineProps<{
    columns: ColumnDef[]
    items: T[]
    loading?: boolean
    searchable?: boolean
    searchPlaceholder?: string
    pageSize?: number
    emptyText?: string
  }>(),
  {
    loading: false,
    searchable: true,
    searchPlaceholder: 'Search records...',
    pageSize: 10,
    emptyText: 'No records found',
  },
)

const searchQuery = ref('')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(props.pageSize)

function toggleSort(key: string) {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') sortOrder.value = 'desc'
    else sortKey.value = null
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// ── Search & Filter ──
const filteredItems = computed(() => {
  let result = [...props.items]

  if (props.searchable && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter((item) =>
      Object.values(item).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    )
  }

  if (sortKey.value) {
    const key = sortKey.value
    const order = sortOrder.value === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const valA = a[key] ?? ''
      const valB = b[key] ?? ''
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * order
      }
      return String(valA).localeCompare(String(valB)) * order
    })
  }

  return result
})

// ── Pagination ──
const totalPages = computed(() => Math.ceil(filteredItems.value.length / perPage.value) || 1)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredItems.value.slice(start, start + perPage.value)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function getValue(item: T, key: string): any {
  return key.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), item as any)
}
</script>

<template>
  <div class="bg-white border border-black/5 rounded-[18px] overflow-hidden shadow-2xs space-y-4 p-5">

    <!-- Header bar with search & options -->
    <div v-if="searchable || $slots.actions" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div v-if="searchable" class="relative w-full sm:w-64">
        <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-rose-400 transition"
        />
      </div>

      <!-- Extra actions slot -->
      <div v-if="$slots.actions" class="flex items-center gap-2 ml-auto">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="w-full text-left text-xs text-gray-600 border-collapse">
        <!-- Table Header -->
        <thead class="bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
              class="px-4 py-3 select-none"
              :class="{ 'cursor-pointer hover:text-gray-700': col.sortable }"
              @click="col.sortable && toggleSort(col.key)"
            >
              <div class="inline-flex items-center gap-1.5" :class="{ 'justify-end': col.align === 'right', 'justify-center': col.align === 'center' }">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="text-gray-400">
                  <ChevronUp v-if="sortKey === col.key && sortOrder === 'asc'" class="w-3 h-3 text-rose-500" />
                  <ChevronDown v-else-if="sortKey === col.key && sortOrder === 'desc'" class="w-3 h-3 text-rose-500" />
                  <ChevronsUpDown v-else class="w-3 h-3 text-gray-300 opacity-60" />
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-100">

          <!-- Loading state -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="py-12 text-center text-gray-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <Loader2 class="w-6 h-6 animate-spin text-rose-500" />
                <span class="text-xs font-medium">Loading data...</span>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="paginatedItems.length === 0">
            <td :colspan="columns.length" class="py-12 text-center text-gray-400">
              <div class="flex flex-col items-center justify-center gap-2">
                <Inbox class="w-8 h-8 text-gray-300" />
                <span class="text-xs font-medium text-gray-500">{{ emptyText }}</span>
              </div>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-for="(item, idx) in paginatedItems"
            :key="item.id || idx"
            class="hover:bg-rose-50/30 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
              class="px-4 py-3 whitespace-nowrap text-gray-800"
            >
              <!-- Dynamic slot for custom cell formatting -->
              <slot :name="`cell-${col.key}`" :item="item" :value="getValue(item, col.key)" :index="idx">
                {{ getValue(item, col.key) ?? '—' }}
              </slot>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="filteredItems.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 pt-1">
      <span class="text-[11px]">
        Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filteredItems.length) }} of {{ filteredItems.length }} entries
      </span>

      <div class="flex items-center gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
        </button>

        <span class="font-medium text-gray-700 text-[11px]">Page {{ currentPage }} of {{ totalPages }}</span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

  </div>
</template>
