import { NextResponse } from "next/server"
import { getAppUrl, sendTeamMemberWelcomeEmail } from "@/lib/email/resend"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PermissionPayload = {
  read?: boolean
  audit?: boolean
  create?: boolean
  edit?: boolean
  delete?: boolean
}

const normalizePermissions = (permissions: PermissionPayload, dbRole: string) =>
  dbRole === "admin"
    ? { read: true, audit: true, create: true, edit: true, delete: true }
    : {
        read: permissions.read ?? true,
        audit: permissions.audit ?? permissions.create ?? false,
        create: permissions.create ?? false,
        edit: permissions.edit ?? false,
        delete: permissions.delete ?? false,
      }

const hasValidPassword = (password: string) => password.length >= 8 && /[A-Z]/.test(password)

const parseRestaurantIds = (value: unknown, fallbackId: string) =>
  Array.from(new Set((Array.isArray(value) ? value : [fallbackId]).map((id: unknown) => String(id ?? "")).filter(Boolean)))

const assertPrimaryAdmin = async (admin: any, restaurantId: string, userId: string) => {
  const { data: requesterMember, error: memberError } = await admin
    .from("restaurant_members")
    .select("role")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", userId)
    .single()

  if (memberError || !requesterMember) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  if (requesterMember.role !== "owner") {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true as const }
}

const assertPrimaryAdminForRestaurants = async (admin: any, restaurantIds: string[], userId: string) => {
  for (const restaurantId of restaurantIds) {
    const access = await assertPrimaryAdmin(admin, restaurantId, userId)
    if (!access.ok) return access
  }
  return { ok: true as const }
}

