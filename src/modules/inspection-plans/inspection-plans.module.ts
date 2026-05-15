import { Module } from '@nestjs/common';
import { InspectionPlansController } from './inspection-plans.controller';
import { InspectionPlansService } from './inspection-plans.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InspectionPlansController],
  providers: [InspectionPlansService],
  exports: [InspectionPlansService],
})
export class InspectionPlansModule {}
