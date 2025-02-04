import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsEmail } from 'class-validator';

export class CompanyLoginDto {
  @ApiProperty({
    example: 'admin@company.com',
    description: 'Company admin email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'YourPassword123!',
    description: 'Account password',
  })
  @IsString()
  password: string;
}

export class EmployeeLoginDto {
  @ApiProperty({
    example: 'employee@company.com',
    description: 'Employee email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'YourPassword123!',
    description: 'Account password',
  })
  @IsString()
  password: string;
}