const findUserByEmail = async (admin: any, email: string) => {
  const { data: profile } = await admin
    .from("profiles")
    .select("id,email,full_name")
    .eq("email", email)
    .maybeSingle()

  if (profile?.id) return { userId: profile.id as string, profile }
  return { userId: null, profile: null }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const restaurantId = String(body.restaurantId ?? "")
    const restaurantIds = parseRestaurantIds(body.restaurantIds, restaurantId)
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")
    const dbRole = String(body.dbRole ?? "collaborator")
    const permissions = (body.permissions ?? {}) as PermissionPayload

    if (!restaurantIds.length || !name || !email || !hasValidPassword(password)) {
      return NextResponse.json({ error: "Missing team member fields" }, { status: 400 })
    }

    const supabase = (await createSupabaseServerClient()) as any
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createSupabaseAdminClient() as any
    const access = await assertPrimaryAdminForRestaurants(admin, restaurantIds, authData.user.id)
    if (!access.ok) return access.response

    let userId: string | null = null
    const existingUser = await findUserByEmail(admin, email)
    userId = existingUser.userId

    if (!userId) {
      const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      })

      if (createUserError || !createdUser.user) {
        return NextResponse.json({ error: createUserError?.message ?? "Could not create user" }, { status: 400 })
      }
      userId = createdUser.user.id
    }

    await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: name,
    })

    const normalizedPermissions = normalizePermissions(permissions, dbRole)

    const members = []
    for (const targetRestaurantId of restaurantIds) {
      const { data: member, error: insertMemberError } = await admin
        .from("restaurant_members")
        .upsert(
          {
            restaurant_id: targetRestaurantId,
            user_id: userId,
            role: dbRole as "admin" | "auditor" | "collaborator",
            permissions: normalizedPermissions,
          },
          { onConflict: "restaurant_id,user_id" },
        )
        .select("*")
        .single()

      if (insertMemberError) {
        return NextResponse.json({ error: insertMemberError.message }, { status: 400 })
      }
      members.push(member)
    }

    const [{ data: restaurantRows }, { data: creatorProfile }] = await Promise.all([
      admin.from("restaurants").select("name").in("id", restaurantIds),
      admin.from("profiles").select("full_name,email").eq("id", authData.user.id).maybeSingle(),
    ])
    const welcomeEmail = await sendTeamMemberWelcomeEmail({
      to: email,
      name,
      role: dbRole === "admin" ? "Admin" : dbRole === "auditor" ? "Read + Audit" : "Collaborator",
      restaurantNames: ((restaurantRows ?? []) as Array<{ name?: string }>).map((restaurant) => restaurant.name ?? "Assigned restaurant"),
      loginUrl: `${getAppUrl()}/login`,
      adminName: creatorProfile?.full_name ?? creatorProfile?.email ?? undefined,
    })
    if (!welcomeEmail.ok) {
      console.error("Team member welcome email could not be sent", { email, userId, error: welcomeEmail.error })
    }

    return NextResponse.json({ member: members[0], members })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected team member error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const restaurantId = String(body.restaurantId ?? "")
    const restaurantIds = parseRestaurantIds(body.restaurantIds, restaurantId)
    const memberId = String(body.memberId ?? "")
    const userId = String(body.userId ?? "")
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const dbRole = String(body.dbRole ?? "collaborator")
    const permissions = (body.permissions ?? {}) as PermissionPayload

    if (!restaurantId || !restaurantIds.length || (!memberId && !userId) || !name || !email) {
      return NextResponse.json({ error: "Missing team member fields" }, { status: 400 })
    }

    const supabase = (await createSupabaseServerClient()) as any
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createSupabaseAdminClient() as any
    const access = await assertPrimaryAdminForRestaurants(admin, [restaurantId, ...restaurantIds], authData.user.id)
    if (!access.ok) return access.response

    const memberQuery = admin
      .from("restaurant_members")
      .select("*")
      .eq("restaurant_id", restaurantId)

    const { data: existingMember, error: existingError } = memberId
      ? await memberQuery.eq("id", memberId).single()
      : await memberQuery.eq("user_id", userId).single()

    if (existingError || !existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    if (existingMember.role === "owner") {
      return NextResponse.json({ error: "Primary admin cannot be edited here" }, { status: 400 })
    }

    const normalizedPermissions = normalizePermissions(permissions, dbRole)

    const { data: currentProfile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", existingMember.user_id)
      .single()

    if (String(currentProfile?.email ?? "").toLowerCase() !== email) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(existingMember.user_id, {
        email,
        email_confirm: true,
        user_metadata: { full_name: name },
      })

      if (authUpdateError) {
        return NextResponse.json({ error: authUpdateError.message }, { status: 400 })
      }
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .update({ full_name: name, email })
      .eq("id", existingMember.user_id)
      .select("id, email, full_name")
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    const { data: requesterOwnedMemberships, error: ownedError } = await admin
      .from("restaurant_members")
      .select("restaurant_id")
      .eq("user_id", authData.user.id)
      .eq("role", "owner")

    if (ownedError) {
      return NextResponse.json({ error: ownedError.message }, { status: 400 })
    }

    const managedRestaurantIds = ((requesterOwnedMemberships ?? []) as Array<{ restaurant_id: string }>).map((member) => member.restaurant_id)
    const membershipsToRemove = managedRestaurantIds.filter((managedRestaurantId) => !restaurantIds.includes(managedRestaurantId))

    if (membershipsToRemove.length) {
      const { error: removeError } = await admin
        .from("restaurant_members")
        .delete()
        .eq("user_id", existingMember.user_id)
        .neq("role", "owner")
        .in("restaurant_id", membershipsToRemove)

      if (removeError) {
        return NextResponse.json({ error: removeError.message }, { status: 400 })
      }
    }

    const members = []
    for (const targetRestaurantId of restaurantIds) {
      const { data: member, error: updateMemberError } = await admin
        .from("restaurant_members")
        .upsert(
          {
            restaurant_id: targetRestaurantId,
            user_id: existingMember.user_id,
            role: dbRole as "admin" | "auditor" | "collaborator",
            permissions: normalizedPermissions,
          },
          { onConflict: "restaurant_id,user_id" },
        )
        .select("*")
        .single()

      if (updateMemberError) {
        return NextResponse.json({ error: updateMemberError.message }, { status: 400 })
      }
      members.push(member)
    }

    return NextResponse.json({ member: members.find((member) => member.restaurant_id === restaurantId) ?? members[0], members, profile })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected team member update error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const restaurantId = String(body.restaurantId ?? "")
    const memberId = String(body.memberId ?? "")
    const userId = String(body.userId ?? "")

    if (!restaurantId || (!memberId && !userId)) {
      return NextResponse.json({ error: "Missing team member fields" }, { status: 400 })
    }

    const supabase = (await createSupabaseServerClient()) as any
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createSupabaseAdminClient() as any
    const access = await assertPrimaryAdmin(admin, restaurantId, authData.user.id)
    if (!access.ok) return access.response

    const memberQuery = admin
      .from("restaurant_members")
      .select("*")
      .eq("restaurant_id", restaurantId)

    const { data: existingMember, error: existingError } = memberId
      ? await memberQuery.eq("id", memberId).single()
      : await memberQuery.eq("user_id", userId).single()

    if (existingError || !existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    if (existingMember.role === "owner") {
      return NextResponse.json({ error: "Primary admin cannot be removed" }, { status: 400 })
    }

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(existingMember.user_id)

    if (authDeleteError) {
      return NextResponse.json({ error: authDeleteError.message }, { status: 400 })
    }

    const { error: deleteError } = await admin
      .from("restaurant_members")
      .delete()
      .eq("id", existingMember.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected team member delete error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
