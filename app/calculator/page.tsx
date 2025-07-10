"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Loader2, Utensils, Save, Clock, Droplet } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"

interface NutritionData {
  food: string
  carbs: number
  calories: number
  protein: number
  fat: number
  fiber: number
}

interface CalculationResult {
  totalCarbs: number
  insulinDose: number
  nutritionBreakdown: NutritionData[]
}

export default function MealCalculator() {
  const [foodInput, setFoodInput] = useState("")
  const [mealPeriod, setMealPeriod] = useState("breakfast")
  const [insulinCarbRatio, setInsulinCarbRatio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)

          // Get user profile data
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (profile) {
            setUserProfile(profile)
            if (profile.icr) {
              setInsulinCarbRatio(profile.icr.toString())
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()
  }, [supabase])

  const parseFood = async () => {
    if (!foodInput.trim()) {
      toast({
        title: "No food entered",
        description: "Please enter some food items to calculate",
        variant: "destructive",
      })
      return
    }

    if (!insulinCarbRatio || isNaN(Number(insulinCarbRatio)) || Number(insulinCarbRatio) <= 0) {
      toast({
        title: "Invalid insulin ratio",
        description: "Please enter a valid insulin-to-carb ratio",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/nutrition?query=${encodeURIComponent(foodInput.trim())}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to parse food")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const netCarbs = data.netCarbs || 0
      const insulinDose = netCarbs / Number(insulinCarbRatio)

      const calculationResult: CalculationResult = {
        totalCarbs: Math.round(netCarbs * 10) / 10,
        insulinDose: Math.round(insulinDose * 10) / 10,
        nutritionBreakdown: data.nutritionBreakdown || [],
      }

      setResult(calculationResult)

      toast({
        title: "Calculation complete",
        description: `Total carbs: ${calculationResult.totalCarbs}g, Insulin needed: ${calculationResult.insulinDose} units`,
      })
    } catch (error) {
      console.error("Error parsing food:", error)
      toast({
        title: "Parsing error",
        description:
          error instanceof Error
            ? error.message
            : "Could not parse the food input. Please use comma-separated format like '1 apple, 100g rice, 2 slices bread'.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveMeal = async () => {
    if (!result || !user) {
      toast({
        title: "Cannot save meal",
        description: !user ? "Please sign in to save meals" : "No calculation result to save",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        description: foodInput.trim(),
        meal_period: mealPeriod,
        carbs: result.totalCarbs,
        insulin: result.insulinDose,
        created_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      toast({
        title: "Meal saved",
        description: "Your meal has been saved to your history",
      })
    } catch (error) {
      console.error("Error saving meal:", error)
      toast({
        title: "Save error",
        description: "Could not save your meal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const clearCalculation = () => {
    setFoodInput("")
    setResult(null)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#006c67]">Prandial Dosage Calculator</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Section */}
          <Card className="border-2 border-[#006c67]">
            <CardHeader>
              <CardTitle className="text-[#006c67] flex items-center">
                <Utensils className="mr-2 h-5 w-5" />
                Food Input
              </CardTitle>
              <CardDescription>Enter food items separated by commas with quantities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="food-input" className="text-[#006c67]">
                  What are you eating?
                </Label>
                <Input
                  id="food-input"
                  placeholder="e.g., 1 apple, 100g rice, 2 slices bread"
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  className="border-[#006c67] focus-visible:ring-[#006c67]"
                />
                <p className="text-sm text-[#006c67] opacity-80">
                  Separate multiple items with commas. Include quantities like "1 cup", "100g", "2 slices"
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[#006c67] flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Meal Period
                </Label>
                <RadioGroup value={mealPeriod} onValueChange={setMealPeriod} className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="breakfast" id="breakfast" className="text-[#006c67]" />
                    <Label htmlFor="breakfast" className="text-[#006c67]">
                      Breakfast
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lunch" id="lunch" className="text-[#006c67]" />
                    <Label htmlFor="lunch" className="text-[#006c67]">
                      Lunch
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dinner" id="dinner" className="text-[#006c67]" />
                    <Label htmlFor="dinner" className="text-[#006c67]">
                      Dinner
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="snack" id="snack" className="text-[#006c67]" />
                    <Label htmlFor="snack" className="text-[#006c67]">
                      Snack
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icr" className="text-[#006c67] flex items-center">
                  <Droplet className="mr-2 h-4 w-4" />
                  Insulin-to-Carb Ratio (1:X)
                </Label>
                <Input
                  id="icr"
                  type="number"
                  placeholder="e.g., 15"
                  value={insulinCarbRatio}
                  onChange={(e) => setInsulinCarbRatio(e.target.value)}
                  className="border-[#006c67] focus-visible:ring-[#006c67]"
                />
                <p className="text-sm text-[#006c67] opacity-80">
                  How many grams of carbs does 1 unit of insulin cover?{" "}
                  {!userProfile?.insulin_carb_ratio && (
                    <Link href="/icr-calculator" className="underline hover:text-[#004a46]">
                      Calculate your ICR
                    </Link>
                  )}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={parseFood}
                disabled={isLoading}
                className="flex-1 bg-[#006c67] hover:bg-[#004a46] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>
              {result && (
                <Button
                  onClick={clearCalculation}
                  variant="outline"
                  className="border-[#006c67] text-[#006c67] hover:bg-[#006c67] hover:text-white bg-transparent"
                >
                  Clear
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Results Section */}
          <Card className="border-2 border-[#006c67]">
            <CardHeader>
              <CardTitle className="text-[#006c67]">Calculation Results</CardTitle>
              <CardDescription>Your insulin dosage and nutritional breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Main Results */}
                  <div className="p-4 bg-[#e6fff9] rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[#006c67]">{result.totalCarbs}g</p>
                        <p className="text-sm text-[#006c67] opacity-80">Total Carbs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#006c67]">{result.insulinDose} units</p>
                        <p className="text-sm text-[#006c67] opacity-80">Insulin Needed</p>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Breakdown */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-[#006c67]">Nutrition Breakdown:</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {result.nutritionBreakdown.map((item, index) => (
                        <div key={index} className="p-3 border border-[#006c67]/30 rounded-lg">
                          <p className="font-medium text-[#006c67] mb-1">{item.food}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-[#006c67]">
                            <p>Carbs: {item.carbs.toFixed(1)}g</p>
                            <p>Calories: {item.calories.toFixed(0)}</p>
                            <p>Protein: {item.protein.toFixed(1)}g</p>
                            <p>Fat: {item.fat.toFixed(1)}g</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  {user && (
                    <Button
                      onClick={saveMeal}
                      disabled={isSaving}
                      className="w-full bg-[#006c67] hover:bg-[#004a46] text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Meal
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#006c67] opacity-80">
                    Enter your meal details and click Calculate to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6 border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">Tips for Better Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-[#006c67] mb-2">Format Examples:</h3>
                <ul className="text-sm text-[#006c67] space-y-1">
                  <li>• "1 medium banana, 2 tbsp peanut butter"</li>
                  <li>• "100g white rice, 150g grilled chicken"</li>
                  <li>• "2 slices whole wheat bread, 1 tbsp jam"</li>
                  <li>• "1 cup oatmeal, 1 apple, 1 cup milk"</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-[#006c67] mb-2">Important Notes:</h3>
                <ul className="text-sm text-[#006c67] space-y-1">
                  <li>• Separate items with commas</li>
                  <li>• Include quantities (cups, grams, pieces)</li>
                  <li>• Be specific about food types</li>
                  <li>• Include cooking methods when relevant</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
