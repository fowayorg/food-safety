import { IsOptional, IsString, IsInt, IsEnum, Min, Max, IsDateString } from 'class-validator';

export enum ScanAction {
  VIEW = 'VIEW',
  VERIFY = 'VERIFY',
  REPORT = 'REPORT',
}

export enum ScannerType {
  CONSUMER = 'CONSUMER',
  INSPECTOR = 'INSPECTOR',
  SCREENER = 'SCREENER',
  OPERATOR = 'OPERATOR',
}

export class CreateQrScanDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsEnum(ScannerType)
  scannerType?: string;

  @IsOptional()
  @IsString()
  scannerName?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(ScanAction)
  action?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryQrScansDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  qrcodeId?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsEnum(ScannerType)
  scannerType?: string;

  @IsOptional()
  @IsEnum(ScanAction)
  action?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}