import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { InspectionType, PlanStatus } from '@prisma/client';

export class AssignmentItem {
  @ApiProperty() @IsString() @IsNotEmpty() staffId: string;
  @ApiProperty() @IsString() @IsNotEmpty() entityId: string;
}

export class CreateInspectionPlanDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ enum: InspectionType }) @IsEnum(InspectionType) @IsNotEmpty() type: InspectionType;
  @ApiProperty() @IsString() @IsOptional() templateId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() legalBasis?: string;
  @ApiProperty() @IsDateString() @IsNotEmpty() startDate: string;
  @ApiProperty() @IsDateString() @IsNotEmpty() endDate: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiProperty({ type: [AssignmentItem] }) @IsArray() @IsOptional() assignments?: AssignmentItem[];
}

export class UpdateInspectionPlanDto {
  @ApiPropertyOptional() @IsString() @IsOptional() name?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() startDate?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() endDate?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() legalBasis?: string;
  @ApiPropertyOptional({ enum: PlanStatus }) @IsEnum(PlanStatus) @IsOptional() status?: PlanStatus;
}
