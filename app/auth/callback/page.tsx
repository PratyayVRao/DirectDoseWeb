"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function CallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession()

      if (error) {
        console.error("Auth callback error:", error)
        router.push("/login?error=auth_callback_failed")
      } else {
        router.push("/") // or redirect to dashboard
      }
    }

    handleAuth()
  }, [supabase, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Processing login...</p>
    </div>
  )
}
