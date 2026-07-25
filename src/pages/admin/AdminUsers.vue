<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DataTable, { type ColumnDef } from '@/components/common/DataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import {
  Users,
  ShieldCheck,
  Search,
  Edit2,
  UserCheck,
  UserX,
  Shield,
  Loader2,
  Mail,
  Plus,
} from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const authStore = useAuthStore()
const { toast } = useFeatherToast()

const loading = ref(false)
const editingLimitUserId = ref<string | null>(null)
const editingLimitValue = ref<number>(2)

// Role Change Dialog state
const roleDialogOpen = ref(false)
const selectedUserId = ref<string | null>(null)
const selectedCurrentRole = ref<string>('user')
const roleChanging = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await authStore.fetchAdminUsers()
  } finally {
    loading.value = false
  }
})

// ── User Columns for DataTable ──
const userColumns: ColumnDef[] = [
  { key: 'user_info', label: 'User Account', sortable: true },
  { key: 'role', label: 'Role', sortable: true, align: 'center' },
  { key: 'letter_limit', label: 'Letter Allowance', sortable: true, align: 'center' },
  { key: 'created_at', label: 'Joined Date', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const totalUsersCount = computed(() => authStore.adminUsersList.length)
const adminCount = computed(() => authStore.adminUsersList.filter((u) => u.role === 'admin').length)
const standardUserCount = computed(() => authStore.adminUsersList.filter((u) => u.role !== 'admin').length)

const promptToggleRole = (userId: string, currentRole?: string) => {
  selectedUserId.value = userId
  selectedCurrentRole.value = currentRole || 'user'
  roleDialogOpen.value = true
}

const handleConfirmRoleChange = async () => {
  if (!selectedUserId.value) return
  const newRole = selectedCurrentRole.value === 'admin' ? 'user' : 'admin'
  roleChanging.value = true

  try {
    await authStore.updateUserRole(selectedUserId.value, newRole)
    toast.success({ title: `User role updated to ${newRole}` })
    roleDialogOpen.value = false
    selectedUserId.value = null
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to update user role' })
  } finally {
    roleChanging.value = false
  }
}

const startEditLimit = (userId: string, currentLimit?: number) => {
  editingLimitUserId.value = userId
  editingLimitValue.value = currentLimit || 2
}

const saveLimit = async (userId: string) => {
  try {
    await authStore.updateUserLimit(userId, editingLimitValue.value)
    toast.success({ title: `Letter limit updated to ${editingLimitValue.value}` })
    editingLimitUserId.value = null
  } catch (err: any) {
    toast.error({ title: err.message || 'Failed to update limit' })
  }
}
</script>

<template>
  <AdminLayout>
    <div class="w-full space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1d1d1f]">User Roster & Allowances</h1>
            <span class="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full">
              {{ totalUsersCount }} Registered
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Manage user accounts, assign admin roles, and set letter allowances.</p>
        </div>
      </div>

      <!-- Overview Cards (Minimalist Apple 18px radius) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-rose-50 text-rose-600 rounded-full shrink-0">
            <Users class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Total Registered Users</p>
            <h3 class="text-xl font-bold text-gray-900">{{ totalUsersCount }}</h3>
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-full shrink-0">
            <UserCheck class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Standard Users</p>
            <h3 class="text-xl font-bold text-gray-900">{{ standardUserCount }}</h3>
          </div>
        </div>

        <div class="bg-white border border-black/5 rounded-[18px] p-5 flex items-center gap-4 shadow-2xs">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <div>
            <p class="text-[11px] font-medium text-gray-400">Administrators</p>
            <h3 class="text-xl font-bold text-gray-900">{{ adminCount }}</h3>
          </div>
        </div>
      </div>

      <!-- Reusable DataTable: User Accounts -->
      <div class="space-y-2">
        <DataTable
          :columns="userColumns"
          :items="authStore.adminUsersList"
          :loading="loading"
          search-placeholder="Search user email, name, role..."
          empty-text="No registered users found."
        >
          <!-- User Info Cell -->
          <template #cell-user_info="{ item }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-xs shrink-0">
                {{ (item.full_name || item.email || 'U').charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-bold text-gray-900 text-xs leading-tight">{{ item.full_name || 'Anonymous User' }}</p>
                <p class="text-[11px] text-gray-400">{{ item.email }}</p>
              </div>
            </div>
          </template>

          <!-- Role Cell -->
          <template #cell-role="{ item }">
            <span
              class="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase"
              :class="item.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ item.role || 'user' }}
            </span>
          </template>

          <!-- Letter Allowance Cell -->
          <template #cell-letter_limit="{ item }">
            <div v-if="editingLimitUserId === item.id" class="flex items-center justify-center gap-1">
              <input
                v-model.number="editingLimitValue"
                type="number"
                min="1"
                max="100"
                class="w-12 text-center text-xs border border-gray-300 rounded-md py-0.5 focus:outline-none focus:border-rose-400"
              />
              <button @click="saveLimit(item.id)" class="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-md hover:bg-rose-600 transition">Save</button>
            </div>
            <div v-else class="flex items-center justify-center gap-1.5 group cursor-pointer" @click="startEditLimit(item.id, item.letter_limit)">
              <span class="font-bold text-gray-900">{{ item.letter_limit ?? 2 }} letters</span>
              <Edit2 class="w-3 h-3 text-gray-400 group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition" />
            </div>
          </template>

          <!-- Joined Date Cell -->
          <template #cell-created_at="{ value }">
            <span class="text-gray-500 text-[11px]">
              {{ value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}
            </span>
          </template>

          <!-- Actions Cell -->
          <template #cell-actions="{ item }">
            <button
              @click="promptToggleRole(item.id, item.role)"
              class="px-2.5 py-1 text-[11px] font-medium border border-gray-200 hover:border-rose-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
            >
              {{ item.role === 'admin' ? 'Demote to User' : 'Promote to Admin' }}
            </button>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Role Confirmation Dialog -->
    <ConfirmDialog
      :open="roleDialogOpen"
      :title="selectedCurrentRole === 'admin' ? 'Demote Administrator?' : 'Promote to Administrator?'"
      :description="selectedCurrentRole === 'admin' ? 'Are you sure you want to revoke admin privileges for this user?' : 'Are you sure you want to grant full root admin privileges to this user?'"
      :confirm-text="selectedCurrentRole === 'admin' ? 'Demote User' : 'Promote User'"
      :loading="roleChanging"
      @update:open="roleDialogOpen = $event"
      @confirm="handleConfirmRoleChange"
    />
  </AdminLayout>
</template>
