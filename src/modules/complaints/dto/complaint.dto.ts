import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComplaintCategory, Satisfaction } from '@prisma/client';
export class CreateComplaintDto {
  @IsString() @IsOptional() entityId?: string;
  @ApiProperty({ description: '投诉类别' }) @IsEnum(ComplaintCategory) category: ComplaintCategory;
  @ApiProperty({ description: '投诉内容' }) @IsString() @IsNotEmpty() content: string;
  @IsString() @IsOptional() evidence?: string;
  @IsBoolean() @IsOptional() isAnonymous?: boolean;
  @IsString() @IsOptional() reporterName?: string;
  @IsString() @IsOptional() reporterPhone?: string;
}
export class HandleComplaintDto {
  @ApiProperty({ description: '处理结果' }) @IsString() @IsNotEmpty() result: string;
  @IsString() @IsOptional() photos?: string;
}
export class FeedbackComplaintDto {
  @ApiProperty({ description: '满意度' }) @IsEnum(Satisfaction) satisfaction: Satisfaction;
  @IsString() @IsOptional() remark?: string;
}