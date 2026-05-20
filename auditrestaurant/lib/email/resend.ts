import "server-only"

import { Resend } from "resend"

type EmailResult = {
  ok: boolean
  id?: string
  error?: string
}

type WelcomeEmailInput = {
  to: string
  name: string
  role: string
  restaurantNames: string[]
  loginUrl: string
  adminName?: string
}

type AssignmentEmailInput = {
  to: string
  name: string
  auditCode: string
  restaurantName: string
  inventoryName: string
  dueDate: string
  assignedBy?: string
  helperName?: string
  temporaryHelperName?: string
  auditUrl: string
  status?: string
}

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

const appName = "AuditNett"
const defaultFrom = "AuditNett <noreply@ggraphsystems.com>"

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || defaultFrom

export const getAppUrl = () =>
  (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || "http://localhost:3000").replace(/\/$/, "")

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const button = (href: string, label: string) => `
  <a href="${escapeHtml(href)}" style="display:inline-block;border-radius:12px;background:#2563eb;color:#ffffff;font-weight:700;text-decoration:none;padding:13px 20px;">
    ${escapeHtml(label)}
  </a>
`

const shell = (content: string) => `
  <!doctype html>
  <html>
    <body style="margin:0;background:#0b0d12;font-family:Inter,Arial,sans-serif;color:#f8fafc;">
      <div style="display:none;max-height:0;overflow:hidden;">${appName} notification</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0d12;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border:1px solid #243041;border-radius:24px;overflow:hidden;background:#111827;">
              <tr>
                <td style="padding:28px 28px 18px;border-bottom:1px solid #243041;">
                  <div style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:#60a5fa;font-weight:700;">${appName}</div>
                  <div style="margin-top:8px;font-size:13px;color:#94a3b8;">Inventory audits, assigned work, and restaurant operations in one workspace.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:20px 28px;border-top:1px solid #243041;color:#94a3b8;font-size:12px;line-height:1.6;">
                  This email was sent by ${appName}. If you were not expecting it, contact your workspace administrator.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const detailRow = (label: string, value: string) => `
  <tr>
    <td style="padding:10px 0;color:#94a3b8;font-size:13px;">${escapeHtml(label)}</td>
    <td align="right" style="padding:10px 0;color:#f8fafc;font-size:13px;font-weight:700;">${escapeHtml(value || "None")}</td>
  </tr>
`

async function sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<EmailResult> {
  if (!resend) {
    console.warn("Resend email skipped: RESEND_API_KEY is not configured")
    return { ok: false, error: "RESEND_API_KEY is not configured" }
  }

  const { data, error } = await resend.emails.send({
    from: getFromEmail(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  })

  if (error) {
    console.error("Resend email failed", { message: error.message, to: input.to, subject: input.subject })
    return { ok: false, error: error.message }
  }

  return { ok: true, id: data?.id }
}

export async function sendTeamMemberWelcomeEmail(input: WelcomeEmailInput) {
  const restaurantList = input.restaurantNames.length ? input.restaurantNames.join(", ") : "Assigned restaurant"
  const html = shell(`
    <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;color:#ffffff;">Welcome to ${appName}, ${escapeHtml(input.name)}</h1>
    <p style="margin:0 0 22px;color:#cbd5e1;font-size:16px;line-height:1.7;">
      ${escapeHtml(input.adminName || "Your administrator")} created your account so you can access assigned restaurant inventory and audit workflows.
    </p>
    ${button(input.loginUrl, "Open login")}
    <div style="margin:26px 0 18px;border:1px solid #243041;border-radius:18px;background:#0f172a;padding:18px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detailRow("Role", input.role)}
        ${detailRow("Restaurant access", restaurantList)}
        ${detailRow("Login email", input.to)}
      </table>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7;">
      Use the login button above, then sign in with the credentials your administrator created for you.
      If the button does not work, paste this link into your browser:<br />
      <span style="color:#60a5fa;word-break:break-all;">${escapeHtml(input.loginUrl)}</span>
    </p>
  `)

  return sendEmail({
    to: input.to,
    subject: `Welcome to ${appName}`,
    html,
    text: [
      `Welcome to ${appName}, ${input.name}.`,
      `${input.adminName || "Your administrator"} created your account.`,
      `Role: ${input.role}`,
      `Restaurant access: ${restaurantList}`,
      `Login: ${input.loginUrl}`,
    ].join("\n"),
  })
}

export async function sendAuditAssignmentEmail(input: AssignmentEmailInput) {
  const html = shell(`
    <h1 style="margin:0 0 14px;font-size:30px;line-height:1.15;color:#ffffff;">New audit work assigned</h1>
    <p style="margin:0 0 22px;color:#cbd5e1;font-size:16px;line-height:1.7;">
      Hi ${escapeHtml(input.name)}, you have been assigned audit work in ${appName}. Review the details and open the audit when you are ready.
    </p>
    ${button(input.auditUrl, "Open assigned audit")}
    <div style="margin:26px 0 18px;border:1px solid #243041;border-radius:18px;background:#0f172a;padding:18px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${detailRow("Audit ID", input.auditCode)}
        ${detailRow("Restaurant", input.restaurantName)}
        ${detailRow("Inventory", input.inventoryName)}
        ${detailRow("Due date", input.dueDate)}
        ${detailRow("Assigned by", input.assignedBy || "Admin")}
        ${detailRow("Helper", input.helperName || input.temporaryHelperName || "None")}
        ${detailRow("Status", input.status || "In progress")}
      </table>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7;">
      If the button does not work, paste this link into your browser:<br />
      <span style="color:#60a5fa;word-break:break-all;">${escapeHtml(input.auditUrl)}</span>
    </p>
  `)

  return sendEmail({
    to: input.to,
    subject: `Assigned audit: ${input.inventoryName}`,
    html,
    text: [
      `Hi ${input.name}, you have new audit work assigned.`,
      `Audit ID: ${input.auditCode}`,
      `Restaurant: ${input.restaurantName}`,
      `Inventory: ${input.inventoryName}`,
      `Due date: ${input.dueDate}`,
      `Assigned by: ${input.assignedBy || "Admin"}`,
      `Open audit: ${input.auditUrl}`,
    ].join("\n"),
  })
}
