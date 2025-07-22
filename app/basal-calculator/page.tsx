// FULL BASAL CALCULATOR UI — TDI Known and Unknown Modes with backend logic included

"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

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
      setStep(7)
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
          <CardHeader><CardTitle className="text-xl">Do you know your Total Daily Insulin (TDI)?</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button className="w-full h-16 text-lg" onClick={() => { setMode("known"); next() }}>Yes, I know my TDI</Button>
            <Button className="w-full h-16 text-lg" onClick={() => { setMode("unknown"); next() }}>No, I don’t know it</Button>
          </CardContent>
        </Card>
      )

    if (step === 1 && mode === "known")
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>Enter your Total Daily Insulin (TDI)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="e.g., 40"
              value={data.totalDailyInsulin}
              onChange={(e) => setData({ ...data, totalDailyInsulin: e.target.value })} />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={() => {
                const tdi = parseFloat(data.totalDailyInsulin)
                const est = Math.round(tdi * 0.45 * 10) / 10
                setData({ ...data, estimatedBasal: est.toString() })
                next()
              }}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 1 && mode === "unknown")
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>Enter your weight in kg (to estimate your insulin needs)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="e.g., 70"
              onChange={(e) => {
                const weight = parseFloat(e.target.value)
                const tdi = Math.round(weight * 0.5)
                const basal = Math.round(tdi * 0.45 * 10) / 10
                setData({ ...data, totalDailyInsulin: tdi.toString(), estimatedBasal: basal.toString(), currentBasalDose: basal.toString() })
              }} />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={next}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 2)
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>Choose Your Fasting Test Type</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-14" onClick={() => { setData({ ...data, testType: "overnight" }); next() }}>Overnight Fasting</Button>
            <Button className="w-full h-14" onClick={() => { setData({ ...data, testType: "daytime" }); next() }}>Daytime Fasting</Button>
            <Button variant="secondary" onClick={prev}>Back</Button>
          </CardContent>
        </Card>
      )

    if (step === 3)
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>Enter Your Blood Sugar Readings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="Before fasting (mg/dL)"
              value={data.bedtimeBg} onChange={(e) => setData({ ...data, bedtimeBg: e.target.value })} />
            <Input type="number" placeholder="After fasting (mg/dL)"
              value={data.morningBg} onChange={(e) => setData({ ...data, morningBg: e.target.value })} />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={next}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 4)
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>Optional: Urine Test Results</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Urine Glucose (e.g., normal, high, low)"
              value={data.urineGlucose} onChange={(e) => setData({ ...data, urineGlucose: e.target.value })} />
            <Input placeholder="Urine Ketones (present/absent)"
              value={data.urineKetones} onChange={(e) => setData({ ...data, urineKetones: e.target.value })} />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={next}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 5)
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>Notes (Optional)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="How did you feel during test?"
              value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
            <div className="flex gap-4">
              <Button onClick={prev}>Back</Button>
              <Button onClick={handleSave} disabled={isSaving}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )

    if (step === 7)
      return (
        <Card className="p-6">
          <CardHeader><CardTitle>History of Saved Basal Dosages</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {history.map((entry, idx) => (
              <div key={idx} className="p-3 border rounded">
                <p><strong>Date:</strong> {entry.test_date}</p>
                <p><strong>Current Basal:</strong> {entry.current_basal_dose} units</p>
                <p><strong>Recommended Adjustment:</strong> {entry.recommended_adjustment} units</p>
              </div>
            ))}
            <Button onClick={() => setStep(0)} className="mt-4 w-full">Start New Calculation</Button>
          </CardContent>
        </Card>
      )
  }

  return <div className="p-4 max-w-xl mx-auto">{renderStep()}</div>
}
