"use client"

import React, { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, FileUp, Loader2, Pencil, Plus, Save, Truck, X } from "lucide-react"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import AuditFlowLogo from "@/components/layout/audit-flow-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/components/app-context"
import { getProviderSummaries, providerFromSlug } from "@/lib/providers"
import { extractElectronicBillFromPdf, type ParsedBillItem } from "@/lib/electronic-bill-parser"
import type { InventoryItem } from "@/components/inventory/multi-restaurant-data"

type ProviderBillImportRow = ParsedBillItem & {
  id: string
  selected: boolean
  typeId: number
  minStock: number
  currency: "CRC" | "USD"
  invoiceNumber: string
}

export default function ProviderDetailPage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = React.use(params)
  const providerName = providerFromSlug(provider)
  const { selectedRestaurant, addInventoryItem, updateInventoryItem, addItemCategory, addSupplier, addProviderBill, exchangeRate, language, formatCurrency, t, can } = useAppContext()
  const providers = useMemo(() => getProviderSummaries(selectedRestaurant), [selectedRestaurant])
  const summary = providers.find((entry) => entry.name === providerName)
  const activeTypes = selectedRestaurant.inventoryTypes.filter((type) => type.active)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editItemDraft, setEditItemDraft] = useState<Partial<InventoryItem>>({})
  const [isReadingBill, setIsReadingBill] = useState(false)
  const [billRows, setBillRows] = useState<ProviderBillImportRow[]>([])
  const [billImportError, setBillImportError] = useState("")
  const [isBillImportOpen, setIsBillImportOpen] = useState(false)
  const billFileInputRef = useRef<HTMLInputElement | null>(null)
  const billCopy = {
    en: {
      uploadBill: "Upload bill",
      uploadingFiles: "Uploading files...",
      importBill: "Import bill",
      reviewBill: "Review bill lines",
      noItems: "No inventory items were detected in this bill.",
      readError: "I could not read inventory lines from this PDF. Try another electronic bill or add the item manually.",
      unsupported: "Upload a PDF electronic bill.",
      importSelected: "Import selected",
      invoice: "Invoice",
    },
    es: {
      uploadBill: "Subir factura",
      uploadingFiles: "Cargando archivos...",
      importBill: "Importar factura",
      reviewBill: "Revisar lineas de factura",
      noItems: "No se detectaron articulos de inventario en esta factura.",
      readError: "No pude leer lineas de inventario desde este PDF. Prueba otra factura electronica o agrega el articulo manualmente.",
      unsupported: "Sube una factura electronica en PDF.",
      importSelected: "Importar seleccionados",
      invoice: "Factura",
    },
  }[language]
  const [manualItem, setManualItem] = useState({
    name: "",
    typeId: activeTypes[0]?.id ?? 0,
    category: "General",
    quantity: "1",
    unit: "pieces",
    minStock: "1",
    price: "",
    priceCurrency: selectedRestaurant.defaultCurrency ?? "USD" as "USD" | "CRC",
  })

  const handleManualItemChange = (field: keyof typeof manualItem, value: string | number) => {
    setManualItem((current) => ({ ...current, [field]: value }))
  }

  const handleAddManualItem = () => {
    const targetType = activeTypes.find((type) => type.id === Number(manualItem.typeId)) ?? activeTypes[0]
    const price = Number.parseFloat(manualItem.price)
    const quantity = Number.parseFloat(manualItem.quantity)
    const minStock = Number.parseFloat(manualItem.minStock)
    if (!targetType || !manualItem.name.trim() || !manualItem.category.trim() || !Number.isFinite(price) || !Number.isFinite(quantity) || !Number.isFinite(minStock)) return

    addSupplier(providerName)
    addItemCategory(targetType.id, manualItem.category)
    addInventoryItem(targetType.id, {
      name: manualItem.name.trim(),
      type: targetType.name,
      category: manualItem.category.trim(),
      quantity,
      unit: manualItem.unit.trim() || "pieces",
      minStock,
      status: "good",
      price: manualItem.priceCurrency === "CRC" ? price / exchangeRate : price,
      priceCurrency: manualItem.priceCurrency,
      phase: "none",
      lastUpdated: new Date().toISOString().split("T")[0],
      supplier: providerName,
      daysUntilExpiry: null,
    })
    setManualItem((current) => ({ ...current, name: "", price: "", quantity: "1", minStock: "1" }))
    setIsAddingItem(false)
  }

  const normalizeProductName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(de|del|la|el|los|las)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim()

  const beginEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id)
    setEditItemDraft({
      name: item.name,
      type: item.type,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      minStock: item.minStock,
    })
  }

  const saveEditItem = () => {
    if (!editingItemId) return
    updateInventoryItem(editingItemId, editItemDraft)
    setEditingItemId(null)
    setEditItemDraft({})
  }

  const handleBillFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!files.length) return
    if (files.some((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))) {
      setBillImportError(billCopy.unsupported)
      setIsBillImportOpen(true)
      return
    }

    setIsReadingBill(true)
    setBillImportError("")
    try {
      const bills = await Promise.all(files.map((file) => extractElectronicBillFromPdf(file)))
      const defaultTypeId = activeTypes[0]?.id ?? 0
      const rows = bills.flatMap((bill, billIndex) =>
        bill.items.map((item, itemIndex) => ({
          ...item,
          id: `${bill.invoiceNumber ?? files[billIndex]?.name ?? "bill"}-${item.name}-${itemIndex}`,
          selected: true,
          typeId: defaultTypeId,
          minStock: 1,
          currency: bill.currency,
          invoiceNumber: bill.invoiceNumber ?? files[billIndex]?.name ?? "",
        })),
      )
      setBillRows(rows)
      setBillImportError(rows.length ? "" : billCopy.noItems)
      setIsBillImportOpen(true)
    } catch {
      setBillRows([])
      setBillImportError(billCopy.readError)
      setIsBillImportOpen(true)
    } finally {
      setIsReadingBill(false)
    }
  }

  const updateBillRow = (rowId: string, data: Partial<ProviderBillImportRow>) => {
    setBillRows((current) => current.map((row) => row.id === rowId ? { ...row, ...data } : row))
  }

  const handleImportBillRows = () => {
    const selectedRows = billRows.filter((row) => row.selected)
    selectedRows.forEach((row) => {
      const targetType = activeTypes.find((type) => type.id === row.typeId) ?? activeTypes[0]
      if (!targetType) return
      addSupplier(providerName)
      if (row.category) addItemCategory(targetType.id, row.category)
      const importedUnitPrice = row.currency === "CRC" ? row.unitPrice / exchangeRate : row.unitPrice
      const matchingItem = targetType.items.find((item) => normalizeProductName(item.name) === normalizeProductName(row.name))

      if (matchingItem) {
        updateInventoryItem(matchingItem.id, {
          quantity: matchingItem.quantity + row.quantity,
          price: matchingItem.price + importedUnitPrice,
          lastUpdated: new Date().toISOString().split("T")[0],
        })
      } else {
        addInventoryItem(targetType.id, {
          name: row.name,
          type: targetType.name,
          category: row.category || "General",
          quantity: row.quantity,
          unit: row.unit,
          minStock: row.minStock,
          status: "good",
          price: importedUnitPrice,
          priceCurrency: row.currency,
          phase: "none",
          lastUpdated: new Date().toISOString().split("T")[0],
          supplier: providerName,
          daysUntilExpiry: null,
        })
      }
    })

    const rowsByBill = selectedRows.reduce<Record<string, typeof selectedRows>>((acc, row) => {
      const key = `${row.invoiceNumber || "manual"}||${row.currency}`
      acc[key] ??= []
      acc[key].push(row)
      return acc
    }, {})

    Object.entries(rowsByBill).forEach(([key, rows]) => {
      const [invoiceNumber, currency] = key.split("||") as [string, "CRC" | "USD"]
      addProviderBill({
        supplier: providerName,
        invoiceNumber,
        currency,
        source: "bill-upload",
        items: rows.map((row) => {
          const targetType = activeTypes.find((type) => type.id === row.typeId) ?? activeTypes[0]
          return {
            name: row.name,
            quantity: row.quantity,
            unit: row.unit,
            unitPrice: row.unitPrice,
            priceCurrency: row.currency,
            category: row.category || "General",
            inventoryTypeName: targetType?.name ?? "",
          }
        }),
      })
    })

    setBillRows([])
    setBillImportError("")
    setIsBillImportOpen(false)
  }

  if (!summary) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="p-6">
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <Truck size={34} className="text-muted-foreground" />
                <p className="text-muted-foreground">{t("provider")} {providerName} not found.</p>
                <Link href="/providers"><Button variant="outline" className="bg-transparent">{t("providers")}</Button></Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  const billItems = summary.bills.flatMap((bill) => bill.items.map((item) => ({ ...item, bill })))

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/providers" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={16} />
                {t("providers")}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck size={16} className="text-primary" />
                <span>{t("provider")}</span>
              </div>
              <h1 className="mt-1 text-3xl font-bold text-foreground">{summary.name}</h1>
              <p className="mt-1 text-muted-foreground">{summary.providedNames.join(", ") || t("providerItems")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                ref={billFileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                className="hidden"
                onChange={handleBillFileChange}
              />
              <Button
                variant="outline"
                onClick={() => billFileInputRef.current?.click()}
                disabled={!can("create") || isReadingBill}
                className="gap-2"
              >
                {isReadingBill ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
                {isReadingBill ? billCopy.uploadingFiles : billCopy.uploadBill}
              </Button>
              <Button onClick={() => setIsAddingItem(true)} disabled={!can("create")} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} />
                {t("addItem")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("providerItems")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-foreground">{summary.providedNames.length}</p></CardContent></Card>
            <Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("uploadedBills")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{summary.bills.length}</p></CardContent></Card>
            <Card className="border-border bg-card"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t("inventoryValue")}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-accent">{formatCurrency(summary.totalValue)}</p></CardContent></Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{t("providerItems")}</CardTitle>
              <CardDescription>{summary.items.length} {t("items")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="auditflow-thin-scrollbar overflow-x-auto rounded-lg border border-border">
                <table className="min-w-[980px] w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary/20">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("itemName")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("inventory")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("category")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("quantity")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("minStock")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("price")}</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">{t("actions")}</th>
                  </tr></thead>
                  <tbody>
                    {summary.items.length ? summary.items.map((item) => {
                      const isEditing = editingItemId === item.id
                      return (
                        <tr key={item.id} className="border-b border-border">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {isEditing ? (
                              <input value={String(editItemDraft.name ?? "")} onChange={(event) => setEditItemDraft((current) => ({ ...current, name: event.target.value }))} className="w-44 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                            ) : item.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {isEditing ? (
                              <select value={String(editItemDraft.type ?? item.type)} onChange={(event) => setEditItemDraft((current) => ({ ...current, type: event.target.value }))} className="w-36 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary">
                                {activeTypes.map((type) => <option key={type.id} value={type.name}>{type.name}</option>)}
                              </select>
                            ) : item.type}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {isEditing ? (
                              <input value={String(editItemDraft.category ?? "")} onChange={(event) => setEditItemDraft((current) => ({ ...current, category: event.target.value }))} className="w-32 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                            ) : item.category}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input type="number" value={Number(editItemDraft.quantity ?? 0)} onChange={(event) => setEditItemDraft((current) => ({ ...current, quantity: Number(event.target.value) }))} className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                                <input value={String(editItemDraft.unit ?? "")} onChange={(event) => setEditItemDraft((current) => ({ ...current, unit: event.target.value }))} className="w-20 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                              </div>
                            ) : `${item.quantity} ${item.unit}`}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {isEditing ? (
                              <input type="number" value={Number(editItemDraft.minStock ?? 0)} onChange={(event) => setEditItemDraft((current) => ({ ...current, minStock: Number(event.target.value) }))} className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                            ) : `${item.minStock} ${item.unit}`}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {isEditing ? (
                              <input type="number" value={Number(editItemDraft.price ?? 0)} onChange={(event) => setEditItemDraft((current) => ({ ...current, price: Number(event.target.value) }))} className="w-28 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                            ) : formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <Button size="sm" variant="ghost" className="gap-2" onClick={saveEditItem}><Save size={15} />{t("save")}</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingItemId(null)}><X size={15} /></Button>
                                </>
                              ) : (
                                <Button size="sm" variant="ghost" className="gap-2" disabled={!can("edit")} onClick={() => beginEditItem(item)}>
                                  <Pencil size={15} />{t("edit")}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("noProviders")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{t("uploadedBills")}</CardTitle>
              <CardDescription>{billItems.length} {t("items")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.bills.length ? summary.bills.map((bill) => (
                <div key={bill.id} className="rounded-lg border border-border bg-secondary/10 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-foreground"><FileText size={16} className="text-primary" />{bill.invoiceNumber || bill.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(bill.uploadedAt).toLocaleString()} - {bill.currency}</p>
                    </div>
                    <p className="text-sm font-semibold text-accent">{bill.items.length} {t("items")}</p>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {bill.items.map((item, index) => (
                      <div key={`${bill.id}-${index}`} className="grid gap-2 rounded-md border border-border bg-background/50 p-3 text-sm sm:grid-cols-[1fr_auto_auto]">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-muted-foreground">{item.quantity} {item.unit}</p>
                        <p className="font-semibold text-foreground">{item.priceCurrency} {item.unitPrice.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                  <FileText size={30} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("uploadedBills")}: 0</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {isAddingItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsAddingItem(false)}>
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("addItem")}</h2>
              <button onClick={() => setIsAddingItem(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input placeholder={t("itemName")} value={manualItem.name} onChange={(event) => handleManualItemChange("name", event.target.value)} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary" />
              <select value={manualItem.typeId} onChange={(event) => handleManualItemChange("typeId", Number(event.target.value))} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary">
                {activeTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
              <input placeholder={t("category")} value={manualItem.category} onChange={(event) => handleManualItemChange("category", event.target.value)} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary" />
              <input placeholder={t("unit")} value={manualItem.unit} onChange={(event) => handleManualItemChange("unit", event.target.value)} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary" />
              <input type="number" placeholder={t("quantity")} value={manualItem.quantity} onChange={(event) => handleManualItemChange("quantity", event.target.value)} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary" />
              <input type="number" placeholder={t("minStock")} value={manualItem.minStock} onChange={(event) => handleManualItemChange("minStock", event.target.value)} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary" />
              <input type="number" placeholder={t("price")} value={manualItem.price} onChange={(event) => handleManualItemChange("price", event.target.value)} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary" />
              <select value={manualItem.priceCurrency} onChange={(event) => handleManualItemChange("priceCurrency", event.target.value as "USD" | "CRC")} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary">
                <option value="USD">USD</option>
                <option value="CRC">CRC</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => setIsAddingItem(false)}>{t("cancel")}</Button>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddManualItem}><Save size={16} />{t("save")}</Button>
            </div>
          </div>
        </div>
      )}

      {isBillImportOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsBillImportOpen(false)}>
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg border border-border bg-card shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">{billCopy.reviewBill}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{summary.name} - {billCopy.invoice}</p>
              </div>
              <button onClick={() => setIsBillImportOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="auditflow-thin-scrollbar flex-1 overflow-auto p-5">
              {billImportError && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {billImportError}
                </div>
              )}
              {billRows.length ? (
                <table className="min-w-[980px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground"></th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("itemName")}</th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("inventory")}</th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("category")}</th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("quantity")}</th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("unit")}</th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("price")}</th>
                      <th className="px-3 py-3 text-left font-semibold text-muted-foreground">{t("minStock")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billRows.map((row) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="px-3 py-3">
                          <input type="checkbox" checked={row.selected} onChange={(event) => updateBillRow(row.id, { selected: event.target.checked })} />
                        </td>
                        <td className="px-3 py-3">
                          <input value={row.name} onChange={(event) => updateBillRow(row.id, { name: event.target.value })} className="w-52 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                          <p className="mt-1 text-xs text-muted-foreground">{row.invoiceNumber}</p>
                        </td>
                        <td className="px-3 py-3">
                          <select value={row.typeId} onChange={(event) => updateBillRow(row.id, { typeId: Number(event.target.value) })} className="w-36 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary">
                            {activeTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input value={row.category} onChange={(event) => updateBillRow(row.id, { category: event.target.value })} className="w-32 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                        </td>
                        <td className="px-3 py-3">
                          <input type="number" value={row.quantity} onChange={(event) => updateBillRow(row.id, { quantity: Number(event.target.value) })} className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                        </td>
                        <td className="px-3 py-3">
                          <input value={row.unit} onChange={(event) => updateBillRow(row.id, { unit: event.target.value })} className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <input type="number" value={row.unitPrice} onChange={(event) => updateBillRow(row.id, { unitPrice: Number(event.target.value) })} className="w-28 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                            <select value={row.currency} onChange={(event) => updateBillRow(row.id, { currency: event.target.value as "USD" | "CRC" })} className="w-20 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary">
                              <option value="USD">USD</option>
                              <option value="CRC">CRC</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <input type="number" value={row.minStock} onChange={(event) => updateBillRow(row.id, { minStock: Number(event.target.value) })} className="w-24 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                  <FileText size={30} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{billCopy.noItems}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-5">
              <Button variant="outline" className="bg-transparent" onClick={() => setIsBillImportOpen(false)}>{t("cancel")}</Button>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleImportBillRows} disabled={!billRows.some((row) => row.selected)}>
                <Save size={16} />
                {billCopy.importSelected}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isReadingBill && (
        <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background/95 text-center">
          <AuditFlowLogo imageClassName="h-14 w-14 rounded-xl" textClassName="hidden" />
          <Loader2 className="mt-6 animate-spin text-primary" size={32} />
          <p className="mt-4 text-lg font-semibold text-foreground">{billCopy.uploadingFiles}</p>
        </div>
      )}
    </div>
  )
}
