import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateQrcodeDto {
  entityId: string;
}

export class UpdateQrcodeDto {
  entityId?: string;
  code?: string;
}

export enum ScannerType {
  CONSUMER = 'CONSUMER',
  INSPECTOR = 'INSPECTOR',
  SCREENER = 'SCREENER',
  OPERATOR = 'OPERATOR',
}

export class VerifyQrcodeDto {
  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(ScannerType)
  scannerType?: ScannerType = ScannerType.INSPECTOR;
}