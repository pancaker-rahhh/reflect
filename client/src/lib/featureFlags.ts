// Feature flags for MVP development
export const featureFlags = {
  // Invitation system features
  ENABLE_BULK_TEXT_INVITES: false,
  ENABLE_CSV_UPLOAD_INVITES: false,
  
  // Navigation features
  SHOW_ORG_SETTINGS_IN_SIDEBAR: false,
  
  // Other features that might need flags later
  // ENABLE_ANALYTICS: false,
  // ENABLE_ADVANCED_PERMISSIONS: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return featureFlags[flag];
};