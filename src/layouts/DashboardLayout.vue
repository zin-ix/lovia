<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import logo from '@/assets/images/logo_w_word.png'
import {
  PlusCircle,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mail,
  Menu,
  Shield,
  Users,
  Sliders,
} from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const userDropdownOpen = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleSignOut = async () => {
  userDropdownOpen.value = false
  await authStore.signOut()
  router.push('/auth/login')
}

const closeDropdown = () => {
  userDropdownOpen.value = false
}

const userInitial = computed(() => {
  if (authStore.profile?.full_name?.trim()) {
    return authStore.profile.full_name.charAt(0).toUpperCase()
  }
  const email = authStore.user?.email || ''
  return email.charAt(0).toUpperCase() || 'U'
})

const userNavItems = [
  { to: '/dashboard', label: 'My Letters', icon: Mail },
  { to: '/dashboard/create', label: 'New Letter', icon: PlusCircle },
]

const adminNavItems = [
  { to: '/admin', label: 'User Roster', icon: Users },
  { to: '/admin/profile', label: 'Admin Profile', icon: Shield },
  { to: '/admin/settings', label: 'System Settings', icon: Sliders },
]

onMounted(async () => {
  if (!authStore.user) {
    try {
      await authStore.getSession()
      if (!authStore.user) {
        router.push('/auth/login')
      }
    } catch {
      router.push('/auth/login')
    }
  }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#FAFAFA] font-sans">
    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed lg:relative z-50 flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-250 ease-in-out shrink-0"
      :class="[
        sidebarCollapsed ? 'w-16' : 'w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Brand / Logo Header -->
      <div
        class="flex items-center h-14 px-4 border-b border-gray-100"
        :class="sidebarCollapsed ? 'justify-center' : 'justify-between'"
      >
        <router-link to="/dashboard" class="flex items-center gap-2">
          <img v-if="!sidebarCollapsed" :src="logo" alt="Lovia" class="h-6 w-auto" />
          <div
            v-else
            class="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs"
          >
            L
          </div>
        </router-link>
        <button
          @click="toggleSidebar"
          class="hidden lg:flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
        >
          <ChevronLeft v-if="!sidebarCollapsed" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <!-- User Core Navigation -->
        <div class="space-y-1">
          <p v-if="!sidebarCollapsed" class="px-3 text-[10px] font-semibold uppercase text-gray-400 tracking-wider mb-1.5">
            WORKSPACE
          </p>
          <router-link
            v-for="item in userNavItems"
            :key="item.to"
            :to="item.to"
            @click="mobileOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
            :class="[
              route.path === item.to
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              sidebarCollapsed ? 'justify-center' : '',
            ]"
            :title="sidebarCollapsed ? item.label : undefined"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </router-link>
        </div>

        <!-- Admin Navigation (If Admin Role) -->
        <div v-if="authStore.isAdmin" class="space-y-1 pt-2 border-t border-gray-100">
          <p v-if="!sidebarCollapsed" class="px-3 text-[10px] font-semibold uppercase text-indigo-500 tracking-wider mb-1.5 flex items-center gap-1">
            <Shield class="w-3 h-3" /> ADMIN PANEL
          </p>
          <router-link
            v-for="item in adminNavItems"
            :key="item.to"
            :to="item.to"
            @click="mobileOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
            :class="[
              route.path === item.to
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-900/70 hover:bg-indigo-50 hover:text-indigo-900',
              sidebarCollapsed ? 'justify-center' : '',
            ]"
            :title="sidebarCollapsed ? item.label : undefined"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Sidebar Footer Links -->
      <div class="px-3 py-3 border-t border-gray-100 space-y-1">
        <router-link
          to="/dashboard/profile"
          @click="mobileOpen = false"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          :class="[
            route.path === '/dashboard/profile' ? 'bg-gray-100 text-gray-900 font-semibold' : '',
            sidebarCollapsed ? 'justify-center' : '',
          ]"
        >
          <User class="w-4 h-4 shrink-0 text-gray-400" />
          <span v-if="!sidebarCollapsed">My Profile</span>
        </router-link>

        <router-link
          to="/dashboard/settings"
          @click="mobileOpen = false"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          :class="[
            route.path === '/dashboard/settings' ? 'bg-gray-100 text-gray-900 font-semibold' : '',
            sidebarCollapsed ? 'justify-center' : '',
          ]"
        >
          <Settings class="w-4 h-4 shrink-0 text-gray-400" />
          <span v-if="!sidebarCollapsed">Settings</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Section -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar (Height 56px per specification) -->
      <header
        class="flex items-center justify-between h-14 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-gray-200 shrink-0 z-30"
      >
        <button
          @click="mobileOpen = true"
          class="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
        >
          <Menu class="w-5 h-5" />
        </button>

        <div class="hidden lg:flex items-center gap-2">
          <span v-if="authStore.isAdmin" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-medium">
            <Shield class="w-3 h-3" /> Admin Mode
          </span>
        </div>

        <!-- Top Right User Dropdown -->
        <div class="relative ml-auto flex items-center gap-3">
          <button
            @click="userDropdownOpen = !userDropdownOpen"
            class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <div class="w-8 h-8 rounded-full bg-gray-900 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
              {{ userInitial }}
            </div>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="userDropdownOpen"
              class="absolute right-0 top-11 w-56 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden z-50 origin-top-right py-1"
            >
              <div class="px-3.5 py-2.5 border-b border-gray-100">
                <p class="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Signed in as</p>
                <p class="text-xs font-semibold text-gray-900 truncate mt-0.5">
                  {{ authStore.user?.email }}
                </p>
              </div>

              <div class="py-1 text-xs">
                <router-link
                  to="/dashboard/profile"
                  @click="closeDropdown"
                  class="flex items-center gap-2 px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition"
                >
                  <User class="w-4 h-4 text-gray-400" /> User Profile
                </router-link>
                <router-link
                  to="/dashboard/settings"
                  @click="closeDropdown"
                  class="flex items-center gap-2 px-3.5 py-2 text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings class="w-4 h-4 text-gray-400" /> Settings
                </router-link>

                <div v-if="authStore.isAdmin" class="border-t border-gray-100 my-1 pt-1">
                  <router-link
                    to="/admin"
                    @click="closeDropdown"
                    class="flex items-center gap-2 px-3.5 py-2 text-indigo-600 hover:bg-indigo-50 font-medium transition"
                  >
                    <Shield class="w-4 h-4" /> Admin Console
                  </router-link>
                </div>
              </div>

              <div class="border-t border-gray-100 pt-1">
                <button
                  @click="handleSignOut"
                  class="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut class="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </header>

      <!-- Page Content View -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot />
        </div>
      </main>
    </div>

    <!-- Overlay back-click handler for dropdown -->
    <div v-if="userDropdownOpen" class="fixed inset-0 z-40" @click="closeDropdown" />
  </div>
</template>
