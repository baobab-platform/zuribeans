import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { MobileNavigation } from "./mobile-navigation"
import { ZURIBEANS_MARKETS } from "@/lib/market/markets"

const meta: Meta<typeof MobileNavigation> = {
  title: "Navigation/MobileNavigation",
  component: MobileNavigation,
  parameters: { layout: "padded" },
  args: {
    marketContext: { active: ZURIBEANS_MARKETS[0], enabled: [...ZURIBEANS_MARKETS] },
    hasSession: false,
  },
  decorators: [
    (Story) => (
      // The trigger is `xl:hidden`: narrow the Storybook browser window below
      // the `xl` breakpoint (1280px) to see it — Tailwind's media query
      // responds to the real viewport, which a wrapper element can't fake.
      <div className="bg-ink p-6">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof MobileNavigation>

export const Anonymous: Story = {}

export const SignedIn: Story = { args: { hasSession: true } }
