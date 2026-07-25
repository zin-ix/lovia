<script setup lang="ts">
import { useRoute } from 'vue-router'
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
import { Users, Shield, Sliders, ArrowLeft, BarChart3, LayoutDashboard, HardDrive, CreditCard, PackagePlus } from '@lucide/vue'

const route = useRoute()

const adminNavItems = [
  { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/analytics', label: 'Analytics & Revenue', icon: BarChart3 },
  { to: '/admin/payments', label: 'Payment Verifications', icon: CreditCard },
  { to: '/admin/plans', label: 'Plan Management', icon: PackagePlus },
  { to: '/admin/profile', label: 'Admin Profile', icon: Shield },
  { to: '/admin/settings', label: 'System Settings', icon: Sliders },
]
</script>

<template>
  <TooltipProvider>
    <Sidebar collapsible="icon" class="border-r border-rose-100 bg-white">
      <!-- Header Brand Logo -->
      <SidebarHeader class="border-b border-rose-100 px-3.5 py-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center flex items-center justify-between h-12 bg-rose-50/30">
        <router-link to="/admin" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 overflow-hidden w-full">
          <!-- Logo with word when full -->
          <div class="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <img :src="logoWithWord" alt="Lovia Admin" class="h-6 w-auto object-contain" />
            <span class="text-[9px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full">Admin</span>
          </div>
          <!-- Icon logo when collapsed -->
          <img
            :src="logoIcon"
            alt="Lovia Admin"
            class="h-7 w-7 group-data-[collapsible=icon]:block hidden object-contain shrink-0 mx-auto"
          />
        </router-link>
      </SidebarHeader>

      <!-- Content Menu -->
      <SidebarContent class="px-2 py-4 space-y-4 group-data-[collapsible=icon]:px-0">
        <SidebarGroup class="group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel class="text-[10px] font-semibold tracking-wider text-rose-500 uppercase group-data-[collapsible=icon]:hidden">
            ADMINISTRATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu class="group-data-[collapsible=icon]:items-center space-y-1">
              <SidebarMenuItem v-for="item in adminNavItems" :key="item.to" class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :as-child="true"
                      :is-active="route.path === item.to"
                      class="w-full text-xs font-medium rounded-full transition-colors group-data-[collapsible=icon]:justify-center"
                      :class="route.path === item.to ? 'bg-rose-500 text-white hover:bg-rose-600 hover:text-white' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'"
                    >
                      <router-link :to="item.to" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 w-full">
                        <component :is="item.icon" class="w-4 h-4 shrink-0" />
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

        <!-- Back to User Workspace -->
        <SidebarGroup class="border-t border-gray-100 pt-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel class="text-[10px] font-semibold tracking-wider text-gray-400 uppercase group-data-[collapsible=icon]:hidden">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu class="group-data-[collapsible=icon]:items-center">
              <SidebarMenuItem class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <SidebarMenuButton
                      :as-child="true"
                      class="w-full text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full group-data-[collapsible=icon]:justify-center"
                    >
                      <router-link to="/dashboard" class="flex items-center justify-start group-data-[collapsible=icon]:justify-center gap-2.5 w-full">
                        <ArrowLeft class="w-4 h-4 shrink-0 text-gray-500" />
                        <span class="group-data-[collapsible=icon]:hidden">User Workspace</span>
                      </router-link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" class="group-data-[collapsible=icon]:block hidden text-xs">
                    Return to User Workspace
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <!-- Footer (Hidden when collapsed into icon mode) -->
      <SidebarFooter class="border-t border-rose-100 p-3 bg-rose-50/20 group-data-[collapsible=icon]:hidden">
        <div class="flex items-center justify-between text-xs text-rose-400">
          <span class="text-[10px] font-medium text-rose-600 flex items-center gap-1">
            <HardDrive class="w-3 h-3 text-rose-500" /> System Protected
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  </TooltipProvider>
</template>
