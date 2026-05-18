import { IsString, IsOptional, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LicenseType {
  FOOD_BUSINESS = 'FOOD_BUSINESS',
  FOOD_PRODUCTION = 'FOOD_PRODUCTION',
  FOOD_CATERING = 'FOOD_CATERING',
  FOOD_CIRCULATION = 'FOOD_CIRCULATION',
  SMALL_FOOD = 'SMALL_FOOD',
}

export class CreateLicenseDto {
  @ApiProperty({ description: '经营主体ID' })
  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @ApiProperty({ enum: LicenseType, description: '许可类型' })
  @IsEnum(LicenseType)
  licenseType!: string;

  @ApiProperty({ description: '许可证号' })
  @IsString()
  licenseNo!: string;

  @ApiPropertyOptional({ description: '许可内容' })
  @IsOptional()
  @IsString()
  licenseContent?: string;

  @ApiPropertyOptional({ description: '有效期开始' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: '有效期截止', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class UpdateLicenseDto {
  @ApiPropertyOptional({ enum: LicenseType })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ description: '有效期截止', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}