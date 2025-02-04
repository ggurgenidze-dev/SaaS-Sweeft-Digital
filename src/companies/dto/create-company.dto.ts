import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { Industry } from '../entities/company.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Company name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'admin@acme.com',
    description: 'Admin email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Password (min 8 chars, must include number and special char)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  country: string;

  @ApiProperty({
    enum: Industry,
    example: 'TECHNOLOGY',
    description: 'Company industry sector',
  })
  @IsEnum(Industry)
  industry: Industry;
}
