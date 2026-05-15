import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate } from 'class-validator';
import { SelfInspectionType } from '@prisma/client';

export class CreateSelfInspectionDto {
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(SelfInspectionType)
  @IsNotEmpty()
  type: SelfInspectionType;


  @IsString()
  @IsOptional()
  items?: string;

  @IsString()
  @IsOptional()
  issues?: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsString()
  @IsOptional()
  photos?: string;

  @IsDate()
  @IsOptional()
  inspectedAt?: Date;
}

export class UpdateSelfInspectionDto {
  @IsString()
  @IsOptional()
  entityId?: string;

  @IsEnum(SelfInspectionType)
  @IsOptional()
  type?: SelfInspectionType;

  @IsString()
  @IsOptional()
  items?: string;

  @IsString()
  @IsOptional()
  issues?: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsString()
  @IsOptional()
  photos?: string;

  @IsDate()
  @IsOptional()
  inspectedAt?: Date;
}
