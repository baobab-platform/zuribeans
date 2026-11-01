import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { FeaturedCommodities } from "./featured-commodities"
import type { CommodityPresentation } from "@/lib/content/commodity"
import type { ProductCardModel } from "@/lib/medusa/types"

const classEntry: CommodityPresentation = {
  id: "coffee-class",
  name: "Green coffee",
  description: "Trade specification information on request.",
  href: "/products?category=coffee",
  eyebrow: "Product class",
  actionLabel: "View coffee",
  contextLabel: "African origin",
  image: {
    src: "/images/zuribeans-origin-trade-hero-v1.webp",
    alt: "Green coffee beans",
  },
}

const published: ProductCardModel = {
  id: "pub-01",
  handle: "uganda-arabica",
  title: "Uganda Arabica",
  subtitle: "Fully washed",
  thumbnail: null,
  cardFacts: { source: "provider" },
  origin: "Mount Elgon, Uganda",
}

afterEach(cleanup)

describe("Featured procurement catalogue", () => {
  it("prioritises provider-published products and does not fabricate commercial claims", () => {
    render(<FeaturedCommodities commodities={[classEntry]} products={[published]} />)
    expect(screen.getByRole("heading", { name: "Uganda Arabica" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View: Uganda Arabica" })).toHaveAttribute(
      "href",
      "/products/uganda-arabica",
    )
    expect(screen.queryByRole("link", { name: "View coffee: Green coffee" })).toBeNull()
    expect(screen.queryByText("Available (sample)")).toBeNull()
    expect(screen.queryByText("Limited (sample)")).toBeNull()
    expect(screen.queryByText(/^(ISO 22000|EUDR Ready|UTZ Certified)$/)).toBeNull()
  })

  it("falls back to governed product classes when no products are published", () => {
    render(<FeaturedCommodities commodities={[classEntry]} products={[]} />)
    expect(screen.getByRole("heading", { name: "Green coffee" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View coffee: Green coffee" })).toHaveAttribute(
      "href",
      "/products?category=coffee",
    )
    expect(screen.getByRole("link", { name: "Full Procurement Catalogue" })).toHaveAttribute(
      "href",
      "/products",
    )
  })

  it("does not invent an empty catalogue section", () => {
    const { container } = render(<FeaturedCommodities commodities={[]} products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
