import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType, ActivityStatus } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty({ description: '活动名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '活动类型', enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ description: '活动描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '活动配置', required: false })
  @IsOptional()
  @IsString()
  config?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '状态', enum: ActivityStatus, required: false })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiProperty({ description: '目标受众', required: false })
  @IsOptional()
  @IsString()
  targetAudience?: string;
}

export class UpdateActivityDto {
  @ApiProperty({ description: '活动名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '活动类型', enum: ActivityType, required: false })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiProperty({ description: '活动描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '活动配置', required: false })
  @IsOptional()
  @IsString()
  config?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '状态', enum: ActivityStatus, required: false })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiProperty({ description: '目标受众', required: false })
  @IsOptional()
  @IsString()
  targetAudience?: string;
}
