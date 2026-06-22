'use client'

export type ExportCellValue = string | number | null | undefined

export type ExportColumn<T extends object> = {
  key: keyof T
  header: string
  width?: number
  align?: 'left' | 'right'
}

export type ExportDocument<T extends object> = {
  title: string
  subtitle?: string
  organizationName?: string
  organizationSubtitle?: string
  referenceLabel?: string
  referenceValue?: string
  issuedAt?: string
  issuedLabel?: string
  footerLabel?: string
  sheetName?: string
  details?: Array<{ label: string; value: ExportCellValue }>
  metrics?: Array<{ label: string; value: ExportCellValue }>
  columns: Array<ExportColumn<T>>
  rows: T[]
  summary?: Array<{ label: string; value: ExportCellValue; emphasis?: boolean }>
  note?: { title: string; body: string }
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const PRIMARY = '0F6CB4'
const INK = '2F2F2F'
const MUTED = '666666'

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const slugifyFilePart = (value: string) =>
  value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()

export const exportDocumentXlsx = <T extends object>(document: ExportDocument<T>, filename: string) => {
  downloadBlob(createXlsxBlob(document), filename)
}

export const exportDocumentPdf = <T extends object>(document: ExportDocument<T>, filename: string) => {
  downloadBlob(createPdfBlob(document), filename)
}

const valueText = (value: ExportCellValue) => value === null || value === undefined ? '' : String(value)

const xmlEscape = (value: ExportCellValue) =>
  valueText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const cellRef = (columnIndex: number, rowIndex: number) => {
  let column = ''
  let index = columnIndex
  while (index > 0) {
    const modulo = (index - 1) % 26
    column = String.fromCharCode(65 + modulo) + column
    index = Math.floor((index - modulo) / 26)
  }
  return `${column}${rowIndex}`
}

const xlsxCell = (columnIndex: number, rowIndex: number, value: ExportCellValue, style = 0) => {
  const ref = cellRef(columnIndex, rowIndex)
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}" s="${style}"><v>${value}</v></c>`
  }
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`
}

const buildSheetXml = <T extends object>(document: ExportDocument<T>) => {
  const columnCount = Math.max(document.columns.length, 6)
  const rows: string[] = []
  const merges: string[] = []
  const maxColumnRef = cellRef(columnCount, 1).replace(/\d/g, '')
  let rowIndex = 1

  rows.push(`<row r="${rowIndex}">${xlsxCell(1, rowIndex, document.title, 1)}</row>`)
  merges.push(`<mergeCell ref="A${rowIndex}:${maxColumnRef}${rowIndex}"/>`)
  rowIndex += 1

  if (document.referenceLabel || document.referenceValue || document.issuedAt) {
    rows.push(`<row r="${rowIndex}">${xlsxCell(1, rowIndex, document.referenceLabel ?? 'Reference', 4)}${xlsxCell(2, rowIndex, document.referenceValue ?? '', 4)}${xlsxCell(columnCount - 1, rowIndex, document.issuedLabel ?? 'Issued', 4)}${xlsxCell(columnCount, rowIndex, document.issuedAt ?? '', 4)}</row>`)
    rowIndex += 2
  }

  if (document.subtitle) {
    rows.push(`<row r="${rowIndex}">${xlsxCell(1, rowIndex, document.subtitle, 2)}</row>`)
    merges.push(`<mergeCell ref="A${rowIndex}:${maxColumnRef}${rowIndex}"/>`)
    rowIndex += 2
  }

  document.details?.forEach((detail) => {
    rows.push(`<row r="${rowIndex}">${xlsxCell(1, rowIndex, detail.label, 4)}${xlsxCell(2, rowIndex, detail.value, 0)}</row>`)
    rowIndex += 1
  })

  if (document.metrics?.length) {
    rowIndex += 1
    const metricCells = document.metrics.slice(0, columnCount).map((metric, index) =>
      `${xlsxCell(index + 1, rowIndex, metric.label, 4)}${xlsxCell(index + 1, rowIndex + 1, metric.value, 5)}`,
    )
    rows.push(`<row r="${rowIndex}">${metricCells.map((pair) => pair.match(/^<c[^]*?<\/c>/)?.[0] ?? '').join('')}</row>`)
    rows.push(`<row r="${rowIndex + 1}">${metricCells.map((pair) => pair.replace(/^<c[^]*?<\/c>/, '')).join('')}</row>`)
    rowIndex += 3
  } else {
    rowIndex += 1
  }

  rows.push(`<row r="${rowIndex}">${document.columns.map((column, index) => xlsxCell(index + 1, rowIndex, column.header, 3)).join('')}</row>`)
  rowIndex += 1

  document.rows.forEach((entry) => {
    rows.push(`<row r="${rowIndex}">${document.columns.map((column, index) => xlsxCell(index + 1, rowIndex, entry[column.key] as ExportCellValue, column.align === 'right' ? 6 : 0)).join('')}</row>`)
    rowIndex += 1
  })

  if (document.summary?.length) {
    rowIndex += 1
    document.summary.forEach((summary) => {
      rows.push(`<row r="${rowIndex}">${xlsxCell(columnCount - 1, rowIndex, summary.label, summary.emphasis ? 7 : 4)}${xlsxCell(columnCount, rowIndex, summary.value, summary.emphasis ? 8 : 6)}</row>`)
      rowIndex += 1
    })
  }

  if (document.note) {
    rowIndex += 1
    rows.push(`<row r="${rowIndex}">${xlsxCell(1, rowIndex, document.note.title, 4)}</row>`)
    rowIndex += 1
    rows.push(`<row r="${rowIndex}">${xlsxCell(1, rowIndex, document.note.body, 0)}</row>`)
    merges.push(`<mergeCell ref="A${rowIndex}:${maxColumnRef}${rowIndex}"/>`)
  }

  const cols = Array.from({ length: columnCount }, (_, index) => {
    const width = document.columns[index]?.width ?? (index === 0 ? 28 : 18)
    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
  }).join('')

  const mergeXml = merges.length ? `<mergeCells count="${merges.length}">${merges.join('')}</mergeCells>` : ''
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${rows.join('')}</sheetData>${mergeXml}</worksheet>`
}

