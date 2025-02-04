import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { SubscriptionType } from '../subscription.types';
import { ApiProperty } from '@nestjs/swagger';

@Entity('subscriptions')
export class Subscription {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    enum: SubscriptionType,
    description: 'Subscription plan type',
  })
  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  type: SubscriptionType;

  @ApiProperty({ description: 'Monthly price in USD' })
  @Column('decimal', { precision: 10, scale: 2 })
  monthlyPrice: number;

  @ApiProperty({ description: 'Maximum number of files allowed' })
  @Column()
  fileLimit: number;

  @ApiProperty({ description: 'Current storage usage in bytes' })
  @Column({ default: 0 })
  currentStorageUsage: number;

  @ApiProperty({ description: 'Current number of files' })
  @Column({ default: 0 })
  currentFileCount: number;

  @Column({ default: 0 })
  additionalUserCount: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @ManyToOne(() => Company, (company) => company.subscriptions)
  company: Company;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
