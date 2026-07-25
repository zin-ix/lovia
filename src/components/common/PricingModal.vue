<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Check,
  Sparkles,
  Crown,
  Heart,
  QrCode,
  X,
  Lock,
  Loader2,
  Infinity as InfinityIcon,
  Star,
} from '@lucide/vue'
import PaymentProofModal from '@/components/common/PaymentProofModal.vue'
import { PlanService, type Plan } from '@/services/plan/plan.services'
import { useAuthStore } from '@/stores/auth/auth.store'

const props = withDefaults(
  defineProps<{
    open: boolean
    userLimit?: number
  }>(),
  { userLimit: 2 },
)

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const authStore = useAuthStore()
const plans = ref<Plan[]>([])
const loadingPlans = ref(false)
const showPaymentModal = ref(false)
const selectedPlan = ref<Plan | null>(null)

// The plan ID the user currently has (from profile.active_plan_id if it exists)
const userActivePlanId = computed(
  () => (authStore.profile as any)?.active_plan_id ?? null,
)

async function loadPlans() {
  loadingPlans.value = true
  try {
    plans.value = await PlanService.fetchActivePlans()
  } finally {
    loadingPlans.value = false
  }
}

// Load plans when modal opens (lazy)
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && plans.value.length === 0) loadPlans()
  },
  { immediate: true },
)

function isCurrentPlan(plan: Plan): boolean {
  return !!userActivePlanId.value && userActivePlanId.value === plan.id
}

function startQrPayment(plan: Plan) {
  selectedPlan.value = plan
  showPaymentModal.value = true
}

function closeModal() {
  emit('update:open', false)
}

// ── Icon helpers per plan tier ─────────────────────────────────────────────
function planIcon(plan: Plan) {
  if (plan.is_unlimited) return Crown
  if (plan.sort_order <= 1) return Heart
  return Star
}

// ── Gradient class per plan ────────────────────────────────────────────────
function planCardClass(plan: Plan) {
  if (plan.is_unlimited) return 'bg-rose-50/60 border-rose-200'
  if (plan.sort_order <= 1) return 'bg-white border-rose-200'
  return 'bg-rose-50/30 border-rose-100'
}
</script>

