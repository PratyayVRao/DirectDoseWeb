import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Manually confirming email for:", email)

    // Create a Supabase admin client with service role key
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY },
    )

    // Find the user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("Error listing users:", userError)
      return NextResponse.json({ error: "Failed to find user" }, { status: 500 })
    }

    // Find the user with the matching email
    const user = userData.users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already confirmed
    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: "Email is already confirmed",
        alreadyConfirmed: true,
      })
    }

    // Update the user to mark their email as confirmed
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirmed_at: new Date().toISOString(),
    })

    if (updateError) {
      console.error("Error confirming user email:", updateError)
      return NextResponse.json({ error: "Failed to confirm email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email confirmed successfully",
      userId: user.id,
    })
  } catch (error) {
    console.error("Error in manual confirm API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
