"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ToastType = {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
  action?: ReactNode
}

type ToastContextType = {
  toasts: ToastType[]
  addToast: (toast: Omit<ToastType, "id">) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = (toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Create a global toast object
export const toast = {
  default: (props: { title: string; description?: string; action?: ReactNode }) => {
    if (typeof window !== "undefined") {
      // Get the toast context from the global window object
      const toastContextValue = (window as any).__TOAST_CONTEXT__
      if (toastContextValue) {
        toastContextValue.addToast({ ...props, variant: "default" })
      }
    }
  },
  destructive: (props: { title: string; description?: string; action?: ReactNode }) => {
    if (typeof window !== "undefined") {
      const toastContextValue = (window as any).__TOAST_CONTEXT__
      if (toastContextValue) {
        toastContextValue.addToast({ ...props, variant: "destructive" })
      }
    }
  },
}

// Initialize the global toast context
if (typeof window !== "undefined") {
  // This will be set by the ToastInitializer component
  if (!(window as any).__TOAST_CONTEXT__) {
    ;(window as any).__TOAST_CONTEXT__ = {
      addToast: () => console.warn("Toast not initialized yet"),
      removeToast: () => {},
    }
  }
}
