import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const fullPermissions = { read: true, audit: true, create: true, edit: true, delete: true }

const defaultRestaurantSettings = {
  auditNotifications: true,
  inventoryAlerts: true,
  weeklyReports: true,
  lowStockThreshold: 5,
}

const assertPrimaryAdmin = async (admin: any, userId: string) => {
  const { data: ownerMemberships, error: memberError } = await admin
    .from("restaurant_members")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .limit(1)

  if (memberError) {
    return { ok: false as const, response: NextResponse.json({ error: memberError.message }, { status: 400 }) }
  }

  if (ownerMemberships?.length) {
    return { ok: true as const }
  }

  const { data: ownedRestaurants, error: restaurantError } = await admin
    .from("restaurants")
    .select("id")
    .eq("created_by", userId)
    .limit(1)

  if (restaurantError) {
    return { ok: false as const, response: NextResponse.json({ error: restaurantError.message }, { status: 400 }) }
  }

  if (!ownedRestaurants?.length) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true as const }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? "").trim()
    const country = String(body.country ?? body.location ?? "United States").trim()
    const location = String(body.location ?? body.address ?? country).trim()
    const address = String(body.address ?? "").trim()
    const email = String(body.email ?? "").trim()
    const phone = String(body.phone ?? "").trim()
    const defaultCurrency = String(body.defaultCurrency ?? "USD") === "CRC" ? "CRC" : "USD"
    const exchangeRateToUsd = Number(body.exchangeRateToUsd ?? 1)

    if (!name || !country) {
      return NextResponse.json({ error: "Missing restaurant fields" }, { status: 400 })
    }

    const supabase = (await createSupabaseServerClient()) as any
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createSupabaseAdminClient() as any
    const access = await assertPrimaryAdmin(admin, authData.user.id)
    if (!access.ok) return access.response

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .insert({
        name,
        country,
        location,
        address,
        email,
        phone,
        default_currency: defaultCurrency,
        exchange_rate_to_usd: Number.isFinite(exchangeRateToUsd) ? exchangeRateToUsd : 1,
        settings: defaultRestaurantSettings,
        created_by: authData.user.id,
      })
      .select("*")
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: restaurantError?.message ?? "Could not create restaurant" }, { status: 400 })
    }

    const { data: member, error: memberError } = await admin
      .from("restaurant_members")
      .upsert(
        {
          restaurant_id: restaurant.id,
          user_id: authData.user.id,
          role: "owner",
          permissions: fullPermissions,
        },
        { onConflict: "restaurant_id,user_id" },
      )
      .select("*")
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: memberError?.message ?? "Could not create owner access" }, { status: 400 })
    }

    const { data: inventoryType, error: inventoryTypeError } = await admin
      .from("inventory_types")
      .insert({
        restaurant_id: restaurant.id,
        name: "Kitchen",
        color: "#3b82f6",
        active: true,
        sort_order: 1,
      })
      .select("*")
      .single()

    if (inventoryTypeError || !inventoryType) {
      return NextResponse.json({ error: inventoryTypeError?.message ?? "Could not create inventory type" }, { status: 400 })
    }

    const { data: verifiedMember, error: verifyError } = await admin
      .from("restaurant_members")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("user_id", authData.user.id)
      .single()

    if (verifyError || !verifiedMember || verifiedMember.role !== "owner") {
      return NextResponse.json({ error: "Owner access could not be verified" }, { status: 400 })
    }

    return NextResponse.json({ restaurant, member: verifiedMember, inventoryType })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected restaurant creation error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
