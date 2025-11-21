"use client"

// This file is intentionally left blank to remove toast functionality.

import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  // No-op
  return {
    id: 'noop',
    dismiss: () => {},
    update: () => {},
  }
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: (toastId?: string) => {},
  }
}

export { useToast, toast }
