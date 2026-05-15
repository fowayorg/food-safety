import { Module } from '@nestjs/common';
import { QrcodesService } from './qrcodes.service';
import { QrcodesController } from './qrcodes.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QrcodesController],
  providers: [QrcodesService],
  exports: [QrcodesService],
})
export class QrcodesModule {}
