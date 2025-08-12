"use client"

import { useEffect } from "react"
import { useToast } from "./toast-provider"

export function ToastInitializer() {
  const context = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__TOAST_CONTEXT__ = context
    }
  }, [context])

  return null
}
