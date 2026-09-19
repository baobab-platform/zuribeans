import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { UtilityBar } from "./utility-bar"
import { ZURIBEANS_MARKETS } from "@/lib/market/markets"

const marketContext = {
  active: ZURIBEANS_MARKETS[0],
  enabled: [...ZURIBEANS_MARKETS],
}

const meta: Meta<typeof UtilityBar> = {
  title: "Layout/UtilityBar",
  component: UtilityBar,
  parameters: { layout: "fullscreen" },
  args: { marketContext, hasSession: false },
  decorators: [
    (Story) => (
      <div className="bg-ink">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof UtilityBar>

export const Anonymous: Story = {}

export const SignedIn: Story = { args: { hasSession: true } }

export const SingleMarket: Story = {
  args: { marketContext: { active: ZURIBEANS_MARKETS[0], enabled: [ZURIBEANS_MARKETS[0]] } },
}
