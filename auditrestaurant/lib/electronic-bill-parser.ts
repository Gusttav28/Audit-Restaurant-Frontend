"use client"

export type ParsedBillItem = {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  category: string
}

export type ParsedElectronicBill = {
  supplier: string
  currency: "CRC" | "USD"
  invoiceNumber?: string
  date?: string
  items: ParsedBillItem[]
  rawText: string
}

type PdfJsModule = typeof import("pdfjs-dist")

export async function extractElectronicBillFromPdf(file: File): Promise<ParsedElectronicBill> {
  const text = await extractPdfText(file)
  return parseElectronicBillText(text)
}

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist") as PdfJsModule
  pdfjs.GlobalWorkerOptions.workerSrc ||= new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString()

  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join("\n"))
  }

  return pages.join("\n")
}

export function parseElectronicBillText(input: string): ParsedElectronicBill {
  const text = normalizeText(input)
  const items = dedupeItems([
    ...parseCompactCostaRicaRows(text),
    ...parseSimpleQuantityRows(text),
  ]).filter((item) => !isNonInventoryLine(item.name))

  return {
    supplier: parseSupplier(text),
    currency: parseCurrency(text),
    invoiceNumber: parseInvoiceNumber(text),
    date: parseDate(text),
    items,
    rawText: text,
  }
}

function normalizeText(input: string) {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function parseSupplier(text: string) {
  const compactProvider = text.match(/-\s*([A-Z0-9 .&'/-]+?)(?:Bodega:|cliente:|Cliente:)/i)
  if (compactProvider?.[1]) return cleanName(compactProvider[1])

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
  const identIndex = lines.findIndex((line) => /Ident\.|C[eé]dula|Cedula/i.test(line))
  if (identIndex > 0) {
    const previous = lines.slice(0, identIndex).filter((line) => !/factura|electronica/i.test(line))
    const tradeName = previous.findLast((line) => /^[A-Z0-9 .&'/-]{4,}$/.test(line))
    if (tradeName) return cleanName(tradeName)
  }

  const known = text.match(/\b(DELICARNES|CARNES EXCLUSIVAS PLAZOLETA)\b/i)
  if (known?.[1]) return cleanName(known[1])

  return "Unknown supplier"
}

function parseCurrency(text: string): "CRC" | "USD" {
  if (/MONEDA:\s*USD|DOLARES|DOLLARS/i.test(text)) return "USD"
  return "CRC"
}

function parseInvoiceNumber(text: string) {
  return text.match(/Factura Electr[oó]nica(?: N[°o.]*)?\s*:?\s*([0-9]{8,})/i)?.[1] ??
    text.match(/Clave:\s*([0-9]{30,})/i)?.[1] ??
    text.match(/Clave n[uú]merica:\s*([0-9\s]{30,})/i)?.[1]?.replace(/\s/g, "")
}

function parseDate(text: string) {
  return text.match(/Fecha:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4}(?:\s+[0-9:ap.m]+)?)/i)?.[1] ??
    text.match(/([0-9]{1,2}\/[a-z]{3}\.\/[0-9]{4})/i)?.[1]
}

function parseCompactCostaRicaRows(text: string): ParsedBillItem[] {
  const rows: ParsedBillItem[] = []
  const rowPattern = /([A-Z][A-Z0-9 .,'/-]{3,}?)\s+([0-9]+[,.][0-9]{1,6})\s*(?:[A-Z0-9]{0,8})?\s+13\.00\s+[0-9,.]+\s+([0-9 ]+[,.][0-9]{2})\s+([0-9 ]+[,.][0-9]{2})/gi
  let match: RegExpExecArray | null

  while ((match = rowPattern.exec(text))) {
    const name = cleanName(match[1])
    const quantity = parseLocaleNumber(match[2], { maxDecimalDigits: 4 })
    const unitPrice = parseLocaleNumber(match[3])
    const total = parseLocaleNumber(match[4])
    if (!name || !quantity || !unitPrice) continue
    rows.push({ name, quantity, unit: inferUnit(name), unitPrice, total, category: inferCategory(name) })
  }

  return rows
}

function parseSimpleQuantityRows(text: string): ParsedBillItem[] {
  const rows: ParsedBillItem[] = []
  const simplePattern = /Precio Unitario\s+([A-Z][A-Z0-9 .,'/-]{3,}?)\s+([0-9]+[,.][0-9]{2})\s+([0-9,.]+)(?:\s|$)/gi
  let match: RegExpExecArray | null

  while ((match = simplePattern.exec(text))) {
    const name = cleanName(match[1])
    const quantity = parseLocaleNumber(match[2])
    const unitPrice = parseLocaleNumber(match[3])
    if (!name || !quantity || !unitPrice) continue
    rows.push({ name, quantity, unit: inferUnit(name), unitPrice, total: quantity * unitPrice, category: inferCategory(name) })
  }

  return rows
}

function parseLocaleNumber(input: string, options?: { maxDecimalDigits?: number }) {
  let value = input.replace(/\s/g, "").trim()
  if (value.includes(",") && !value.includes(".")) {
    const [integer, decimal = ""] = value.split(",")
    value = `${integer}.${options?.maxDecimalDigits ? decimal.slice(0, options.maxDecimalDigits) : decimal}`
  } else {
    value = value.replace(/,/g, "")
  }

  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

function cleanName(value: string) {
  return value
    .replace(/^.*Precio Unit\./i, "")
    .replace(/^.*Precio Unitario/i, "")
    .replace(/^\d+[-\s]*/, "")
    .replace(/\s+/g, " ")
    .replace(/[.:,-]+$/g, "")
    .trim()
}

function inferUnit(name: string) {
  if (/carne|res|cerdo|pollo|bistec|chicharron|posta/i.test(name)) return "kg"
  if (/leche|aceite|jugo|salsa|vino|cerveza/i.test(name)) return "L"
  return "pieces"
}

function inferCategory(name: string) {
  if (/carne|res|cerdo|pollo|bistec|chicharron|posta/i.test(name)) return "Meat"
  if (/lechuga|tomate|cebolla|vegetal|fruta/i.test(name)) return "Produce"
  if (/botella|empaque|bolsa|caja/i.test(name)) return "Packaging"
  return "General"
}

function isNonInventoryLine(name: string) {
  return /servicio|express|envio|flete|transporte|impuesto|subtotal|total/i.test(name)
}

function dedupeItems(items: ParsedBillItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.name}-${item.quantity}-${item.unitPrice}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
