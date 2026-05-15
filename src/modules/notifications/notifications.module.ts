import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationTemplateService } from '../../common/services/notification-template.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationTemplateService],
  exports: [NotificationsService, NotificationTemplateService],
})
export class NotificationsModule {}
