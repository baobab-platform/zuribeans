"use client"

import {
  Children,
  isValidElement,
  type OptionHTMLAttributes,
  type SelectHTMLAttributes,
} from "react"
import { Select as BaseSelect } from "@base-ui/react/select"
import { classNames } from "@/lib/ui/classnames"

type Props = Pick<
  SelectHTMLAttributes<HTMLSelectElement>,
  | "children"
  | "name"
  | "id"
  | "defaultValue"
  | "required"
  | "disabled"
  | "form"
  | "className"
  | "aria-label"
  | "aria-labelledby"
  | "aria-describedby"
>

/**
 * Preserve the audited native-option call sites and form field names while
 * Base UI owns keyboard selection, portal focus and required-field behaviour.
 * Do not synthesise native onChange events or reinterpret a selected market
 * as permission. The existing Server Actions validate all submitted values.
 */
export function Select({
  children,
  name,
  id,
  defaultValue,
  required,
  disabled,
  form,
  className,
  ...aria
}: Props) {
  const options = Children.toArray(children).map((child) => {
    if (
      !isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child) ||
      child.type !== "option"
    ) {
      throw new TypeError("Select accepts audited option elements only")
    }
    const value = child.props.value
    if (typeof value !== "string" && typeof value !== "number")
      throw new TypeError("Select option value must be scalar")
    return { value: String(value), label: child.props.children, disabled: child.props.disabled }
  })
  if (Array.isArray(defaultValue))
    throw new TypeError("Multiple selection requires a separately audited component")
  const seen = new Set<string>()
  for (const option of options) {
    if (seen.has(option.value)) throw new TypeError("Select option values must be unique")
    seen.add(option.value)
  }
  // Base UI treats the empty scalar as no selection. Preserve the audited
  // native <option value=""> prompt so supplier onboarding fields never
  // appear blank before the user makes a required choice.
  const placeholder = options.find((option) => option.value === "")?.label
  return (
    <BaseSelect.Root
      items={options}
      name={name}
      defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
      required={required}
      disabled={disabled}
      form={form}
    >
      <BaseSelect.Trigger
        id={id}
        {...aria}
        className={classNames(
          "mt-2 flex min-h-11 w-full items-center justify-between rounded-control border border-line-strong bg-surface px-4 py-3 text-left text-ink shadow-control focus:ring-2 focus:ring-focus disabled:cursor-not-allowed disabled:bg-surface-muted",
          className,
        )}
      >
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon aria-hidden="true">▾</BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} className="z-[60]">
          <BaseSelect.Popup className="max-h-[min(24rem,70vh)] min-w-[var(--anchor-width)] overflow-auto rounded-control border border-line bg-surface p-1 text-ink shadow-panel">
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="min-h-11 cursor-default rounded-control px-3 py-2 data-highlighted:bg-surface-muted"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}
