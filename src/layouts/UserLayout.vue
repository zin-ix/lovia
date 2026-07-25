<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { SidebarProvider } from '@/components/ui/sidebar'
import UserSidebar from '@/components/navigation/UserSidebar.vue'
import UserNavbar from '@/components/navigation/UserNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

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
  <SidebarProvider class="bg-[#f5f5f7] min-h-screen text-gray-900 font-sans">
    <div class="flex h-screen w-full overflow-hidden">
      <!-- User Sidebar -->
      <UserSidebar />

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- User Navbar -->
        <UserNavbar />

        <!-- Main Workspace Container -->
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>
