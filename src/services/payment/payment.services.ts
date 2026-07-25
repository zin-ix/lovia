import { supabase } from '@/plugins/supabase'

export interface PaymentRecord {
  id: string
  user_id: string
  ref_number: string
  amount: number
  payment_method: string
  plan_name: string
  proof_url: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
  profiles?: {
    email: string
    full_name?: string
  }
}

export const PaymentService = {
  // ── 0. Upload receipt image to Supabase Storage bucket "payment_proof" ──
  async uploadProofImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'png'
    const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`

    const { error } = await supabase.storage
      .from('payment_proof')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.warn('Storage upload warning:', error)
      throw new Error(`Storage error (${error.message}). Please ensure bucket "payment_proof" exists in Supabase.`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('payment_proof')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  },

  // ── 1. User submits payment proof ──
  async submitPaymentProof(payload: {
    userId: string
    refNumber: string
    amount: number
    paymentMethod?: string
    planName?: string
    proofUrl: string
  }): Promise<PaymentRecord> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: payload.userId,
        ref_number: payload.refNumber,
        amount: payload.amount,
        payment_method: payload.paymentMethod || 'Maya QR',
        plan_name: payload.planName || 'Single Pass',
        proof_url: payload.proofUrl,
        status: 'pending',
      })
      .select('*, profiles:user_id(email, full_name)')
      .single()

    if (error) {
      console.error('Error submitting payment proof:', error)
      throw new Error(error.message || 'Failed to submit payment proof')
    }

    return data
  },

  // ── 2. Admin fetches all payment records from database ──
  async fetchAllPayments(): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, profiles:user_id(email, full_name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return []
    }

    return data || []
  },

  // ── 3. Admin approves payment proof & upgrades user profile ──
  async approvePayment(paymentId: string, userId: string, planName: string, amount: number): Promise<void> {
    const { error: paymentErr } = await supabase
      .from('payments')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', paymentId)

    if (paymentErr) {
      console.error('Error approving payment:', paymentErr)
      throw new Error(paymentErr.message || 'Failed to approve payment')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('letter_limit')
      .eq('id', userId)
      .single()

    const currentLimit = profile?.letter_limit || 2
    const isUnlimited = planName.toLowerCase().includes('unlimited') || amount >= 149
    const newLimit = isUnlimited ? 99999 : currentLimit + 1

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        letter_limit: newLimit,
        is_premium: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileErr) {
      console.error('Error updating user profile limit:', profileErr)
      throw new Error(profileErr.message || 'Failed to update user profile limit')
    }
  },

  // ── 4. Admin rejects payment proof ──
  async rejectPayment(paymentId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        admin_notes: notes || 'Receipt verification failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    if (error) {
      console.error('Error rejecting payment:', error)
      throw new Error(error.message || 'Failed to reject payment')
    }
  },

  // ── 5. Realtime Subscription for Payments (Admin & Users) ──
  subscribeToPayments(onPaymentChange: (payload: any) => void) {
    const channel = supabase
      .channel('public:payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          onPaymentChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // ── 6. Realtime Subscription for User Profile upgrades ──
  subscribeToUserProfile(userId: string, onProfileChange: (payload: any) => void) {
    const channel = supabase
      .channel(`public:profiles:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          onProfileChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
