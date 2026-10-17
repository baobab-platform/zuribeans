import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { expect, userEvent, within } from "storybook/test"
import { Select } from "./select"
const meta = { title: "Forms/Select", component: Select } satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>
export const Country: Story = {
  render: () => (
    <form aria-label="Synthetic company form">
      <label>
        Country
        <Select name="country" defaultValue="ZA" required>
          <option value="ZA">South Africa</option>
          <option value="UG">Uganda</option>
        </Select>
      </label>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("combobox", { name: "Country" })
    await userEvent.click(trigger)
    await userEvent.keyboard("{End}{Enter}")
    await expect(trigger).toHaveTextContent("Uganda")
    const form = canvas.getByRole("form", { name: "Synthetic company form" }) as HTMLFormElement
    await expect(new FormData(form).get("country")).toBe("UG")
    await userEvent.click(trigger)
    await userEvent.keyboard("{Escape}")
    await expect(trigger).toHaveFocus()
  },
}
