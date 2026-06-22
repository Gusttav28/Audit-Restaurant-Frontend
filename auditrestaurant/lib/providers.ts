import type { InventoryItem, ProviderBill, RestaurantInventory } from "@/components/inventory/multi-restaurant-data"

export type ProviderSummary = {
  name: string
  items: InventoryItem[]
  bills: ProviderBill[]
  providedNames: string[]
  totalValue: number
}

export function getProviderSummaries(restaurant: RestaurantInventory) {
  const inventoryItems = restaurant.inventoryTypes.flatMap((type) => type.items)
  const providerNames = new Set<string>()

  ;(restaurant.suppliers ?? []).forEach((supplier) => {
    if (supplier.trim()) providerNames.add(supplier.trim())
  })
  inventoryItems.forEach((item) => {
    if (item.supplier?.trim()) providerNames.add(item.supplier.trim())
  })
  ;(restaurant.providerBills ?? []).forEach((bill) => {
    if (bill.supplier.trim()) providerNames.add(bill.supplier.trim())
  })

  return Array.from(providerNames)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const items = inventoryItems.filter((item) => item.supplier === name)
      const bills = (restaurant.providerBills ?? []).filter((bill) => bill.supplier === name)
      const providedNames = Array.from(new Set([
        ...items.map((item) => item.name),
        ...bills.flatMap((bill) => bill.items.map((item) => item.name)),
      ])).sort((a, b) => a.localeCompare(b))

      return {
        name,
        items,
        bills,
        providedNames,
        totalValue: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
      } satisfies ProviderSummary
    })
}

export function providerSlug(name: string) {
  return encodeURIComponent(name)
}

export function providerFromSlug(slug: string) {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}
