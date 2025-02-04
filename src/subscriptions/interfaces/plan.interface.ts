export interface Plan {
  monthlyPrice: number;
  fileLimit: number;
  maxUsers: number;
  additionalUserPrice: number;
  additionalFilePrice: number;
  unlimitedUsers?: boolean;
}
