import { supabase } from '@/plugins/supabase'
import Compressor from 'compressorjs'

export interface Plan {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  letter_limit: number | null   // null = unlimited
  is_unlimited: boolean
  qr_code_url: string
  account_name: string
  account_number: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type PlanUpsert = Omit<Plan, 'id' | 'created_at' | 'updated_at'>

/** Inline compress helper (safe to call outside Vue components) */
function compressFile(file: File, quality = 0.85, maxWidth = 800, maxHeight = 800): Promise<File> {
  return new Promise((resolve) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      success(result) {
        const out =
          result instanceof File
            ? result
            : new File([result as Blob], file.name, { type: (result as Blob).type })
        resolve(out)
      },
      error() {
        resolve(file) // graceful fallback
      },
    })
  })
}

export const PlanService = {
  // ── 1. Fetch all plans ordered by sort_order ──
  async fetchAllPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[PlanService] fetchAllPlans error:', error.code, error.message, error.details)
      return []
    }
    console.log('[PlanService] fetchAllPlans returned', data?.length ?? 0, 'rows')
    return data || []
  },

  // ── 2. Fetch only active plans (for user-facing pricing) ──
  async fetchActivePlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[PlanService] fetchActivePlans error:', error.code, error.message, error.details)
      return []
    }
    console.log('[PlanService] fetchActivePlans returned', data?.length ?? 0, 'rows')
    return data || []
  },

  // ── 3. Create a new plan ──
  async createPlan(payload: PlanUpsert): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new Error(error.message || 'Failed to create plan')
    return data
  },

  // ── 4. Update an existing plan ──
  async updatePlan(id: string, payload: Partial<PlanUpsert>): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message || 'Failed to update plan')
    return data
  },

  // ── 5. Delete a plan ──
  async deletePlan(id: string): Promise<void> {
    const { error } = await supabase.from('plans').delete().eq('id', id)
    if (error) throw new Error(error.message || 'Failed to delete plan')
  },

  // ── 6. Upload + compress a QR code image → Supabase Storage (images bucket) ──
  async uploadPlanQrImage(file: File, planSlug: string): Promise<string> {
    const compressed = await compressFile(file, 0.85, 800, 800)
    const fileExt = compressed.name.split('.').pop() || 'png'
    const filePath = `plan_qr/${planSlug}_${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('images')                         // ← images bucket
      .upload(filePath, compressed, { cacheControl: '3600', upsert: true })

    if (error) throw new Error(`QR upload error: ${error.message}`)

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  },

  // ── 7. Get the plan a user currently has (by active_plan_id on profile) ──
  async getUserActivePlan(activePlanId: string | null | undefined): Promise<Plan | null> {
    if (!activePlanId) return null
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', activePlanId)
      .single()
    if (error) return null
    return data
  },
}
