import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';

@Module({
  controllers: [LicensesController],
  providers: [PrismaService, LicensesService],
  imports: [PrismaModule],
})
export class LicensesModule {}