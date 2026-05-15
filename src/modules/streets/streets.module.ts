import { Module } from '@nestjs/common';
import { StreetsController } from './streets.controller';
import { StreetsService } from './streets.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StreetsController],
  providers: [StreetsService],
  exports: [StreetsService],
})
export class StreetsModule {}
