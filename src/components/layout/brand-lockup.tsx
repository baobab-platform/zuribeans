import Link from "next/link"

/**
 * Sizes the mark at the two states the shell defines: 48px initial, 40px once
 * `HeaderScrollState` marks the document scrolled, via a CSS size swap so the
 * brand link stays a single focusable element. A plain `<img>` — not
 * `next/image` — serves the local SVG: Next Image optimization does not
 * process SVG sources without `dangerouslyAllowSVG`, which is a
 * security-header decision out of this component's scope.
 */
export function BrandLockup() {
  return (
    <Link href="/" aria-label="ZuriBeans home" className="flex shrink-0 items-center gap-3">
      <img
        src="/brand/zuribeans-mark.svg"
        alt=""
        width={48}
        height={48}
        className="size-12 shrink-0 transition-[width,height] duration-200 [.is-header-scrolled_&]:size-10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[28px] font-bold tracking-tight text-white lg:text-3xl">
          Zuribeans
        </span>
        <span className="mt-1 text-[10px] font-bold tracking-[0.18em] text-white/70 uppercase lg:text-[11px]">
          Commodities. Connected.
        </span>
      </span>
    </Link>
  )
}
