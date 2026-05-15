import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface NotificationTemplate {
  title: string;
  content: string;
  type: NotificationType;
  relatedType?: string;
}

const TEMPLATES: Record<string, (params: Record<string, string>) => NotificationTemplate> = {
  // 检查相关
  'inspection.assigned': (p) => ({
    title: '检查任务分配',
    content: `您有一个新的检查任务：${p.entityName || '经营主体'}，请及时处理。`,
    type: NotificationType.INSPECTION,
    relatedType: 'inspection',
  }),
  'inspection.completed': (p) => ({
    title: '检查完成通知',
    content: `${p.entityName || '经营主体'}的检查已完成，结果：${p.result || '未知'}。`,
    type: NotificationType.INSPECTION,
    relatedType: 'inspection',
  }),
  'inspection.issue_found': (p) => ({
    title: '检查发现问题',
    content: `${p.entityName || '经营主体'}检查发现问题，已创建整改任务。`,
    type: NotificationType.INSPECTION,
    relatedType: 'inspection',
  }),

  // 整改相关
  'rectification.created': (p) => ({
    title: '整改任务创建',
    content: `您有一个新的整改任务：${p.description || '请及时处理'}，截止日期：${p.deadline || '未设置'}。`,
    type: NotificationType.RECTIFICATION,
    relatedType: 'rectification',
  }),
  'rectification.submitted': (p) => ({
    title: '整改提交审核',
    content: `${p.entityName || '经营主体'}已提交整改，请及时审核。`,
    type: NotificationType.RECTIFICATION,
    relatedType: 'rectification',
  }),
  'rectification.approved': (p) => ({
    title: '整改审核通过',
    content: `您的整改任务已通过审核。${p.remark ? '审核备注：' + p.remark : ''}`,
    type: NotificationType.RECTIFICATION,
    relatedType: 'rectification',
  }),
  'rectification.rejected': (p) => ({
    title: '整改审核驳回',
    content: `您的整改任务被驳回，请重新整改。${p.remark ? '审核备注：' + p.remark : ''}`,
    type: NotificationType.RECTIFICATION,
    relatedType: 'rectification',
  }),
  'rectification.overdue': (p) => ({
    title: '整改逾期提醒',
    content: `${p.entityName || '经营主体'}的整改任务已逾期，请尽快处理。`,
    type: NotificationType.RECTIFICATION,
    relatedType: 'rectification',
  }),

  // 投诉相关
  'complaint.created': (p) => ({
    title: '新投诉通知',
    content: `收到关于${p.entityName || '经营主体'}的新投诉，请及时处理。`,
    type: NotificationType.COMPLAINT,
    relatedType: 'complaint',
  }),
  'complaint.escalated': (p) => ({
    title: '投诉升级通知',
    content: `${p.entityName || '经营主体'}的投诉已升级，消费者对初核结果不满意。`,
    type: NotificationType.COMPLAINT,
    relatedType: 'complaint',
  }),
  'complaint.resolved': (p) => ({
    title: '投诉已解决',
    content: `${p.entityName || '经营主体'}的投诉已解决。`,
    type: NotificationType.COMPLAINT,
    relatedType: 'complaint',
  }),

  // 活动相关
  'activity.published': (p) => ({
    title: '新活动通知',
    content: `新活动发布：${p.title || '活动'}，${p.startTime ? '开始时间：' + p.startTime : ''}`,
    type: NotificationType.ACTIVITY,
    relatedType: 'activity',
  }),
  'activity.reminder': (p) => ({
    title: '活动提醒',
    content: `活动"${p.title || '活动'}"即将开始，请做好准备。`,
    type: NotificationType.ACTIVITY,
    relatedType: 'activity',
  }),

  // 系统通知
  'system.maintenance': (p) => ({
    title: '系统维护通知',
    content: `系统将于${p.time || '近期'}进行维护，届时服务将暂停，请提前做好准备。`,
    type: NotificationType.SYSTEM,
    relatedType: 'system',
  }),
  'system.account': (p) => ({
    title: '账号安全通知',
    content: p.message || '您的账号安全设置已更新。',
    type: NotificationType.SYSTEM,
    relatedType: 'system',
  }),
};

@Injectable()
export class NotificationTemplateService {
  constructor(private prisma: PrismaService) {}

  /**
   * 根据模板key和参数创建通知
   */
  async createFromTemplate(
    templateKey: string,
    params: Record<string, string>,
    userId: string,
    relatedId?: string,
  ) {
    const templateFn = TEMPLATES[templateKey];
    if (!templateFn) {
      return this.prisma.notification.create({
        data: {
          userId,
          title: '系统通知',
          content: params.message || params.content || '您有一条新通知',
          type: NotificationType.SYSTEM,
          relatedId,
          relatedType: 'system',
          isRead: false,
        },
      });
    }

    const template = templateFn(params);
    return this.prisma.notification.create({
      data: {
        userId,
        title: template.title,
        content: template.content,
        type: template.type,
        relatedId,
        relatedType: template.relatedType,
        isRead: false,
      },
    });
  }

  /**
   * 批量为多个用户创建通知
   */
  async createFromTemplateBatch(
    templateKey: string,
    params: Record<string, string>,
    userIds: string[],
    relatedId?: string,
  ) {
    const templateFn = TEMPLATES[templateKey];
    if (!templateFn || !userIds.length) return [];

    const template = templateFn(params);
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: template.title,
        content: template.content,
        type: template.type,
        relatedId,
        relatedType: template.relatedType,
        isRead: false,
      })),
    });
  }

  /**
   * 获取所有可用模板列表
   */
  getAvailableTemplates() {
    return Object.keys(TEMPLATES).map((key) => {
      const template = TEMPLATES[key]({});
      return {
        key,
        title: template.title,
        type: template.type,
        relatedType: template.relatedType,
      };
    });
  }
}
