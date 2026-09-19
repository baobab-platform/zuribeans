import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DesktopNavigation } from "./desktop-navigation"
import { ZURIBEANS_MARKETS } from "@/lib/market/markets"

const meta: Meta<typeof DesktopNavigation> = {
  title: "Navigation/DesktopNavigation",
  component: DesktopNavigation,
  parameters: { layout: "padded" },
  args: {
    marketContext: { active: ZURIBEANS_MARKETS[0], enabled: [...ZURIBEANS_MARKETS] },
  },
  decorators: [
    (Story) => (
      <div className="bg-ink p-6">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof DesktopNavigation>

export const Default: Story = {}
