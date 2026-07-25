import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'
import ForgotPassword from '@/pages/auth/ForgotPassword.vue'
import ResetPassword from '@/pages/auth/ResetPassword.vue'
import LettersList from '@/pages/dashboard/LettersList.vue'
import CreateLetter from '@/pages/dashboard/CreateLetter.vue'
import TemplatesCatalog from '@/pages/dashboard/TemplatesCatalog.vue'
import UserProfile from '@/pages/dashboard/UserProfile.vue'
import UserSettings from '@/pages/dashboard/UserSettings.vue'
import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AdminUsers from '@/pages/admin/AdminUsers.vue'
import AdminAnalytics from '@/pages/admin/AdminAnalytics.vue'
import AdminPayments from '@/pages/admin/AdminPayments.vue'
import AdminProfile from '@/pages/admin/AdminProfile.vue'
import AdminSettings from '@/pages/admin/AdminSettings.vue'
import AdminPlans from '@/pages/admin/AdminPlans.vue'
import GuestLetter from '@/pages/letter/GuestLetter.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home, name: 'Home' },
    { path: '/auth/login', component: Login, name: 'Login' },
    { path: '/auth/register', component: Register, name: 'Register' },
    { path: '/auth/forgot-password', component: ForgotPassword, name: 'ForgotPassword' },
    { path: '/auth/reset-password', component: ResetPassword, name: 'ResetPassword' },

    // User Dashboard Routes
    { path: '/dashboard', component: LettersList, name: 'Dashboard' },
    { path: '/dashboard/templates', component: TemplatesCatalog, name: 'TemplatesCatalog' },
    { path: '/dashboard/create', component: CreateLetter, name: 'CreateLetter' },
    { path: '/dashboard/edit/:id', component: CreateLetter, name: 'EditLetter' },
    { path: '/dashboard/profile', component: UserProfile, name: 'UserProfile' },
    { path: '/dashboard/settings', component: UserSettings, name: 'UserSettings' },

    // Admin Panel Routes
    { path: '/admin', component: AdminDashboard, name: 'AdminDashboard' },
    { path: '/admin/users', component: AdminUsers, name: 'AdminUsers' },
    { path: '/admin/analytics', component: AdminAnalytics, name: 'AdminAnalytics' },
    { path: '/admin/payments', component: AdminPayments, name: 'AdminPayments' },
    { path: '/admin/profile', component: AdminProfile, name: 'AdminProfile' },
    { path: '/admin/plans', component: AdminPlans, name: 'AdminPlans' },
    { path: '/admin/settings', component: AdminSettings, name: 'AdminSettings' },

    // Guest Letter Preview
    { path: '/l/:slug?', component: GuestLetter, name: 'GuestLetter' },
  ],
})

export default router
