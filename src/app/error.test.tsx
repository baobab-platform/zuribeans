import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ErrorPage from "./error"

describe("ErrorPage", () => {
  it("offers an explicit retry without exposing error details", () => {
    const retry = vi.fn()

    render(<ErrorPage error={new Error("commercially sensitive detail")} retry={retry} />)

    expect(screen.getByRole("alert")).not.toHaveTextContent("commercially sensitive detail")
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
