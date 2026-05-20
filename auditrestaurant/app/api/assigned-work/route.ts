import { NextResponse } from "next/server"
import { getAppUrl, sendAuditAssignmentEmail } from "@/lib/email/resend"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const canManageAssignedWork = (member: any, restaurantCreatedBy: string | null, userId: string) =>
  restaurantCreatedBy === userId || member?.role === "owner" || member?.role === "admin"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const auditId = String(body.auditId ?? "")
    const restaurantId = String(body.restaurantId ?? "")
    const inventoryTypeId = String(body.inventoryTypeId ?? "")
    const auditorId = String(body.auditorId ?? "").trim()
    const auditorName = String(body.auditorName ?? "").trim()
    const dueDate = String(body.dueDate ?? "")
    const status = String(body.status ?? "in-progress")
    const notes = String(body.notes ?? "")
    const helperName = String(body.helperName ?? "").trim()
    const temporaryHelperName = String(body.temporaryHelperName ?? "").trim()

    if (!auditId || !restaurantId || !inventoryTypeId || !auditorName) {
      return NextResponse.json({ error: "Missing assigned work fields" }, { status: 400 })
    }

    const supabase = (await createSupabaseServerClient()) as any
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createSupabaseAdminClient() as any

    const { data: restaurant, error: restaurantError } = await admin
      .from("restaurants")
      .select("id,name,created_by")
      .eq("id", restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: restaurantError?.message ?? "Restaurant not found" }, { status: 404 })
    }

    const { data: requesterMember, error: memberError } = await admin
      .from("restaurant_members")
      .select("role,permissions")
      .eq("restaurant_id", restaurantId)
      .eq("user_id", authData.user.id)
      .maybeSingle()

    if (memberError || !canManageAssignedWork(requesterMember, restaurant.created_by, authData.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: existingAudit, error: existingAuditError } = await admin
      .from("audits")
      .select("id,audit_code,auditor_id,auditor_name,restaurant_id,inventory_type_id,status,created_date,notes")
      .eq("id", auditId)
      .eq("restaurant_id", restaurantId)
      .single()

    if (existingAuditError || !existingAudit) {
      return NextResponse.json({ error: existingAuditError?.message ?? "Assigned work not found" }, { status: 404 })
    }

    const { data: inventoryType, error: inventoryTypeError } = await admin
      .from("inventory_types")
      .select("id,name")
      .eq("id", inventoryTypeId)
      .eq("restaurant_id", restaurantId)
      .single()

    if (inventoryTypeError || !inventoryType) {
      return NextResponse.json({ error: inventoryTypeError?.message ?? "Inventory not found" }, { status: 404 })
    }

    if (auditorId) {
      const { data: auditorMember, error: auditorMemberError } = await admin
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", restaurantId)
        .eq("user_id", auditorId)
        .maybeSingle()

      if (auditorMemberError || !auditorMember) {
        return NextResponse.json({ error: "Selected auditor does not have access to this restaurant" }, { status: 400 })
      }
    }

    const { data: updatedAudit, error: updateError } = await admin
      .from("audits")
      .update({
        inventory_type_id: inventoryTypeId,
        auditor_id: auditorId || null,
        auditor_name: auditorName,
        created_date: dueDate || existingAudit.created_date,
        started_date: dueDate || existingAudit.created_date,
        status,
        notes,
      })
      .eq("id", auditId)
      .eq("restaurant_id", restaurantId)
      .select("*")
      .single()

    if (updateError || !updatedAudit) {
      return NextResponse.json({ error: updateError?.message ?? "Could not update assigned work" }, { status: 400 })
    }

    if (auditorId && auditorId !== existingAudit.auditor_id) {
      const [{ data: assigneeProfile }, { data: assignerProfile }] = await Promise.all([
        admin.from("profiles").select("email,full_name").eq("id", auditorId).maybeSingle(),
        admin.from("profiles").select("email,full_name").eq("id", authData.user.id).maybeSingle(),
      ])

      if (assigneeProfile?.email) {
        const assignmentEmail = await sendAuditAssignmentEmail({
          to: assigneeProfile.email,
          name: assigneeProfile.full_name ?? auditorName,
          auditCode: updatedAudit.audit_code,
          restaurantName: restaurant.name ?? "Assigned restaurant",
          inventoryName: inventoryType.name ?? "Assigned inventory",
          dueDate: dueDate || updatedAudit.created_date,
          assignedBy: assignerProfile?.full_name ?? assignerProfile?.email ?? "Admin",
          helperName,
          temporaryHelperName,
          auditUrl: `${getAppUrl()}/audits/${encodeURIComponent(updatedAudit.audit_code)}`,
          status,
        })
        if (!assignmentEmail.ok) {
          console.error("Assigned work update email could not be sent", {
            auditId: updatedAudit.id,
            auditCode: updatedAudit.audit_code,
            to: assigneeProfile.email,
            error: assignmentEmail.error,
          })
        }
      }
    }

    return NextResponse.json({ audit: updatedAudit })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected assigned work error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
