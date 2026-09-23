import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { InsightArticle } from "@/lib/content/insights"
import { InsightCard } from "./insight-card"

const sampleArticle: InsightArticle = {
  slug: "reading-a-uganda-harvest-report-as-a-buyer",
  title: "Reading a Uganda harvest report as a buyer",
  excerpt:
    "What a procurement team should actually take from a seasonal harvest update — and what it can't tell you.",
  body: ["Body copy."],
  category: "market-intelligence",
  marketKeys: ["zuribeans_ug"],
  publishedAt: "2026-09-15",
  authorName: "ZuriBeans Editorial",
  status: "published",
  canonicalContentId: null,
}

const meta: Meta<typeof InsightCard> = {
  title: "Insights/InsightCard",
  component: InsightCard,
  parameters: { layout: "padded" },
  args: { article: sampleArticle },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof InsightCard>

export const Default: Story = {}

export const WithHeroImage: Story = {
  args: {
    article: {
      ...sampleArticle,
      heroImage: {
        src: "/images/zuribeans-origin-trade-hero-v1.webp",
        alt: "Coffee lots prepared for export",
      },
    },
  },
}

export const GlobalArticle: Story = {
  args: {
    article: {
      ...sampleArticle,
      slug: "company-update",
      title: "Company update: new quality partnerships",
      category: "company-news",
      marketKeys: null,
    },
  },
}
