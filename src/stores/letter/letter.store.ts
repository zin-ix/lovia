import { ref } from 'vue'
import { defineStore } from 'pinia'
import { LetterService } from '@/services/letter/letter.services'
import type { Letter } from '@/types/letter.types'

export const useLetterStore = defineStore('letter', () => {
  const letters = ref<Letter[]>([])
  const currentLetter = ref<Letter | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUserLetters = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      letters.value = await LetterService.getUserLetters(userId)
    } catch (err: any) {
      error.value = err.message || 'Failed to load user letters'
    } finally {
      loading.value = false
    }
  }

  const fetchLetterBySlug = async (slug: string) => {
    loading.value = true
    error.value = null
    try {
      const letter = await LetterService.getLetterBySlug(slug)
      currentLetter.value = letter
      if (letter) {
        LetterService.incrementViewCount(letter.id).catch(() => {})
        LetterService.recordAnalytics(letter.id, 'open').catch(() => {})
      }
      return letter
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch letter'
      currentLetter.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const createLetter = async (userId: string, data: Partial<Letter>) => {
    loading.value = true
    error.value = null
    try {
      const newLetter = await LetterService.createLetter(userId, data)
      letters.value.unshift(newLetter)
      return newLetter
    } catch (err: any) {
      error.value = err.message || 'Failed to create letter'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLetter = async (id: string, data: Partial<Letter>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await LetterService.updateLetter(id, data)
      const index = letters.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        letters.value[index] = updated
      }
      if (currentLetter.value?.id === id) {
        currentLetter.value = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update letter'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLetter = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await LetterService.deleteLetter(id)
      letters.value = letters.value.filter((l) => l.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete letter'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    letters,
    currentLetter,
    loading,
    error,
    fetchUserLetters,
    fetchLetterBySlug,
    createLetter,
    updateLetter,
    deleteLetter,
  }
})
