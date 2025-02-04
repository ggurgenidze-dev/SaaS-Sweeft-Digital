import { IsEmail, IsString, IsEnum } from 'class-validator';
import { EmployeeRole } from '../employee.types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Employee email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Employee full name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: EmployeeRole,
    example: 'MANAGER',
    description: 'Employee role in company',
  })
  @IsEnum(EmployeeRole)
  role: EmployeeRole;
}
