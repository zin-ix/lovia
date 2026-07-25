import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Template } from '@/types/template.types'
import { TemplateService } from '@/services/template/template.service'
import { BUILTIN_TEMPLATES } from '@/data/templates.data'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<Template[]>(BUILTIN_TEMPLATES)
  const loading = ref(false)

  const fetchTemplates = async () => {
    loading.value = true
    try {
      const data = await TemplateService.getAllTemplates()
      templates.value = data
    } catch {
      templates.value = BUILTIN_TEMPLATES
    } finally {
      loading.value = false
    }
  }

  const getTemplate = (idOrSlug?: string): Template => {
    const fallback = BUILTIN_TEMPLATES[0] as Template
    if (!idOrSlug) return (templates.value[0] ?? fallback) as Template
    
    // Search both loaded templates and built-in template catalog
    const foundInState = templates.value.find((t) => t.id === idOrSlug || t.slug === idOrSlug)
    const foundBuiltin = BUILTIN_TEMPLATES.find((t) => t.id === idOrSlug || t.slug === idOrSlug)
    
    const target = foundInState || foundBuiltin || fallback

    // Ensure theme_config has all required styling variables from matching built-in template
    const defaultTheme = (foundBuiltin || fallback).theme_config
    const mergedTheme = { ...defaultTheme, ...(target.theme_config || {}) }

    return {
      ...target,
      theme_config: mergedTheme,
    }
  }

  return {
    templates,
    loading,
    fetchTemplates,
    getTemplate,
  }
})
