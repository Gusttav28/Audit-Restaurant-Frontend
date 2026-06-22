"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Plus, Save, Search, Trash2, Truck, X } from "lucide-react"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/components/app-context"
import { getProviderSummaries, providerSlug } from "@/lib/providers"

export default function ProvidersPage() {
  const router = useRouter()
  const { selectedRestaurant, addSupplier, renameSupplier, deleteSupplier, formatCurrency, t, can } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [newProviderName, setNewProviderName] = useState("")
  const [editingProvider, setEditingProvider] = useState("")
  const [editingName, setEditingName] = useState("")
  const providers = useMemo(() => getProviderSummaries(selectedRestaurant), [selectedRestaurant])
  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.providedNames.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase())),
  )
  const providerItemsCount = providers.reduce((sum, provider) => sum + provider.providedNames.length, 0)
  const uploadedBillsCount = providers.reduce((sum, provider) => sum + provider.bills.length, 0)

  const handleAddProvider = () => {
    const name = newProviderName.trim()
    if (!name) return
    addSupplier(name)
    setNewProviderName("")
    setIsAddingProvider(false)
    router.push(`/providers/${providerSlug(name)}`)
  }

  const handleSaveProvider = () => {
    renameSupplier(editingProvider, editingName)
    setEditingProvider("")
    setEditingName("")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck size={16} className="text-primary" />
                <span>{selectedRestaurant.name}</span>
              </div>
              <h1 className="mt-1 text-3xl font-bold text-foreground">{t("providerList")}</h1>
              <p className="mt-1 text-muted-foreground">{t("providerListSubtitle")}</p>
            </div>
            <Button onClick={() => setIsAddingProvider(true)} disabled={!can("create")} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={18} />
              {t("addProvider")}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("providers")}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-foreground">{providers.length}</p></CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("providerItems")}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-primary">{providerItemsCount}</p></CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">{t("uploadedBills")}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-accent">{uploadedBillsCount}</p></CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{t("providers")}</CardTitle>
                  <CardDescription>{filteredProviders.length} {t("providers").toLowerCase()}</CardDescription>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-3 text-muted-foreground" size={17} />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t("search")}
                    className="w-full rounded-lg border border-border bg-secondary/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProviders.length ? (
                <div className="auditflow-thin-scrollbar overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-[820px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/20">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("provider")}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("providerItems")}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("uploadedBills")}</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("inventoryValue")}</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProviders.map((provider) => {
                        const isEditing = editingProvider === provider.name
                        return (
                          <tr key={provider.name} className="border-b border-border">
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  value={editingName}
                                  onChange={(event) => setEditingName(event.target.value)}
                                  className="w-56 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:border-primary"
                                />
                              ) : (
                                <p className="font-semibold text-foreground">{provider.name}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{provider.providedNames.slice(0, 4).join(", ") || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{provider.bills.length}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(provider.totalValue)}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <Button size="sm" variant="ghost" className="gap-2" onClick={handleSaveProvider}><Save size={15} />{t("save")}</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingProvider("")}><X size={15} /></Button>
                                  </>
                                ) : (
                                  <>
                                    <Link href={`/providers/${providerSlug(provider.name)}`}>
                                      <Button size="sm" variant="ghost" className="gap-2"><Eye size={15} />{t("open")}</Button>
                                    </Link>
                                    <Button size="sm" variant="ghost" className="gap-2" disabled={!can("edit")} onClick={() => {
                                      setEditingProvider(provider.name)
                                      setEditingName(provider.name)
                                    }}><Pencil size={15} />{t("edit")}</Button>
                                    <Button size="sm" variant="ghost" className="gap-2 text-destructive hover:text-destructive" disabled={!can("delete")} onClick={() => deleteSupplier(provider.name)}>
                                      <Trash2 size={15} />{t("delete")}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                  <Truck size={30} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("noProviders")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {isAddingProvider && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsAddingProvider(false)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("addProvider")}</h2>
              <button onClick={() => setIsAddingProvider(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <label className="mt-4 block text-sm font-medium text-foreground">{t("supplierName")}</label>
            <input
              value={newProviderName}
              onChange={(event) => setNewProviderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAddProvider()
              }}
              className="mt-2 w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => setIsAddingProvider(false)}>{t("cancel")}</Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddProvider}>{t("save")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
