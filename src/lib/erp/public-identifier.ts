import { z } from "zod"

/** Shared erp/v1 domain.schema.json#/$defs/erpResourceId. */
export const publicErpBusinessPartnerId = z
  .string()
  .min(8)
  .max(63)
  .regex(/^erp_[a-z0-9]+$/)
