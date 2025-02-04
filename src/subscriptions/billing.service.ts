import { Injectable } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { EmployeesService } from '../employees/employees.service';
import { SUBSCRIPTION_PLANS } from './subscription.plans';
import { BillingCalculation } from './interfaces/billing.interface';

@Injectable()
export class BillingService {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly employeesService: EmployeesService,
  ) {}

  async calculateBill(companyId: string): Promise<BillingCalculation> {
    const subscription =
      await this.subscriptionsService.getCurrentSubscription(companyId);
    const plan = SUBSCRIPTION_PLANS[subscription.type];
    const employeeCount = await this.employeesService.getCount(companyId);

    // Base monthly fee
    const baseFee = plan.monthlyPrice;

    // Calculate storage overage (per MB over limit)
    const storageOverageMB = Math.max(
      0,
      subscription.currentStorageUsage / (1024 * 1024) - plan.maxFileSize,
    );
    const storageOverageFee = storageOverageMB * plan.additionalStoragePrice;

    // Calculate file count overage
    const fileOverage = Math.max(
      0,
      subscription.currentFileCount - plan.fileLimit,
    );
    const fileOverageFee = fileOverage * plan.additionalFilePrice;

    // Calculate user overage
    const userOverage = Math.max(0, employeeCount - plan.maxUsers);
    const userOverageFee = userOverage * plan.additionalUserPrice;

    // Calculate total
    const totalAmount =
      baseFee + storageOverageFee + fileOverageFee + userOverageFee;

    return {
      baseFee,
      storageOverageFee,
      fileOverageFee,
      userOverageFee,
      totalAmount,
    };
  }
}
