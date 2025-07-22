"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"

export default function BasalCalculator() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<"known" | "unknown" | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg")
  const [data, setData] = useState({
    totalDailyInsulin: "",
    estimatedBasal: "",
    currentBasalDose: "",
    testType: "overnight",
    bedtimeBg: "",
    morningBg: "",
    urineGlucose: "",
    urineKetones: "",
    notes: "",
    adjustmentHistory: [],
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id ?? null)
        const { data: records } = await supabase
          .from("basal_calculator")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        if (records) setHistory(records)
      }
    })
  }, [])

  const next = () => setStep((s) => s + 1)
  const prev = () => setStep((s) => Math.max(0, s - 1))

  const calculateAdjustment = (bgChange: number, currentDose: number) => {
    if (Math.abs(bgChange) <= 15) return 0
    const direction = bgChange > 15 ? 1 : -1
    return Math.round(currentDose * 0.15 * direction * 10) / 10
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const bedtimeBg = parseFloat(data.bedtimeBg)
      const morningBg = parseFloat(data.morningBg)
      const bgChange = morningBg - bedtimeBg
      const currentBasal = parseFloat(data.currentBasalDose || data.estimatedBasal)
      const recommendedAdjustment = calculateAdjustment(bgChange, currentBasal)
      const saveData = {
        user_id: userId,
        total_daily_insulin: parseFloat(data.totalDailyInsulin),
        estimated_basal: parseFloat(data.estimatedBasal),
        current_basal_dose: currentBasal,
        test_type: data.testType,
        bedtime_bg: bedtimeBg,
        morning_bg: morningBg,
        bg_change: bgChange,
        urine_glucose: data.urineGlucose || null,
        urine_ketones: data.urineKetones || null,
        notes: data.notes,
        adjustment_history: data.adjustmentHistory,
        recommended_adjustment: recommendedAdjustment,
        test_date: new Date().toISOString().split("T")[0],
        is_completed: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      await supabase.from("basal_calculator").insert(saveData)
      // Update history after save
      const { data: records } = await supabase
        .from("basal_calculator")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (records) setHistory(records)

      setStep(6) // Show results page
    } catch (err) {
      console.error(err)
      alert("Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const convertWeightToKg = (weight: number, unit: "kg" | "lbs") => {
    if (unit === "lbs") {
      return weight * 0.453592
    }
    return weight
  }
// Add this function above renderStep()
const generateWarning = () => {
  const { urineGlucose, urineKetones } = data
  let messages: string[] = []

  if (urineKetones === "present") {
    messages.push(
      "⚠️ Urine ketones are present. High ketones can be a sign of DKA. Please consult a healthcare provider before making insulin changes."
    )
  }

  if (urineGlucose === "high") {
    messages.push(
      "⚠️ Urine glucose is high. Elevated glucose with ketones may indicate insulin deficiency."
    )
  }

  if (messages.length > 0) {
    return (
      <div className="p-4 mt-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
        <p className="font-semibold mb-1">Important Note:</p>
        <ul className="list-disc ml-5 space-y-1">
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    )
  }
  return null
}

  const renderStep = () => {
    if (step === 0)
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-xl">
              Do you know your Total Daily Insulin (TDI)?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>
              Total Daily Insulin (TDI) is the total amount of insulin you use in a
              day, including basal and mealtime doses.
            </p>
            <Button
              className="w-full h-16 text-lg"
              onClick={() => {
                setMode("known")
                next()
              }}
            >
              Yes, I know my TDI
            </Button>
            <Button
              className="w-full h-16 text-lg"
              onClick={() => {
                setMode("unknown")
                next()
              }}
            >
              No, I don’t know it
            </Button>
          </CardContent>
        </Card>
      )

    if (step === 1 && mode === "known")
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Enter your Total Daily Insulin (TDI)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Enter the total units of insulin you usually take in 24 hours,
              including both basal and mealtime insulin.
            </p>
            <Input
              type="number"
              placeholder="e.g., 40"
              value={data.totalDailyInsulin}
              onChange={(e) =>
                setData({ ...data, totalDailyInsulin: e.target.value })
              }
            />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button
                onClick={() => {
                  const tdi = parseFloat(data.totalDailyInsulin)
                  if (isNaN(tdi) || tdi <= 0) {
                    alert("Please enter a valid positive number for TDI")
                    return
                  }
                  const est = Math.round(tdi * 0.45 * 10) / 10
                  setData({ ...data, estimatedBasal: est.toString() })
                  next()
                }}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 1 && mode === "unknown")
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Enter your weight to estimate your insulin needs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you don't know your TDI, we will estimate it based on your body
              weight.
            </p>

            <Input
              type="number"
              placeholder="Enter your weight"
              onChange={(e) => {
                const weight = parseFloat(e.target.value)
                if (isNaN(weight) || weight <= 0) return
                const weightKg = convertWeightToKg(weight, weightUnit)
                const tdi = Math.round(weightKg * 0.5) // 0.5 units/kg/day estimate
                const basal = Math.round(tdi * 0.45 * 10) / 10 // basal = 45% of TDI
                setData({
                  ...data,
                  totalDailyInsulin: tdi.toString(),
                  estimatedBasal: basal.toString(),
                  currentBasalDose: basal.toString(),
                })
              }}
            />

            <div className="w-48 mt-2">
              <Select
                value={weightUnit}
                onValueChange={(val) => setWeightUnit(val as "kg" | "lbs")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={prev}>Back</Button>
              <Button onClick={next}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 2)
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Choose Your Fasting Test Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Choose the type of fasting test you performed. Overnight fasting means
              you fasted overnight. Daytime fasting means you fasted during the day.
            </p>
            <Button
              className="w-full h-14"
              onClick={() => {
                setData({ ...data, testType: "overnight" })
                next()
              }}
            >
              Overnight Fasting
            </Button>
            <Button
              className="w-full h-14"
              onClick={() => {
                setData({ ...data, testType: "daytime" })
                next()
              }}
            >
              Daytime Fasting
            </Button>
            <Button variant="secondary" onClick={prev}>
              Back
            </Button>
          </CardContent>
        </Card>
      )

    if (step === 3)
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Enter Your Blood Sugar Readings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Please enter your blood sugar before the fasting period and after the
              fasting period.
            </p>
            <Input
              type="number"
              placeholder="Before fasting (mg/dL)"
              value={data.bedtimeBg}
              onChange={(e) => setData({ ...data, bedtimeBg: e.target.value })}
            />
            <Input
              type="number"
              placeholder="After fasting (mg/dL)"
              value={data.morningBg}
              onChange={(e) => setData({ ...data, morningBg: e.target.value })}
            />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button
                onClick={() => {
                  // Validate BG inputs
                  const before = parseFloat(data.bedtimeBg)
                  const after = parseFloat(data.morningBg)
                  if (isNaN(before) || isNaN(after) || before <= 0 || after <= 0) {
                    alert("Please enter valid positive numbers for blood sugar levels.")
                    return
                  }
                  next()
                }}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 4)
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Optional: Urine Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have urine test results, please select the values below.
              Otherwise, you can skip this step.
            </p>

            <label className="block font-semibold mb-1">Urine Glucose</label>
            <div className="w-48">
              <Select
                value={data.urineGlucose}
                onValueChange={(val) => setData({ ...data, urineGlucose: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urine glucose level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="block font-semibold mt-4 mb-1">Urine Ketones</label>
            <div className="w-48">
              <Select
                value={data.urineKetones}
                onValueChange={(val) => setData({ ...data, urineKetones: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urine ketones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={prev}>Back</Button>
              <Button onClick={next}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 5)
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You can write how you felt during the fasting test here.</p>
            <Input
              placeholder="How did you feel during test?"
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save & See Result"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 6) {
      // Show calculation result before history
      const currentBasal = parseFloat(data.currentBasalDose || data.estimatedBasal)
      const bedtimeBg = parseFloat(data.bedtimeBg)
      const morningBg = parseFloat(data.morningBg)
      const bgChange = morningBg - bedtimeBg
      const recommendedAdjustment = calculateAdjustment(bgChange, currentBasal)

      return (
  <Card className="p-6">
    <CardHeader>
      <CardTitle>Calculation Result</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>
        <strong>Estimated Basal Dose:</strong> {data.estimatedBasal} units
      </p>
      <p>
        <strong>Current Basal Dose:</strong> {currentBasal} units
      </p>
      <p>
        <strong>Bedtime Blood Sugar:</strong> {bedtimeBg} mg/dL
      </p>
      <p>
        <strong>Morning Blood Sugar:</strong> {morningBg} mg/dL
      </p>
      <p>
        <strong>Blood Sugar Change:</strong> {bgChange} mg/dL
      </p>
      <p>
        <strong>Recommended Adjustment:</strong>{" "}
        {recommendedAdjustment === 0
          ? "No change needed"
          : recommendedAdjustment > 0
          ? `Increase basal insulin by ${recommendedAdjustment} units`
          : `Decrease basal insulin by ${Math.abs(recommendedAdjustment)} units`}
      </p>

      {generateWarning()}

      <Button onClick={() => setStep(7)}>See History</Button>
      <Button onClick={() => setStep(0)} variant="secondary">
        Start New Calculation
      </Button>
    </CardContent>
  </Card>
)

    }

    if (step === 7)
      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>History of Saved Basal Dosages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.length === 0 && <p>No saved basal dosage history found.</p>}
            {history.map((entry, idx) => (
              <div key={idx} className="p-3 border rounded">
                <p>
                  <strong>Date:</strong> {new Date(entry.test_date).toLocaleString()}
                </p>
                <p>
                  <strong>Current Basal:</strong> {entry.current_basal_dose} units
                </p>
                <p>
                  <strong>Recommended Adjustment:</strong> {entry.recommended_adjustment}{" "}
                  units
                </p>
                <p>
                  <strong>Notes:</strong> {entry.notes || "None"}
                </p>
              </div>
            ))}
            <Button onClick={() => setStep(0)} className="mt-4 w-full">
              Start New Calculation
            </Button>
          </CardContent>
        </Card>
      )
  }

  return <div className="p-4 max-w-xl mx-auto">{renderStep()}</div>
}
