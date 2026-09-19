import Image from "next/image"
import { MapLegend } from "@/components/markets/map-legend"
import type { TradeMapLocation } from "@/lib/content/market-presentation"

export function TradeMap({ locations }: { locations: readonly TradeMapLocation[] }) {
  return (
    <figure
      aria-labelledby="trade-map-title"
      className="overflow-hidden rounded-panel border border-white/15 bg-ink-soft shadow-panel"
      data-testid="trade-map"
    >
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p id="trade-map-title" className="font-display text-lg text-white">
            Initial operating contexts
          </p>
          <p className="mt-1 text-xs text-white/50">
            Capability shown by role, not speculative routes
          </p>
        </div>
        <MapLegend roles={locations.map(({ role }) => role)} />
      </div>

      <div className="relative min-h-[310px] overflow-hidden sm:min-h-[430px] lg:min-h-[520px]">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 58% 58%, rgba(213, 163, 76, .3), transparent 28%), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
            backgroundSize: "auto, 32px 32px, 32px 32px",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 top-1/2 aspect-[2/1] -translate-y-1/2">
          <Image
            src="/maps/world-natural-earth.svg"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-contain p-3 sm:p-6"
            aria-hidden="true"
          />

          {locations.map((location) => (
            <div
              key={location.marketKey}
              className="absolute z-10"
              style={{
                left: `${location.position.left}%`,
                top: `${location.position.top}%`,
              }}
            >
              <span
                className={`absolute top-1/2 hidden h-px w-7 -translate-y-1/2 bg-clay-inverse/60 sm:block ${location.labelSide === "left" ? "right-3" : "left-3"}`}
                aria-hidden="true"
              />
              <span
                className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 ring-4 ring-clay/20 ${location.role === "origin" ? "rounded-full bg-clay" : "rotate-45 border-2 border-clay-inverse bg-ink"}`}
                aria-hidden="true"
              />
              <span
                className={`absolute left-1/2 w-max max-w-36 -translate-x-1/2 rounded-control border border-white/15 bg-ink/90 px-3 py-2 text-center shadow-panel backdrop-blur-sm sm:top-1/2 sm:-translate-y-1/2 ${location.labelSide === "left" ? "top-5 sm:left-auto sm:right-10 sm:translate-x-0 sm:text-right" : "bottom-5 sm:bottom-auto sm:left-10 sm:translate-x-0 sm:text-left"}`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-clay-inverse">
                  {location.countryCode} · {location.roleLabel}
                </span>
                <span className="mt-0.5 block font-display text-sm text-white sm:text-base">
                  {location.name}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="border-t border-white/10 px-5 py-3 text-xs leading-5 text-white/45">
        Geography: Natural Earth public-domain data. Markers describe current ZuriBeans operating
        roles; they do not represent live shipments, inventory or confirmed trade lanes.
      </figcaption>
    </figure>
  )
}