const createXlsxBlob = <T extends object>(document: ExportDocument<T>) => {
  const now = new Date().toISOString()
  const files: Record<string, string> = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    'docProps/core.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:title>${xmlEscape(document.title)}</dc:title><dc:creator>AuditNett</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${now}</dcterms:created></cp:coreProperties>`,
    'docProps/app.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>AuditNett</Application></Properties>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(document.sheetName ?? 'Export')}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><color rgb="FF${INK}"/><name val="Calibri"/></font><font><b/><sz val="18"/><color rgb="FF${INK}"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="12"/><color rgb="FF${PRIMARY}"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF${PRIMARY}"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF4EA"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFE5D6CA"/></left><right style="thin"><color rgb="FFE5D6CA"/></right><top style="thin"><color rgb="FFE5D6CA"/></top><bottom style="thin"><color rgb="FFE5D6CA"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="9"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFill="1" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1"/><xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFill="1" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="right"/></xf></cellXfs></styleSheet>`,
    'xl/worksheets/sheet1.xml': buildSheetXml(document),
  }
  return new Blob([createZip(files)], { type: XLSX_MIME })
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
})

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  })
  return (crc ^ 0xffffffff) >>> 0
}

const pushUint16 = (bytes: number[], value: number) => {
  bytes.push(value & 0xff, (value >>> 8) & 0xff)
}

const pushUint32 = (bytes: number[], value: number) => {
  bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff)
}

