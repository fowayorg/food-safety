import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStreetDto {
  @ApiProperty({ description: '街道名称' }) @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ description: '街道编码' }) @IsString() @IsOptional() code?: string;
  @ApiProperty({ description: '所属区' }) @IsString() @IsOptional() district?: string;
}
export class UpdateStreetDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() code?: string;
  @IsString() @IsOptional() district?: string;
}
