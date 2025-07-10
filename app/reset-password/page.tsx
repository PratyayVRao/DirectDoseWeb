"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, CheckCircle, KeyRound } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/toast-provider"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidReset, setIsValidReset] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Check if we have a valid reset token
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsCheckingSession(true)

        // Get token_hash from URL if present
        const tokenHash = searchParams.get("token_hash")
        const type = searchParams.get("type")
        const email = searchParams.get("email")

        if (tokenHash && type === "recovery") {
          console.log("Found token hash in URL, verifying...")
          // This is a direct access with a token hash
          setIsValidReset(true)
          setIsCheckingSession(false)
          return
        }

        // Otherwise check if we have a session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        console.log("Session check for reset password:", data.session ? "Has session" : "No session")

        // If we have a user session, this is a valid reset
        if (data.session) {
          setIsValidReset(true)
        } else {
          // No valid token or session, redirect to login
          console.log("No valid token or session, invalid reset attempt")
          toast.destructive({
            title: "Invalid reset link",
            description: "This password reset link is invalid or has expired. Please request a new one.",
          })
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        setError(error instanceof Error ? error.message : "An error occurred while checking your session")
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [supabase, router, searchParams])

  // Clear error when inputs change
  useEffect(() => {
    setError(null)
  }, [password, confirmPassword])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting to update password")

      // Get token hash from URL if present
      const tokenHash = searchParams.get("token_hash")
      const type = searchParams.get("type")
      const email = searchParams.get("email")

      let error

      if (tokenHash && type === "recovery") {
        // If we have a token hash, use it to verify OTP and update password
        console.log("Using token hash to reset password")
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
          new_password: password,
        })
        error = verifyError
      } else {
        // Otherwise use the standard update user method
        console.log("Using session to update password")
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })
        error = updateError
      }

      if (error) {
        throw error
      }

      console.log("Password updated successfully")
      setSuccess(true)
      toast.default({
        title: "Password updated successfully",
        description: "Your password has been reset. You can now sign in with your new password.",
      })

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("Reset password error:", error)
      setError(error instanceof Error ? error.message : "An error occurred while resetting your password")

      toast.destructive({
        title: "Reset password failed",
        description: error instanceof Error ? error.message : "An error occurred while resetting your password",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#006c67] mx-auto mb-4" />
          <p className="text-[#006c67]">Validating your reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidReset && !error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium">Invalid or expired reset link</p>
          <p className="mt-2">Please request a new password reset link from the login page.</p>
          <Button onClick={() => router.push("/login")} className="mt-4 bg-[#006c67] hover:bg-[#004a46] text-white">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DiabeteaseLogo-BG-bk6LGtoECw2WDKDg2nZIC8vFNsGCly.png"
            alt="DirectDose Logo"
            width={80}
            height={80}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#006c67]">Reset Your Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-[#006c67]">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={success}
                  className="border-[#006c67] focus-visible:ring-[#006c67]"
                />
                <p className="text-sm text-[#006c67] opacity-80">Password must be at least 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#006c67]">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={success}
                  className="border-[#006c67] focus-visible:ring-[#006c67]"
                />
              </div>

              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span className="text-sm font-medium text-red-800">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 p-3 rounded-md flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div className="text-sm font-medium text-green-800">
                    <p>Password reset successful!</p>
                    <p className="mt-1">Redirecting to login page...</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full bg-[#006c67] hover:bg-[#004a46] text-white rounded-full transition-all"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-[#006c67] text-[#006c67]"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
