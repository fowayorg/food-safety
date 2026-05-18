import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as XLSX from 'xlsx';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  /** 通用：查询列表并导出 Excel */
  async exportToExcel(params: {
    model: string;
    sheetName: string;
    columns: { key: string; header: string; format?: (val: any, row: any) => string }[];
    query: (prisma: any) => Promise<any[]>;
  }) {
    const rows = await params.query(this.prisma);
    const data = rows.map((row) => {
      const obj: Record<string, any> = {};
      for (const col of params.columns) {
        obj[col.header] = col.format ? col.format(row[col.key], row) : row[col.key];
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, params.sheetName);
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    return buf;
  }

  // ── 实体导出 ────────────────────────────────────────────────────────────
  async exportEntities(filters?: { type?: string; streetId?: string; riskLevel?: string }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.streetId) where.streetId = filters.streetId;
    if (filters?.riskLevel) where.riskLevel = filters.riskLevel;

    const rows = await this.prisma.bizEntity.findMany({
      where,
      include: { street: true, licenses: true },
    });

    return this.buildWorkbook(
      '经营主体',
      [
        { key: 'name', header: '主体名称' },
        { key: 'creditCode', header: '统一社会信用代码' },
        { key: 'type', header: '主体类型', format: (v) => this.fmtEntityType(v) },
        { key: 'legalPerson', header: '法定代表人' },
        { key: 'address', header: '地址' },
        { key: 'streetName', header: '所属街道', format: (_, r) => r.street?.name || '-' },
        { key: 'riskLevel', header: '风险等级', format: (v) => this.fmtRiskLevel(v) },
        { key: 'guaranteeLevel', header: '包保等级' },
        { key: 'safetyDirector', header: '食品安全总监' },
        { key: 'safetyOfficer', header: '食品安全员' },
        { key: 'status', header: '状态', format: (v) => this.fmtStatus(v) },
        {
          key: 'licenses',
          header: '许可证数量',
          format: (v) => (Array.isArray(v) ? v.length : 0),
        },
        { key: 'createdAt', header: '创建时间', format: (v) => this.fmtDate(v) },
      ],
      rows,
    );
  }

  // ── 检查记录导出 ────────────────────────────────────────────────────────
  async exportInspections(filters?: { entityId?: string; inspectorId?: string; startDate?: string; endDate?: string }) {
    const where: any = {};
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.inspectorId) where.inspectorId = filters.inspectorId;
    if (filters?.startDate || filters?.endDate) {
      where.inspectedAt = {};
      if (filters.startDate) where.inspectedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.inspectedAt.lte = new Date(filters.endDate + 'T23:59:59');
    }

    const rows = await this.prisma.inspectionRecord.findMany({
      where,
      include: { entity: true, inspector: true },
      orderBy: { inspectedAt: 'desc' },
    });

    return this.buildWorkbook(
      '检查记录',
      [
        { key: 'entityName', header: '经营主体', format: (_, r) => r.entity?.name || '-' },
        { key: 'inspectorName', header: '检查人员', format: (_, r) => r.inspector?.realName || '-' },
        { key: 'type', header: '检查类型', format: (v) => this.fmtInspectionType(v) },
        { key: 'result', header: '检查结果', format: (v) => this.fmtResult(v) },
        { key: 'totalScore', header: '总分', format: (v) => (v ?? '-') },
        { key: 'issueCount', header: '问题数量', format: (v) => (v ?? 0) },
        { key: 'inspectedAt', header: '检查时间', format: (v) => this.fmtDate(v) },
        { key: 'notes', header: '备注' },
      ],
      rows,
    );
  }

  // ── 投诉导出 ───────────────────────────────────────────────────────────
  async exportComplaints(filters?: { status?: string; startDate?: string; endDate?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate + 'T23:59:59');
    }

    const rows = await this.prisma.complaint.findMany({
      where,
      include: { entity: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.buildWorkbook(
      '投诉记录',
      [
        { key: 'title', header: '投诉标题' },
        { key: 'entityName', header: '被投诉主体', format: (_, r) => r.entity?.name || '-' },
        { key: 'category', header: '类别', format: (v) => this.fmtComplaintCategory(v) },
        { key: 'status', header: '状态', format: (v) => this.fmtComplaintStatus(v) },
        { key: 'contactName', header: '投诉人' },
        { key: 'contactPhone', header: '联系电话' },
        { key: 'description', header: '投诉内容' },
        { key: 'createdAt', header: '投诉时间', format: (v) => this.fmtDate(v) },
        { key: 'handledAt', header: '处理时间', format: (v) => this.fmtDate(v) },
        { key: 'resolution', header: '处理结果' },
      ],
      rows,
    );
  }

  // ── 整改导出 ───────────────────────────────────────────────────────────
  async exportRectifications(filters?: { status?: string; entityId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.entityId) where.entityId = filters.entityId;

    const rows = await this.prisma.rectification.findMany({
      where,
      include: { entity: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.buildWorkbook(
      '整改记录',
      [
        { key: 'entityName', header: '经营主体', format: (_, r) => r.entity?.name || '-' },
        { key: 'description', header: '问题描述' },
        { key: 'level', header: '优先级', format: (v) => this.fmtPriority(v) },
        { key: 'status', header: '状态', format: (v) => this.fmtRectStatus(v) },
        { key: 'deadline', header: '截止日期', format: (v) => this.fmtDate(v) },
        { key: 'submitDescription', header: '整改说明' },
        { key: 'reviewResult', header: '审核结果' },
        { key: 'reviewerId', header: '审核人ID' },
        { key: 'reviewedAt', header: '审核时间', format: (v) => this.fmtDate(v) },
        { key: 'createdAt', header: '创建时间', format: (v) => this.fmtDate(v) },
      ],
      rows,
    );
  }

  // ── 许可证导出 ──────────────────────────────────────────────────────
  async exportLicenses(filters?: { entityId?: string }) {
    const where: any = {};
    if (filters?.entityId) where.entityId = filters.entityId;
    const rows = await this.prisma.bizLicense.findMany({
      where,
      include: { entity: true },
      orderBy: { validTo: 'asc' },
    });
    return this.buildWorkbook('许可证备案', [
      { key: 'entityName', header: '经营主体', format: (_, r) => r.entity?.name || '-' },
      { key: 'identity', header: '统一社会信用代码' },
      { key: 'licenseType', header: '许可证类型', format: (v) => this.fmtLicenseType(v) },
      { key: 'licenseNo', header: '许可证号' },
      { key: 'issuingAuthority', header: '发证机关' },
      { key: 'licenseContent', header: '许可内容' },
      { key: 'validFrom', header: '有效期起', format: (v) => this.fmtDate(v) },
      { key: 'validTo', header: '有效期至', format: (v) => v ? this.fmtDate(v) : '长期有效' },
      { key: 'status', header: '状态', format: (v) => this.fmtLicenseStatus(v) },
      { key: 'createdAt', header: '创建时间', format: (v) => this.fmtDate(v) },
    ], rows);
  }

  // ── 活动导出 ───────────────────────────────────────────────────────────
  async exportActivities(filters?: { status?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;

    const rows = await this.prisma.activity.findMany({
      where,
      include: { _count: { select: { participants: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return this.buildWorkbook(
      '活动记录',
      [
        { key: 'name', header: '活动名称' },
        { key: 'description', header: '活动描述' },
        { key: 'type', header: '活动类型', format: (v) => this.fmtActivityType(v) },
        { key: 'status', header: '状态', format: (v) => this.fmtActivityStatus(v) },
        { key: 'startDate', header: '开始时间', format: (v) => this.fmtDate(v) },
        { key: 'endDate', header: '结束时间', format: (v) => this.fmtDate(v) },
        { key: 'participantCount', header: '参与人数', format: (_, r) => r._count?.participants ?? 0 },
        { key: 'targetAudience', header: '目标受众' },
        { key: 'createdAt', header: '创建时间', format: (v) => this.fmtDate(v) },
      ],
      rows,
    );
  }

  // ── 私有辅助 ───────────────────────────────────────────────────────────
  private buildWorkbook(
    sheetName: string,
    columns: { key: string; header: string; format?: (val: any, row: any) => string }[],
    rows: any[],
  ): Buffer {
    const data = rows.map((row) => {
      const obj: Record<string, any> = {};
      for (const col of columns) {
        obj[col.header] = col.format ? col.format(row[col.key], row) : row[col.key];
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    // 自动列宽
    const colWidths = columns.map((c) => ({ wch: Math.max(c.header.length, 15) }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as unknown as Buffer;
  }

  private fmtDate(v: any) {
    if (!v) return '-';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '-' : d.toLocaleString('zh-CN');
  }

  private fmtEntityType(v: any) {
    const map: Record<string, string> = { RESTAURANT: '餐饮', CATERING: '食堂', FOOD_MARKET: '农贸市场', SUPERMARKET: '超市', OTHER: '其他' };
    return map[v] || v || '-';
  }

  private fmtRiskLevel(v: any) {
    const map: Record<string, string> = { HIGH: '高风险', HIGHER: '较高风险', MEDIUM: '中风险', LOW: '低风险', LOWER: '较低风险', UNRATED: '未评级' };
    return map[v] || v || '-';
  }

  private fmtStatus(v: any) {
    const map: Record<string, string> = { ACTIVE: '正常', SUSPENDED: '歇业', REVOKED: '注销', PENDING: '待审核' };
    return map[v] || v || '-';
  }

  private fmtInspectionType(v: any) {
    const map: Record<string, string> = { ROUTINE: '日常检查', SPECIAL: '专项检查', LICENSE: '许可审查' };
    return map[v] || v || '-';
  }

  private fmtResult(v: any) {
    const map: Record<string, string> = { PASS: '合格', ISSUE: '有问题', FAIL: '不合格' };
    return map[v] || v || '-';
  }

  private fmtComplaintCategory(v: any) {
    const map: Record<string, string> = { FOOD_SAFETY: '食品安全', HYGIENE: '环境卫生', SERVICE: '服务质量', PRICE: '价格问题', OTHER: '其他' };
    return map[v] || v || '-';
  }

  private fmtComplaintStatus(v: any) {
    const map: Record<string, string> = { PENDING: '待处理', FIRST_HANDLING: '首次处理中', HANDLED: '已处理待反馈', RESOLVED: '已解决', SECOND_HANDLING: '升级处理中', CLOSED: '已关闭' };
    return map[v] || v || '-';
  }

  private fmtRectStatus(v: any) {
    const map: Record<string, string> = { PENDING: '待整改', SUBMITTED: '待审核', APPROVED: '已通过', REJECTED: '已驳回', COMPLETED: '已完成' };
    return map[v] || v || '-';
  }

  private fmtPriority(v: any) {
    const map: Record<string, string> = { LOW: '低', MEDIUM: '中', HIGH: '高', URGENT: '紧急' };
    return map[v] || v || '-';
  }

  private fmtActivityType(v: any) {
    const map: Record<string, string> = { TRAINING: '培训', SEMINAR: '讲座', COMPETITION: '竞赛', OTHER: '其他' };
    return map[v] || v || '-';
  }

  private fmtActivityStatus(v: any) {
    const map: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', ACTIVE: '进行中', ENDED: '已结束', CANCELLED: '已取消' };
    return map[v] || v || '-';
  }

  private fmtLicenseType(v: any) {
    const map: Record<string, string> = { FOOD_BUSINESS: '食品经营', FOOD_PRODUCTION: '食品生产', FOOD_CIRCULATION: '食品流通', CATERING: '餐饮服务', RECORD: '小餐饮登记' };
    return map[v] || v || '-';
  }

  private fmtLicenseStatus(v: any) {
    const map: Record<string, string> = { VALID: '有效', EXPIRED: '已过期', REVOKED: '已吊销' };
    return map[v] || v || '-';
  }
}
