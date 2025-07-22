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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id ?? null)
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
      const recommendedAdjustment = calculateAdjustment(bgChange, parseFloat(data.currentBasalDose))
      const saveData = {
        user_id: userId,
        total_daily_insulin: parseFloat(data.totalDailyInsulin),
        estimated_basal: parseFloat(data.estimatedBasal),
        current_basal_dose: parseFloat(data.currentBasalDose),
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
      const { data: existing, error: findError } = await supabase
        .from("basal_calculator")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (!findError && existing) {
        await supabase.from("basal_calculator").update(saveData).eq("id", existing.id)
      } else {
        await supabase.from("basal_calculator").insert(saveData)
      }

      alert("Saved successfully!")
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
        <Card>
          <CardHeader>
            <CardTitle>Do you know your Total Daily Insulin (TDI)?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => { setMode("known"); next() }}>Yes</Button>
            <Button onClick={() => { setMode("unknown"); next() }}>No</Button>
          </CardContent>
        </Card>
      )

    if (step === 1 && mode === "known")
      return (
        <Card>
          <CardHeader><CardTitle>Enter your Total Daily Insulin (TDI)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="e.g., 40"
              value={data.totalDailyInsulin}
              onChange={(e) => setData({ ...data, totalDailyInsulin: e.target.value })} />
            <Button onClick={() => {
              const tdi = parseFloat(data.totalDailyInsulin)
              const est = Math.round(tdi * 0.45 * 10) / 10
              setData({ ...data, estimatedBasal: est.toString() })
              next()
            }}>Next</Button>
          </CardContent>
        </Card>
      )

    if (step === 1 && mode === "unknown")
      return (
        <Card>
          <CardHeader><CardTitle>Enter your weight</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="kg"
              onChange={(e) => {
                const weight = parseFloat(e.target.value)
                const tdi = Math.round(weight * 0.5)
                const basal = Math.round(tdi * 0.45 * 10) / 10
                setData({ ...data, totalDailyInsulin: tdi.toString(), estimatedBasal: basal.toString() })
              }} />
            <Button onClick={next}>Next</Button>
          </CardContent>
        </Card>
      )

    if (step === 2)
      return (
        <Card>
          <CardHeader><CardTitle>Enter your current basal dose</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" value={data.currentBasalDose} onChange={(e) => setData({ ...data, currentBasalDose: e.target.value })} />
            <Button onClick={next}>Next</Button>
          </CardContent>
        </Card>
      )

    if (step === 3)
      return (
        <Card>
          <CardHeader><CardTitle>Choose Fasting Test Type</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => { setData({ ...data, testType: "overnight" }); next() }}>Overnight</Button>
            <Button onClick={() => { setData({ ...data, testType: "daytime" }); next() }}>Daytime</Button>
          </CardContent>
        </Card>
      )

    if (step === 4)
      return (
        <Card>
          <CardHeader><CardTitle>Enter Blood Sugar Values</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="number" placeholder="Before sleep or test start (mg/dL)"
              value={data.bedtimeBg} onChange={(e) => setData({ ...data, bedtimeBg: e.target.value })} />
            <Input type="number" placeholder="After sleep or test end (mg/dL)"
              value={data.morningBg} onChange={(e) => setData({ ...data, morningBg: e.target.value })} />
            <Button onClick={next}>Next</Button>
          </CardContent>
        </Card>
      )

    if (step === 5)
      return (
        <Card>
          <CardHeader><CardTitle>Optional: Urine Test Results</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Urine Glucose (e.g., normal, high, low)"
              value={data.urineGlucose} onChange={(e) => setData({ ...data, urineGlucose: e.target.value })} />
            <Input placeholder="Urine Ketones (present/absent)"
              value={data.urineKetones} onChange={(e) => setData({ ...data, urineKetones: e.target.value })} />
            <Button onClick={next}>Next</Button>
          </CardContent>
        </Card>
      )

    if (step === 6)
      return (
        <Card>
          <CardHeader><CardTitle>Notes (Optional)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="How did you feel during test?"
              value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
            <Button onClick={handleSave} disabled={isSaving}>Save</Button>
          </CardContent>
        </Card>
      )
  }

  return <div className="p-4 max-w-xl mx-auto">{renderStep()}</div>
}
