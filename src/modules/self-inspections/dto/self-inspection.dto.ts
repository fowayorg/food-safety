import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SelfInspectionType } from '@prisma/client';

export class CreateSelfInspectionDto {
  @ApiProperty({ description: '经营主体ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: '自查类型', enum: SelfInspectionType })
  @IsEnum(SelfInspectionType)
  type: SelfInspectionType;

  @ApiProperty({ description: '检查项', required: false })
  @IsOptional()
  @IsString()
  items?: string;

  @ApiProperty({ description: '问题', required: false })
  @IsOptional()
  @IsString()
  issues?: string;

  @ApiProperty({ description: '结果', required: false })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ description: '照片', required: false })
  @IsOptional()
  @IsString()
  photos?: string;
}

export class UpdateSelfInspectionDto {
  @ApiProperty({ description: '自查类型', enum: SelfInspectionType, required: false })
  @IsOptional()
  @IsEnum(SelfInspectionType)
  type?: SelfInspectionType;

  @ApiProperty({ description: '检查项', required: false })
  @IsOptional()
  @IsString()
  items?: string;

  @ApiProperty({ description: '问题', required: false })
  @IsOptional()
  @IsString()
  issues?: string;

  @ApiProperty({ description: '结果', required: false })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ description: '照片', required: false })
  @IsOptional()
  @IsString()
  photos?: string;
}
