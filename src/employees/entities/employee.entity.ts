import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { File } from '../../files/entities/file.entity';
import { EmployeeRole } from '../employee.types';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('employees')
export class Employee {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Employee email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Employee full name' })
  @Column()
  name: string;

  @ApiProperty({
    enum: EmployeeRole,
    description: 'Employee role in company',
  })
  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.EMPLOYEE,
  })
  role: EmployeeRole;

  @ApiProperty({ description: 'Whether employee account is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Company ID the employee belongs to' })
  @Column()
  companyId: string;

  @ApiProperty({ type: () => Company })
  @ManyToOne(() => Company, (company) => company.employees)
  company: Company;

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

  // Exclude sensitive data from Swagger docs
  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @Column({ nullable: true })
  refreshToken?: string;

  @ManyToMany(() => File, (file) => file.allowedEmployees)
  accessibleFiles: File[];

  @Column({ nullable: true })
  activationToken: string | null;
}
