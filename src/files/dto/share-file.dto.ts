import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class ShareFileDto {
  @IsBoolean()
  @IsOptional()
  isPublicInCompany?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  employeeIds?: string[];
}
