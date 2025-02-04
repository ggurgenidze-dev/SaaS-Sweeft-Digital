import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionUsageService } from './subscription-usage.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';
import { CompaniesModule } from '../companies/companies.module';
import { BillingService } from './billing.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    forwardRef(() => CompaniesModule),
    forwardRef(() => EmployeesModule),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionUsageService, BillingService],
  exports: [SubscriptionsService, SubscriptionUsageService, BillingService],
})
export class SubscriptionsModule {}
