import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const fullPermissions = { read: true, audit: true, create: true, edit: true, delete: true }

const defaultRestaurantSettings = {
  auditNotifications: true,
  inventoryAlerts: true,
  weeklyReports: true,
  lowStockThreshold: 5,
}

const hasValidPassword = (password: string) => password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")
    const company = String(body.company ?? "").trim()
    const workspaceName = company || `${name || email.split("@")[0]}'s Restaurant`

    if (!name || !email || !hasValidPassword(password)) {
      return NextResponse.json({ error: "Missing signup fields" }, { status: 400 })
    }

    const admin = createSupabaseAdminClient() as any
    const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, company: workspaceName },
    })

    if (createUserError || !createdUser.user) {
      return NextResponse.json({ error: createUserError?.message ?? "Could not create user" }, { status: 400 })
    }

    const userId = createdUser.user.id

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: name,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .insert({
        name: workspaceName,
        country: "Costa Rica",
        location: "Costa Rica",
        address: "",
        email,
        phone: "",
        default_currency: "CRC",
        exchange_rate_to_usd: 1 / 506,
        settings: defaultRestaurantSettings,
        created_by: userId,
      })
      .select("*")
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: restaurantError?.message ?? "Could not create restaurant workspace" }, { status: 400 })
    }

    const { error: memberError } = await admin
      .from("restaurant_members")
      .upsert(
        {
          restaurant_id: restaurant.id,
          user_id: userId,
          role: "owner",
          permissions: fullPermissions,
        },
        { onConflict: "restaurant_id,user_id" },
      )

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    const { error: inventoryTypeError } = await admin
      .from("inventory_types")
      .insert({
        restaurant_id: restaurant.id,
        name: "Kitchen",
        color: "#3b82f6",
        active: true,
        sort_order: 1,
      })

    if (inventoryTypeError) {
      return NextResponse.json({ error: inventoryTypeError.message }, { status: 400 })
    }

    return NextResponse.json({ userId, restaurantId: restaurant.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected signup workspace error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
