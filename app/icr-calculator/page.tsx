"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"
import { Loader2, Calculator, AlertTriangle, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface DayData {
  premealBG: string
  carbs: string
  insulinDose: string
  postmealBG: string
  adjustedICR: string | null
}

interface ICRCalculatorData {
  totalDailyInsulin: string
  initialICR: string | null
  targetBG: string
  isf: string | null
  day1: DayData
  day2: DayData
  day3: DayData
  day4: DayData
  day5: DayData
  finalICR: string | null
}

const defaultDayData: DayData = {
  premealBG: "",
  carbs: "",
  insulinDose: "",
  postmealBG: "",
  adjustedICR: null,
}

const defaultData: ICRCalculatorData = {
  totalDailyInsulin: "",
  initialICR: null,
  targetBG: "140",
  isf: null,
  day1: { ...defaultDayData },
  day2: { ...defaultDayData },
  day3: { ...defaultDayData },
  day4: { ...defaultDayData },
  day5: { ...defaultDayData },
  finalICR: null,
}

export default function ICRCalculator() {
  const [data, setData] = useState<ICRCalculatorData>({ ...defaultData })
  const [activeTab, setActiveTab] = useState("step1")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showICRWarning, setShowICRWarning] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

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
              .from("icr_calculator")
              .select("*")
              .eq("user_id", user.id)
              .single()

            if (!error && savedData) {
              const mergedData = {
                ...defaultData,
                totalDailyInsulin: savedData.total_daily_insulin?.toString() || "",
                initialICR: savedData.initial_icr?.toString() || null,
                targetBG: savedData.target_bg?.toString() || "140",
                isf: savedData.isf?.toString() || null,
                day1: { ...defaultDayData, ...(savedData.day1_data || {}) },
                day2: { ...defaultDayData, ...(savedData.day2_data || {}) },
                day3: { ...defaultDayData, ...(savedData.day3_data || {}) },
                day4: { ...defaultDayData, ...(savedData.day4_data || {}) },
                day5: { ...defaultDayData, ...(savedData.day5_data || {}) },
                finalICR: savedData.final_icr?.toString() || null,
              }
              setData(mergedData)

              if (mergedData.initialICR) {
                const icr = Number.parseFloat(mergedData.initialICR)
                setShowICRWarning(icr < 8 || icr > 20)
              }
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
        const savedData = localStorage.getItem("icr_calculator_data")
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData)
            const mergedData = {
              ...defaultData,
              ...parsedData,
              day1: { ...defaultDayData, ...(parsedData.day1 || {}) },
              day2: { ...defaultDayData, ...(parsedData.day2 || {}) },
              day3: { ...defaultDayData, ...(parsedData.day3 || {}) },
              day4: { ...defaultDayData, ...(parsedData.day4 || {}) },
              day5: { ...defaultDayData, ...(parsedData.day5 || {}) },
            }
            setData(mergedData)

            if (mergedData.initialICR) {
              const icr = Number.parseFloat(mergedData.initialICR)
              setShowICRWarning(icr < 8 || icr > 20)
            }
          } catch (error) {
            console.error("Error parsing local storage data:", error)
          }
        }
      }
    }

    checkAuth()
  }, [supabase])
  useEffect(() => {
  async function fetchBasalCalculatorTDI() {
    if (!userId) return

    try {
      const { data: basalRecords, error } = await supabase
        .from("basal_calculator")
        .select("total_daily_insulin")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && basalRecords?.total_daily_insulin) {
        setData((prevData) => ({
          ...prevData,
          // Only set totalDailyInsulin if it's empty or different
          totalDailyInsulin:
            prevData.totalDailyInsulin && prevData.totalDailyInsulin !== ""
              ? prevData.totalDailyInsulin
              : basalRecords.total_daily_insulin.toString(),
        }))
      }
    } catch (error) {
      console.error("Failed to fetch basal calculator TDI:", error)
    }
  }

  if (isAuthenticated && userId) {
    fetchBasalCalculatorTDI()
  }
}, [isAuthenticated, userId, supabase, setData])


  const saveProgress = async (dataToSave = data) => {
    setIsSaving(true)

    try {
      // Always save to local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("icr_calculator_data", JSON.stringify(dataToSave))
      }

      // If user is authenticated, also save to database
      if (isAuthenticated && userId) {
        try {
          // Check if record exists
          const { data: existingData, error: checkError } = await supabase
            .from("icr_calculator")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle()

          const saveData = {
            user_id: userId,
            total_daily_insulin: dataToSave.totalDailyInsulin ? Number.parseFloat(dataToSave.totalDailyInsulin) : null,
            initial_icr: dataToSave.initialICR ? Number.parseFloat(dataToSave.initialICR) : null,
            target_bg: dataToSave.targetBG ? Number.parseFloat(dataToSave.targetBG) : 140,
            isf: dataToSave.isf ? Number.parseFloat(dataToSave.isf) : null,
            day1_data: dataToSave.day1,
            day2_data: dataToSave.day2,
            day3_data: dataToSave.day3,
            day4_data: dataToSave.day4,
            day5_data: dataToSave.day5,
            final_icr: dataToSave.finalICR ? Number.parseFloat(dataToSave.finalICR) : null,
            is_completed: !!dataToSave.finalICR,
            updated_at: new Date().toISOString(),
          }

          if (!checkError && existingData) {
            const { error } = await supabase.from("icr_calculator").update(saveData).eq("id", existingData.id)

            if (error) {
              console.error("Database update error:", error)
              throw error
            }
          } else {
            const { error } = await supabase.from("icr_calculator").insert({
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
            description: "Your ICR calculator progress has been saved to your account",
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
          description: "Your ICR calculator progress has been saved to this device",
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

  const calculateInitialICR = () => {
    if (!data.totalDailyInsulin || isNaN(Number(data.totalDailyInsulin)) || Number(data.totalDailyInsulin) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid Total Daily Insulin value",
        variant: "destructive",
      })
      return
    }

    const tdi = Number(data.totalDailyInsulin)
    const icr = 500 / tdi
    const isf = 1800 / tdi

    const isIcrOutsideRange = icr < 8 || icr > 20
    setShowICRWarning(isIcrOutsideRange)

    const updatedData = {
      ...data,
      initialICR: icr.toFixed(1),
      isf: isf.toFixed(1),
    }

    setData(updatedData)
    saveProgress(updatedData)

    toast({
      title: "Initial ICR calculated",
      description: `Your estimated ICR is 1:${icr.toFixed(1)} and ISF is ${isf.toFixed(1)} mg/dL per unit`,
    })
  }

  const calculateDayAdjustment = (day: keyof ICRCalculatorData, dayData: DayData) => {
    if (
      !data.initialICR ||
      !dayData.premealBG ||
      !dayData.carbs ||
      !dayData.postmealBG ||
      !data.targetBG ||
      isNaN(Number(dayData.premealBG)) ||
      isNaN(Number(dayData.carbs)) ||
      isNaN(Number(dayData.postmealBG)) ||
      isNaN(Number(data.targetBG))
    ) {
      toast({
        title: "Invalid input",
        description: "Please enter valid values for all fields",
        variant: "destructive",
      })
      return
    }

    const currentICR = Number(dayData.adjustedICR || data.initialICR)
    const postmealBG = Number(dayData.postmealBG)
    const targetBG = Number(data.targetBG)
    const adjustment = 1 + (postmealBG - targetBG) / targetBG

    const adjustedICR = currentICR * (postmealBG > targetBG ? adjustment : 2 - adjustment)
    const insulinDose = Number(dayData.carbs) / currentICR

    const updatedDayData = {
      ...dayData,
      insulinDose: insulinDose.toFixed(1),
      adjustedICR: adjustedICR.toFixed(1),
    }

    const updatedData = {
      ...data,
      [day]: updatedDayData,
    }

    setData(updatedData)
    saveProgress(updatedData)

    toast({
      title: "ICR adjusted",
      description: `Adjusted ICR: 1:${adjustedICR.toFixed(1)}`,
    })
  }

  const calculateFinalICR = async () => {
    setIsCalculating(true)

    try {
      const adjustedICRs = [
        data.day1.adjustedICR,
        data.day2.adjustedICR,
        data.day3.adjustedICR,
        data.day4.adjustedICR,
        data.day5.adjustedICR,
      ]
        .filter((icr) => icr !== null)
        .map((icr) => Number(icr))

      if (adjustedICRs.length === 0) {
        toast({
          title: "No data",
          description: "Please complete at least one day's testing before calculating final ICR",
          variant: "destructive",
        })
        setIsCalculating(false)
        return
      }

      const sum = adjustedICRs.reduce((acc, val) => acc + val, 0)
      const finalICR = sum / adjustedICRs.length
      const roundedFinalICR = Math.round(finalICR * 10) / 10

      const isIcrOutsideRange = roundedFinalICR < 8 || roundedFinalICR > 20
      setShowICRWarning(isIcrOutsideRange)

      const updatedData = {
        ...data,
        finalICR: roundedFinalICR.toString(),
      }

      setData(updatedData)
      await saveProgress(updatedData)

      // If user is authenticated, update their profile with the new ICR
      if (isAuthenticated && userId) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              icr: roundedFinalICR,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          if (profileError) {
            console.error("Error updating profile with new ICR:", profileError)
            toast({
              title: "ICR calculated",
              description: `Your optimized ICR is 1:${roundedFinalICR}. Profile update failed, but you can manually enter this in the calculator.`,
            })
          } else {
            toast({
              title: "Final ICR calculated and saved",
              description: `Your optimized ICR of 1:${roundedFinalICR} has been saved to your profile`,
            })
          }
        } catch (profileError) {
          console.error("Profile update error:", profileError)
          toast({
            title: "ICR calculated",
            description: `Your optimized ICR is 1:${roundedFinalICR}. Profile update failed, but you can manually enter this in the calculator.`,
          })
        }
      } else {
        toast({
          title: "Final ICR calculated",
          description: `Your optimized ICR is 1:${roundedFinalICR}. Sign in to save it to your profile.`,
        })
      }
    } catch (error) {
      console.error("Error calculating final ICR:", error)
      toast({
        title: "Calculation error",
        description: error instanceof Error ? error.message : "An error occurred while calculating your final ICR",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const updateDayData = (day: keyof ICRCalculatorData, field: keyof DayData, value: string) => {
    const updatedData = {
      ...data,
      [day]: {
        ...(data[day as keyof ICRCalculatorData] as DayData),
        [field]: value,
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
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006c67]">ICR Calculator</h1>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-[#e6fff9] p-6 rounded-lg border-2 border-[#006c67]">
          <h2 className="text-xl font-bold text-[#006c67] mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2" />
            What is the ICR Calculator?
          </h2>
          <p className="text-[#006c67] mb-4">
            The Insulin-to-Carb Ratio (ICR) Calculator helps you determine how many grams of carbohydrates one unit of
            insulin covers. This is essential for accurate insulin dosing when eating meals.
          </p>
          <h3 className="text-lg font-semibold text-[#006c67] mb-2">How to use this calculator:</h3>
          <ol className="list-decimal pl-6 space-y-2 text-[#006c67] mb-4">
            <li>
              <strong>Step 1:</strong> Enter your Total Daily Insulin (TDI) - the sum of all insulin you take in a day,
              including both{" "}
              <Link href="/basal-calculator" className="text-[#006c67] underline hover:text-[#004a46]">
                basal (long-acting)
              </Link>{" "}
              and bolus (mealtime) insulin.
            </li>
            <li>
              <strong>Days 1-5:</strong> Over several days, record your blood glucose before meals, the carbs you eat,
              and your blood glucose 2 hours after meals. The calculator will adjust your ICR based on these results.
            </li>
            <li>
              <strong>Results:</strong> After testing for at least one day (ideally 3-5 days), calculate your final ICR,
              which will be saved to your profile and used in the main calculator.
            </li>
          </ol>
          <p className="text-[#006c67] italic">
            Note: Your progress is automatically saved to this device{isAuthenticated && " and your account"}, so you
            can return anytime to continue where you left off.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 mb-6">
            <TabsTrigger value="step1" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Step 1
            </TabsTrigger>
            <TabsTrigger value="day1" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Day 1
            </TabsTrigger>
            <TabsTrigger value="day2" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Day 2
            </TabsTrigger>
            <TabsTrigger value="day3" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Day 3
            </TabsTrigger>
            <TabsTrigger value="day4" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Day 4
            </TabsTrigger>
            <TabsTrigger value="day5" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Day 5
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step1">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Calculate Initial ICR</CardTitle>
                <CardDescription>
                  Enter your total daily insulin to calculate your initial Insulin to Carb Ratio (ICR) and Insulin
                  Sensitivity Factor (ISF).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalDailyInsulin">Total Daily Insulin (TDI)</Label>
                  <Input
  type="number"
  id="totalDailyInsulin"
  value={data.totalDailyInsulin}
  onChange={(e) => setData({ ...data, totalDailyInsulin: e.target.value })}
/>

                  <p className="text-sm text-[#006c67]">
                    This is the total amount of insulin you take in a 24-hour period, including both{" "}
                    <Link href="/basal-calculator" className="text-[#006c67] underline hover:text-[#004a46]">
                      basal (long-acting)
                    </Link>{" "}
                    and bolus (mealtime) insulin.
                  </p>
                </div>

                {data.initialICR && (
                  <div className="p-4 bg-[#e6fff9] rounded-lg">
                    <h3 className="font-bold text-[#006c67] mb-2">Your Initial Estimates:</h3>
                    <p className="text-[#006c67]">
                      <strong>Insulin-to-Carb Ratio (ICR):</strong> 1:{data.initialICR}
                    </p>
                    <p className="text-[#006c67]">
                      <strong>Insulin Sensitivity Factor (ISF):</strong> {data.isf} mg/dL per unit
                    </p>
                    <p className="text-sm text-[#006c67] mt-2 italic">
                      These are starting estimates based on the 500/1800 rules. You'll refine your ICR in the next
                      steps.
                    </p>
                  </div>
                )}

                {showICRWarning && data.initialICR && (
                  <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-medium">Unusual ICR Value</p>
                      <p className="text-amber-700 text-sm">
                        Your calculated ICR of 1:{data.initialICR} is{" "}
                        {Number(data.initialICR) > 20 ? "higher" : "lower"} than the typical range (8-20). This may
                        still be correct for your body, but please verify your Total Daily Insulin value and consult
                        with your healthcare provider.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={calculateInitialICR} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate
                    </>
                  )}
                </Button>

                {data.initialICR && (
                  <Button onClick={() => setActiveTab("day1")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
                    Continue to Day 1
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="day1">
            <Card>
              <CardHeader>
                <CardTitle>Day 1: Track Your Blood Sugar</CardTitle>
                <CardDescription>
                  Record your blood sugar levels and carb intake for Day 1 to adjust your ICR.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-4 bg-[#e6fff9] rounded-lg mb-4">
                  <h3 className="font-bold text-[#006c67] mb-2">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#006c67]">
                    <li>Measure and record your blood sugar before a meal</li>
                    <li>Count and record the carbs you eat in that meal</li>
                    <li>Take insulin based on your initial ICR (1:{data.initialICR || "?"}) for the carbs</li>
                    <li>Measure your blood sugar again 2 hours after the meal</li>
                    <li>Click "Calculate Adjustment" to see your adjusted ICR</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="premealBG-day1">Pre-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="premealBG-day1"
                      value={data.day1.premealBG}
                      onChange={(e) => updateDayData("day1", "premealBG", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs-day1">Carbs (grams)</Label>
                    <Input
                      type="number"
                      id="carbs-day1"
                      value={data.day1.carbs}
                      onChange={(e) => updateDayData("day1", "carbs", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postmealBG-day1">Post-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="postmealBG-day1"
                      value={data.day1.postmealBG}
                      onChange={(e) => updateDayData("day1", "postmealBG", e.target.value)}
                    />
                    <p className="text-xs text-[#006c67]">Measured 2 hours after eating</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insulinDose-day1">Insulin Dose (units)</Label>
                    <Input
                      type="number"
                      id="insulinDose-day1"
                      value={data.day1.insulinDose}
                      onChange={(e) => updateDayData("day1", "insulinDose", e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-[#006c67]">Calculated automatically</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adjustedICR-day1">Adjusted ICR</Label>
                  <Input
                    type="text"
                    id="adjustedICR-day1"
                    value={data.day1.adjustedICR || "Not calculated yet"}
                    disabled
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("step1")}>
                  Back to Step 1
                </Button>

                <Button onClick={() => calculateDayAdjustment("day1", data.day1)} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Adjustment
                    </>
                  )}
                </Button>

                {data.day1.adjustedICR && (
                  <Button onClick={() => setActiveTab("day2")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
                    Continue to Day 2
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="day2">
            <Card>
              <CardHeader>
                <CardTitle>Day 2: Track Your Blood Sugar</CardTitle>
                <CardDescription>
                  Record your blood sugar levels and carb intake for Day 2 to adjust your ICR.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-4 bg-[#e6fff9] rounded-lg mb-4">
                  <h3 className="font-bold text-[#006c67] mb-2">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#006c67]">
                    <li>Measure and record your blood sugar before a meal</li>
                    <li>Count and record the carbs you eat in that meal</li>
                    <li>
                      Take insulin based on your adjusted ICR from Day 1 (1:
                      {data.day1.adjustedICR || data.initialICR || "?"}) for the carbs
                    </li>
                    <li>Measure your blood sugar again 2 hours after the meal</li>
                    <li>Click "Calculate Adjustment" to see your adjusted ICR</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="premealBG-day2">Pre-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="premealBG-day2"
                      value={data.day2.premealBG}
                      onChange={(e) => updateDayData("day2", "premealBG", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs-day2">Carbs (grams)</Label>
                    <Input
                      type="number"
                      id="carbs-day2"
                      value={data.day2.carbs}
                      onChange={(e) => updateDayData("day2", "carbs", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postmealBG-day2">Post-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="postmealBG-day2"
                      value={data.day2.postmealBG}
                      onChange={(e) => updateDayData("day2", "postmealBG", e.target.value)}
                    />
                    <p className="text-xs text-[#006c67]">Measured 2 hours after eating</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insulinDose-day2">Insulin Dose (units)</Label>
                    <Input
                      type="number"
                      id="insulinDose-day2"
                      value={data.day2.insulinDose}
                      onChange={(e) => updateDayData("day2", "insulinDose", e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-[#006c67]">Calculated automatically</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adjustedICR-day2">Adjusted ICR</Label>
                  <Input
                    type="text"
                    id="adjustedICR-day2"
                    value={data.day2.adjustedICR || "Not calculated yet"}
                    disabled
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("day1")}>
                  Back to Day 1
                </Button>

                <Button onClick={() => calculateDayAdjustment("day2", data.day2)} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Adjustment
                    </>
                  )}
                </Button>

                {data.day2.adjustedICR && (
                  <Button onClick={() => setActiveTab("day3")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
                    Continue to Day 3
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="day3">
            <Card>
              <CardHeader>
                <CardTitle>Day 3: Track Your Blood Sugar</CardTitle>
                <CardDescription>
                  Record your blood sugar levels and carb intake for Day 3 to adjust your ICR.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-4 bg-[#e6fff9] rounded-lg mb-4">
                  <h3 className="font-bold text-[#006c67] mb-2">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#006c67]">
                    <li>Measure and record your blood sugar before a meal</li>
                    <li>Count and record the carbs you eat in that meal</li>
                    <li>
                      Take insulin based on your adjusted ICR from Day 2 (1:
                      {data.day2.adjustedICR || data.day1.adjustedICR || data.initialICR || "?"}) for the carbs
                    </li>
                    <li>Measure your blood sugar again 2 hours after the meal</li>
                    <li>Click "Calculate Adjustment" to see your adjusted ICR</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="premealBG-day3">Pre-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="premealBG-day3"
                      value={data.day3.premealBG}
                      onChange={(e) => updateDayData("day3", "premealBG", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs-day3">Carbs (grams)</Label>
                    <Input
                      type="number"
                      id="carbs-day3"
                      value={data.day3.carbs}
                      onChange={(e) => updateDayData("day3", "carbs", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postmealBG-day3">Post-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="postmealBG-day3"
                      value={data.day3.postmealBG}
                      onChange={(e) => updateDayData("day3", "postmealBG", e.target.value)}
                    />
                    <p className="text-xs text-[#006c67]">Measured 2 hours after eating</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insulinDose-day3">Insulin Dose (units)</Label>
                    <Input
                      type="number"
                      id="insulinDose-day3"
                      value={data.day3.insulinDose}
                      onChange={(e) => updateDayData("day3", "insulinDose", e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-[#006c67]">Calculated automatically</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adjustedICR-day3">Adjusted ICR</Label>
                  <Input
                    type="text"
                    id="adjustedICR-day3"
                    value={data.day3.adjustedICR || "Not calculated yet"}
                    disabled
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("day2")}>
                  Back to Day 2
                </Button>

                <Button onClick={() => calculateDayAdjustment("day3", data.day3)} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Adjustment
                    </>
                  )}
                </Button>

                {data.day3.adjustedICR && (
                  <Button onClick={() => setActiveTab("day4")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
                    Continue to Day 4
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="day4">
            <Card>
              <CardHeader>
                <CardTitle>Day 4: Track Your Blood Sugar</CardTitle>
                <CardDescription>
                  Record your blood sugar levels and carb intake for Day 4 to adjust your ICR.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-4 bg-[#e6fff9] rounded-lg mb-4">
                  <h3 className="font-bold text-[#006c67] mb-2">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#006c67]">
                    <li>Measure and record your blood sugar before a meal</li>
                    <li>Count and record the carbs you eat in that meal</li>
                    <li>
                      Take insulin based on your adjusted ICR from Day 3 (1:
                      {data.day3.adjustedICR ||
                        data.day2.adjustedICR ||
                        data.day1.adjustedICR ||
                        data.initialICR ||
                        "?"}
                      ) for the carbs
                    </li>
                    <li>Measure your blood sugar again 2 hours after the meal</li>
                    <li>Click "Calculate Adjustment" to see your adjusted ICR</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="premealBG-day4">Pre-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="premealBG-day4"
                      value={data.day4.premealBG}
                      onChange={(e) => updateDayData("day4", "premealBG", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs-day4">Carbs (grams)</Label>
                    <Input
                      type="number"
                      id="carbs-day4"
                      value={data.day4.carbs}
                      onChange={(e) => updateDayData("day4", "carbs", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postmealBG-day4">Post-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="postmealBG-day4"
                      value={data.day4.postmealBG}
                      onChange={(e) => updateDayData("day4", "postmealBG", e.target.value)}
                    />
                    <p className="text-xs text-[#006c67]">Measured 2 hours after eating</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insulinDose-day4">Insulin Dose (units)</Label>
                    <Input
                      type="number"
                      id="insulinDose-day4"
                      value={data.day4.insulinDose}
                      onChange={(e) => updateDayData("day4", "insulinDose", e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-[#006c67]">Calculated automatically</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adjustedICR-day4">Adjusted ICR</Label>
                  <Input
                    type="text"
                    id="adjustedICR-day4"
                    value={data.day4.adjustedICR || "Not calculated yet"}
                    disabled
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("day3")}>
                  Back to Day 3
                </Button>

                <Button onClick={() => calculateDayAdjustment("day4", data.day4)} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Adjustment
                    </>
                  )}
                </Button>

                {data.day4.adjustedICR && (
                  <Button onClick={() => setActiveTab("day5")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
                    Continue to Day 5
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="day5">
            <Card>
              <CardHeader>
                <CardTitle>Day 5: Track Your Blood Sugar</CardTitle>
                <CardDescription>
                  Record your blood sugar levels and carb intake for Day 5 to adjust your ICR.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-4 bg-[#e6fff9] rounded-lg mb-4">
                  <h3 className="font-bold text-[#006c67] mb-2">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-[#006c67]">
                    <li>Measure and record your blood sugar before a meal</li>
                    <li>Count and record the carbs you eat in that meal</li>
                    <li>
                      Take insulin based on your adjusted ICR from Day 4 (1:
                      {data.day4.adjustedICR ||
                        data.day3.adjustedICR ||
                        data.day2.adjustedICR ||
                        data.day1.adjustedICR ||
                        data.initialICR ||
                        "?"}
                      ) for the carbs
                    </li>
                    <li>Measure your blood sugar again 2 hours after the meal</li>
                    <li>Click "Calculate Adjustment" to see your adjusted ICR</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="premealBG-day5">Pre-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="premealBG-day5"
                      value={data.day5.premealBG}
                      onChange={(e) => updateDayData("day5", "premealBG", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="carbs-day5">Carbs (grams)</Label>
                    <Input
                      type="number"
                      id="carbs-day5"
                      value={data.day5.carbs}
                      onChange={(e) => updateDayData("day5", "carbs", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postmealBG-day5">Post-meal Blood Sugar (mg/dL)</Label>
                    <Input
                      type="number"
                      id="postmealBG-day5"
                      value={data.day5.postmealBG}
                      onChange={(e) => updateDayData("day5", "postmealBG", e.target.value)}
                    />
                    <p className="text-xs text-[#006c67]">Measured 2 hours after eating</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="insulinDose-day5">Insulin Dose (units)</Label>
                    <Input
                      type="number"
                      id="insulinDose-day5"
                      value={data.day5.insulinDose}
                      onChange={(e) => updateDayData("day5", "insulinDose", e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-[#006c67]">Calculated automatically</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adjustedICR-day5">Adjusted ICR</Label>
                  <Input
                    type="text"
                    id="adjustedICR-day5"
                    value={data.day5.adjustedICR || "Not calculated yet"}
                    disabled
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("day4")}>
                  Back to Day 4
                </Button>

                <Button onClick={() => calculateDayAdjustment("day5", data.day5)} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Adjustment
                    </>
                  )}
                </Button>

                {data.day5.adjustedICR && (
                  <Button
                    onClick={() => setActiveTab("results")}
                    className="bg-[#006c67] hover:bg-[#004a46] text-white"
                  >
                    Continue to Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Results: Your Optimized ICR</CardTitle>
                <CardDescription>
                  Calculate your final ICR based on the adjusted values from the previous days.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-4 bg-[#e6fff9] rounded-lg mb-4">
                  <h3 className="font-bold text-[#006c67] mb-2">How Your Final ICR is Calculated:</h3>
                  <p className="text-[#006c67] mb-2">
                    Your final Insulin-to-Carb Ratio (ICR) is calculated by taking the average of all your daily
                    adjusted ICRs. This provides a personalized ratio based on how your body actually responds to
                    carbohydrates and insulin.
                  </p>
                  <p className="text-[#006c67]">
                    For the most accurate results, we recommend completing at least 3-5 days of testing. However, you
                    can calculate a final ICR after just one day if needed.
                  </p>
                </div>

                <div className="grid gap-4">
                  <h3 className="font-medium text-[#006c67]">Your Daily Adjusted ICRs:</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="p-2 border rounded text-center">
                      <p className="font-medium text-[#006c67]">Day 1</p>
                      <p className="text-[#006c67]">{data.day1.adjustedICR || "N/A"}</p>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <p className="font-medium text-[#006c67]">Day 2</p>
                      <p className="text-[#006c67]">{data.day2.adjustedICR || "N/A"}</p>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <p className="font-medium text-[#006c67]">Day 3</p>
                      <p className="text-[#006c67]">{data.day3.adjustedICR || "N/A"}</p>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <p className="font-medium text-[#006c67]">Day 4</p>
                      <p className="text-[#006c67]">{data.day4.adjustedICR || "N/A"}</p>
                    </div>
                    <div className="p-2 border rounded text-center">
                      <p className="font-medium text-[#006c67]">Day 5</p>
                      <p className="text-[#006c67]">{data.day5.adjustedICR || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 mt-4">
                  <Label htmlFor="finalICR" className="text-lg font-medium text-[#006c67]">
                    Final ICR
                  </Label>
                  <Input
                    type="text"
                    id="finalICR"
                    value={data.finalICR ? `1:${data.finalICR}` : "Not calculated yet"}
                    className="text-lg font-bold"
                    disabled
                  />
                </div>

                {showICRWarning && data.finalICR && (
                  <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-medium">Unusual ICR Value</p>
                      <p className="text-amber-700 text-sm">
                        Your calculated ICR of 1:{data.finalICR} is {Number(data.finalICR) > 20 ? "higher" : "lower"}{" "}
                        than the typical range (8-20). This may still be correct for your body, but please verify your
                        measurements and consult with your healthcare provider.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("day5")}>
                  Back to Day 5
                </Button>

                <Button onClick={calculateFinalICR} disabled={isCalculating}>
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Final ICR
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            {data.finalICR && (
              <div className="mt-6 p-6 bg-[#e6fff9] rounded-lg border-2 border-[#006c67] text-center">
                <h3 className="text-xl font-bold text-[#006c67] mb-2">Congratulations!</h3>
                <p className="text-[#006c67] mb-4">
                  Your optimized Insulin-to-Carb Ratio (ICR) is <span className="font-bold">1:{data.finalICR}</span>.
                  {isAuthenticated
                    ? " This value has been saved to your profile and will be used as your default ratio in the calculator."
                    : " Sign in to save this to your profile for use in the calculator."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <Button asChild className="bg-[#006c67] hover:bg-[#004a46] text-white">
                    <Link href="/calculator">Go to Insulin Calculator</Link>
                  </Button>
                  {isAuthenticated && (
                    <Button asChild variant="outline" className="border-[#006c67] text-[#006c67] bg-transparent">
                      <Link href="/profile">View Profile</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
