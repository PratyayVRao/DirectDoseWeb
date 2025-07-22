"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Select, SelectItem } from "@/components/ui/select" // Assuming you have these components

export default function BasalCalculator() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<"known" | "unknown" | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [history, setHistory] = useState<any[]>([])
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
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg")

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
        test_time: new Date().toLocaleTimeString(),
        is_completed: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      await supabase.from("basal_calculator").insert(saveData)
      // Reload history after save
      const { data: records } = await supabase
        .from("basal_calculator")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (records) setHistory(records)
      setStep(6)
    } catch (err) {
      console.error(err)
      alert("Save failed")
    } finally {
      setIsSaving(false)
    }
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
              Your Total Daily Insulin (TDI) is the total amount of insulin you
              take in one day, including basal and mealtime insulin.
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
              Enter the total amount of insulin you take in a day (both basal and
              mealtime), usually in units.
            </p>
            <Input
              type="number"
              placeholder="e.g., 40"
              value={data.totalDailyInsulin}
              onChange={(e) =>
                setData({ ...data, totalDailyInsulin: e.target.value })
              }
            />
            <div className="flex gap-4 mt-4">
              <Button onClick={prev} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => {
                  const tdi = parseFloat(data.totalDailyInsulin)
                  if (isNaN(tdi) || tdi <= 0) {
                    alert("Please enter a valid number for TDI.")
                    return
                  }
                  const est = Math.round(tdi * 0.45 * 10) / 10
                  setData({ ...data, estimatedBasal: est.toString() })
                  next()
                }}
                className="flex-1"
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
            <CardTitle>Enter your weight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We can estimate your insulin needs based on your weight. Please
              enter your weight and select the unit.
            </p>
            <Input
              type="number"
              placeholder="e.g., 70"
              onChange={(e) => {
                const weight = parseFloat(e.target.value)
                if (isNaN(weight) || weight <= 0) {
                  setData({
                    ...data,
                    totalDailyInsulin: "",
                    estimatedBasal: "",
                    currentBasalDose: "",
                  })
                  return
                }
                let weightInKg = weight
                if (weightUnit === "lbs") {
                  weightInKg = weight / 2.20462
                }
                const tdi = Math.round(weightInKg * 0.5)
                const basal = Math.round(tdi * 0.45 * 10) / 10
                setData({
                  ...data,
                  totalDailyInsulin: tdi.toString(),
                  estimatedBasal: basal.toString(),
                  currentBasalDose: basal.toString(),
                })
              }}
              value={
                data.totalDailyInsulin
                  ? undefined
                  : "" /* Let user input freely */
              }
            />
            <div className="w-24 mt-2">
              <label className="mr-2 font-semibold block mb-1">Unit:</label>
              <Select
                value={weightUnit}
                onValueChange={(val) => setWeightUnit(val as "kg" | "lbs")}
              >
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
              </Select>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={prev} className="flex-1">
                Back
              </Button>
              <Button onClick={next} className="flex-1" disabled={!data.totalDailyInsulin}>
                Next
              </Button>
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
              Select how you will perform your basal insulin test. Overnight
              fasting means fasting during sleep. Daytime fasting means fasting
              during the day.
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
            <Button variant="secondary" onClick={prev} className="mt-4 w-full">
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
              Please enter your blood sugar readings before and after your fasting
              period in mg/dL.
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
            <div className="flex gap-4 mt-4">
              <Button onClick={prev} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!data.bedtimeBg || !data.morningBg) {
                    alert("Please enter both blood sugar readings.")
                    return
                  }
                  next()
                }}
                className="flex-1"
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
              Otherwise, you may skip this step.
            </p>
            <div>
              <label className="font-semibold mb-1 block">Urine Glucose</label>
              <div className="w-48">
                <Select
                  value={data.urineGlucose}
                  onValueChange={(val) => setData({ ...data, urineGlucose: val })}
                >
                  <SelectItem value="">-- Select --</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <label className="font-semibold mb-1 block">Urine Ketones</label>
              <div className="w-48">
                <Select
                  value={data.urineKetones}
                  onValueChange={(val) => setData({ ...data, urineKetones: val })}
                >
                  <SelectItem value="">-- Select --</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={prev} className="flex-1">
                Back
              </Button>
              <Button onClick={next} className="flex-1">
                Next
              </Button>
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
            <p>
              Write any notes about how you felt during the test or anything else
              you'd like to remember.
            </p>
            <Input
              placeholder="How did you feel during test?"
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
            <div className="flex gap-4 mt-4">
              <Button onClick={prev} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 6) {
      // Show current calculation results before history
      const latest = history[0]
      if (!latest) {
        return (
          <Card className="p-6">
            <CardHeader>
              <CardTitle>No Saved Data Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setStep(0)} className="w-full">
                Start New Calculation
              </Button>
            </CardContent>
          </Card>
        )
      }

      return (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Basal Insulin Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Date:</strong> {latest.test_date} <br />
              <strong>Time:</strong> {latest.test_time || "Unknown"}
            </p>
            <p>
              <strong>Current Basal Dose:</strong> {latest.current_basal_dose} units
            </p>
            <p>
              <strong>Recommended Adjustment:</strong> {latest.recommended_adjustment} units
            </p>
            <p>
              The recommended adjustment suggests how much you should increase or
              decrease your basal insulin based on your fasting blood sugar changes.
            </p>
            <Button
              onClick={() => setStep(7)}
              className="w-full"
              autoFocus
            >
              View Full History
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
          <CardContent className="space-y-4 max-h-[400px] overflow-auto">
            {history.length === 0 && <p>No basal dosage records saved yet.</p>}
            {history.map((entry, idx) => (
              <div key={idx} className="p-3 border rounded">
                <p>
                  <strong>Date:</strong> {entry.test_date}{" "}
                  <strong>Time:</strong> {entry.test_time || "Unknown"}
                </p>
                <p>
                  <strong>Current Basal Dose:</strong> {entry.current_basal_dose} units
                </p>
                <p>
                  <strong>Recommended Adjustment:</strong> {entry.recommended_adjustment} units
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
