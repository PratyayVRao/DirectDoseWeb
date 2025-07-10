import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, secretKey } = await request.json()

    // Verify the secret key (you should set this in your environment variables)
    const expectedSecretKey = "directdose-admin-key" // Replace with a secure key

    if (secretKey !== expectedSecretKey) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 403 })
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

    // Update the user's profile to make them an admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_admin: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)
      return NextResponse.json({ error: "Failed to make user an admin" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "User is now an admin" })
  } catch (error) {
    console.error("Error in make-admin API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
