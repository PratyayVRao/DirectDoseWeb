"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"
import { Loader2, Save, Calculator, ClipboardList } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BasalCalculatorData {
  totalDailyInsulin: string
  estimatedBasal: string | null
  currentBasal: string
  testType: "overnight" | "daytime"
  symptoms: {
    shaky: boolean
    sweaty: boolean
    dizzy: boolean
    hungry: boolean
    thirsty: boolean
    urinating: boolean
    sluggish: boolean
    fatigued: boolean
  }
  urineGlucose: "high" | "normal" | "low" | null
  urineKetones: "present" | "absent" | null
  notes: string
  adjustmentHistory: {
    date: string
    adjustment: number
    reason: string
  }[]
  recommendedAdjustment: number | null
}

const defaultBasalData: BasalCalculatorData = {
  totalDailyInsulin: "",
  estimatedBasal: null,
  currentBasal: "",
  testType: "overnight",
  symptoms: {
    shaky: false,
    sweaty: false,
    dizzy: false,
    hungry: false,
    thirsty: false,
    urinating: false,
    sluggish: false,
    fatigued: false,
  },
  urineGlucose: null,
  urineKetones: null,
  notes: "",
  adjustmentHistory: [],
  recommendedAdjustment: null,
}

export default function BasalCalculator() {
  const [data, setData] = useState<BasalCalculatorData>({ ...defaultBasalData })
  const [activeTab, setActiveTab] = useState("step1")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setIsAuthenticated(true)
          setUserId(user.id)

          // Load saved data from localStorage first (for immediate display)
          loadFromLocalStorage()

          // Then try to load from database
          try {
            const { data: savedData, error } = await supabase
              .from("basal_calculator")
              .select("*")
              .eq("user_id", user.id)
              .single()

            if (!error && savedData) {
              const mergedData = {
                ...defaultBasalData,
                totalDailyInsulin: savedData.total_daily_insulin || "",
                estimatedBasal: savedData.estimated_basal || null,
                currentBasal: savedData.current_basal_dose?.toString() || "",
                testType: savedData.test_type || "overnight",
                symptoms: {
                  ...defaultBasalData.symptoms,
                  ...(savedData.symptoms_data || {}),
                },
                urineGlucose: savedData.urine_glucose || null,
                urineKetones: savedData.urine_ketones || null,
                notes: savedData.notes || "",
                adjustmentHistory: savedData.adjustment_history || [],
                recommendedAdjustment: savedData.recommended_adjustment || null,
              }
              setData(mergedData)
            }
          } catch (dbError) {
            console.log("No saved data in database, using local storage")
          }
        } else {
          // Not authenticated, use local storage only
          loadFromLocalStorage()
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        loadFromLocalStorage()
      } finally {
        setIsLoading(false)
      }
    }

    const loadFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem("basal_calculator_data")
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData)
            const mergedData = {
              ...defaultBasalData,
              ...parsedData,
              symptoms: {
                ...defaultBasalData.symptoms,
                ...(parsedData.symptoms || {}),
              },
            }
            setData(mergedData)
          } catch (error) {
            console.error("Error parsing local storage data:", error)
          }
        }
      }
    }

    checkAuth()
  }, [supabase])

  const saveProgress = async (dataToSave = data) => {
    setIsSaving(true)

    try {
      // Always save to local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("basal_calculator_data", JSON.stringify(dataToSave))
      }

      // If user is authenticated, also save to database
      if (isAuthenticated && userId) {
        try {
          // Check if record exists
          const { data: existingData, error: checkError } = await supabase
            .from("basal_calculator")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle()

          const saveData = {
            user_id: userId,
            total_daily_insulin: dataToSave.totalDailyInsulin || null,
            estimated_basal: dataToSave.estimatedBasal || null,
            current_basal_dose: dataToSave.currentBasal ? Number.parseFloat(dataToSave.currentBasal) : null,
            test_type: dataToSave.testType,
            symptoms_data: dataToSave.symptoms,
            urine_glucose: dataToSave.urineGlucose,
            urine_ketones: dataToSave.urineKetones,
            notes: dataToSave.notes,
            adjustment_history: dataToSave.adjustmentHistory,
            recommended_adjustment: dataToSave.recommendedAdjustment,
            is_completed: false,
            updated_at: new Date().toISOString(),
          }

          if (!checkError && existingData) {
            const { error } = await supabase.from("basal_calculator").update(saveData).eq("id", existingData.id)

            if (error) {
              console.error("Database update error:", error)
              throw error
            }
          } else {
            const { error } = await supabase.from("basal_calculator").insert({
              ...saveData,
              created_at: new Date().toISOString(),
            })

            if (error) {
              console.error("Database insert error:", error)
              throw error
            }
          }

          toast({
            title: "Progress saved",
            description: "Your basal calculator progress has been saved to your account",
          })
        } catch (dbError) {
          console.error("Database save failed:", dbError)
          toast({
            title: "Progress saved locally",
            description: "Your progress has been saved to this device. Database sync will retry later.",
          })
        }
      } else {
        toast({
          title: "Progress saved locally",
          description: "Your basal calculator progress has been saved to this device",
        })
      }
    } catch (error) {
      console.error("Error saving progress:", error)
      toast({
        title: "Save error",
        description: "An error occurred while saving your progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const calculateEstimatedBasal = () => {
    if (!data.totalDailyInsulin || isNaN(Number(data.totalDailyInsulin)) || Number(data.totalDailyInsulin) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid Total Daily Insulin value",
        variant: "destructive",
      })
      return
    }

    const tdi = Number(data.totalDailyInsulin)
    const lowerEstimate = Math.round(tdi * 0.4)
    const upperEstimate = Math.round(tdi * 0.5)
    const estimatedBasal = `${lowerEstimate}-${upperEstimate}`

    const updatedData = {
      ...data,
      estimatedBasal,
      currentBasal: data.currentBasal || lowerEstimate.toString(),
    }

    setData(updatedData)
    saveProgress(updatedData)

    toast({
      title: "Basal insulin estimated",
      description: `Your estimated basal insulin is ${estimatedBasal} units (40-50% of TDI)`,
    })
  }

  const analyzeSymptoms = () => {
    setIsCalculating(true)

    try {
      const symptoms = data.symptoms || defaultBasalData.symptoms

      const highSymptoms = [symptoms.shaky, symptoms.sweaty, symptoms.dizzy, symptoms.hungry].filter(Boolean).length
      const lowSymptoms = [symptoms.thirsty, symptoms.urinating, symptoms.sluggish, symptoms.fatigued].filter(
        Boolean,
      ).length

      let urineResult = 0
      if (data.urineGlucose === "high") urineResult = -1
      if (data.urineGlucose === "low" && symptoms.shaky) urineResult = 1
      if (data.urineKetones === "present") urineResult = -1

      let recommendedAdjustment = 0

      if (highSymptoms >= 2 && lowSymptoms === 0) {
        recommendedAdjustment = -1
      } else if (lowSymptoms >= 2 && highSymptoms === 0) {
        recommendedAdjustment = 1
      }

      if (urineResult !== 0) {
        if (recommendedAdjustment === 0) {
          recommendedAdjustment = urineResult
        } else if (Math.sign(recommendedAdjustment) === Math.sign(urineResult)) {
          recommendedAdjustment = urineResult * 2
        }
      }

      const updatedData = {
        ...data,
        recommendedAdjustment,
      }

      setData(updatedData)
      saveProgress(updatedData)

      let message = ""
      if (recommendedAdjustment > 0) {
        message = `Based on your symptoms and test results, your basal insulin dose appears to be too low. Consider increasing by ${Math.abs(recommendedAdjustment)} unit(s).`
      } else if (recommendedAdjustment < 0) {
        message = `Based on your symptoms and test results, your basal insulin dose appears to be too high. Consider decreasing by ${Math.abs(recommendedAdjustment)} unit(s).`
      } else {
        message = "Based on your symptoms and test results, your basal insulin dose appears to be appropriate."
      }

      toast({
        title: "Analysis complete",
        description: message,
      })
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
      toast({
        title: "Analysis error",
        description: "An error occurred while analyzing your symptoms and test results",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const saveAdjustment = async () => {
    if (!data.recommendedAdjustment) {
      toast({
        title: "No adjustment",
        description: "Please analyze your symptoms first to get a recommended adjustment",
        variant: "destructive",
      })
      return
    }

    const currentBasal = Number(data.currentBasal) || 0
    const newBasal = currentBasal + data.recommendedAdjustment

    let reason = "Adjustment based on "
    if (data.testType === "overnight") {
      reason += "overnight fasting test. "
    } else {
      reason += "daytime fasting test. "
    }

    const symptoms = data.symptoms || defaultBasalData.symptoms

    if (symptoms.shaky || symptoms.sweaty || symptoms.dizzy || symptoms.hungry) {
      reason += "Symptoms of hypoglycemia present. "
    }

    if (symptoms.thirsty || symptoms.urinating || symptoms.sluggish || symptoms.fatigued) {
      reason += "Symptoms of hyperglycemia present. "
    }

    if (data.urineGlucose) {
      reason += `Urine glucose: ${data.urineGlucose}. `
    }

    if (data.urineKetones) {
      reason += `Urine ketones: ${data.urineKetones}.`
    }

    const newHistory = [
      ...(data.adjustmentHistory || []),
      {
        date: new Date().toISOString(),
        adjustment: data.recommendedAdjustment,
        reason,
      },
    ]

    const updatedData = {
      ...data,
      currentBasal: newBasal.toString(),
      adjustmentHistory: newHistory,
      recommendedAdjustment: null,
      symptoms: {
        shaky: false,
        sweaty: false,
        dizzy: false,
        hungry: false,
        thirsty: false,
        urinating: false,
        sluggish: false,
        fatigued: false,
      },
      urineGlucose: null,
      urineKetones: null,
      notes: "",
    }

    setData(updatedData)

    // Save to user profile if authenticated
    if (isAuthenticated && userId) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            basal_insulin: newBasal,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (error) {
          console.error("Error updating profile with basal insulin:", error)
          toast({
            title: "Adjustment saved locally",
            description: `Your basal insulin has been adjusted to ${newBasal} units and saved locally. Profile update failed.`,
          })
        } else {
          toast({
            title: "Adjustment saved",
            description: `Your basal insulin has been adjusted to ${newBasal} units and saved to your profile`,
          })
        }
      } catch (error) {
        console.error("Error saving basal insulin to profile:", error)
        toast({
          title: "Adjustment saved locally",
          description: `Your basal insulin has been adjusted to ${newBasal} units and saved locally`,
        })
      }
    } else {
      toast({
        title: "Adjustment saved",
        description: `Your basal insulin has been adjusted to ${newBasal} units`,
      })
    }

    saveProgress(updatedData)
  }

  const toggleSymptom = (symptom: keyof BasalCalculatorData["symptoms"]) => {
    const currentSymptoms = data.symptoms || { ...defaultBasalData.symptoms }

    const updatedData = {
      ...data,
      symptoms: {
        ...currentSymptoms,
        [symptom]: !currentSymptoms[symptom],
      },
    }

    setData(updatedData)
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
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006c67]">Basal Insulin Calculator</h1>

      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="step1" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Step 1
            </TabsTrigger>
            <TabsTrigger value="step2" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Step 2
            </TabsTrigger>
            <TabsTrigger value="step3" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Step 3
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step1">
            <Card className="border-2 border-[#006c67]">
              <CardHeader>
                <CardTitle className="text-[#006c67]">Step 1: Estimate Basal Insulin</CardTitle>
                <CardDescription>Use the 50% Rule to estimate your basal insulin dose</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tdi" className="text-[#006c67]">
                    Total Daily Insulin (TDI)
                  </Label>
                  <Input
                    id="tdi"
                    type="number"
                    placeholder="e.g., 40"
                    value={data.totalDailyInsulin}
                    onChange={(e) => setData({ ...data, totalDailyInsulin: e.target.value })}
                    className="border-[#006c67] focus-visible:ring-[#006c67]"
                  />
                  <p className="text-sm text-[#006c67] opacity-80">
                    Sum of all basal (long-acting) and bolus (mealtime) insulin doses taken in a day
                  </p>
                </div>

                <Button onClick={calculateEstimatedBasal} className="w-full bg-[#006c67] hover:bg-[#004a46] text-white">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Estimated Basal
                </Button>

                {data.estimatedBasal && (
                  <div className="p-4 bg-[#e6fff9] rounded-lg mt-4">
                    <h3 className="font-bold text-[#006c67] mb-2">Initial Estimate:</h3>
                    <p className="text-[#006c67]">
                      <strong>Basal Insulin:</strong> {data.estimatedBasal} units (40-50% of TDI)
                    </p>
                    <p className="text-sm text-[#006c67] mt-2 italic">
                      This is your starting point. You'll refine this through testing in the next steps.
                    </p>
                  </div>
                )}

                {data.estimatedBasal && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="current-basal" className="text-[#006c67]">
                      Current Basal Insulin Dose
                    </Label>
                    <Input
                      id="current-basal"
                      type="number"
                      placeholder="e.g., 18"
                      value={data.currentBasal}
                      onChange={(e) => setData({ ...data, currentBasal: e.target.value })}
                      className="border-[#006c67] focus-visible:ring-[#006c67]"
                    />
                    <p className="text-sm text-[#006c67] opacity-80">
                      Enter your current basal insulin dose if different from the estimate
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setActiveTab("step2")}
                  className="w-full bg-[#006c67] hover:bg-[#004a46] text-white"
                  disabled={!data.estimatedBasal}
                >
                  Continue to Step 2
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="step2">
            <Card className="border-2 border-[#006c67]">
              <CardHeader>
                <CardTitle className="text-[#006c67]">Step 2: Check for Signs of Incorrect Basal Insulin</CardTitle>
                <CardDescription>
                  Identify symptoms that may indicate your basal insulin dose needs adjustment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#006c67]">Signs Your Basal Insulin is Too High (Overdosing)</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="shaky"
                          checked={data.symptoms.shaky}
                          onChange={() => toggleSymptom("shaky")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="shaky" className="text-[#006c67]">
                          Feeling shaky
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sweaty"
                          checked={data.symptoms.sweaty}
                          onChange={() => toggleSymptom("sweaty")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="sweaty" className="text-[#006c67]">
                          Sweaty
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dizzy"
                          checked={data.symptoms.dizzy}
                          onChange={() => toggleSymptom("dizzy")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="dizzy" className="text-[#006c67]">
                          Dizzy or lightheaded
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hungry"
                          checked={data.symptoms.hungry}
                          onChange={() => toggleSymptom("hungry")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="hungry" className="text-[#006c67]">
                          Extremely hungry
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-[#006c67]">Signs Your Basal Insulin is Too Low (Underdosing)</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="thirsty"
                          checked={data.symptoms.thirsty}
                          onChange={() => toggleSymptom("thirsty")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="thirsty" className="text-[#006c67]">
                          Thirsty or dry mouth
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="urinating"
                          checked={data.symptoms.urinating}
                          onChange={() => toggleSymptom("urinating")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="urinating" className="text-[#006c67]">
                          Frequent urination
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sluggish"
                          checked={data.symptoms.sluggish}
                          onChange={() => toggleSymptom("sluggish")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="sluggish" className="text-[#006c67]">
                          Sluggish
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="fatigued"
                          checked={data.symptoms.fatigued}
                          onChange={() => toggleSymptom("fatigued")}
                          className="rounded border-[#006c67] text-[#006c67] focus:ring-[#006c67]"
                        />
                        <Label htmlFor="fatigued" className="text-[#006c67]">
                          Fatigued
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={() => setActiveTab("step1")}
                  variant="outline"
                  className="border-[#006c67] text-[#006c67] hover:bg-[#006c67] hover:text-white"
                >
                  Back
                </Button>
                <Button onClick={() => setActiveTab("step3")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
                  Continue to Step 3
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="step3">
            <Card className="border-2 border-[#006c67]">
              <CardHeader>
                <CardTitle className="text-[#006c67]">Step 3: Conduct a Basal Insulin Test</CardTitle>
                <CardDescription>
                  Test your basal insulin dose with a fasting period and assess the results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-[#006c67]">Test Type</h3>
                  <RadioGroup
                    value={data.testType}
                    onValueChange={(value) => setData({ ...data, testType: value as "overnight" | "daytime" })}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overnight" id="overnight" className="text-[#006c67]" />
                      <Label htmlFor="overnight" className="text-[#006c67]">
                        Overnight Fasting Test
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daytime" id="daytime" className="text-[#006c67]" />
                      <Label htmlFor="daytime" className="text-[#006c67]">
                        Daytime Fasting Test
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {data.testType === "overnight" && (
                  <div className="p-4 bg-[#e6fff9] rounded-lg">
                    <h3 className="font-bold text-[#006c67] mb-2">Overnight Fasting Test Instructions:</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-[#006c67]">
                      <li>Eat an early dinner (4-5 hours before bed), avoiding high-carb or high-fat foods.</li>
                      <li>Do not eat or drink anything (except water) after dinner.</li>
                      <li>Take your basal insulin as usual.</li>
                      <li>When you wake up, assess how you feel and check your urine glucose if possible.</li>
                    </ol>
                  </div>
                )}

                {data.testType === "daytime" && (
                  <div className="p-4 bg-[#e6fff9] rounded-lg">
                    <h3 className="font-bold text-[#006c67] mb-2">Daytime Fasting Test Instructions:</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-[#006c67]">
                      <li>Skip breakfast (or eat a small low-carb meal like eggs).</li>
                      <li>Avoid eating for 6-8 hours, drinking only water.</li>
                      <li>Take your basal insulin as usual.</li>
                      <li>After the fasting period, assess how you feel and check your urine glucose if possible.</li>
                    </ol>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-medium text-[#006c67]">Urine Test Results (if available)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="urine-glucose" className="text-[#006c67]">
                        Urine Glucose
                      </Label>
                      <select
                        id="urine-glucose"
                        value={data.urineGlucose || ""}
                        onChange={(e) => setData({ ...data, urineGlucose: (e.target.value as any) || null })}
                        className="w-full rounded-md border border-[#006c67] p-2 focus:ring-[#006c67] focus:border-[#006c67]"
                      >
                        <option value="">Not tested</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urine-ketones" className="text-[#006c67]">
                        Urine Ketones
                      </Label>
                      <select
                        id="urine-ketones"
                        value={data.urineKetones || ""}
                        onChange={(e) => setData({ ...data, urineKetones: (e.target.value as any) || null })}
                        className="w-full rounded-md border border-[#006c67] p-2 focus:ring-[#006c67] focus:border-[#006c67]"
                      >
                        <option value="">Not tested</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[#006c67]">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional observations or notes about how you felt during the test"
                    value={data.notes}
                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                    className="border-[#006c67] focus-visible:ring-[#006c67]"
                  />
                </div>

                <Button
                  onClick={analyzeSymptoms}
                  className="w-full bg-[#006c67] hover:bg-[#004a46] text-white"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Analyze Results
                    </>
                  )}
                </Button>

                {data.recommendedAdjustment !== null && (
                  <div className="p-4 bg-[#e6fff9] rounded-lg mt-4">
                    <h3 className="font-bold text-[#006c67] mb-2">Analysis Results:</h3>
                    <p className="text-[#006c67] mb-2">
                      <strong>Current Basal Dose:</strong> {data.currentBasal} units
                    </p>
                    <p className="text-[#006c67] mb-2">
                      <strong>Recommended Adjustment:</strong>{" "}
                      {data.recommendedAdjustment > 0
                        ? `Increase by ${data.recommendedAdjustment} unit(s)`
                        : data.recommendedAdjustment < 0
                          ? `Decrease by ${Math.abs(data.recommendedAdjustment)} unit(s)`
                          : "No adjustment needed"}
                    </p>
                    <p className="text-[#006c67] mb-2">
                      <strong>New Recommended Dose:</strong>{" "}
                      {(Number(data.currentBasal) + (data.recommendedAdjustment || 0)).toFixed(0)} units
                    </p>
                    <p className="text-sm text-[#006c67] mt-2 italic">
                      Wait at least 3 days before making another adjustment, and repeat the test to see if the new dose
                      is effective.
                    </p>
                    <Button onClick={saveAdjustment} className="w-full mt-4 bg-[#006c67] hover:bg-[#004a46] text-white">
                      <Save className="mr-2 h-4 w-4" />
                      Save Adjustment
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={() => setActiveTab("step2")}
                  variant="outline"
                  className="border-[#006c67] text-[#006c67] hover:bg-[#006c67] hover:text-white"
                >
                  Back
                </Button>
                <Button
                  onClick={() => saveProgress()}
                  className="bg-[#006c67] hover:bg-[#004a46] text-white"
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
                      Save Progress
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-2 border-[#006c67]">
              <CardHeader>
                <CardTitle className="text-[#006c67]">Adjustment History</CardTitle>
                <CardDescription>Track your basal insulin adjustments over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.adjustmentHistory.length === 0 ? (
                  <div className="p-4 bg-[#e6fff9] rounded-lg text-center">
                    <p className="text-[#006c67]">No adjustments have been made yet.</p>
                    <p className="text-sm text-[#006c67] mt-2 italic">
                      Complete a basal insulin test and save your adjustments to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#e6fff9] rounded-lg">
                      <h3 className="font-bold text-[#006c67] mb-2">Current Basal Insulin Dose:</h3>
                      <p className="text-xl font-bold text-[#006c67]">{data.currentBasal} units</p>
                    </div>

                    <h3 className="font-medium text-[#006c67]">Adjustment Log:</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {data.adjustmentHistory
                        .slice()
                        .reverse()
                        .map((adjustment, index) => (
                          <div key={index} className="p-3 border border-[#006c67]/30 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-[#006c67]">
                                  {new Date(adjustment.date).toLocaleDateString()} at{" "}
                                  {new Date(adjustment.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-[#006c67]">
                                  <span
                                    className={
                                      adjustment.adjustment > 0
                                        ? "text-green-600"
                                        : adjustment.adjustment < 0
                                          ? "text-red-600"
                                          : "text-[#006c67]"
                                    }
                                  >
                                    {adjustment.adjustment > 0
                                      ? `Increased by ${adjustment.adjustment} unit(s)`
                                      : adjustment.adjustment < 0
                                        ? `Decreased by ${Math.abs(adjustment.adjustment)} unit(s)`
                                        : "No change"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-[#006c67] mt-2">{adjustment.reason}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setActiveTab("step1")}
                  variant="outline"
                  className="border-[#006c67] text-[#006c67] hover:bg-[#006c67] hover:text-white"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Start New Test
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
