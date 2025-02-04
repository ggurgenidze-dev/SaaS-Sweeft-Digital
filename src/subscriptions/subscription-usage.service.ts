import { Injectable, BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SUBSCRIPTION_PLANS } from './subscription.plans';

@Injectable()
export class SubscriptionUsageService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async checkStorageLimit(
    companyId: string,
    fileSize: number,
  ): Promise<boolean> {
    const subscription =
      await this.subscriptionsService.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.type];
    const newStorageUsage = subscription.currentStorageUsage + fileSize;

    if (newStorageUsage > plan.maxFileSize) {
      throw new BadRequestException(
        `Storage limit exceeded. Current: ${subscription.currentStorageUsage} bytes, Limit: ${plan.maxFileSize} bytes`,
      );
    }

    return true;
  }

  async checkFileLimit(companyId: string): Promise<boolean> {
    const subscription =
      await this.subscriptionsService.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    if (subscription.currentFileCount >= subscription.fileLimit) {
      throw new BadRequestException(
        `File limit exceeded. Current: ${subscription.currentFileCount}, Limit: ${subscription.fileLimit}`,
      );
    }

    return true;
  }

  async incrementUsage(companyId: string, fileSize: number): Promise<void> {
    const subscription =
      await this.subscriptionsService.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    subscription.currentStorageUsage += fileSize;
    subscription.currentFileCount += 1;

    await this.subscriptionsService.update(subscription);
  }

  async decrementUsage(companyId: string, fileSize: number): Promise<void> {
    const subscription =
      await this.subscriptionsService.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    subscription.currentStorageUsage = Math.max(
      0,
      subscription.currentStorageUsage - fileSize,
    );
    subscription.currentFileCount = Math.max(
      0,
      subscription.currentFileCount - 1,
    );

    await this.subscriptionsService.update(subscription);
  }
}
