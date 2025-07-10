import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { action, email, password } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // Create a Supabase admin client with service role key
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(
      {
        cookies: () => cookieStore,
      },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    )

    // Handle different actions
    if (action === "confirm-email") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
      }

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

      // Update the user to mark their email as confirmed
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirmed_at: new Date().toISOString(),
      })

      if (updateError) {
        console.error("Error confirming user email:", updateError)
        return NextResponse.json({ error: "Failed to confirm email" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Email confirmed successfully" })
    } else if (action === "create-and-login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
      }

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find((u) => u.email === email)

      let userId

      if (existingUser) {
        // User exists, update email confirmation if needed
        userId = existingUser.id

        // Only update if email isn't confirmed
        if (!existingUser.email_confirmed_at) {
          await supabase.auth.admin.updateUserById(userId, {
            email_confirmed_at: new Date().toISOString(),
          })
        }

        // Don't try to update password for existing users during sign-in
        // This was causing the error
      } else {
        // Create new user with admin API
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
        })

        if (createError) {
          console.error("Error creating user:", createError)
          return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
        }

        userId = newUser.user.id
      }

      // Create profile if needed
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // Create profile
        await supabase.from("profiles").insert({
          id: userId,
          email: email,
          username: null,
          insulin_carb_ratio: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      // For existing users, we'll just return success without generating a new session
      if (existingUser) {
        return NextResponse.json({
          success: true,
          message: "User authenticated",
          properties: {
            userId: userId,
            email: email,
          },
        })
      }

      // For new users, generate a session
      const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      })

      if (sessionError) {
        console.error("Error generating session:", sessionError)
        return NextResponse.json({ error: "Failed to generate session" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "User created and authenticated",
        properties: {
          userId: userId,
          email: email,
          authLink: session.properties.action_link,
        },
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in admin API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
