import { classNames } from "@/lib/ui/classnames"
import {
  ZURIBEANS_IDENTITY,
  type TradeHouseAudience,
} from "@/lib/brand/identity"

/**
 * Editorial identity, not a policy check or legal-entity attestation.
 * Its language is estate-owned; BXS supplies the semantic UI foundation.
 */
export function TradeHouseSignature({
  audience = "public",
  tone = "default",
  compact = false,
  className,
}: {
  audience?: TradeHouseAudience
  tone?: "default" | "inverse"
  compact?: boolean
  className?: string
}) {
  const journey = ZURIBEANS_IDENTITY.journeys[audience]
  const inverse = tone === "inverse"

  return (
    <div
      data-testid="trade-house-signature"
      aria-label="ZuriBeans commodity trading identity"
      className={classNames(
        "flex max-w-2xl items-start gap-3 border-l-2 pl-4",
        inverse ? "border-clay-inverse text-canvas" : "border-clay text-ink",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG; optimisation requires a security-header decision */}
      <img
        src="/brand/zuribeans-mark.svg"
        alt=""
        width={32}
        height={32}
        className="mt-0.5 size-8 shrink-0"
      />
      <div className="min-w-0">
        <p
          className={classNames(
            "text-[11px] font-bold uppercase leading-5 tracking-[0.12em]",
            inverse ? "text-clay-inverse" : "text-clay-on-light",
          )}
        >
          {ZURIBEANS_IDENTITY.category} · {journey.label}
        </p>
        {!compact ? (
          <p className={classNames("mt-1 text-sm leading-6", inverse ? "text-canvas/80" : "text-muted")}>
            {journey.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
