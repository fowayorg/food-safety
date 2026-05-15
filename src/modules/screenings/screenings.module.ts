import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ScreeningsController } from './screenings.controller';
import { ScreeningsService } from './screenings.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ScreeningsController],
  providers: [ScreeningsService],
  exports: [ScreeningsService],
})
export class ScreeningsModule {}
