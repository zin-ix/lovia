import { supabase } from '@/plugins/supabase'
import type { Letter } from '@/types/letter.types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUUID(val?: string | null): boolean {
  return !!val && UUID_REGEX.test(val)
}

export const LetterService = {
  async getLetterBySlug(slug: string): Promise<Letter | null> {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null
    }

    return data as Letter
  },

  async getUserLetters(userId?: string): Promise<Letter[]> {
    let query = supabase.from('letters').select('*').order('created_at', { ascending: false })

    if (userId && userId.trim()) {
      query = query.eq('user_id', userId.trim())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching letters:', error)
      return []
    }
    return (data || []) as Letter[]
  },

  async getLetterById(id: string): Promise<Letter | null> {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data as Letter
  },

  async createLetter(userId: string, letterData: Partial<Letter>): Promise<Letter> {
    const slug = letterData.slug || Math.random().toString(36).substring(2, 10)
    const rawTemplate = letterData.template_id || letterData.template_slug || (letterData.content as any)?.templateSlug || 'romantic-rose'

    const validUUID = isUUID(rawTemplate) ? rawTemplate : null
    const templateSlug = !validUUID ? rawTemplate : letterData.template_slug || null

    const contentPayload = {
      ...(letterData.content || {}),
      templateSlug: templateSlug || rawTemplate,
    }

    const payload: Record<string, any> = {
      user_id: userId,
      slug,
      title: letterData.title || 'Untitled Letter',
      recipient_name: letterData.recipient_name || 'My Love',
      template_id: validUUID,
      template_slug: templateSlug || rawTemplate,
      content: contentPayload,
      music_url: letterData.music_url || null,
      music_title: letterData.music_title || null,
      expires_at: letterData.expires_at || null,
      is_active: letterData.is_active ?? true,
    }

    const { data, error } = await supabase
      .from('letters')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Letter
  },

  async updateLetter(id: string, updates: Partial<Letter>): Promise<Letter> {
    const rawTemplate = updates.template_id || updates.template_slug || (updates.content as any)?.templateSlug
    const validUUID = isUUID(rawTemplate) ? rawTemplate : null
    const templateSlug = !validUUID ? rawTemplate : updates.template_slug || null

    const contentPayload = {
      ...(updates.content || {}),
      templateSlug: templateSlug || rawTemplate,
    }

    const cleanUpdates = { ...updates }
    delete cleanUpdates.recipient_type

    const payload: Record<string, any> = {
      ...cleanUpdates,
      template_id: validUUID,
      template_slug: templateSlug || rawTemplate,
      content: contentPayload,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('letters')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Letter
  },

  async deleteLetter(id: string): Promise<void> {
    const { error } = await supabase.from('letters').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  async incrementViewCount(letterId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_letter_views', { letter_id_param: letterId })
    if (error) {
      const { data } = await supabase.from('letters').select('view_count').eq('id', letterId).single()
      if (data) {
        await supabase
          .from('letters')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', letterId)
      }
    }
  },

  async recordAnalytics(letterId: string, eventType: string): Promise<void> {
    try {
      await supabase.from('letter_analytics').insert({
        letter_id: letterId,
        event_type: eventType,
      })
    } catch {
      // Ignore analytics logging errors gracefully
    }
  },
}
