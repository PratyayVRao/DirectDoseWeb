"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Database, Users, PieChart } from "lucide-react"
import { toast } from "@/components/toast-provider"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userData, setUserData] = useState<any[]>([])
  const [mealData, setMealData] = useState<any[]>([])
  const [demographicData, setDemographicData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("users")
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Check if user is admin
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error checking admin status:", profileError)
          router.push("/")
          return
        }

        if (!profileData.is_admin) {
          console.log("User is not an admin")
          router.push("/")
          return
        }

        setIsAdmin(true)

        // Fetch all data
        await fetchAllData()
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [supabase, router])

  const fetchAllData = async () => {
    try {
      // Fetch users with profiles
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) {
        console.error("Error fetching users:", usersError)
        throw usersError
      }

      setUserData(users || [])

      // Fetch meals with user info and time data
      const { data: meals, error: mealsError } = await supabase
        .from("meals")
        .select(`
          *,
          profiles:user_id (username, email),
          meal_items (*),
          meal_time_data (*)
        `)
        .order("created_at", { ascending: false })

      if (mealsError) {
        console.error("Error fetching meals:", mealsError)
        throw mealsError
      }

      setMealData(meals || [])

      // Fetch demographic data with user info
      const { data: demographics, error: demographicsError } = await supabase
        .from("user_demographics")
        .select(`
          *,
          profiles:user_id (username, email)
        `)
        .order("created_at", { ascending: false })

      if (demographicsError) {
        console.error("Error fetching demographics:", demographicsError)
        throw demographicsError
      }

      setDemographicData(demographics || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.destructive({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
      })
    }
  }

  const downloadCSV = (data: any[], filename: string) => {
    // Convert data to CSV
    const replacer = (key: string, value: any) => (value === null ? "" : value)
    const header = Object.keys(data[0])
    const csv = data.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(","))
    csv.unshift(header.join(","))
    const csvString = csv.join("\r\n")

    // Download CSV
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", filename)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const prepareUserDataForDownload = () => {
    return userData.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username || "N/A",
      insulin_carb_ratio: user.insulin_carb_ratio,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))
  }

  const prepareMealDataForDownload = () => {
    return mealData.map((meal) => {
      const timeRange =
        meal.meal_time_data && meal.meal_time_data.length > 0 ? meal.meal_time_data[0].time_range : "N/A"

      return {
        id: meal.id,
        user_email: meal.profiles?.email || "N/A",
        user_username: meal.profiles?.username || "N/A",
        meal_name: meal.meal_name,
        total_carbs: meal.total_carbs,
        total_calories: meal.total_calories,
        total_insulin: meal.total_insulin,
        time_range: timeRange,
        created_at: meal.created_at,
        item_count: meal.meal_items?.length || 0,
      }
    })
  }

  const prepareDemographicDataForDownload = () => {
    return demographicData.map((demo) => ({
      id: demo.id,
      user_email: demo.profiles?.email || "N/A",
      user_username: demo.profiles?.username || "N/A",
      race: demo.race || "N/A",
      age_range: demo.age_range || "N/A",
      weight_range: demo.weight_range || "N/A",
      location: demo.location || "N/A",
      created_at: demo.created_at,
      updated_at: demo.updated_at,
    }))
  }

  const downloadAllData = () => {
    // Prepare and download all datasets
    downloadCSV(prepareUserDataForDownload(), "directdose_users.csv")
    setTimeout(() => {
      downloadCSV(prepareMealDataForDownload(), "directdose_meals.csv")
    }, 500)
    setTimeout(() => {
      downloadCSV(prepareDemographicDataForDownload(), "directdose_demographics.csv")
    }, 1000)

    toast.default({
      title: "Download started",
      description: "All data is being downloaded as CSV files",
    })
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#006c67]" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-[#006c67]">Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full bg-[#006c67] hover:bg-[#004a46] text-white">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#006c67]">Admin Dashboard</h1>
        <Button onClick={downloadAllData} className="bg-[#006c67] hover:bg-[#004a46] text-white">
          <Download className="mr-2 h-4 w-4" />
          Download All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[#006c67] flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[#006c67] flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{mealData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[#006c67] flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{demographicData.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="users" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
            Users
          </TabsTrigger>
          <TabsTrigger value="meals" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
            Meals
          </TabsTrigger>
          <TabsTrigger value="demographics" className="data-[state=active]:bg-[#006c67] data-[state=active]:text-white">
            Demographics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#006c67]">User Data</CardTitle>
                <Button
                  onClick={() => downloadCSV(prepareUserDataForDownload(), "directdose_users.csv")}
                  className="bg-[#006c67] hover:bg-[#004a46] text-white"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#e6fff9]">
                      <th className="p-2 text-left text-[#006c67] border">Email</th>
                      <th className="p-2 text-left text-[#006c67] border">Username</th>
                      <th className="p-2 text-left text-[#006c67] border">ICR</th>
                      <th className="p-2 text-left text-[#006c67] border">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{user.email}</td>
                        <td className="p-2 border">{user.username || "N/A"}</td>
                        <td className="p-2 border">{user.insulin_carb_ratio}</td>
                        <td className="p-2 border">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#006c67]">Meal Data</CardTitle>
                <Button
                  onClick={() => downloadCSV(prepareMealDataForDownload(), "directdose_meals.csv")}
                  className="bg-[#006c67] hover:bg-[#004a46] text-white"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#e6fff9]">
                      <th className="p-2 text-left text-[#006c67] border">User</th>
                      <th className="p-2 text-left text-[#006c67] border">Meal Name</th>
                      <th className="p-2 text-left text-[#006c67] border">Carbs</th>
                      <th className="p-2 text-left text-[#006c67] border">Insulin</th>
                      <th className="p-2 text-left text-[#006c67] border">Time Range</th>
                      <th className="p-2 text-left text-[#006c67] border">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealData.map((meal) => {
                      const timeRange =
                        meal.meal_time_data && meal.meal_time_data.length > 0
                          ? meal.meal_time_data[0].time_range
                          : "N/A"

                      return (
                        <tr key={meal.id} className="hover:bg-gray-50">
                          <td className="p-2 border">{meal.profiles?.email || "N/A"}</td>
                          <td className="p-2 border">{meal.meal_name}</td>
                          <td className="p-2 border">{meal.total_carbs.toFixed(1)}g</td>
                          <td className="p-2 border">{meal.total_insulin.toFixed(1)} units</td>
                          <td className="p-2 border">{timeRange}</td>
                          <td className="p-2 border">{new Date(meal.created_at).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#006c67]">Demographic Data</CardTitle>
                <Button
                  onClick={() => downloadCSV(prepareDemographicDataForDownload(), "directdose_demographics.csv")}
                  className="bg-[#006c67] hover:bg-[#004a46] text-white"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#e6fff9]">
                      <th className="p-2 text-left text-[#006c67] border">User</th>
                      <th className="p-2 text-left text-[#006c67] border">Race</th>
                      <th className="p-2 text-left text-[#006c67] border">Age Range</th>
                      <th className="p-2 text-left text-[#006c67] border">Weight Range</th>
                      <th className="p-2 text-left text-[#006c67] border">Location</th>
                      <th className="p-2 text-left text-[#006c67] border">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demographicData.map((demo) => (
                      <tr key={demo.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{demo.profiles?.email || "N/A"}</td>
                        <td className="p-2 border">{demo.race || "N/A"}</td>
                        <td className="p-2 border">{demo.age_range || "N/A"}</td>
                        <td className="p-2 border">{demo.weight_range || "N/A"}</td>
                        <td className="p-2 border">{demo.location || "N/A"}</td>
                        <td className="p-2 border">{new Date(demo.updated_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
