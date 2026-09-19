import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, userEvent, within } from "storybook/test"
import { NavDisclosure } from "./nav-disclosure"

const meta: Meta<typeof NavDisclosure> = {
  title: "Navigation/NavDisclosure",
  component: NavDisclosure,
  parameters: { layout: "padded" },
  args: {
    label: "Commodities",
    items: [
      { href: "/products", label: "View all commodities" },
      { href: "/products?category=coffee", label: "Green coffee" },
      { href: "/products?category=vanilla", label: "Vanilla pods" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="bg-ink p-10">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof NavDisclosure>

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Commodities" }))
    await expect(canvas.getByRole("link", { name: "View all commodities" })).toBeVisible()
  },
}
