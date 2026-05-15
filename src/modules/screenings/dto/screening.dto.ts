import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel } from '@prisma/client';

export class CreateScreeningDto {
  @ApiProperty({ description: '计划ID' }) @IsString() @IsOptional() planId?: string;
  @ApiProperty({ description: '经营主体ID' }) @IsString() @IsNotEmpty() entityId: string;
  @IsOptional() infoVerified?: boolean;
  @IsEnum(RiskLevel) @IsOptional() riskLevel?: RiskLevel;
  @IsString() @IsOptional() issues?: string;
  @IsString() @IsOptional() photos?: string;
  @IsString() @IsOptional() notes?: string;
}