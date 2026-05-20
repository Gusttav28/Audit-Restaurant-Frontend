import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type AuditItemPayload = {
  inventoryItemRemoteId?: string | null
  itemName?: string
  category?: string
  previousStock?: number
  unit?: string
  unitPrice?: number
  phase?: "none" | "production" | "merma" | null
  mermaQuantity?: number | null
  productionQuantity?: number | null
}

const canCreateAudit = (member: any, isCreatorOwner: boolean) => {
  if (isCreatorOwner || member?.role === "owner" || member?.role === "admin") return true
  const permissions = member?.permissions && typeof member.permissions === "object" ? member.permissions : {}
  return Boolean(permissions.audit || permissions.create)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const restaurantId = String(body.restaurantId ?? "")
    const inventoryTypeId = String(body.inventoryTypeId ?? "")
    const auditCode = String(body.auditCode ?? "").trim()
    const auditorName = String(body.auditorName ?? "").trim()
    const requestedAuditorId = String(body.auditorId ?? "").trim()
    const auditDate = String(body.auditDate ?? new Date().toISOString().split("T")[0])
    const notes = String(body.notes ?? "")
    const items = Array.isArray(body.items) ? (body.items as AuditItemPayload[]) : []

    if (!restaurantId || !inventoryTypeId || !auditCode || !auditorName) {
      return NextResponse.json({ error: "Missing audit fields" }, { status: 400 })
    }

    const supabase = (await createSupabaseServerClient()) as any
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createSupabaseAdminClient() as any

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .select("id,created_by")
      .eq("id", restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: restaurantError?.message ?? "Restaurant not found" }, { status: 404 })
    }

    const { data: member, error: memberError } = await admin
      .from("restaurant_members")
      .select("role,permissions")
      .eq("restaurant_id", restaurantId)
      .eq("user_id", authData.user.id)
      .maybeSingle()

    const isCreatorOwner = restaurant.created_by === authData.user.id
    if (memberError || !canCreateAudit(member, isCreatorOwner)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: inventoryType, error: inventoryTypeError } = await admin
      .from("inventory_types")
      .select("id")
      .eq("id", inventoryTypeId)
      .eq("restaurant_id", restaurantId)
      .single()

    if (inventoryTypeError || !inventoryType) {
      return NextResponse.json({ error: inventoryTypeError?.message ?? "Inventory not found" }, { status: 404 })
    }

    const isAdminUser = isCreatorOwner || member?.role === "owner" || member?.role === "admin"
    const auditorId = isAdminUser && requestedAuditorId ? requestedAuditorId : authData.user.id

    if (auditorId) {
      const { data: auditorMember, error: auditorMemberError } = await admin
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", restaurantId)
        .eq("user_id", auditorId)
        .maybeSingle()

      if (auditorMemberError || (!auditorMember && auditorId !== authData.user.id && restaurant.created_by !== auditorId)) {
        return NextResponse.json({ error: "Selected auditor does not have access to this restaurant" }, { status: 400 })
      }
    }

    const { data: audit, error: auditError } = await admin
      .from("audits")
      .insert({
        restaurant_id: restaurantId,
        inventory_type_id: inventoryTypeId,
        audit_code: auditCode,
        auditor_id: auditorId,
        auditor_name: auditorName,
        created_date: auditDate,
        started_date: auditDate,
        completed_date: null,
        status: "in-progress",
        total_items: items.length,
        counted_items: 0,
        flagged_items: 0,
        total_discrepancy: 0,
        compliance: 0,
        notes,
      })
      .select("*")
      .single()

    if (auditError || !audit) {
      return NextResponse.json({ error: auditError?.message ?? "Could not create audit" }, { status: 400 })
    }

    const auditItems = items.length
      ? await admin
          .from("audit_items")
          .insert(
            items.map((item) => ({
              audit_id: audit.id,
              inventory_item_id: item.inventoryItemRemoteId ?? null,
              item_name: String(item.itemName ?? ""),
              category: String(item.category ?? ""),
              previous_stock: Number(item.previousStock ?? 0),
              current_stock: null,
              unit: String(item.unit ?? "pieces"),
              unit_price: Number(item.unitPrice ?? 0),
              phase: item.phase ?? null,
              merma_quantity: item.mermaQuantity ?? null,
              production_quantity: item.productionQuantity ?? null,
              difference: null,
              result: "pending",
              notes: "",
            })),
          )
          .select("*")
      : { data: [], error: null }

    if (auditItems.error) {
      await admin.from("audits").delete().eq("id", audit.id)
      return NextResponse.json({ error: auditItems.error.message }, { status: 400 })
    }

    let comment = null
    if (notes.trim()) {
      const { data: createdComment, error: commentError } = await admin
        .from("audit_comments")
        .insert({
          audit_id: audit.id,
          author_id: authData.user.id,
          author_name: auditorName,
          content: notes.trim(),
        })
        .select("*")
        .single()

      if (commentError) {
        await admin.from("audit_items").delete().eq("audit_id", audit.id)
        await admin.from("audits").delete().eq("id", audit.id)
        return NextResponse.json({ error: commentError.message }, { status: 400 })
      }
      comment = createdComment
    }

    return NextResponse.json({ audit, auditItems: auditItems.data ?? [], comment })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected audit creation error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
