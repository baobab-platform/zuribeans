import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { BrandLockup } from "./brand-lockup"

const meta: Meta<typeof BrandLockup> = {
  title: "Layout/BrandLockup",
  component: BrandLockup,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="bg-ink p-6">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof BrandLockup>

export const Default: Story = {}

export const Scrolled: Story = {
  decorators: [
    (Story) => (
      <div className="is-header-scrolled">
        <Story />
      </div>
    ),
  ],
}
