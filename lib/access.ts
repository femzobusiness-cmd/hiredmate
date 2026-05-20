/**
 * Temporary beta flag: all features unlocked regardless of subscription plan.
 * Stripe/subscription code remains; set to false to re-enable paid gating.
 */
export const BETA_ALL_FEATURES_FREE = true;

/** When false, free-plan session limits and upgrade gates apply. */
export function isPaidFeatureGatingEnabled(): boolean {
  return !BETA_ALL_FEATURES_FREE;
}
