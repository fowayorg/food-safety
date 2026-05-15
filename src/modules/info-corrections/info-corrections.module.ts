import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InfoCorrectionsController } from './info-corrections.controller';
import { InfoCorrectionsService } from './info-corrections.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InfoCorrectionsController],
  providers: [InfoCorrectionsService],
  exports: [InfoCorrectionsService],
})
export class InfoCorrectionsModule {}
