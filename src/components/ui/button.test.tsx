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

  it("keeps disabled native semantics", () => {
    render(<Button disabled>Unavailable</Button>)
    expect(screen.getByRole("button", { name: "Unavailable" }).hasAttribute("disabled")).toBe(true)
  })
})
