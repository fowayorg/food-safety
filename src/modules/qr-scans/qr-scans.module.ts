import { Module } from '@nestjs/common';
import { QrScansService } from './qr-scans.service';
import { QrScansController } from './qr-scans.controller';

@Module({
  controllers: [QrScansController],
  providers: [QrScansService],
  exports: [QrScansService],
})
export class QrScansModule {}
