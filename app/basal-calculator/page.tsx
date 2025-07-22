"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const supabase = createClient()

export default function BasalCalculatorFlow() {
  const [mode, setMode] = useState<"basic" | "complex" | null>(null)
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    totalDailyInsulin: "",
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
  })

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) console.error(error)
      setUserId(user?.id || null)
      setIsLoading(false)
    }
    init()
  }, [])

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveToDatabase = async () => {
    setIsSaving(true)
    const payload = {
      user_id: userId,
      total_daily_insulin: form.totalDailyInsulin,
      current_basal_dose: parseFloat(form.currentBasal),
      estimated_basal: (0.5 * parseFloat(form.totalDailyInsulin)).toFixed(2),
      test_type: form.testType,
      symptoms_data: form.symptoms,
      urine_glucose: form.urineGlucose,
      urine_ketones: form.urineKetones,
      notes: form.notes,
      adjustment_history: [],
      recommended_adjustment: null,
      is_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from("basal_calculator").insert(payload)
    if (error) toast({ title: "Save failed", description: error.message })
    else toast({ title: "Data saved!" })
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!mode) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Select Calculation Mode</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => setMode("basic")}>Basic Mode</Button>
          <Button variant="secondary" onClick={() => setMode("complex")}>Complex Mode</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>{mode === "basic" ? "Basic Basal Calculator" : "Advanced Basal Calculator"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <Label>Total Daily Insulin</Label>
            <Input
              type="number"
              value={form.totalDailyInsulin}
              onChange={(e) => handleChange("totalDailyInsulin", e.target.value)}
            />
            <Label>Current Basal Dose</Label>
            <Input
              type="number"
              value={form.currentBasal}
              onChange={(e) => handleChange("currentBasal", e.target.value)}
            />
            <Button onClick={() => setStep(1)}>Next</Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Label>Test Type</Label>
            <RadioGroup value={form.testType} onValueChange={(val) => handleChange("testType", val)}>
              <RadioGroupItem value="overnight">Overnight</RadioGroupItem>
              <RadioGroupItem value="daytime">Daytime</RadioGroupItem>
            </RadioGroup>
            <Button onClick={() => setStep(2)}>Next</Button>
          </div>
        )}

        {step === 2 && mode === "complex" && (
          <div className="space-y-4">
            <Label>Symptoms</Label>
            {Object.keys(form.symptoms).map((symptom) => (
              <label key={symptom} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.symptoms[symptom as keyof typeof form.symptoms]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      symptoms: {
                        ...prev.symptoms,
                        [symptom]: e.target.checked,
                      },
                    }))
                  }
                />
                {symptom}
              </label>
            ))}
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        )}

        {(step === 2 && mode === "basic") || step === 3 ? (
          <div className="space-y-4">
            <Label>Urine Glucose</Label>
            <RadioGroup value={form.urineGlucose} onValueChange={(val) => handleChange("urineGlucose", val)}>
              <RadioGroupItem value="high">High</RadioGroupItem>
              <RadioGroupItem value="normal">Normal</RadioGroupItem>
              <RadioGroupItem value="low">Low</RadioGroupItem>
            </RadioGroup>
            <Label>Urine Ketones</Label>
            <RadioGroup value={form.urineKetones} onValueChange={(val) => handleChange("urineKetones", val)}>
              <RadioGroupItem value="present">Present</RadioGroupItem>
              <RadioGroupItem value="absent">Absent</RadioGroupItem>
            </RadioGroup>
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} />
            <Button onClick={saveToDatabase} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
