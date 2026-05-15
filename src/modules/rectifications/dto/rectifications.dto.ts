import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRectificationDto {
  @ApiProperty() @IsString() recordId: string;
  @ApiProperty() @IsString() entityId: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH']) level?: string;
}

export class SubmitRectificationDto {
  @ApiProperty() @IsString() submitDescription: string;
  @ApiPropertyOptional() @IsOptional() @IsString() submitPhotos?: string;
}

export class ReviewRectificationDto {
  @ApiProperty() @IsEnum(['APPROVED', 'REJECTED']) reviewResult: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewRemark?: string;
}
