"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function Demographics() {
  const [ethnicity, setEthnicity] = useState<string>("")
  const [ageRange, setAgeRange] = useState<string>("")
  const [region, setRegion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Check if user has saved demographic data
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (!error && data) {
          setEthnicity(data.ethnicity || "")
          setAgeRange(data.age_range || "")
          setRegion(data.region || "")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const saveDemographics = async () => {
    setIsSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const now = new Date().toISOString()

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (checkError && checkError.code === "PGRST116") {
        // Profile doesn't exist, create it
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          ethnicity,
          age_range: ageRange,
          region,
          updated_at: now,
        })
      } else {
        // Update existing profile
        await supabase
          .from("profiles")
          .update({
            ethnicity,
            age_range: ageRange,
            region,
            updated_at: now,
          })
          .eq("id", user.id)
      }

      toast({
        title: "Demographics saved",
        description: "Your demographic information has been saved successfully",
      })
    } catch (error) {
      console.error("Error saving demographics:", error)
      toast({
        title: "Error",
        description: "Failed to save demographic information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/profile")}
          className="mr-4 text-[#006c67] hover:text-[#004a46] hover:bg-[#006c67]/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <h1 className="text-3xl font-bold text-[#006c67]">Demographic Information</h1>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#006c67]">Your Demographics</CardTitle>
            <CardDescription>
              This information helps us understand our user base better. Your data is kept private and only used for
              research purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ethnicity" className="text-[#006c67]">
                Ethnicity
              </Label>
              <Select value={ethnicity} onValueChange={setEthnicity}>
                <SelectTrigger id="ethnicity" className="border-[#006c67] focus-visible:ring-[#006c67]">
                  <SelectValue placeholder="Select your ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White/Caucasian</SelectItem>
                  <SelectItem value="black">Black/African American</SelectItem>
                  <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="native">Native American/Alaska Native</SelectItem>
                  <SelectItem value="pacific">Pacific Islander/Native Hawaiian</SelectItem>
                  <SelectItem value="mixed">Mixed/Multiple Races</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age-range" className="text-[#006c67]">
                Age Range
              </Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger id="age-range" className="border-[#006c67] focus-visible:ring-[#006c67]">
                  <SelectValue placeholder="Select your age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_18">Under 18</SelectItem>
                  <SelectItem value="18_24">18-24</SelectItem>
                  <SelectItem value="25_34">25-34</SelectItem>
                  <SelectItem value="35_44">35-44</SelectItem>
                  <SelectItem value="45_54">45-54</SelectItem>
                  <SelectItem value="55_64">55-64</SelectItem>
                  <SelectItem value="65_plus">65+</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-[#006c67]">
                Region
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger id="region" className="border-[#006c67] focus-visible:ring-[#006c67]">
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us_northeast">US - Northeast</SelectItem>
                  <SelectItem value="us_southeast">US - Southeast</SelectItem>
                  <SelectItem value="us_midwest">US - Midwest</SelectItem>
                  <SelectItem value="us_southwest">US - Southwest</SelectItem>
                  <SelectItem value="us_west">US - West</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="mexico">Mexico</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="australia">Australia/Oceania</SelectItem>
                  <SelectItem value="south_america">South America</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={saveDemographics}
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
                  Save Demographics
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
