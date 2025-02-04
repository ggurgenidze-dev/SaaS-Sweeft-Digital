import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CompaniesService } from '../companies/companies.service';
import { SubscriptionType } from './subscription.types';
import { SUBSCRIPTION_PLANS } from './subscription.plans';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
  ) {}

  async initializeFreeSubscription(companyId: string): Promise<Subscription> {
    return this.create(companyId, SubscriptionType.FREE);
  }

  async create(
    companyId: string,
    type: SubscriptionType,
  ): Promise<Subscription> {
    const company = await this.companiesService.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existingSubscription = await this.getCurrentSubscription(companyId);
    if (existingSubscription) {
      throw new BadRequestException(
        'Company already has an active subscription',
      );
    }

    const plan = SUBSCRIPTION_PLANS[type];
    const subscription = new Subscription();
    subscription.type = type;
    subscription.startDate = new Date();
    subscription.company = company;
    subscription.monthlyPrice = plan.monthlyPrice;
    subscription.fileLimit = plan.fileLimit;
    subscription.currentFileCount = 0;
    subscription.additionalUserCount = 0;

    return this.subscriptionRepository.save(subscription);
  }

  async getCurrentSubscription(companyId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        companyId,
        endDate: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!subscription) {
      // Check if company exists before creating subscription
      const company = await this.companiesService.findById(companyId);
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const plan = SUBSCRIPTION_PLANS[SubscriptionType.FREE];
      const newSubscription = this.subscriptionRepository.create({
        type: SubscriptionType.FREE,
        companyId,
        startDate: new Date(),
        monthlyPrice: plan.monthlyPrice,
        fileLimit: plan.fileLimit,
        currentFileCount: 0,
        currentStorageUsage: 0,
      });

      return this.subscriptionRepository.save(newSubscription);
    }

    return subscription;
  }

  async getAvailablePlans() {
    return SUBSCRIPTION_PLANS;
  }

  async changePlan(
    companyId: string,
    newType: SubscriptionType,
  ): Promise<Subscription> {
    const currentSubscription = await this.getCurrentSubscription(companyId);
    if (!currentSubscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (currentSubscription.type === newType) {
      throw new BadRequestException('Company is already on this plan');
    }

    const company = await this.companiesService.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // End current subscription
    currentSubscription.endDate = new Date();
    await this.subscriptionRepository.save(currentSubscription);

    // Create new subscription
    const plan = SUBSCRIPTION_PLANS[newType];
    const newSubscription = new Subscription();
    newSubscription.type = newType;
    newSubscription.startDate = new Date();
    newSubscription.company = company;
    newSubscription.monthlyPrice = plan.monthlyPrice;
    newSubscription.fileLimit = plan.fileLimit;
    newSubscription.currentFileCount = currentSubscription.currentFileCount;
    newSubscription.additionalUserCount =
      currentSubscription.additionalUserCount;

    // Check if current usage exceeds new plan limits
    if (currentSubscription.currentFileCount > plan.fileLimit) {
      throw new BadRequestException(
        `Cannot downgrade: Current file count (${currentSubscription.currentFileCount}) exceeds new plan limit (${plan.fileLimit})`,
      );
    }

    return this.subscriptionRepository.save(newSubscription);
  }

  async calculateCurrentBill(companyId: string): Promise<number> {
    const subscription = await this.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.type];
    let totalBill = plan.monthlyPrice;

    // Add additional file charges for premium plan
    if (
      subscription.type === SubscriptionType.PREMIUM &&
      subscription.currentFileCount > plan.fileLimit
    ) {
      const extraFiles = subscription.currentFileCount - plan.fileLimit;
      totalBill += extraFiles * plan.additionalFilePrice;
    }

    // Add per-user charges for basic plan
    if (
      subscription.type === SubscriptionType.BASIC &&
      subscription.additionalUserCount > 0
    ) {
      totalBill += subscription.additionalUserCount * plan.additionalUserPrice;
    }

    return totalBill;
  }

  async checkFileUploadLimit(companyId: string): Promise<void> {
    const subscription = await this.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    const plan = SUBSCRIPTION_PLANS[subscription.type];

    if (
      subscription.type !== SubscriptionType.PREMIUM &&
      subscription.currentFileCount >= plan.fileLimit
    ) {
      throw new BadRequestException(
        'File upload limit reached for current subscription',
      );
    }
  }

  async incrementFileCount(companyId: string): Promise<void> {
    const subscription = await this.getCurrentSubscription(companyId);
    if (subscription) {
      subscription.currentFileCount += 1;
      await this.subscriptionRepository.save(subscription);
    }
  }

  async decrementFileCount(companyId: string): Promise<void> {
    const subscription = await this.getCurrentSubscription(companyId);
    if (subscription && subscription.currentFileCount > 0) {
      subscription.currentFileCount -= 1;
      await this.subscriptionRepository.save(subscription);
    }
  }

  async updateUserCount(companyId: string, userCount: number): Promise<void> {
    const subscription = await this.getCurrentSubscription(companyId);
    if (!subscription) {
      return;
    }

    const plan = SUBSCRIPTION_PLANS[subscription.type];

    if (
      subscription.type === SubscriptionType.FREE &&
      userCount > plan.maxUsers
    ) {
      throw new BadRequestException('Free tier limited to 1 user');
    }

    if (subscription.type === SubscriptionType.BASIC) {
      subscription.additionalUserCount = Math.max(0, userCount - 1); // First user is included
      await this.subscriptionRepository.save(subscription);
    }
  }

  async validateUserLimit(
    companyId: string,
    plannedUserCount: number,
  ): Promise<void> {
    const subscription = await this.getCurrentSubscription(companyId);
    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    if (subscription.type === SubscriptionType.FREE && plannedUserCount > 1) {
      throw new BadRequestException('Free tier is limited to 1 user');
    }

    if (subscription.type === SubscriptionType.BASIC && plannedUserCount > 10) {
      throw new BadRequestException('Basic tier is limited to 10 users');
    }
  }

  private async cancelActiveSubscription(companyId: string): Promise<void> {
    const activeSubscription = await this.getCurrentSubscription(companyId);
    if (activeSubscription) {
      activeSubscription.endDate = new Date();
      await this.subscriptionRepository.save(activeSubscription);
    }
  }

  async update(subscription: Subscription): Promise<Subscription> {
    return this.subscriptionRepository.save(subscription);
  }
}
