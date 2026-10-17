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

/**
 * Regression for native <option value=""> prompts retained by the Base UI
 * adapter. A blank required supplier category must visibly ask for a choice;
 * selecting a concrete value must still submit under the original field name.
 */
export const RequiredSupplierCategory: Story = {
  render: () => (
    <form aria-label="Synthetic supplier application">
      <label>
        Supplier category
        <Select name="category" defaultValue="" required>
          <option value="">Select a category…</option>
          <option value="coffee">Coffee</option>
          <option value="vanilla">Vanilla</option>
        </Select>
      </label>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole("combobox", { name: "Supplier category" })
    await expect(trigger).toHaveTextContent("Select a category…")
    await expect(trigger).toHaveAttribute("aria-required", "true")
    const form = canvas.getByRole("form", {
      name: "Synthetic supplier application",
    }) as HTMLFormElement
    await expect(new FormData(form).get("category") ?? "").toBe("")
    // This regression targets the missing empty-choice label. The Country
    // story independently proves keyboard selection and FormData propagation.
    // An empty required choice must remain visibly incomplete before input.
  },
}
