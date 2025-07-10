import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 })
  }

  try {
    const appId = process.env.EDAMAM_APP_ID
    const appKey = process.env.EDAMAM_APP_KEY

    if (!appId || !appKey) {
      console.error("Missing Edamam credentials")
      return NextResponse.json({ error: "API credentials not configured" }, { status: 500 })
    }

    // Parse the query to extract individual food items
    const foodItems = query
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    if (foodItems.length === 0) {
      return NextResponse.json({ error: "No valid food items found" }, { status: 400 })
    }

    let totalNetCarbs = 0
    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalFiber = 0
    const nutritionBreakdown = []

    // Process each food item
    for (const foodItem of foodItems) {
      const edamamUrl = `https://api.edamam.com/api/nutrition-data?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(foodItem)}`

      const response = await fetch(edamamUrl)

      if (!response.ok) {
        console.error(`Edamam API error for "${foodItem}":`, response.status, response.statusText)
        continue
      }

      const data = await response.json()

      if (!data.calories || data.calories === 0) {
        console.log(`No nutrition data found for: ${foodItem}`)
        continue
      }

      const carbs = data.totalNutrients?.CHOCDF?.quantity || 0
      const fiber = data.totalNutrients?.FIBTG?.quantity || 0
      const netCarbs = Math.max(0, carbs - fiber)
      const calories = data.calories || 0
      const protein = data.totalNutrients?.PROCNT?.quantity || 0
      const fat = data.totalNutrients?.FAT?.quantity || 0

      totalNetCarbs += netCarbs
      totalCalories += calories
      totalProtein += protein
      totalFat += fat
      totalFiber += fiber

      nutritionBreakdown.push({
        food: foodItem,
        carbs: Math.round(netCarbs * 10) / 10,
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        fiber: Math.round(fiber * 10) / 10,
      })
    }

    if (nutritionBreakdown.length === 0) {
      return NextResponse.json({ error: "No nutrition data found for any of the provided food items" }, { status: 404 })
    }

    return NextResponse.json({
      netCarbs: Math.round(totalNetCarbs * 10) / 10,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      foodLabel: foodItems.join(", "),
      nutritionBreakdown,
    })
  } catch (error) {
    console.error("Error fetching nutrition data:", error)
    return NextResponse.json({ error: "Failed to fetch nutrition data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { foodInput } = await request.json()

    if (!foodInput) {
      return NextResponse.json({ error: "Food input is required" }, { status: 400 })
    }

    // Redirect to GET method
    const url = new URL("/api/nutrition", request.url)
    url.searchParams.set("query", foodInput)

    return NextResponse.redirect(url)
  } catch (error) {
    console.error("Error processing POST request:", error)
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
  }
}
