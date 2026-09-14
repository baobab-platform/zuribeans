import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import ErrorPage from "./error"

afterEach(cleanup)

describe("ErrorPage", () => {
  it("offers an explicit retry without exposing error details", () => {
    const retry = vi.fn()
    const reset = vi.fn()

    render(
      <ErrorPage error={new Error("commercially sensitive detail")} retry={retry} reset={reset} />,
    )

    expect(screen.getByRole("alert")).not.toHaveTextContent("commercially sensitive detail")
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
    expect(reset).not.toHaveBeenCalled()
  })

  it("falls back to resetting the boundary when retry is unavailable", () => {
    const reset = vi.fn()

    render(<ErrorPage error={new Error("failed")} reset={reset} />)

    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(reset).toHaveBeenCalledOnce()
  })
})
