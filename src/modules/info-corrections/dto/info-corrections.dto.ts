import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

// 纠错状态
export enum InfoCorrectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export class CreateInfoCorrectionDto {
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsOptional()
  submittedBy?: string;

  @IsString()
  @IsOptional()
  submitterPhone?: string;

  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsString()
  @IsOptional()
  oldValue?: string;

  @IsString()
  @IsNotEmpty()
  newValue: string;

  @IsString()
  @IsOptional()
  evidence?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateInfoCorrectionDto {
  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  submittedBy?: string;

  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsString()
  @IsOptional()
  oldValue?: string;

  @IsString()
  @IsOptional()
  newValue?: string;

  @IsString()
  @IsOptional()
  evidence?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class ReviewInfoCorrectionDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  reviewRemark?: string;
}

export class InfoCorrectionQueryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 10;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}