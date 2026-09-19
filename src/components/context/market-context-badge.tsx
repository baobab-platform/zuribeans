import type { ZuribeansMarket } from "@/lib/market/markets";

type MarketContextBadgeProps = {
  market: ZuribeansMarket;
  tone?: "default" | "inverse";
};

export function MarketContextBadge({
  market,
  tone = "default",
}: MarketContextBadgeProps) {
  return (
    <p
      className={
        tone === "inverse"
          ? "inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70"
          : "inline-flex items-center gap-3 rounded-full border border-line bg-surface-raised px-4 py-2 text-sm text-muted"
      }
    >
      <span className="size-2 rounded-full bg-success" aria-hidden="true" />
      <span>
        Viewing the{" "}
        <strong className="font-semibold text-current">
          {market.displayName}
        </strong>{" "}
        market in {market.currency}
      </span>
    </p>
  );
}
