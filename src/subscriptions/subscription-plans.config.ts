import { SubscriptionType } from './subscription.types';

type SubscriptionPlan = {
  monthlyPrice: number;
  fileLimit: number;
  maxUsers: number;
  additionalUserPrice: number;
  additionalFilePrice: number;
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionType, SubscriptionPlan> = {
  FREE: {
    monthlyPrice: 0,
    fileLimit: 10,
    maxUsers: 1,
    additionalUserPrice: 0,
    additionalFilePrice: 0,
  },
  BASIC: {
    monthlyPrice: 5,
    fileLimit: 100,
    maxUsers: 10,
    additionalUserPrice: 5,
    additionalFilePrice: 0,
  },
  PREMIUM: {
    monthlyPrice: 300,
    fileLimit: 1000,
    maxUsers: Number.MAX_SAFE_INTEGER, // unlimited users
    additionalUserPrice: 0,
    additionalFilePrice: 0.5,
  },
};
