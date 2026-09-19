import Link from "next/link"

/**
 * Sizes the mark at the two states the shell defines: 48px initial, 40px once
 * `HeaderScrollState` marks the document scrolled, via a CSS size swap so the
 * brand link stays a single focusable element. A plain `<img>` — not
 * `next/image` — serves the local SVG: Next Image optimization does not
 * process SVG sources without `dangerouslyAllowSVG`, which is a
 * security-header decision out of this component's scope.
 *
 * Below `sm` (the narrowest phones, alongside the mobile Menu trigger in the
 * same row) the mark and wordmark shrink and the strapline hides entirely —
 * at full size the lockup alone exceeds a 320px viewport's available width.
 */
export function BrandLockup() {
  return (
    <Link
      href="/"
      aria-label="ZuriBeans home"
      className="flex shrink-0 items-center gap-2 sm:gap-3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG, next/image needs dangerouslyAllowSVG */}
      <img
        src="/brand/zuribeans-mark.svg"
        alt=""
        width={48}
        height={48}
        className="size-9 shrink-0 transition-[width,height] duration-200 sm:size-12 [.is-header-scrolled_&]:size-10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold tracking-tight text-white sm:text-[28px] lg:text-3xl">
          Zuribeans
        </span>
        <span className="mt-1 hidden text-[10px] font-bold tracking-[0.18em] text-white/70 uppercase sm:block lg:text-[11px]">
          Commodities. Connected.
        </span>
      </span>
    </Link>
  )
}
