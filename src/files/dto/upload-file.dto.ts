import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    description: 'File to upload (CSV, XLS, XLSX only)',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Whether file should be visible to all company employees',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublicInCompany?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  allowedEmployeeIds?: string[];
}
