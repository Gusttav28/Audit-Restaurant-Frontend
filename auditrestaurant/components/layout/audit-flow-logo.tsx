"use client"

import Image from "next/image"

interface AuditFlowLogoProps {
  collapsed?: boolean
  className?: string
  imageClassName?: string
  textClassName?: string
}

export default function AuditFlowLogo({
  collapsed = false,
  className = "",
  imageClassName = "h-9 w-9 rounded-lg",
  textClassName = "text-sidebar-foreground",
}: AuditFlowLogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <Image
        src="/audit-coflow-logo-dark.jpg"
        alt="Audit Coflow"
        width={92}
        height={92}
        priority
        className={`hidden shrink-0 object-cover shadow-sm dark:block ${imageClassName}`}
      />
      <Image
        src="/audit-coflow-logo-light.jpg"
        alt="Audit Coflow"
        width={92}
        height={92}
        priority
        className={`shrink-0 object-cover shadow-sm dark:hidden ${imageClassName}`}
      />
      {!collapsed && (
        <div className="min-w-0">
          <h1 className={`truncate text-xl font-bold ${textClassName}`}>Audit Coflow</h1>
        </div>
      )}
    </div>
  )
}
