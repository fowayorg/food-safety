import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SelfInspectionsController } from './self-inspections.controller';
import { SelfInspectionsService } from './self-inspections.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SelfInspectionsController],
  providers: [SelfInspectionsService],
  exports: [SelfInspectionsService],
})
export class SelfInspectionsModule {}
