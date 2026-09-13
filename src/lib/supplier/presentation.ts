import type { SupplierStatus } from "./lifecycle"

type SupplierStatusPresentation = {
  label: string
  description: string
  tone: "neutral" | "success" | "warning" | "danger" | "info"
}

const SUPPLIER_STATUS_PRESENTATION: Record<SupplierStatus, SupplierStatusPresentation> = {
  draft: {
    label: "Draft",
    description: "The application has not been submitted for review.",
    tone: "neutral",
  },
  submitted: {
    label: "Submitted",
    description: "The application is queued for an initial sourcing review.",
    tone: "info",
  },
  under_review: {
    label: "Under review",
    description: "The sourcing team is reviewing the organisation and declared capabilities.",
    tone: "info",
  },
  more_information_required: {
    label: "Information required",
    description: "The sourcing team needs more information before review can continue.",
    tone: "warning",
  },
  sample_required: {
    label: "Sample required",
    description: "A product sample is required before qualification can continue.",
    tone: "warning",
  },
  qualification: {
    label: "In qualification",
    description: "Product, capacity and operating declarations are being qualified.",
    tone: "info",
  },
  approved: {
    label: "Approved",
    description: "The organisation is approved and awaiting supplier activation.",
    tone: "success",
  },
  rejected: {
    label: "Not approved",
    description: "The application did not meet the current sourcing requirements.",
    tone: "danger",
  },
  active: {
    label: "Active supplier",
    description: "The organisation is active in the ZuriBeans sourcing network.",
    tone: "success",
  },
  suspended: {
    label: "Suspended",
    description: "Supplier activity is paused while the account is reviewed.",
    tone: "warning",
  },
  offboarded: {
    label: "Offboarded",
    description: "The organisation is no longer active in the sourcing network.",
    tone: "neutral",
  },
}

export const getSupplierStatusPresentation = (status: SupplierStatus): SupplierStatusPresentation =>
  SUPPLIER_STATUS_PRESENTATION[status]
