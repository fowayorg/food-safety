import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '角色', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: '真实姓名' })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '街道ID' })
  @IsString()
  @IsOptional()
  streetId?: string;

  @ApiProperty({ description: '经营主体ID' })
  @IsString()
  @IsOptional()
  entityId?: string;
}

export class UpdateUserDto {
  @IsString() @IsOptional() realName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() streetId?: string;
  @IsString() @IsOptional() entityId?: string;
  @IsString() @IsOptional() avatar?: string;
}
