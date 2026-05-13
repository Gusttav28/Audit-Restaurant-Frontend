"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

const LIGHT_MODE_ICON = "/audit-coflow-logo-light.jpg"
const DARK_MODE_ICON = "/audit-coflow-logo-dark.jpg"

function ensureIconLink(rel: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!link) {
    link = document.createElement("link")
    link.rel = rel
    document.head.appendChild(link)
  }
  return link
}

function applyIcon(link: HTMLLinkElement, href: string) {
  link.href = href
  link.type = "image/jpeg"
  link.removeAttribute("media")
}

export default function ThemeFavicon() {
  const { resolvedTheme, theme } = useTheme()

  useEffect(() => {
    const activeTheme = resolvedTheme ?? theme
    const href = activeTheme === "dark" ? DARK_MODE_ICON : LIGHT_MODE_ICON

    document
      .querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
      .forEach((link) => applyIcon(link, href))

    for (const rel of ["icon", "shortcut icon", "apple-touch-icon"]) {
      applyIcon(ensureIconLink(rel), href)
    }
  }, [resolvedTheme, theme])

  return null
}
