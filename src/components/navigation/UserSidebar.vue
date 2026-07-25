<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import logoWithWord from '@/assets/images/logo_w_word.png'
import logoIcon from '@/assets/images/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Mail, PlusCircle, User, Settings, Shield, LayoutGrid } from '@lucide/vue'

const route = useRoute()
const authStore = useAuthStore()

const userNavItems = [
  { to: '/dashboard', label: 'My Letters', icon: Mail },
  { to: '/dashboard/templates', label: 'Letter Templates', icon: LayoutGrid },
  { to: '/dashboard/create', label: 'New Letter', icon: PlusCircle },
]

const accountNavItems = [
  { to: '/dashboard/profile', label: 'My Profile', icon: User },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]
</script>

<template>
  <TooltipProvider>
    <Sidebar collapsible="icon" class="border-r border-gray-200 bg-white">
      <!-- Header Brand Logo -->
      <SidebarHeader class="border-b border-gray-100 px-3.5 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center flex items-center justify-between h-13">
        <router-link to="/dashboard" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 overflow-hidden w-full">
          <!-- Logo with word when full -->
          <img
            :src="logoWithWord"
            alt="Lovia"
            class="h-6 w-auto group-data-[collapsible=icon]:hidden object-contain"
          />
          <!-- Icon logo when collapsed -->
          <img
            :src="logoIcon"
            alt="Lovia"
            class="h-7 w-7 group-data-[collapsible=icon]:block hidden object-contain shrink-0 mx-auto"
          />
        </router-link>
      </SidebarHeader>

      <!-- Content Menu -->
      <SidebarContent class="px-2.5 py-4 space-y-4 group-data-[collapsible=icon]:px-0">
        <!-- Main Workspace Group -->
        <SidebarGroup class="group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel class="text-[10px] font-semibold tracking-wider text-gray-400 uppercase group-data-[collapsible=icon]:hidden">
            WORKSPACE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu class="group-data-[collapsible=icon]:items-center space-y-1">
              <SidebarMenuItem v-for="item in userNavItems" :key="item.to" class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :as-child="true"
                      :is-active="route.path === item.to"
                      class="w-full text-xs font-medium rounded-full transition-colors group-data-[collapsible=icon]:justify-center"
                      :class="route.path === item.to ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
                    >
                      <router-link :to="item.to" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 w-full">
                        <component :is="item.icon" class="w-4 h-4 shrink-0" :class="route.path === item.to ? 'text-rose-500' : 'text-gray-500'" />
                        <span class="group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
                      </router-link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="group-data-[collapsible=icon]:block hidden text-xs">
                    {{ item.label }}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <!-- Account Settings Group -->
        <SidebarGroup class="group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel class="text-[10px] font-semibold tracking-wider text-gray-400 uppercase group-data-[collapsible=icon]:hidden">
            ACCOUNT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu class="group-data-[collapsible=icon]:items-center space-y-1">
              <SidebarMenuItem v-for="item in accountNavItems" :key="item.to" class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :as-child="true"
                      :is-active="route.path === item.to"
                      class="w-full text-xs font-medium rounded-full transition-colors group-data-[collapsible=icon]:justify-center"
                      :class="route.path === item.to ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
                    >
                      <router-link :to="item.to" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 w-full">
                        <component :is="item.icon" class="w-4 h-4 shrink-0" :class="route.path === item.to ? 'text-rose-500' : 'text-gray-500'" />
                        <span class="group-data-[collapsible=icon]:hidden">{{ item.label }}</span>
                      </router-link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="group-data-[collapsible=icon]:block hidden text-xs">
                    {{ item.label }}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <!-- Admin Switcher Group if user is Admin -->
        <SidebarGroup v-if="authStore.isAdmin" class="border-t border-gray-100 pt-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel class="text-[10px] font-semibold tracking-wider text-rose-500 uppercase group-data-[collapsible=icon]:hidden flex items-center gap-1">
            <Shield class="w-3 h-3" /> ADMIN SYSTEM
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu class="group-data-[collapsible=icon]:items-center">
              <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :as-child="true"
                      class="w-full text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full group-data-[collapsible=icon]:justify-center"
                    >
                      <router-link to="/admin" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 w-full">
                        <Shield class="w-4 h-4 shrink-0 text-rose-500" />
                        <span class="group-data-[collapsible=icon]:hidden">Admin Console</span>
                      </router-link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="group-data-[collapsible=icon]:block hidden text-xs">
                    Switch to Admin Console
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <!-- Footer (Hidden when collapsed into icon mode) -->
      <SidebarFooter class="border-t border-gray-100 p-3 group-data-[collapsible=icon]:hidden">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span class="text-[10px] font-medium text-gray-500">Lovia Workspace</span>
          <span class="text-[10px] font-mono text-gray-400">v1.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  </TooltipProvider>
</template>
