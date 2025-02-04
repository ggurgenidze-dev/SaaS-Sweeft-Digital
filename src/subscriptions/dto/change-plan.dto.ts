import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionType } from '../subscription.types';
import { IsEnum } from 'class-validator';

export class ChangePlanDto {
  @ApiProperty({
    enum: SubscriptionType,
    example: 'PREMIUM',
    description: 'New subscription plan type',
  })
  @IsEnum(SubscriptionType)
  type: SubscriptionType;
}
