export const BUYER_INVITE_ROLES = [
  "BUYER",
  "SENIOR_BUYER",
  "APPROVER",
  "VIEWER",
] as const

export type BuyerInviteRole = (typeof BUYER_INVITE_ROLES)[number]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type BuyerInvitationInput = {
  email: string
  role: BuyerInviteRole
}

export const parseBuyerInvitation = (
  emailValue: FormDataEntryValue | null,
  roleValue: FormDataEntryValue | null,
): BuyerInvitationInput | null => {
  if (typeof emailValue !== "string" || typeof roleValue !== "string") return null
  const email = emailValue.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(email)) return null
  if (!(BUYER_INVITE_ROLES as readonly string[]).includes(roleValue)) return null
  return { email, role: roleValue as BuyerInviteRole }
}
