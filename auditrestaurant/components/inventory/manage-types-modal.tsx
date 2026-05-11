"use client"

import { useState } from "react"
import { X, Plus, Trash2, Package, Pencil, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/components/app-context"

interface InventoryType {
  id: number
  name: string
  color: string
  active: boolean
}

interface ManageTypesModalProps {
  isOpen: boolean
  onClose: () => void
  inventoryTypes: InventoryType[]
  onAddType: (type: { name: string; color: string }) => void
  onUpdateType: (id: number, data: any) => void
  onDeleteType: (id: number) => void
}

export default function ManageTypesModal({
  isOpen,
  onClose,
  inventoryTypes,
  onAddType,
  onUpdateType,
  onDeleteType,
}: ManageTypesModalProps) {
  const { t, isPrimaryAdmin } = useAppContext()
  const [isAdding, setIsAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InventoryType | null>(null)
  const [deleteWord, setDeleteWord] = useState("")
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("")
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeColor, setNewTypeColor] = useState("#3b82f6")
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null)
  const [editingTypeName, setEditingTypeName] = useState("")
  const [editingTypeColor, setEditingTypeColor] = useState("#3b82f6")

  const predefinedColors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#f97316", // orange
    "#ec4899", // pink
  ]

  const handleAddType = () => {
    if (isPrimaryAdmin && newTypeName.trim()) {
      onAddType({ name: newTypeName.trim(), color: newTypeColor })
      setNewTypeName("")
      setNewTypeColor("#3b82f6")
      setIsAdding(false)
    }
  }

  const startEditingType = (type: InventoryType) => {
    if (!isPrimaryAdmin) return
    setEditingTypeId(type.id)
    setEditingTypeName(type.name)
    setEditingTypeColor(type.color)
  }

  const handleSaveType = () => {
    if (isPrimaryAdmin && editingTypeId && editingTypeName.trim()) {
      onUpdateType(editingTypeId, { name: editingTypeName.trim(), color: editingTypeColor })
      setEditingTypeId(null)
      setEditingTypeName("")
      setEditingTypeColor("#3b82f6")
    }
  }

  if (!isOpen) return null

  const closeDeleteModal = () => {
    setDeleteTarget(null)
    setDeleteWord("")
    setDeleteConfirmValue("")
  }

  const handleDeleteType = () => {
    if (!deleteTarget || deleteWord !== "delete") return
    const matchesName = deleteConfirmValue === deleteTarget.name
    const matchesId = deleteConfirmValue === String(deleteTarget.id)
    if (!matchesName && !matchesId) return
    onDeleteType(deleteTarget.id)
    closeDeleteModal()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Manage Inventory Types</h2>
              <p className="text-sm text-muted-foreground">Add or manage different inventory areas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Existing Types List */}
          <div className="space-y-2">
            {inventoryTypes.map((type) => {
              const isEditing = editingTypeId === type.id

              return (
                <div
                  key={type.id}
                  className="p-4 bg-secondary/30 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input
                          type="text"
                          value={editingTypeName}
                          onChange={(event) => setEditingTypeName(event.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                        />
                        <input
                          type="color"
                          value={editingTypeColor}
                          onChange={(event) => setEditingTypeColor(event.target.value)}
                          className="h-10 w-full rounded-lg border-2 border-border cursor-pointer sm:w-12"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setEditingTypeId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                          onClick={handleSaveType}
                          disabled={!editingTypeName.trim()}
                        >
                          <Check size={16} />
                          Save Type
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="w-4 h-4 shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
                        <span className="truncate font-medium text-foreground">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPrimaryAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                              onClick={() => startEditingType(type)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(type)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add New Type Section */}
          {isPrimaryAdmin && isAdding ? (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type Name *</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="e.g., Storage Room, Freezer, etc."
                  className="w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Color *</label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTypeColor(color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        newTypeColor === color ? "border-accent scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newTypeColor}
                    onChange={(e) => setNewTypeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setNewTypeName("")
                    setNewTypeColor("#3b82f6")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddType}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!newTypeName.trim()}
                >
                  Add Type
                </Button>
              </div>
            </div>
          ) : isPrimaryAdmin ? (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full gap-2 border-2 border-dashed hover:border-accent hover:bg-accent/5 hover:text-white"
            >
              <Plus size={20} />
              Add New Inventory Type
            </Button>
          ) : (
            <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              {t("noPermission")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-border">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Done
          </Button>
        </div>
      </div>
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={(event) => event.stopPropagation()}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("deleteAuditTitle")}</h2>
                <p className="text-sm text-muted-foreground">{deleteTarget.name} · ID {deleteTarget.id}</p>
              </div>
              <button onClick={closeDeleteModal} className="text-muted-foreground hover:text-foreground">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">{t("deleteItemBody")}</p>
              <input
                value={deleteWord}
                onChange={(event) => setDeleteWord(event.target.value)}
                placeholder="delete"
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
              />
              <input
                value={deleteConfirmValue}
                onChange={(event) => setDeleteConfirmValue(event.target.value)}
                placeholder={`${deleteTarget.name} or ${deleteTarget.id}`}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-foreground focus:outline-none focus:border-accent"
              />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={closeDeleteModal}>{t("cancel")}</Button>
                <Button
                  className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                  disabled={deleteWord !== "delete" || (deleteConfirmValue !== deleteTarget.name && deleteConfirmValue !== String(deleteTarget.id))}
                  onClick={handleDeleteType}
                >
                  {t("delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
