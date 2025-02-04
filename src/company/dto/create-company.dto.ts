import { IsEmail, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Industry } from '../entities/company.entity';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsEnum(Industry)
  industry: Industry;
}
