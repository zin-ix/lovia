<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { SidebarProvider } from '@/components/ui/sidebar'
import AdminSidebar from '@/components/navigation/AdminSidebar.vue'
import AdminNavbar from '@/components/navigation/AdminNavbar.vue'
import { AlertCircle } from '@lucide/vue'

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
  <SidebarProvider class="bg-[#FAFAFA] min-h-screen text-gray-900 font-sans">
    <div class="flex h-screen w-full overflow-hidden">
      <!-- Admin Sidebar -->
      <AdminSidebar />

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Admin Navbar -->
        <AdminNavbar />

        <!-- Main Workspace Container -->
        <main class="flex-1 overflow-y-auto">
          <div class="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Access Guard -->
            <div v-if="!authStore.isAdmin" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-3">
              <AlertCircle class="w-10 h-10 text-red-500 mx-auto" />
              <h2 class="text-base font-bold text-red-900">Administrator Access Required</h2>
              <p class="text-xs text-red-700">You must be logged in as an administrator to access the admin console.</p>
              <button
                @click="router.push('/dashboard')"
                class="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition"
              >
                Return to User Workspace
              </button>
            </div>

            <slot v-else />
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
</template>
