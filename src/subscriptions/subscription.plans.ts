export const SUBSCRIPTION_PLANS = {
  FREE: {
    monthlyPrice: 0,
    fileLimit: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxUsers: 5,
    additionalUserPrice: 0,
    additionalFilePrice: 0,
    additionalStoragePrice: 0,
  },
  BASIC: {
    monthlyPrice: 10,
    fileLimit: 100,
    maxFileSize: 15 * 1024 * 1024, // 15MB
    maxUsers: 20,
    additionalUserPrice: 2,
    additionalFilePrice: 0.5,
    additionalStoragePrice: 0.1, // $0.10 per MB over limit
  },
  PREMIUM: {
    monthlyPrice: 25,
    fileLimit: 1000,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxUsers: 100,
    additionalUserPrice: 1,
    additionalFilePrice: 0.2,
    additionalStoragePrice: 0.05, // $0.05 per MB over limit
  },
} as const;
