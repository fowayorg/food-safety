import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDate } from 'class-validator';
import { FeedbackCategory } from '@prisma/client';

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(FeedbackCategory)
  @IsNotEmpty()
  category: FeedbackCategory;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  reply?: string;

  @IsString()
  @IsOptional()
  repliedBy?: string;

  @IsDate()
  @IsOptional()
  repliedAt?: Date;
}

export class UpdateFeedbackDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(FeedbackCategory)
  @IsOptional()
  category?: FeedbackCategory;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  reply?: string;

  @IsString()
  @IsOptional()
  repliedBy?: string;

  @IsDate()
  @IsOptional()
  repliedAt?: Date;
}
