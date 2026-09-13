const parseHttpUrl = (value: string): URL | null => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url : null
  } catch {
    return null
  }
}

type ProductMediaEnvironment = {
  MEDUSA_BACKEND_URL?: string
  PRODUCT_MEDIA_ORIGINS?: string
}

export const getAllowedProductMediaOrigins = (
  environment: ProductMediaEnvironment = process.env as ProductMediaEnvironment,
): URL[] => {
  const candidates = [
    environment.MEDUSA_BACKEND_URL,
    ...(environment.PRODUCT_MEDIA_ORIGINS?.split(",") ?? []),
  ]
  const origins = new Map<string, URL>()
  for (const candidate of candidates) {
    if (!candidate) continue
    const parsed = parseHttpUrl(candidate.trim())
    if (parsed) origins.set(parsed.origin, new URL(parsed.origin))
  }
  return [...origins.values()]
}

export const normalizeProductMediaUrl = (
  value: string | null | undefined,
  allowedOrigins = getAllowedProductMediaOrigins(),
): string | null => {
  if (!value) return null
  if (value.startsWith("/") && !value.startsWith("//")) return value
  const parsed = parseHttpUrl(value)
  if (!parsed) return null
  return allowedOrigins.some((origin) => origin.origin === parsed.origin) ? parsed.toString() : null
}
