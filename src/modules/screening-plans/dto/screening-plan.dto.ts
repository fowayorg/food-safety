import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScreeningPlanDto {
  @ApiProperty({ description: '计划名称' }) @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() content?: string;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsString() @IsOptional() screenerIds?: string;
  @IsString() @IsOptional() entityIds?: string;
}
