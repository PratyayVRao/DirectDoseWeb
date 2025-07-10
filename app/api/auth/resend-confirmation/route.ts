import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("Resending confirmation email to:", email)

    // Create a Supabase client with service role key for admin operations
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY },
    )

    // Get the origin for the redirect URL
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const redirectTo = `${origin}/auth/callback?type=signup`

    // First, check if the user exists and if their email is already confirmed
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("Error listing users:", userError)
      return NextResponse.json({ error: "Failed to check user status" }, { status: 500 })
    }

    const user = userData.users.find((u) => u.email === email)

    if (user) {
      // If email is already confirmed, return success
      if (user.email_confirmed_at) {
        return NextResponse.json({
          success: true,
          message: "Email is already confirmed",
          alreadyConfirmed: true,
        })
      }

      // Try to resend confirmation email
      const { error } = await supabase.auth.admin.generateLink({
        type: "signup",
        email,
        options: {
          redirectTo,
        },
      })

      if (error) {
        console.error("Error generating signup link:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Confirmation email sent successfully",
      })
    } else {
      // User doesn't exist, return appropriate message
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          error: "No user found with this email address",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Error in resend confirmation API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