const createZip = (files: Record<string, string>) => {
  const encoder = new TextEncoder()
  const output: number[] = []
  const centralDirectory: number[] = []

  Object.entries(files).forEach(([path, content]) => {
    const nameBytes = encoder.encode(path)
    const data = encoder.encode(content)
    const checksum = crc32(data)
    const localOffset = output.length

    pushUint32(output, 0x04034b50)
    pushUint16(output, 20)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint16(output, 0)
    pushUint32(output, checksum)
    pushUint32(output, data.length)
    pushUint32(output, data.length)
    pushUint16(output, nameBytes.length)
    pushUint16(output, 0)
    output.push(...nameBytes, ...data)

    pushUint32(centralDirectory, 0x02014b50)
    pushUint16(centralDirectory, 20)
    pushUint16(centralDirectory, 20)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint32(centralDirectory, checksum)
    pushUint32(centralDirectory, data.length)
    pushUint32(centralDirectory, data.length)
    pushUint16(centralDirectory, nameBytes.length)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint16(centralDirectory, 0)
    pushUint32(centralDirectory, 0)
    pushUint32(centralDirectory, localOffset)
    centralDirectory.push(...nameBytes)
  })

  const centralOffset = output.length
  output.push(...centralDirectory)
  pushUint32(output, 0x06054b50)
  pushUint16(output, 0)
  pushUint16(output, 0)
  pushUint16(output, Object.keys(files).length)
  pushUint16(output, Object.keys(files).length)
  pushUint32(output, centralDirectory.length)
  pushUint32(output, centralOffset)
  pushUint16(output, 0)

  return new Uint8Array(output)
}

const pdfText = (value: ExportCellValue) =>
  valueText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, ' ')
    .replace(/[()\\]/g, '\\$&')

const clampPdfText = (value: ExportCellValue, maxCharacters: number) => {
  const text = valueText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, ' ')
  return text.length > maxCharacters ? `${text.slice(0, Math.max(maxCharacters - 1, 0))}.` : text
}

