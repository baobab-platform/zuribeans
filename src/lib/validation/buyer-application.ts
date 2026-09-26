import { z } from "zod"

export const buyerApplicationSchema = z.object({
  idempotencyKey: z.string().uuid(),
  legalName: z.string().trim().min(1).max(200),
  tradingName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  registrationNumber: z
    .string()
    .trim()
    .max(128)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  countryOfRegistration: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/)
    .transform((value) => value.toUpperCase()),
  requestedMarketKeys: z.array(z.string().trim().min(1).max(64)).min(1).max(16),
})

export type BuyerApplicationInput = z.infer<typeof buyerApplicationSchema>
