import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityType, EntityStatus, RiskLevel } from '@prisma/client';

export class CreateEntityDto {
  @ApiProperty({ description: '统一社会信用代码' }) @IsString() @IsOptional() creditCode?: string;
  @ApiProperty({ description: '主体名称' }) @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ description: '主体类型', enum: EntityType }) @IsEnum(EntityType) type: EntityType;
  @ApiProperty({ description: '法定代表人' }) @IsString() @IsOptional() legalPerson?: string;
  @ApiProperty({ description: '地址' }) @IsString() @IsOptional() address?: string;
  @ApiProperty({ description: '街道ID' }) @IsString() @IsOptional() streetId?: string;
  @ApiProperty({ description: '经营范围' }) @IsString() @IsOptional() businessScope?: string;
  @ApiProperty({ description: '成立日期' }) @IsDateString() @IsOptional() establishedAt?: string;
  @ApiProperty({ description: '包保等级' }) @IsString() @IsOptional() guaranteeLevel?: string;
  @ApiProperty({ description: '食品安全总监' }) @IsString() @IsOptional() safetyDirector?: string;
  @ApiProperty({ description: '食品安全员' }) @IsString() @IsOptional() safetyOfficer?: string;
  @ApiProperty({ description: '包保干部姓名' }) @IsString() @IsOptional() guaranteeCadre?: string;
  @ApiProperty({ description: '包保干部职务' }) @IsString() @IsOptional() guaranteeCadreTitle?: string;
}

export class UpdateEntityDto {
  @IsString() @IsOptional() creditCode?: string;
  @IsString() @IsOptional() name?: string;
  @IsEnum(EntityType) @IsOptional() type?: EntityType;
  @IsString() @IsOptional() legalPerson?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() streetId?: string;
  @IsString() @IsOptional() businessScope?: string;
  @IsString() @IsOptional() guaranteeLevel?: string;
  @IsString() @IsOptional() safetyDirector?: string;
  @IsString() @IsOptional() safetyOfficer?: string;
  @IsString() @IsOptional() guaranteeCadre?: string;
  @IsString() @IsOptional() guaranteeCadreTitle?: string;
  @IsEnum(EntityStatus) @IsOptional() status?: EntityStatus;
  @IsEnum(RiskLevel) @IsOptional() riskLevel?: RiskLevel;
}

export class UpdateLicenseDto {
  @IsString() @IsOptional() licenseType?: any;
  @IsString() @IsOptional() licenseNo?: string;
  @IsString() @IsOptional() licenseContent?: string;
  @IsDateString() @IsOptional() validFrom?: string;
  @IsDateString() @IsOptional() validTo?: string;
  @IsString() @IsOptional() licensePhoto?: string;
  @IsString() @IsOptional() businessLicensePhoto?: string;
}

export class CreateLicenseDto {
  @ApiProperty({ description: '许可类型' }) @IsNotEmpty() licenseType: any;
  @IsString() @IsOptional() licenseNo?: string;
  @IsString() @IsOptional() licenseContent?: string;
  @IsDateString() @IsOptional() validFrom?: string;
  @IsDateString() @IsOptional() validTo?: string;
  @IsString() @IsOptional() licensePhoto?: string;
  @IsString() @IsOptional() businessLicensePhoto?: string;
}

export class CreatePhotoDto {
  @ApiProperty({ description: '照片分类' }) @IsNotEmpty() category: any;
  @ApiProperty({ description: '照片URL' }) @IsString() @IsNotEmpty() url: string;
  @IsString() @IsOptional() description?: string;
}
