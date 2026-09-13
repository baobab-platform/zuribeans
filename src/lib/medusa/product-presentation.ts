type ProductMetadata = Record<string, unknown> | null | undefined

const stringValue = (metadata: ProductMetadata, key: string): string | null => {
  const value = metadata?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

const stringList = (metadata: ProductMetadata, key: string): string[] => {
  const value = metadata?.[key]
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const specificationFields = [
  ["grade", "Grade"],
  ["processing_method", "Processing method"],
  ["packaging", "Packaging"],
  ["minimum_order_quantity", "Minimum order"],
  ["availability", "Published availability note"],
  ["market_availability", "Market availability"],
  ["incoterms", "Incoterm context"],
  ["traceability", "Traceability"],
] as const

export const normalizeProductMetadata = (metadata: ProductMetadata) => ({
  certifications: stringList(metadata, "certifications"),
  qualityInformation: stringValue(metadata, "quality_information"),
  specifications: specificationFields.flatMap(([key, label]) => {
    const value = stringValue(metadata, key)
    return value ? [{ label, value }] : []
  }),
})
