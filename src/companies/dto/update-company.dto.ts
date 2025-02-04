import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Industry } from '../entities/company.entity';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;
}
