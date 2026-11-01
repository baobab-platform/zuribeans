/**
 * Never use synthetic fixtures as a fallback for failed authoritative services.
 * This gate is server-side, opt-in, and impossible to enable in a production build.
 */
export function isSyntheticExperienceEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === "development" && env.ZB_DEV_DATA_MODE === "synthetic"
}
