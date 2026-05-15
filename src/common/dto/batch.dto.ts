import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class BatchDeleteDto {
  @IsArray()
  @ArrayMinSize(1, { message: '至少选择一条记录' })
  @ArrayMaxSize(100, { message: '一次最多删除100条记录' })
  @IsString({ each: true })
  ids: string[];
}

export class BatchReviewDto {
  @IsArray()
  @ArrayMinSize(1, { message: '至少选择一条记录' })
  @ArrayMaxSize(100, { message: '一次最多审核100条记录' })
  @IsString({ each: true })
  ids: string[];

  result: string; // APPROVED / REJECTED
  remark?: string;
}

export class BatchExportDto {
  @IsArray()
  @ArrayMinSize(1, { message: '至少选择一条记录' })
  @IsString({ each: true })
  ids?: string[];

  format?: 'xlsx' | 'csv' | 'pdf';
  fields?: string[];
}