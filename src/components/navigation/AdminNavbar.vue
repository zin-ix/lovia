<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { ShieldCheck, User, Settings, ArrowLeft, LogOut } from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const router = useRouter()
const authStore = useAuthStore()
const { toast } = useFeatherToast()

const showSignOutConfirm = ref(false)

const adminInitial = computed(() => {
  if (authStore.profile?.full_name?.trim()) {
    return authStore.profile.full_name.charAt(0).toUpperCase()
  }
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase() || 'A'
})

const handleSignOutConfirm = async () => {
  showSignOutConfirm.value = false
  await authStore.signOut()
  toast.success({ title: 'Admin signed out' })
  router.push('/auth/login')
}
</script>

<template>
  <header
    class="flex items-center justify-between h-12 px-4 sm:px-6 bg-white/80 backdrop-blur-[20px] border-b border-black/5 shrink-0 z-30 sticky top-0"
  >
    <div class="flex items-center gap-3">
      <SidebarTrigger class="text-rose-600 hover:text-rose-700 cursor-pointer" />
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-900 tracking-tight">Administrator Console</span>
        <span class="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
          <ShieldCheck class="w-3 h-3 text-rose-600" /> Root Access
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <router-link
        to="/dashboard"
        class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition"
      >
        <ArrowLeft class="w-3.5 h-3.5" /> User Workspace
      </router-link>

      <!-- Admin Avatar Dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 transition cursor-pointer">
            <Avatar class="w-8 h-8 border-2 border-rose-200">
              <AvatarImage :src="authStore.profile?.avatar_url || ''" />
              <AvatarFallback class="bg-rose-600 text-white text-xs font-bold">
                {{ adminInitial }}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56 shadow-md border-rose-100 rounded-[14px]">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-xs font-bold text-gray-900 leading-none">
                {{ authStore.profile?.full_name || 'System Administrator' }}
              </p>
              <p class="text-[11px] text-gray-400 leading-none truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="router.push('/admin/profile')" class="text-xs cursor-pointer">
            <User class="mr-2 w-3.5 h-3.5 text-rose-600" /> Admin Profile
          </DropdownMenuItem>
          <DropdownMenuItem @click="router.push('/admin/settings')" class="text-xs cursor-pointer">
            <Settings class="mr-2 w-3.5 h-3.5 text-rose-600" /> System Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="router.push('/dashboard')" class="text-xs cursor-pointer">
            <ArrowLeft class="mr-2 w-3.5 h-3.5 text-gray-400" /> User Workspace
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="showSignOutConfirm = true" class="text-xs text-red-600 focus:bg-red-50 cursor-pointer">
            <LogOut class="mr-2 w-3.5 h-3.5" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Confirm Sign Out -->
    <ConfirmDialog
      v-model:open="showSignOutConfirm"
      title="Admin Log Out"
      description="Are you sure you want to exit the administrator console?"
      confirm-text="Log Out"
      variant="destructive"
      @confirm="handleSignOutConfirm"
    />
  </header>
</template>
