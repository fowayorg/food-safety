import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '类型', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: '关联ID', required: false })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiProperty({ description: '关联类型', required: false })
  @IsOptional()
  @IsString()
  relatedType?: string;
}

export class UpdateNotificationDto {
  @ApiProperty({ description: '标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '内容', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '是否已读', required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ description: '类型', enum: NotificationType, required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ description: '关联ID', required: false })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiProperty({ description: '关联类型', required: false })
  @IsOptional()
  @IsString()
  relatedType?: string;
}
