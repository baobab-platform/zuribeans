// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "./button"

describe("Base UI Button", () => {
  it("never submits a form unless type=submit is explicit", () => {
    render(
      <form>
        <Button>Inspect quote</Button>
      </form>,
    )
    expect(screen.getByRole("button", { name: "Inspect quote" }).getAttribute("type")).toBe(
      "button",
    )
  })

  it("provides visible semantic foregrounds for primary, gold, inverse and outline CTAs", () => {
    const samples = [
      { variant: "primary", foreground: "var(--color-canvas)" },
      { variant: "secondary", foreground: "var(--color-canvas)" },
      { variant: "gold", foreground: "var(--color-ink)" },
      { variant: "inverse", foreground: "var(--color-canvas)" },
      { variant: "outline", foreground: "var(--color-ink)" },
      { variant: "ghost", foreground: "var(--color-ink)" },
      { variant: "danger", foreground: "var(--color-canvas)" },
    ] as const
    for (const { variant, foreground } of samples) {
      const { unmount } = render(<Button variant={variant}>{variant} action</Button>)
      const button = screen.getByRole("button", { name: `${variant} action` })
      expect(button.getAttribute("data-button-variant")).toBe(variant)
      expect(button.style.color).toBe(foreground)
      unmount()
    }
  })

  it("keeps disabled native semantics", () => {
    render(<Button disabled>Unavailable</Button>)
    expect(screen.getByRole("button", { name: "Unavailable" }).hasAttribute("disabled")).toBe(true)
  })
})
