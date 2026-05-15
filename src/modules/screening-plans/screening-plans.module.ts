import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScreeningPlansController } from './screening-plans.controller';
import { ScreeningPlansService } from './screening-plans.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({ imports: [PrismaModule, AuthModule], controllers: [ScreeningPlansController], providers: [ScreeningPlansService], exports: [ScreeningPlansService] })
export class ScreeningPlansModule {}
