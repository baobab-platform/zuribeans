import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/content/insight-content-provider", () => ({
  insightContentProvider: {
    listSyndicationEligible: vi.fn().mockResolvedValue([
      {
        slug: "safe-and-sound",
        title: "Safe & sound",
        excerpt: "Published <globally>.",
        authorName: "ZuriBeans Editorial",
        publishedAt: "2026-09-22",
      },
    ]),
  },
}))

describe("Insights Atom feed", () => {
  it("serializes only provider-approved entries as XML", async () => {
    const { GET } = await import("./route")
    const response = await GET()
    const body = await response.text()

    expect(response.headers.get("content-type")).toBe("application/atom+xml; charset=utf-8")
    expect(body).toContain("<title>Safe &amp; sound</title>")
    expect(body).toContain("<summary>Published &lt;globally&gt;.</summary>")
    expect(body).toContain("/insights/safe-and-sound")
  })
})
