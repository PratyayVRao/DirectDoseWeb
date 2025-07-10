"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AuthDebug() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        setSession(sessionData.session)

        // Get user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(userData.user)
      } catch (err) {
        console.error("Auth check error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  const signOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (err) {
      console.error("Sign out error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during sign out")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006c67]">Auth Debug Page</h1>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#006c67]" />
        </div>
      ) : (
        <div className="grid gap-6 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current authentication state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">User Status:</h3>
                  <p
                    className={`font-mono p-2 rounded ${user ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                  >
                    {user ? "Authenticated" : "Not authenticated"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Session Status:</h3>
                  <p
                    className={`font-mono p-2 rounded ${session ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                  >
                    {session ? "Active session" : "No active session"}
                  </p>
                </div>

                {error && (
                  <div>
                    <h3 className="font-medium mb-2">Error:</h3>
                    <p className="font-mono p-2 rounded bg-red-50 text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {user && (
                <Button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white">
                  Sign Out
                </Button>
              )}
              {!user && (
                <Button
                  onClick={() => (window.location.href = "/login")}
                  className="bg-[#006c67] hover:bg-[#004a46] text-white"
                >
                  Go to Login
                </Button>
              )}
            </CardFooter>
          </Card>

          {user && (
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>Information about the authenticated user</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {session && (
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>Information about the current session</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
