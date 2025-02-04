import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateFileAccessDto {
  @ApiProperty({
    description: 'Whether file is visible to all company employees',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublicInCompany?: boolean;

  @ApiProperty({
    description: 'List of employee IDs who can access the file',
    type: [String],
    required: false,
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  allowedEmployeeIds?: string[];
}
