import { z } from "zod"

export const buyerApplicationSchema = z.object({
  legalName: z.string().trim().min(1).max(200),
  tradingName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  registrationNumber: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  defaultMarketKey: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
})

export type BuyerApplicationInput = z.infer<typeof buyerApplicationSchema>
