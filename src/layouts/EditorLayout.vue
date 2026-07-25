<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { SidebarProvider } from '@/components/ui/sidebar'
import UserSidebar from '@/components/navigation/UserSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.user) {
    try {
      await authStore.getSession()
      if (!authStore.user) router.push('/auth/login')
    } catch {
      router.push('/auth/login')
    }
  }
})
</script>

<template>
  <!-- Full-height editor layout — no navbar, no content container -->
  <SidebarProvider class="bg-[#f5f5f7] min-h-screen text-gray-900 font-sans">
    <div class="flex h-screen w-full overflow-hidden">
      <UserSidebar />
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <slot />
      </div>
    </div>
  </SidebarProvider>
</template>
