import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreateScreeningRecordDto {
  @IsString()
  @IsOptional()
  planId?: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsBoolean()
  @IsOptional()
  infoVerified?: boolean;

  @IsString()
  @IsOptional()
  riskLevel?: string;

  @IsString()
  @IsOptional()
  issues?: string;

  @IsString()
  @IsOptional()
  photos?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  screenedAt?: string;
}

export class UpdateScreeningRecordDto {
  @IsBoolean()
  @IsOptional()
  infoVerified?: boolean;

  @IsString()
  @IsOptional()
  riskLevel?: string;

  @IsString()
  @IsOptional()
  issues?: string;

  @IsString()
  @IsOptional()
  photos?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  screenedAt?: string;
}