const createPdfBlob = <T extends object>(document: ExportDocument<T>) => {
  const pageWidth = 612
  const pageHeight = 792
  const margin = 40
  const contentWidth = pageWidth - margin * 2
  const pages: string[][] = [[]]
  let pageIndex = 0
  let y = 742

  const current = () => pages[pageIndex]
  const add = (operation: string) => current().push(operation)
  const text = (value: ExportCellValue, x: number, yPosition: number, size = 9, font = 'F1', color = INK) => {
    add(`${hexToRgb(color)} rg BT /${font} ${size} Tf ${x} ${yPosition} Td (${pdfText(value)}) Tj ET`)
  }
  const rect = (x: number, yPosition: number, width: number, height: number, color: string, stroke = false) => {
    add(`${hexToRgb(color)} ${stroke ? 'RG' : 'rg'} ${x} ${yPosition} ${width} ${height} re ${stroke ? 'S' : 'f'}`)
  }
  const line = (x1: number, y1: number, x2: number, y2: number, color = PRIMARY) => {
    add(`${hexToRgb(color)} RG 1 w ${x1} ${y1} m ${x2} ${y2} l S`)
  }
  const newPage = () => {
    pages.push([])
    pageIndex += 1
    y = 742
  }

  text(document.organizationName ?? 'AuditNett', margin, y, 18, 'F2')
  text(document.organizationSubtitle ?? 'Restaurant operations export', margin, y - 16, 8, 'F1', MUTED)
  if (document.referenceValue) {
    text(document.referenceLabel ?? 'Reference', 420, y, 8, 'F2', MUTED)
    text(document.referenceValue, 420, y - 13, 10, 'F1')
  }
  if (document.issuedAt) {
    text(document.issuedLabel ?? 'Issued', 420, y - 30, 8, 'F2', MUTED)
    text(document.issuedAt, 420, y - 43, 10, 'F1')
  }
  line(margin, y - 60, pageWidth - margin, y - 60)
  y -= 95

  text(document.title, margin, y, 22, 'F2')
  y -= 18
  if (document.subtitle) {
    text(document.subtitle, margin, y, 10, 'F1', MUTED)
    y -= 22
  }

  if (document.details?.length) {
    rect(margin, y - 70, contentWidth, 78, 'FFF4EA')
    const details = document.details.slice(0, 8)
    details.forEach((detail, index) => {
      const x = margin + 18 + (index % 2) * 250
      const rowY = y - 12 - Math.floor(index / 2) * 17
      text(detail.label.toUpperCase(), x, rowY, 6, 'F2', MUTED)
      text(clampPdfText(detail.value, 34), x + 88, rowY, 8)
    })
    y -= 95
  }

  if (document.metrics?.length) {
    const metrics = document.metrics.slice(0, 4)
    const metricWidth = contentWidth / metrics.length
    metrics.forEach((metric, index) => {
      const x = margin + index * metricWidth
      text(metric.label.toUpperCase(), x, y, 6, 'F2', MUTED)
      text(metric.value, x, y - 20, 15, 'F2')
    })
    y -= 54
  }

  const headerHeight = 22
  const rowHeight = 18
  const columnWidthTotal = document.columns.reduce((sum, column) => sum + (column.width ?? 16), 0)
  const widths = document.columns.map((column) => contentWidth * ((column.width ?? 16) / columnWidthTotal))
  const drawTableHeader = () => {
    rect(margin, y - headerHeight + 4, contentWidth, headerHeight, PRIMARY)
    let x = margin + 6
    document.columns.forEach((column, index) => {
      text(clampPdfText(column.header.toUpperCase(), Math.max(7, Math.floor(widths[index] / 4.2))), x, y - 10, 6, 'F2', 'FFFFFF')
      x += widths[index]
    })
    y -= headerHeight
  }

  drawTableHeader()
  document.rows.forEach((row) => {
    if (y < 110) {
      newPage()
      drawTableHeader()
    }
    let x = margin + 6
    document.columns.forEach((column, index) => {
      const maxCharacters = Math.max(6, Math.floor(widths[index] / 4.3))
      text(clampPdfText(row[column.key] as ExportCellValue, maxCharacters), x, y - 10, 7, 'F1')
      x += widths[index]
    })
    line(margin, y - 15, pageWidth - margin, y - 15, 'E5D6CA')
    y -= rowHeight
  })

  if (document.summary?.length) {
    if (y < 140) newPage()
    y -= 18
    const summaryX = 352
    document.summary.forEach((summary) => {
      text(summary.label, summaryX, y, summary.emphasis ? 10 : 8, summary.emphasis ? 'F2' : 'F1', summary.emphasis ? INK : MUTED)
      text(summary.value, 500, y, summary.emphasis ? 10 : 8, summary.emphasis ? 'F2' : 'F1')
      y -= 16
    })
  }

  if (document.note) {
    if (y < 105) newPage()
    y -= 8
    rect(margin, y - 44, contentWidth, 54, 'FFF4EA')
    text(document.note.title, margin + 18, y - 10, 8, 'F2')
    text(clampPdfText(document.note.body, 92), margin + 18, y - 27, 8, 'F1', MUTED)
  }

  pages.forEach((page, index) => {
    page.push(`${hexToRgb(MUTED)} rg BT /F1 7 Tf ${margin} 28 Td (${pdfText(document.footerLabel ?? 'AuditNett export')}) Tj ET`)
    page.push(`${hexToRgb(MUTED)} rg BT /F1 7 Tf 520 28 Td (Page ${index + 1}) Tj ET`)
  })

  const objects: string[] = []
  const pageObjects: number[] = []
  pages.forEach((operations) => {
    const content = operations.join('\n')
    const contentObject = objects.length + 6
    const pageObject = contentObject - 1
    pageObjects.push(pageObject)
    objects.push(`${pageObject} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >> endobj`)
    objects.push(`${contentObject} 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`)
  })
  const rootObjects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    `2 0 obj << /Type /Pages /Kids [${pageObjects.map((objectId) => `${objectId} 0 R`).join(' ')}] /Count ${pages.length} >> endobj`,
    '3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
  ]
  return new Blob([writePdf([...rootObjects, ...objects])], { type: 'application/pdf' })
}

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '')
  const red = Number.parseInt(value.slice(0, 2), 16) / 255
  const green = Number.parseInt(value.slice(2, 4), 16) / 255
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255
  return `${red.toFixed(3)} ${green.toFixed(3)} ${blue.toFixed(3)}`
}

const writePdf = (objects: string[]) => {
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object) => {
    offsets.push(pdf.length)
    pdf += `${object}\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return pdf
}
