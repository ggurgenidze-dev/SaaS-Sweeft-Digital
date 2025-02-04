/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionType } from './subscription.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Subscription } from './entities/subscription.entity';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly billingService: BillingService,
  ) {}

  @ApiOperation({ summary: 'Get current subscription' })
  @ApiResponse({
    status: 200,
    description: 'Current subscription details',
    type: Subscription,
  })
  @Get('current')
  async getCurrentSubscription(@Request() req) {
    return this.subscriptionsService.getCurrentSubscription(req.user.companyId);
  }

  @ApiOperation({ summary: 'Change subscription plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['FREE', 'BASIC', 'PREMIUM'],
          description: 'New subscription plan type',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Plan changed successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to change plan' })
  @Post('change-plan')
  async changePlan(@Body('type') type: SubscriptionType, @Request() req) {
    return this.subscriptionsService.changePlan(req.user.companyId, type);
  }

  @ApiOperation({ summary: 'Get current billing details' })
  @ApiResponse({
    status: 200,
    description: 'Current billing calculation',
    schema: {
      properties: {
        baseFee: { type: 'number', description: 'Monthly base fee' },
        storageOverageFee: {
          type: 'number',
          description: 'Storage overage charges',
        },
        fileOverageFee: {
          type: 'number',
          description: 'File count overage charges',
        },
        userOverageFee: {
          type: 'number',
          description: 'Additional users charges',
        },
        totalAmount: { type: 'number', description: 'Total monthly bill' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view billing' })
  @Get('billing')
  async getBilling(@Request() req) {
    if (req.user.type !== 'company') {
      throw new ForbiddenException(
        'Only company administrators can view billing',
      );
    }
    return this.billingService.calculateBill(req.user.id);
  }

  @ApiOperation({ summary: 'Preview billing for different plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['FREE', 'BASIC', 'PREMIUM'],
          description: 'Plan type to preview',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Billing preview for selected plan',
    schema: {
      properties: {
        baseFee: { type: 'number' },
        storageOverageFee: { type: 'number' },
        fileOverageFee: { type: 'number' },
        userOverageFee: { type: 'number' },
        totalAmount: { type: 'number' },
      },
    },
  })
  @Get('billing/preview')
  async previewBill(@Request() req, @Body('type') newType: SubscriptionType) {
    if (req.user.type !== 'company') {
      throw new ForbiddenException(
        'Only company administrators can view billing',
      );
    }
    return this.billingService.calculateBill(req.user.id);
  }

  @Post('initialize-free')
  async initializeFree(@Request() req) {
    return this.subscriptionsService.create(req.user.id, SubscriptionType.FREE);
  }

  @Get('plans')
  async getAvailablePlans() {
    return this.subscriptionsService.getAvailablePlans();
  }
}
