"use client"

import { useState, useEffect, useRef, type RefObject } from "react"

type IntersectionOptions = {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useIntersectionObserver<T extends HTMLElement>(
  options: IntersectionOptions = {},
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = false } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && element) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, once])

  return [ref, isVisible]
}
