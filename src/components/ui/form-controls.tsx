import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react"
import { classNames } from "@/lib/ui/classnames"

const controlClass =
  "mt-2 w-full rounded-control border border-line-strong bg-surface px-4 py-3 text-ink shadow-control placeholder:text-muted focus:border-leaf focus:outline-none focus:ring-2 focus:ring-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={classNames(controlClass, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={classNames(controlClass, "min-h-32 resize-y", className)} {...props} />
  )
}

export { Select } from "./select"

export function FieldDescription({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-sm leading-5 text-muted">
      {children}
    </p>
  )
}

export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-semibold text-danger-strong">
      {children}
    </p>
  )
}
