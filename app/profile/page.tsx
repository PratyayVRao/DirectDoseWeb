"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, LogOut, Save, UserCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { User } from "@supabase/auth-helpers-nextjs"

interface Profile {
  id: string
  username: string | null
  email: string | null
  icr: number | null
  basal_insulin: number | null
  age_range: string | null
  region: string | null
  ethnicity: string | null
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState("")
  const [icRatio, setIcRatio] = useState("15")
  const [basalInsulin, setBasalInsulin] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchLatestCalculatedBasal = async (userId: string): Promise<number | null> => {
    const { data, error } = await supabase
      .from("basal_calculator")
      .select("estimated_basal")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.warn("No recent basal found or error fetching it:", error.message)
      return null
    }

    return data?.estimated_basal ?? null
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setUser(user)
        console.log("Fetching profile for user:", user.id)

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (data && !error) {
          console.log("Found profile:", data)
          setProfile(data)
          setUsername(data.username || "")
          setIcRatio(data.icr?.toString() || "15")

          const latestBasal = await fetchLatestCalculatedBasal(user.id)
          setBasalInsulin(
            latestBasal !== null
              ? latestBasal.toString()
              : data.basal_insulin?.toString() || ""
          )
        } else if (error) {
          console.error("Error fetching profile:", error)

          if (error.code === "PGRST116") {
            console.log("Creating new profile")
            try {
              const { error: insertError } = await supabase.from("profiles").insert({
                id: user.id,
                email: user.email,
                username: null,
                icr: 15,
                basal_insulin: null,
                updated_at: new Date().toISOString(),
              })

              if (insertError) throw insertError

              setProfile({
                id: user.id,
                username: null,
                email: user.email || "",
                icr: 15,
                basal_insulin: null,
                age_range: null,
                region: null,
                ethnicity: null,
              })
            } catch (insertErr) {
              console.error("Error creating profile:", insertErr)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()

      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return
    setIsSaving(true)

    try {
      const icRatioNumber = Number.parseFloat(icRatio) || 15
      const basalInsulinNumber = basalInsulin ? Number.parseFloat(basalInsulin) : null

      console.log("Saving profile with ICR:", icRatioNumber, "basal insulin:", basalInsulinNumber, "and username:", username)

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username || null,
          icr: icRatioNumber,
          basal_insulin: basalInsulinNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Profile update error:", error)
        throw error
      }

      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fetchError) {
        console.error("Error verifying profile update:", fetchError)
        throw new Error("Failed to verify profile update")
      }

      if (updatedProfile) {
        console.log("Updated profile:", updatedProfile)
        setProfile(updatedProfile)
        setUsername(updatedProfile.username || "")
        setIcRatio(updatedProfile.icr?.toString() || "15")
        setBasalInsulin(updatedProfile.basal_insulin?.toString() || "")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const navigateToMealHistory = () => {
    router.push("/profile/meals")
  }

  const navigateToDemographics = () => {
    router.push("/profile/demographics")
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#006c67]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006c67]">Your Profile</h1>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#006c67]">Account Information</CardTitle>
            <CardDescription>Manage your DirectDose account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#006c67]">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className="border-[#006c67] focus-visible:ring-[#006c67]"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[#006c67]">
                Email
              </Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-[#006c67] opacity-80">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ic-ratio" className="text-[#006c67]">
                Default Insulin-to-Carb Ratio (ICR)
              </Label>
              <Input
                id="ic-ratio"
                type="number"
                step="0.1"
                value={icRatio}
                onChange={(e) => setIcRatio(e.target.value)}
                min="1"
                className="border-[#006c67] focus-visible:ring-[#006c67]"
              />
              <p className="text-xs text-[#006c67] opacity-80">
                This will be used as your default ratio in the calculator
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basal-insulin" className="text-[#006c67]">
                Basal Insulin Dose (units)
              </Label>
              <Input
                id="basal-insulin"
                type="number"
                step="0.1"
                value={basalInsulin}
                onChange={(e) => setBasalInsulin(e.target.value)}
                min="0"
                placeholder="Enter your basal insulin dose"
                className="border-[#006c67] focus-visible:ring-[#006c67]"
              />
              <p className="text-xs text-[#006c67] opacity-80">
                Your daily basal (long-acting) insulin dose. Pulled from most recent basal calculator entry.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={navigateToMealHistory} className="w-full bg-[#006c67] hover:bg-[#004a46] text-white">
                View Meal History
              </Button>

              <Button onClick={navigateToDemographics} className="w-full bg-[#006c67] hover:bg-[#004a46] text-white">
                <UserCircle className="mr-2 h-4 w-4" />
                Update Demographics
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={saveProfile}
              className="w-full bg-[#006c67] hover:bg-[#004a46] text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
