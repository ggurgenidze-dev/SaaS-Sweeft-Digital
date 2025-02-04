import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { File } from '../../files/entities/file.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export enum Industry {
  FINANCE = 'FINANCE',
  ECOMMERCE = 'ECOMMERCE',
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTHCARE = 'HEALTHCARE',
  OTHER = 'OTHER',
}

@Entity('companies')
export class Company {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Company name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Admin email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    enum: Industry,
    description: 'Company industry sector',
  })
  @Column({
    type: 'enum',
    enum: Industry,
    default: Industry.OTHER,
  })
  industry: Industry;

  @ApiProperty({
    description: 'Creation timestamp',
    type: Date,
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: Date,
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Exclude password from Swagger docs
  @Exclude()
  @Column()
  password: string;

  @Column()
  country: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  activationToken: string;

  @OneToMany(() => Employee, (employee) => employee.company)
  employees: Employee[];

  @OneToMany(() => File, (file) => file.company)
  files: File[];

  @OneToMany(() => Subscription, (subscription) => subscription.company)
  subscriptions: Subscription[];
}
