"use client"

import { useState } from "react"
import { X, Plus, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [isAdding, setIsAdding] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeColor, setNewTypeColor] = useState("#3b82f6")

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
    if (newTypeName.trim()) {
      onAddType({ name: newTypeName.trim(), color: newTypeColor })
      setNewTypeName("")
      setNewTypeColor("#3b82f6")
      setIsAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl">
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
            {inventoryTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-4 bg-secondary/30 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="font-medium text-foreground">{type.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (
                        confirm(`Are you sure you want to delete ${type.name}? All items in this type will be removed.`)
                      ) {
                        onDeleteType(type.id)
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Type Section */}
          {isAdding ? (
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
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full border-dashed border-2 hover:border-accent hover:bg-accent/5 gap-2"
            >
              <Plus size={20} />
              Add New Inventory Type
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-border">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
