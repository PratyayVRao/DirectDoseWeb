"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Trash2, Clock, Utensils } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Meal {
  id: string
  description: string
  carbs: number
  insulin: number
  meal_period: string
  created_at: string
}

export default function MealHistory() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mealToDelete, setMealToDelete] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (data && !error) {
          setMeals(data)
        } else if (error) {
          console.error("Error fetching meals:", error)
          toast({
            title: "Error",
            description: "Failed to load meal history",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error in fetchMeals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeals()
  }, [supabase, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getMealPeriodIcon = (period: string) => {
    switch (period.toLowerCase()) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "☀️"
      case "dinner":
        return "🌙"
      case "snack":
        return "🍎"
      default:
        return "🍽️"
    }
  }

  const confirmDeleteMeal = (mealId: string) => {
    setMealToDelete(mealId)
  }

  const deleteMeal = async () => {
    if (!mealToDelete) return

    setIsDeleting(true)

    try {
      const { error } = await supabase.from("meals").delete().eq("id", mealToDelete)

      if (error) throw error

      setMeals(meals.filter((meal) => meal.id !== mealToDelete))

      toast({
        title: "Meal deleted",
        description: "The meal has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting meal:", error)
      toast({
        title: "Error",
        description: "Failed to delete meal",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setMealToDelete(null)
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
        <h1 className="text-3xl font-bold text-[#006c67]">Meal History</h1>
      </div>

      {meals.length === 0 ? (
        <Card className="border-2 border-[#006c67] max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Utensils className="h-12 w-12 text-[#006c67] mb-4" />
            <p className="text-lg text-[#006c67] mb-4">You haven't saved any meals yet</p>
            <Button onClick={() => router.push("/calculator")} className="bg-[#006c67] hover:bg-[#004a46] text-white">
              Go to Calculator
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {meals.map((meal) => (
            <Card key={meal.id} className="border-2 border-[#006c67]/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMealPeriodIcon(meal.meal_period)}</span>
                    <div>
                      <CardTitle className="text-[#006c67] text-lg">{meal.description}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(meal.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDeleteMeal(meal.id)}
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#006c67] font-medium">Meal Period:</span>
                    <span className="text-[#006c67] capitalize">{meal.meal_period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#006c67] font-medium">Carbs:</span>
                    <span className="text-[#006c67] font-bold">{meal.carbs.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#006c67] font-medium">Insulin:</span>
                    <span className="text-[#09fbb7] font-bold">{meal.insulin.toFixed(1)} units</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!mealToDelete} onOpenChange={(open) => !open && setMealToDelete(null)}>
        <AlertDialogContent className="border-2 border-[#006c67]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#006c67]">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meal from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMeal} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
