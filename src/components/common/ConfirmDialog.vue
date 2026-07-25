<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    loading?: boolean
  }>(),
  {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'destructive',
    loading: false,
  }
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleClose = (value: boolean) => {
  emit('update:open', value)
  if (!value) emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-base font-bold text-gray-900">{{ title }}</DialogTitle>
        <DialogDescription class="text-xs text-gray-500 mt-1.5">
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex items-center justify-end gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          :disabled="loading"
          @click="handleClose(false)"
          class="text-xs"
        >
          {{ cancelText }}
        </Button>
        <Button
          :variant="variant"
          size="sm"
          :disabled="loading"
          @click="handleConfirm"
          class="text-xs flex items-center gap-1.5"
        >
          <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
          {{ confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
