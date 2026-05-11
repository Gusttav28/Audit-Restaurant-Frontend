"use client"
import { useState } from "react"
import { Trash2, AlertCircle, CheckCircle, Eye, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/components/app-context"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"

interface InventoryItem {
  id: number
  name: string
  type: string
  category: string
  quantity: number
  unit: string
  minStock: number
  status: string
  price: number
  priceCurrency?: "USD" | "CRC"
  phase?: "none" | "production" | "merma"
  mermaQuantity?: number
  productionQuantity?: number
  lastUpdated: string
  supplier: string
  daysUntilExpiry: number | null
  stockHistory?: Array<{
    auditId: string
    completedDate: string
    previousStock: number
    newStock: number
  }>
  auditPreviousStock?: number
  auditCurrentStock?: number | null
  auditDifference?: number | null
  auditResult?: "pending" | "sold" | "discrepancy" | "matched"
}

interface InventoryTableProps {
  items: InventoryItem[]
  onUpdateItem: (id: number, data: any) => void
  onDeleteItem: (id: number) => void | Promise<{ ok: boolean; error?: string }>
  onEditItem: (item: InventoryItem) => void
  readOnly?: boolean
}

export default function InventoryTable({ items, onUpdateItem, onDeleteItem, onEditItem, readOnly = false }: InventoryTableProps) {
  const { formatCurrency, t, isAdmin, can } = useAppContext()
  const canEditInventory = !readOnly && can("edit")
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [phaseItem, setPhaseItem] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [deleteWord, setDeleteWord] = useState("")
  const [deleteItemId, setDeleteItemId] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [draftPhase, setDraftPhase] = useState<Record<number, { phase: InventoryItem["phase"] | ""; mermaQuantity: string; productionQuantity: string }>>({})
  const [editingPhaseRows, setEditingPhaseRows] = useState<Record<number, boolean>>({})
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-emerald-600 text-white"
      case "low":
        return "bg-destructive text-white"
      case "warning":
        return "bg-yellow-500 text-white"
      case "critical":
        return "bg-destructive text-white"
      default:
        return "bg-yellow-500 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    return status === "good" ? <CheckCircle size={16} /> : <AlertCircle size={16} />
  }

  const getDraft = (item: InventoryItem) =>
    draftPhase[item.id] ?? {
      phase: item.phase ?? "",
      mermaQuantity: item.mermaQuantity?.toString() ?? "",
      productionQuantity: item.productionQuantity?.toString() ?? "",
    }

  const getPhaseLabel = (phase?: InventoryItem["phase"] | "") => {
    if (phase === "merma") return t("mermaStock")
    if (phase === "production") return t("productionStock")
    if (phase === "none") return t("noProductionStock")
    return "-"
  }

  const getPhaseDisplay = (item: InventoryItem) => {
    if (item.phase === "merma") return `${item.mermaQuantity ?? 0} ${item.unit} ${t("mermaStock")}`
    if (item.phase === "production") {
      const phaseCount = [item.productionQuantity, item.mermaQuantity].filter((value) => value !== undefined && value !== null).length
      return phaseCount > 1 ? t("multiplePhases") : `${item.productionQuantity ?? 0} ${item.unit} ${t("productionStock")}`
    }
    if (item.phase === "none") return t("noProductionStock")
    return "-"
  }

  const startPhaseEdit = (item: InventoryItem) => {
    if (!canEditInventory) return
    setEditingPhaseRows((prev) => ({ ...prev, [item.id]: true }))
    setDraftPhase((prev) => ({
      ...prev,
      [item.id]: getDraft(item),
    }))
  }

  const updateDraft = (
    item: InventoryItem,
    data: Partial<{ phase: InventoryItem["phase"] | ""; mermaQuantity: string; productionQuantity: string }>,
  ) => {
    if (!canEditInventory) return
    setEditingPhaseRows((prev) => ({ ...prev, [item.id]: true }))
    setDraftPhase((prev) => ({
      ...prev,
      [item.id]: {
        ...getDraft(item),
        ...prev[item.id],
        ...data,
      },
    }))
  }

  const hasDraftChanged = (
    item: InventoryItem,
    draft: { phase: InventoryItem["phase"] | ""; mermaQuantity: string; productionQuantity: string },
  ) => {
    const savedPhase = item.phase ?? ""
    if (draft.phase !== savedPhase) return true
    if (draft.phase === "merma") return (Number.parseFloat(draft.mermaQuantity) || 0) !== (item.mermaQuantity ?? 0)
    if (draft.phase === "production") {
      return (Number.parseFloat(draft.productionQuantity) || 0) !== (item.productionQuantity ?? 0) ||
        (Number.parseFloat(draft.mermaQuantity) || 0) !== (item.mermaQuantity ?? 0)
    }
    return false
  }

  const pendingRowIds = Object.keys(draftPhase).map((id) => Number(id))
  const pendingChangeCount = pendingRowIds.length

  const openHistory = (item: InventoryItem) => {
    setIsHistoryLoading(true)
    window.setTimeout(() => {
      setHistoryItem(item)
      setIsHistoryLoading(false)
    }, 450)
  }

  const confirmDelete = async () => {
    if (!isAdmin || !can("delete")) return
    if (!deleteTarget || deleteWord !== "delete" || deleteItemId !== String(deleteTarget.id)) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await onDeleteItem(deleteTarget.id)
    setIsDeleting(false)
    if (result && !result.ok) {
      setDeleteError(result.error ?? t("requestErrorTitle"))
      return
    }
    setDeleteTarget(null)
    setDeleteWord("")
    setDeleteItemId("")
  }

  const savePhaseDraft = (itemId: number) => {
    if (!canEditInventory) return
    const draft = draftPhase[itemId]
    if (!draft) return
    onUpdateItem(itemId, {
      phase: draft.phase || undefined,
      mermaQuantity: draft.phase === "merma" || draft.phase === "production" ? Number.parseFloat(draft.mermaQuantity) || 0 : undefined,
      productionQuantity: draft.phase === "production" ? Number.parseFloat(draft.productionQuantity) || 0 : undefined,
    })
    setDraftPhase((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    setEditingPhaseRows((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const cancelPhaseDraft = (itemId: number) => {
    setDraftPhase((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    setEditingPhaseRows((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const saveAllPhaseDrafts = () => {
    if (!canEditInventory) return
    pendingRowIds.forEach((id) => {
      const draft = draftPhase[id]
      if (!draft) return
      onUpdateItem(id, {
        phase: draft.phase || undefined,
        mermaQuantity: draft.phase === "merma" || draft.phase === "production" ? Number.parseFloat(draft.mermaQuantity) || 0 : undefined,
        productionQuantity: draft.phase === "production" ? Number.parseFloat(draft.productionQuantity) || 0 : undefined,
      })
    })
    setDraftPhase({})
    setEditingPhaseRows({})
  }

  const handlePhaseKeyDown = (event: React.KeyboardEvent<HTMLElement>, item: InventoryItem) => {
    if (event.key !== "Enter") return
    event.preventDefault()
    if (pendingChangeCount <= 1) {
      savePhaseDraft(item.id)
    } else {
      saveAllPhaseDrafts()
    }
  }

  return (
    <>
    <div className="overflow-x-auto">
      <table className="min-w-[1040px] w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Item Name</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
              {readOnly ? t("previousStock") : "Quantity"}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
              {readOnly ? t("currentStock") : "Min Stock"}
            </th>
            {readOnly ? (
              <>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t("difference")}</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t("result")}</th>
              </>
            ) : (
              <>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t("itemPhase")}</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
              </>
            )}
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t("pricePerUnit")}</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{t("totalValue")}</th>
            {!readOnly && <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                <td className="py-3 px-4">
                  <span className="text-primary font-medium">{item.type}</span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                <td className="py-3 px-4">
                  <span className="font-medium text-foreground">
                    {readOnly ? item.auditPreviousStock ?? item.quantity : item.quantity} {item.unit}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {readOnly ? item.auditCurrentStock ?? "-" : item.minStock} {item.unit}
                </td>
                {readOnly ? (
                  <>
                    <td className={`py-3 px-4 font-semibold ${(item.auditDifference ?? 0) < 0 ? "text-destructive" : "text-accent"}`}>
                      {item.auditDifference === null || item.auditDifference === undefined ? "-" : `${item.auditDifference > 0 ? "+" : ""}${item.auditDifference} ${item.unit}`}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.auditResult === "sold" ? t("sold") : item.auditResult === "discrepancy" ? t("discrepancy") : item.auditResult === "matched" ? t("matched") : t("pending")}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4">
                      {canEditInventory && (editingPhaseRows[item.id] || !item.phase) ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <select
                            value={getDraft(item).phase}
                            onFocus={() => startPhaseEdit(item)}
                            onKeyDown={(event) => handlePhaseKeyDown(event, item)}
                            onChange={(event) => {
                              const nextPhase = event.target.value as InventoryItem["phase"] | ""
                              updateDraft(item, {
                                phase: nextPhase,
                                mermaQuantity: nextPhase === "merma" || nextPhase === "production" ? getDraft(item).mermaQuantity : "",
                                productionQuantity: nextPhase === "production" ? getDraft(item).productionQuantity : "",
                              })
                            }}
                            className="w-full rounded-lg border border-primary/40 bg-primary/10 px-2 py-1.5 font-medium text-foreground focus:outline-none focus:border-accent sm:w-44"
                          >
                            <option value="">-</option>
                            <option value="none">{t("noProductionStock")}</option>
                            <option value="production">{t("productionStock")}</option>
                            <option value="merma">{t("mermaStock")}</option>
                          </select>
                          {(getDraft(item).phase === "merma" || getDraft(item).phase === "production") && (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={getDraft(item).mermaQuantity}
                              onFocus={() => startPhaseEdit(item)}
                              onKeyDown={(event) => handlePhaseKeyDown(event, item)}
                              onChange={(event) => updateDraft(item, { mermaQuantity: event.target.value })}
                              placeholder={t("mermaQuantity")}
                              className="w-full rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-foreground focus:outline-none focus:border-accent sm:w-28"
                            />
                          )}
                          {getDraft(item).phase === "production" && (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={getDraft(item).productionQuantity}
                              onFocus={() => startPhaseEdit(item)}
                              onKeyDown={(event) => handlePhaseKeyDown(event, item)}
                              onChange={(event) => updateDraft(item, { productionQuantity: event.target.value })}
                              placeholder={t("productionQuantity")}
                              className="w-full rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-foreground focus:outline-none focus:border-accent sm:w-28"
                            />
                          )}
                        </div>
                      ) : canEditInventory ? (
                        <button
                          type="button"
                          onClick={() => {
                            const hasMultiplePhases = item.phase === "production" && item.mermaQuantity !== undefined && item.productionQuantity !== undefined
                            if (hasMultiplePhases) {
                              setPhaseItem(item)
                            } else {
                              startPhaseEdit(item)
                            }
                          }}
                          className="rounded-lg border border-transparent px-2 py-1 text-left font-medium text-foreground transition-colors hover:border-border hover:bg-secondary/30 focus:outline-none focus:border-accent"
                          title={getPhaseLabel(item.phase)}
                        >
                          {getPhaseDisplay(item)}
                        </button>
                      ) : (
                        <span className="rounded-lg px-2 py-1 text-left font-medium text-foreground">
                          {getPhaseDisplay(item)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status === "good" ? t("stable") : item.status === "warning" ? t("warning") : item.status === "critical" ? t("critical") : t("lowStock")}
                      </span>
                    </td>
                  </>
                )}
                <td className="py-3 px-4 text-foreground font-medium">{formatCurrency(item.price)}</td>
                <td className="py-3 px-4 text-foreground font-semibold">{formatCurrency(item.price * (readOnly ? item.auditCurrentStock ?? 0 : item.quantity))}</td>
                {!readOnly && <td className="py-3 px-4 flex gap-2">
                  {canEditInventory && pendingChangeCount === 1 && pendingRowIds.includes(item.id) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                        onClick={() => savePhaseDraft(item.id)}
                        title={t("save")}
                      >
                        <CheckCircle size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => cancelPhaseDraft(item.id)}
                        title={t("cancel")}
                      >
                        <X size={16} />
                      </Button>
                    </>
                  )}
                  {canEditInventory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:!bg-primary/10 hover:!text-primary"
                      onClick={() => onEditItem(item)}
                    >
                      {t("open")}
                    </Button>
                  )}
                  {(item.stockHistory?.length ?? 0) > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => openHistory(item)}
                      title={t("previousStockView")}
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                  {isAdmin && can("delete") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(item)}
                      title={t("delete")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                  {!canEditInventory && !isAdmin && (item.stockHistory?.length ?? 0) === 0 && (
                    <span className="px-2 py-1 text-xs text-muted-foreground">{t("read")}</span>
                  )}
                </td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={readOnly ? 9 : 10} className="py-8 text-center text-muted-foreground">
                No items found. Try adjusting your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {canEditInventory && pendingChangeCount > 1 && (
      <div className="mt-4 flex justify-end border-t border-border pt-4">
        <Button onClick={saveAllPhaseDrafts} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
          <Save size={16} />
          {t("saveAll")}
        </Button>
      </div>
    )}
    {historyItem && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setHistoryItem(null)}>
        <div className="w-full max-w-lg rounded-lg border border-border bg-card" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("previousStockView")}</h2>
              <p className="text-sm text-muted-foreground">{historyItem.name}</p>
            </div>
            <button onClick={() => setHistoryItem(null)} className="text-muted-foreground hover:text-foreground">x</button>
          </div>
          <div className="space-y-3 p-6">
            {(historyItem.stockHistory ?? []).slice().reverse().map((entry) => (
              <div key={`${entry.auditId}-${entry.completedDate}`} className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs text-muted-foreground">{entry.auditId} · {t("completedOn")}: {entry.completedDate}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("previousStockView")}</p>
                    <p className="text-lg font-bold text-foreground">{entry.previousStock} {historyItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("newStock")}</p>
                    <p className="text-lg font-bold text-accent">{entry.newStock} {historyItem.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    {isHistoryLoading && (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/35 p-4 backdrop-blur-sm">
        <div className="rounded-2xl border border-border bg-card/90 px-8 py-6 text-center shadow-xl">
          <AuditFlowLogo collapsed className="mx-auto mb-4 animate-pulse justify-center" imageClassName="h-14 w-14 rounded-2xl" />
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{t("loadingData")}</p>
          <h2 className="mt-2 text-xl font-bold text-foreground">{t("previousStockView")}</h2>
        </div>
      </div>
    )}
    {deleteTarget && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("deleteItemTitle")}</h2>
              <p className="text-sm text-muted-foreground">{deleteTarget.name} · ID {deleteTarget.id}</p>
            </div>
            <button onClick={() => setDeleteTarget(null)} className="text-muted-foreground hover:text-foreground">x</button>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">{t("deleteItemBody")}</p>
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("requiredItemId")}</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">{deleteTarget.id}</p>
            </div>
            <input
              value={deleteWord}
              onChange={(event) => setDeleteWord(event.target.value)}
              placeholder="delete"
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
            />
            <input
              value={deleteItemId}
              onChange={(event) => setDeleteItemId(event.target.value)}
              placeholder={t("typeItemId")}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
            />
            {deleteError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{deleteError}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" disabled={isDeleting} onClick={() => setDeleteTarget(null)}>{t("cancel")}</Button>
              <Button
                className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                disabled={isDeleting || deleteWord !== "delete" || deleteItemId !== String(deleteTarget.id)}
                onClick={confirmDelete}
              >
                {isDeleting ? t("loadingData") : t("delete")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    {phaseItem && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("phaseDetails")}</h2>
              <p className="text-sm text-muted-foreground">{phaseItem.name}</p>
            </div>
            <button onClick={() => setPhaseItem(null)} className="text-muted-foreground hover:text-foreground">x</button>
          </div>
          <div className="grid gap-3 p-6">
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground">{t("productionStock")}</p>
              <p className="text-xl font-bold text-foreground">{phaseItem.productionQuantity ?? 0} {phaseItem.unit}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground">{t("mermaStock")}</p>
              <p className="text-xl font-bold text-foreground">{phaseItem.mermaQuantity ?? 0} {phaseItem.unit}</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
              startPhaseEdit(phaseItem)
              setPhaseItem(null)
            }}>
              {t("edit")}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
