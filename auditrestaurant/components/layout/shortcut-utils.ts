export type ShortcutAction =
  | "sidebar"
  | "inventory"
  | "audits"
  | "reports"
  | "assignedWork"
  | "team"
  | "settings"
  | "profile"
  | "notifications"
  | "theme"
  | "logout"

const shortcutKeys: Record<ShortcutAction, string> = {
  sidebar: "\\",
  inventory: "I",
  audits: "A",
  reports: "R",
  assignedWork: "J",
  team: "T",
  settings: "S",
  profile: "P",
  notifications: "N",
  theme: "B",
  logout: "Space",
}

export function isMacPlatform() {
  if (typeof navigator === "undefined") return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

export function formatShortcut(action: ShortcutAction) {
  const modifier = isMacPlatform() ? "⌘" : "Ctrl"
  if (action === "sidebar") return `${modifier} + ${shortcutKeys[action]}`
  if (action === "notifications") return isMacPlatform() ? `^ + ${modifier} + N` : `Ctrl + Alt + N`
  if (action === "assignedWork") return `${modifier} + ${shortcutKeys[action]}`
  if (action === "team") return `Fn + ${modifier} + ${shortcutKeys[action]}`
  if (action === "theme") return `${modifier} + ${shortcutKeys[action]}`
  if (action === "logout") return `Shift + ${modifier} + Space`
  return `Shift + ${modifier} + ${shortcutKeys[action]}`
}

export function withShortcut(label: string, action: ShortcutAction) {
  return `${label} ${formatShortcut(action)}`
}

export function shouldIgnoreShortcut(event: KeyboardEvent) {
  if (event.defaultPrevented) return true

  const target = event.target
  if (!(target instanceof HTMLElement)) return false

  const tagName = target.tagName.toLowerCase()
  const isEditableElement =
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable ||
    target.closest("[contenteditable='true']")

  return Boolean(isEditableElement)
}
