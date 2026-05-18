"use client"

import Image from "next/image"
import { useTheme } from "next-themes"

const DARK_BLUE_LOGO_FOR_LIGHT_MODE = "/audit-coflow-logo-dark.jpg"
const WHITE_LOGO_FOR_DARK_MODE = "/audit-coflow-logo-light.jpg"

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
  const { resolvedTheme, theme } = useTheme()
  const activeTheme = resolvedTheme ?? theme
  const logoSrc = activeTheme === "dark" ? WHITE_LOGO_FOR_DARK_MODE : DARK_BLUE_LOGO_FOR_LIGHT_MODE

  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <Image
        src={logoSrc}
        alt="AuditNett"
        width={92}
        height={92}
        priority
        className={`shrink-0 object-cover shadow-sm ${imageClassName}`}
      />
      {!collapsed && (
        <div className="min-w-0">
          <h1 className={`truncate text-xl font-bold ${textClassName}`}>AuditNett</h1>
        </div>
      )}
    </div>
  )
}
