import { Module } from '@nestjs/common';
import { InspectionTemplatesService } from './inspection-templates.service';
import { InspectionTemplatesController } from './inspection-templates.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InspectionTemplatesController],
  providers: [InspectionTemplatesService],
  exports: [InspectionTemplatesService],
})
export class InspectionTemplatesModule {}
