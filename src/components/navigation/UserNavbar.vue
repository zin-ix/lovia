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
import { User, Settings, Shield, LogOut } from '@lucide/vue'
import { useFeatherToast } from 'feather-toast-vue'

const router = useRouter()
const authStore = useAuthStore()
const { toast } = useFeatherToast()

const showSignOutConfirm = ref(false)

const userInitial = computed(() => {
  if (authStore.profile?.full_name?.trim()) {
    return authStore.profile.full_name.charAt(0).toUpperCase()
  }
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase() || 'U'
})

const handleSignOutConfirm = async () => {
  showSignOutConfirm.value = false
  await authStore.signOut()
  toast.success({ title: 'Signed out successfully' })
  router.push('/auth/login')
}
</script>

<template>
  <header
    class="flex items-center justify-between h-12 px-4 sm:px-6 bg-white/80 backdrop-blur-[20px] border-b border-black/5 shrink-0 z-30 sticky top-0"
  >
    <div class="flex items-center gap-3">
      <SidebarTrigger class="text-gray-600 hover:text-rose-500 cursor-pointer transition-colors" />
      <span class="text-xs font-semibold text-gray-800 tracking-tight hidden sm:inline-block">User Workspace</span>
    </div>

    <div class="flex items-center gap-3">
      <!-- Admin Mode Badge -->
      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-medium hover:bg-rose-100 transition"
      >
        <Shield class="w-3 h-3 text-rose-500" /> Admin Mode
      </router-link>

      <!-- User Avatar Dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button class="rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 transition cursor-pointer">
            <Avatar class="w-8 h-8">
              <AvatarImage :src="authStore.profile?.avatar_url || ''" />
              <AvatarFallback class="bg-[#1d1d1f] text-white text-xs font-bold">
                {{ userInitial }}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56 shadow-md border-gray-200 rounded-[14px]">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-xs font-bold text-gray-900 leading-none">
                {{ authStore.profile?.full_name || 'User Account' }}
              </p>
              <p class="text-[11px] text-gray-400 leading-none truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="router.push('/dashboard/profile')" class="text-xs cursor-pointer">
            <User class="mr-2 w-3.5 h-3.5 text-gray-400" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem @click="router.push('/dashboard/settings')" class="text-xs cursor-pointer">
            <Settings class="mr-2 w-3.5 h-3.5 text-gray-400" /> Settings
          </DropdownMenuItem>

          <template v-if="authStore.isAdmin">
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="router.push('/admin')" class="text-xs text-rose-600 font-medium cursor-pointer">
              <Shield class="mr-2 w-3.5 h-3.5 text-rose-500" /> Admin Panel
            </DropdownMenuItem>
          </template>

          <DropdownMenuSeparator />
          <DropdownMenuItem @click="showSignOutConfirm = true" class="text-xs text-red-600 focus:bg-red-50 cursor-pointer">
            <LogOut class="mr-2 w-3.5 h-3.5" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Confirmation Dialog for Sign out -->
    <ConfirmDialog
      v-model:open="showSignOutConfirm"
      title="Sign Out Confirmation"
      description="Are you sure you want to end your current session?"
      confirm-text="Sign Out"
      variant="destructive"
      @confirm="handleSignOutConfirm"
    />
  </header>
</template>
