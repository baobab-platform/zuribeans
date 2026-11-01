import { expect, test } from "@playwright/test"

/**
 * Browser-computed contrast gate for all visible public-site buttons and
 * links styled as CTAs. Checks actual inherited backgrounds; CSS token and
 * variant strings alone cannot catch a blank-looking call to action.
 */
test("public action labels remain legible at desktop and mobile widths", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Canonical color contrast browser check")
  const routes = [
    "/",
    "/products",
    "/sourcing",
    "/sourcing/become-a-supplier",
    "/buyer",
    "/buyer/login",
    "/buyer/register",
    "/supplier/login",
    "/supplier/register",
    "/contact",
    "/help",
    "/trade",
  ]
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const failures = await page.evaluate(() => {
        type RGB = [number, number, number, number]
        const parseColor = (input: string): RGB | null => {
          const color = input.trim()
          if (color.startsWith("rgb(") || color.startsWith("rgba(")) {
            const parts = color.match(/[\d.]+/g)?.map(Number)
            if (!parts || parts.length < 3) return null
            return [parts[0], parts[1], parts[2], parts[3] ?? 1]
          }
          if (color.startsWith("color(srgb ")) {
            const parts = color.match(/[\d.]+/g)?.map(Number)
            if (!parts || parts.length < 3) return null
            return [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1]
          }
          return null
        }
        const blend = (front: RGB, back: RGB): RGB => {
          const a = front[3]
          return [
            front[0] * a + back[0] * (1 - a),
            front[1] * a + back[1] * (1 - a),
            front[2] * a + back[2] * (1 - a),
            1,
          ]
        }
        const luminance = ([r, g, b]: RGB) => {
          const linear = (value: number) => {
            const v = value / 255
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
          }
          return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
        }
        const contrast = (a: RGB, b: RGB) => {
          const light = Math.max(luminance(a), luminance(b))
          const dark = Math.min(luminance(a), luminance(b))
          return (light + 0.05) / (dark + 0.05)
        }
        const visible = (element: Element) => {
          const rect = element.getBoundingClientRect()
          const css = getComputedStyle(element)
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            css.visibility !== "hidden" &&
            css.display !== "none" &&
            css.opacity !== "0"
          )
        }
        const background = (element: Element): RGB => {
          const ancestors: Element[] = []
          for (let node: Element | null = element; node; node = node.parentElement) {
            ancestors.unshift(node)
          }
          let result: RGB = [247, 242, 233, 1]
          for (const node of ancestors) {
            const color = parseColor(getComputedStyle(node).backgroundColor)
            if (color) result = blend(color, result)
          }
          return result
        }
        return Array.from(
          document.querySelectorAll(
            "button, a[data-button-variant], a[class*='bg-ink'], a[class*='bg-clay']",
          ),
        )
          .filter((node) => visible(node) && !node.hasAttribute("disabled"))
          .filter((node) => node.textContent?.trim())
          .map((node) => {
            const css = getComputedStyle(node)
            const fg = parseColor(css.color)
            const bg = background(node)
            const effectiveFg = fg ? blend(fg, bg) : null
            return {
              tag: node.tagName.toLowerCase(),
              label: node.textContent?.trim().replace(/\s+/g, " ").slice(0, 72),
              variant: node.getAttribute("data-button-variant"),
              contrast: effectiveFg ? Number(contrast(effectiveFg, bg).toFixed(2)) : 0,
              foreground: css.color,
              background: getComputedStyle(node).backgroundColor,
            }
          })
          .filter((entry) => entry.contrast < 4.5)
      })
      expect(failures, `Unclear button or CTA text on ${route} at ${width}px`).toEqual([])
    }
  }
})
