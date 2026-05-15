import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ComplaintCategory, ComplaintStatus } from '@prisma/client';

export class CreateComplaintDto {
  @IsString()
  @IsOptional()
  entityId?: string;

  @IsEnum(ComplaintCategory)
  @IsNotEmpty()
  category: ComplaintCategory;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  evidence?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  reporterName?: string;

  @IsString()
  @IsOptional()
  reporterPhone?: string;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;
}

export class UpdateComplaintDto {
  @IsString()
  @IsOptional()
  entityId?: string;

  @IsEnum(ComplaintCategory)
  @IsOptional()
  category?: ComplaintCategory;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  evidence?: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  reporterName?: string;

  @IsString()
  @IsOptional()
  reporterPhone?: string;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;
}
