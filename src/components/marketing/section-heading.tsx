import { classNames } from "@/lib/ui/classnames"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
  tone?: "default" | "inverse"
}) {
  return (
    <div className={classNames("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className={tone === "inverse" ? "eyebrow-inverse" : "eyebrow"}>{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl leading-tight text-balance md:text-5xl">{title}</h2>
      {description ? (
        <p
          className={classNames(
            "mt-5 text-lg leading-8",
            tone === "inverse" ? "text-white/70" : "text-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
