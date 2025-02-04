export interface BillingCalculation {
  baseFee: number;
  storageOverageFee: number;
  fileOverageFee: number;
  userOverageFee: number;
  totalAmount: number;
}
