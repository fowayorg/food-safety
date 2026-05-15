import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsString()
  relatedType?: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsString()
  relatedType?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