<template>
  <div>
    <!-- Main Pricing Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/20 backdrop-blur-xs overflow-y-auto"
        @click.self="closeModal"
      >
        <div
          class="w-full max-w-3xl bg-white rounded-[20px] p-6 sm:p-7 shadow-xl space-y-5 border border-rose-100/80 relative my-8 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 p-1.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Header -->
          <div class="text-center space-y-1.5 max-w-md mx-auto">
            <span class="px-2.5 py-1 bg-rose-50/80 text-rose-400 text-[10px] font-semibold uppercase tracking-wide rounded-full inline-flex items-center gap-1">
              <Sparkles class="w-3 h-3" /> Lovia Keepsake Passes
            </span>
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">Choose Your Keepsake Pass</h2>
            <p class="text-xs text-gray-400 leading-relaxed">
              One-time payment. No subscriptions. Scan the QR code to unlock premium templates instantly.
            </p>
          </div>

          <!-- Loading state -->
          <div v-if="loadingPlans" class="flex items-center justify-center py-8 text-gray-400 gap-2">
            <Loader2 class="w-5 h-5 animate-spin" />
            <span class="text-xs">Loading plans…</span>
          </div>

          <!-- Plans Grid from DB -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">

            <!-- Free / Standard plan card (always shown) -->
            <div class="bg-rose-50/40 border border-rose-100 rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5">
              <div class="space-y-2.5">
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Standard Free</span>
                  <span
                    v-if="!userActivePlanId"
                    class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
                  >
                    ✓ Current
                  </span>
                </div>
                <div>
                  <span class="text-xl font-bold text-gray-700">₱0</span>
                  <span class="text-[11px] text-gray-400"> / free forever</span>
                </div>
                <p class="text-[11px] text-gray-400 leading-normal">Perfect for your first love letter keepsake.</p>
                <ul class="space-y-1.5 text-xs text-gray-500 pt-2 border-t border-rose-100/70">
                  <li class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <span>Up to {{ userLimit }} Letter Keepsakes</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <span>Standard Rose Template</span>
                  </li>
                  <li class="flex items-center gap-2 text-gray-300">
                    <Lock class="w-3.5 h-3.5 shrink-0" />
                    <span>Premium Templates Locked</span>
                  </li>
                </ul>
              </div>
              <button disabled class="w-full py-2 bg-white text-gray-400 border border-gray-100 rounded-xl text-xs font-semibold cursor-not-allowed">
                {{ !userActivePlanId ? 'Current Plan' : 'Free Plan' }}
              </button>
            </div>

            <!-- Dynamic DB-driven plan cards -->
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5 border relative"
              :class="planCardClass(plan)"
            >
              <!-- Best Value ribbon for unlimited -->
              <div
                v-if="plan.is_unlimited"
                class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-400 text-white text-[9px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full whitespace-nowrap"
              >
                Best Value
              </div>

              <!-- Current plan indicator -->
              <div
                v-if="isCurrentPlan(plan)"
                class="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
              >
                ✓ Your Plan
              </div>

              <div class="space-y-2.5" :class="plan.is_unlimited ? 'pt-1' : ''">
                <!-- Plan name row -->
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1"
                    :class="plan.is_unlimited ? 'text-rose-500' : 'text-rose-400'"
                  >
                    <component :is="planIcon(plan)" class="w-3.5 h-3.5" :class="plan.is_unlimited ? 'text-rose-400' : 'text-rose-300'" />
                    {{ plan.name }}
                  </span>
                  <span
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    :class="plan.is_unlimited ? 'text-rose-500 bg-white' : 'text-rose-400 bg-rose-50'"
                  >
                    <span v-if="plan.is_unlimited">Lifetime</span>
                    <span v-else>{{ plan.letter_limit }} Keepsake{{ plan.letter_limit !== 1 ? 's' : '' }}</span>
                  </span>
                </div>

                <!-- Price -->
                <div>
                  <span class="text-2xl font-bold text-gray-800">₱{{ Number(plan.price).toFixed(0) }}</span>
                  <span class="text-[11px] text-gray-400"> {{ plan.is_unlimited ? 'lifetime access' : 'one-time' }}</span>
                </div>

                <p v-if="plan.description" class="text-[11px] text-gray-400 leading-normal">{{ plan.description }}</p>

                <!-- Feature bullets -->
                <ul class="space-y-1.5 text-xs text-gray-500 pt-2 border-t border-rose-50">
                  <li v-if="plan.is_unlimited" class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span class="font-medium text-gray-600">Unlimited Letter Keepsakes</span>
                  </li>
                  <li v-else class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 text-rose-300 shrink-0" />
                    <span>Unlock {{ plan.letter_limit }} Premium Template{{ plan.letter_limit !== 1 ? 's' : '' }}</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 shrink-0" :class="plan.is_unlimited ? 'text-rose-400' : 'text-rose-300'" />
                    <span>Passcode Privacy Protection</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 shrink-0" :class="plan.is_unlimited ? 'text-rose-400' : 'text-rose-300'" />
                    <span>Custom Background Music URL</span>
                  </li>
                  <li v-if="plan.is_unlimited" class="flex items-center gap-2">
                    <Check class="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Priority QR Approval</span>
                  </li>
                </ul>
              </div>

              <!-- CTA button -->
              <button
                v-if="isCurrentPlan(plan)"
                disabled
                class="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Check class="w-3.5 h-3.5" /> Active Plan
              </button>
              <button
                v-else
                @click="startQrPayment(plan)"
                class="w-full py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                :class="plan.is_unlimited
                  ? 'bg-rose-400 hover:bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100'"
              >
                <QrCode class="w-3.5 h-3.5" />
                Pay ₱{{ Number(plan.price).toFixed(0) }} via QR
              </button>
            </div>

            <!-- Empty state if no DB plans yet -->
            <div
              v-if="plans.length === 0"
              class="col-span-2 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-400"
            >
              No paid plans configured yet. Ask an admin to add plans via Plan Management.
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- QR Code Payment Proof Upload Modal -->
    <PaymentProofModal
      v-model:open="showPaymentModal"
      :plan-name="selectedPlan?.name"
      :amount-text="selectedPlan ? `₱${Number(selectedPlan.price).toFixed(2)}` : undefined"
      :qr-image-url="selectedPlan?.qr_code_url"
      :account-name="selectedPlan?.account_name"
      :account-number="selectedPlan?.account_number"
    />
  </div>
</template>
