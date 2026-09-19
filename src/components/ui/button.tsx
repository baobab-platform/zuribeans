import Link from "next/link"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { classNames } from "@/lib/ui/classnames"

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  secondary: "bg-leaf text-white hover:bg-leaf-dark",
  outline: "border border-line-strong bg-transparent text-ink hover:bg-surface-raised",
  ghost: "bg-transparent text-ink hover:bg-surface-raised",
  danger: "bg-danger text-white hover:bg-danger-strong",
}

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-12 px-7 py-3 text-base",
}

export const buttonClassName = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) =>
  classNames(
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  )

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return <button type={type} className={buttonClassName({ variant, size, className })} {...props} />
}

export function ButtonLink({
  href,
  children,
  className,
  variant,
  size,
  onClick,
}: {
  href: string
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick} className={buttonClassName({ variant, size, className })}>
      {children}
    </Link>
  )
}
