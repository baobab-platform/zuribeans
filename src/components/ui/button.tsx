import Link from "next/link"
import { Button as BaseButton } from "@base-ui/react/button"
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react"
import { classNames } from "@/lib/ui/classnames"

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "inverse" | "gold" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft hover:text-white",
  secondary: "bg-leaf text-white hover:bg-leaf-dark hover:text-white",
  outline:
    "border border-line-strong bg-transparent text-ink hover:bg-surface-raised hover:text-ink",
  inverse: "border border-white/40 bg-transparent text-canvas hover:bg-white/10 hover:text-canvas",
  gold: "bg-clay text-ink hover:bg-clay-inverse hover:text-ink",
  ghost: "bg-transparent text-ink hover:bg-surface-raised hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger-strong hover:text-white",
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
  return (
    <BaseButton type={type} className={buttonClassName({ variant, size, className })} {...props} />
  )
}

export function ButtonLink({
  href,
  children,
  className,
  variant,
  size,
  onClick,
  style,
}: {
  href: string
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  style?: CSSProperties
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={style}
      className={buttonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  )
}
