import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('files')
export class File {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Original filename' })
  @Column()
  filename: string;

  @ApiProperty({ description: 'File storage path' })
  @Column()
  path: string;

  @ApiProperty({ description: 'File MIME type' })
  @Column()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column()
  size: number;

  @ApiProperty({
    description: 'Whether file is visible to all company employees',
  })
  @Column({ default: false })
  isPublicInCompany: boolean;

  @ManyToOne(() => Company, (company) => company.files)
  company: Company;

  @ApiProperty({ description: 'Company ID that owns the file' })
  @Column()
  companyId: string;

  @ApiProperty({
    description: 'List of employees with access to file',
    type: () => [Employee],
  })
  @ManyToMany(() => Employee)
  @JoinTable()
  allowedEmployees: Employee[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
