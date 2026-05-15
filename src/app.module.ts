import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StreetsModule } from './modules/streets/streets.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { QrcodesModule } from './modules/qrcodes/qrcodes.module';
import { InspectionTemplatesModule } from './modules/inspection-templates/inspection-templates.module';
import { InspectionPlansModule } from './modules/inspection-plans/inspection-plans.module';
import { ScreeningPlansModule } from './modules/screening-plans/screening-plans.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { ScreeningsModule } from './modules/screenings/screenings.module';
import { InfoCorrectionsModule } from './modules/info-corrections/info-corrections.module';
import { SelfInspectionsModule } from './modules/self-inspections/self-inspections.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RectificationsModule } from './modules/rectifications/rectifications.module';
import { QrScansModule } from './modules/qr-scans/qr-scans.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // API 限流：默认 60次/分钟
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,        // 1分钟窗口
        limit: 60,         // 每窗口最多60次请求
      },
      {
        name: 'public',
        ttl: 60000,        // 1分钟窗口
        limit: 30,         // 公开接口更严格：每窗口30次
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    StreetsModule,
    EntitiesModule,
    QrcodesModule,
    InspectionTemplatesModule,
    InspectionPlansModule,
    ScreeningPlansModule,
    InspectionsModule,
    ActivitiesModule,
    ComplaintsModule,
    ScreeningsModule,
    InfoCorrectionsModule,
    SelfInspectionsModule,
    FeedbackModule,
    NotificationsModule,
    ReportsModule,
    RectificationsModule,
    QrScansModule,
    AuditLogsModule,
  ],
  providers: [
    // 全局限流守卫（通过依赖注入注册）
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // 全局审计拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
