import { supabase } from '@/plugins/supabase'
import type { Template } from '@/types/template.types'
import { BUILTIN_TEMPLATES } from '@/data/templates.data'

export class TemplateService {
  static async getAllTemplates(): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category || t.theme_config?.category || 'Romantic',
          tags: t.tags || t.theme_config?.tags || ['Love'],
          theme_config: t.theme_config,
          preset_content: t.preset_content || t.theme_config?.preset_content,
          is_premium: Boolean(t.is_premium),
        })) as Template[]
      }

      // If DB templates table is empty, auto-seed templates into Supabase
      if (data && data.length === 0) {
        await this.seedTemplatesToDatabase()
        const { data: seededData } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: true })
        if (seededData && seededData.length > 0) {
          return seededData.map((t: any) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            description: t.description,
            category: t.category || t.theme_config?.category || 'Romantic',
            tags: t.tags || t.theme_config?.tags || ['Love'],
            theme_config: t.theme_config,
            preset_content: t.preset_content || t.theme_config?.preset_content,
            is_premium: Boolean(t.is_premium),
          })) as Template[]
        }
      }

      return BUILTIN_TEMPLATES
    } catch {
      return BUILTIN_TEMPLATES
    }
  }

  /**
   * Auto-seed built-in templates into Supabase 'templates' table
   * Matching exact table schema: (name, slug, description, theme_config, is_premium)
   */
  static async seedTemplatesToDatabase(): Promise<void> {
    try {
      const dbPayload = BUILTIN_TEMPLATES.map((t) => ({
        name: t.name,
        slug: t.slug,
        description: t.description,
        theme_config: {
          ...t.theme_config,
          category: t.category,
          preset_content: t.preset_content,
        },
        is_premium: Boolean(t.is_premium),
      }))

      await supabase.from('templates').upsert(dbPayload, { onConflict: 'slug' })
    } catch (err) {
      console.warn('Failed to seed templates to database:', err)
    }
  }

  /**
   * Get a template by ID or Slug.
   */
  static async getTemplateByIdOrSlug(idOrSlug: string): Promise<Template | undefined> {
    const templates = await this.getAllTemplates()
    return templates.find((t) => t.id === idOrSlug || t.slug === idOrSlug)
  }
}
