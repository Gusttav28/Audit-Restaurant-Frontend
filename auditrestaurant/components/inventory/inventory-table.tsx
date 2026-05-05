"use client"
import { Edit2, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/components/app-context"

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
  lastUpdated: string
  supplier: string
  daysUntilExpiry: number | null
}

interface InventoryTableProps {
  items: InventoryItem[]
  onUpdateItem: (id: number, data: any) => void
  onDeleteItem: (id: number) => void
  onEditItem: (item: InventoryItem) => void
}

export default function InventoryTable({ items, onUpdateItem, onDeleteItem, onEditItem }: InventoryTableProps) {
  const { formatCurrency } = useAppContext()
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-accent/20 text-accent"
      case "low":
        return "bg-primary/20 text-primary"
      case "critical":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    return status === "good" ? <CheckCircle size={16} /> : <AlertCircle size={16} />
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[920px] w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Item Name</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Quantity</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Min Stock</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Expires In</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Price</th>
            <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
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
                    {item.quantity} {item.unit}
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {item.minStock} {item.unit}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {item.daysUntilExpiry ? (
                    <span className={item.daysUntilExpiry <= 7 ? "text-destructive font-medium" : "text-accent"}>
                      {item.daysUntilExpiry} days
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-foreground font-medium">{formatCurrency(item.price)}</td>
                <td className="py-3 px-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                    onClick={() => onEditItem(item)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="py-8 text-center text-muted-foreground">
                No items found. Try adjusting your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
