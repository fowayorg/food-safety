import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'foway',
    database: 'foodsatety',
  }),
});

async function cleanup() {
  // 删除顺序：子表 → 父表（按外键依赖关系）
  await prisma.notification.deleteMany();
  await prisma.activityParticipant.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.complaintFeedback.deleteMany();
  await prisma.complaintHandle.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.selfInspection.deleteMany();
  await prisma.rectification.deleteMany();
  await prisma.inspectionItemResult.deleteMany();
  await prisma.inspectionRecord.deleteMany();
  await prisma.inspectionTask.deleteMany();
  await prisma.inspectionPlan.deleteMany();
  await prisma.inspectionTemplateItem.deleteMany();
  await prisma.inspectionTemplate.deleteMany();
  await prisma.entityPhoto.deleteMany();
  await prisma.bizLicense.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.bizEntity.deleteMany();
  await prisma.street.deleteMany();
  // 保留 sys_user 中的 admin 账号
  await prisma.sysUser.deleteMany({ where: { NOT: { username: 'admin' } } });
  console.log('🗑️  已清理旧数据');
}

async function main() {
  console.log('🌱 开始种子数据...\n');
  await cleanup();

  // 1. 创建街道
  const streets = await Promise.all([
    prisma.street.create({ data: { name: '城东街道', code: 'CD001' } }),
    prisma.street.create({ data: { name: '城南街道', code: 'CN002' } }),
    prisma.street.create({ data: { name: '城西街道', code: 'CX003' } }),
    prisma.street.create({ data: { name: '城北街道', code: 'CB004' } }),
    prisma.street.create({ data: { name: '市中心街道', code: 'SZX005' } }),
  ]);
  console.log(`✅ 创建了 ${streets.length} 个街道`);

  // 2. 创建用户
  const pwd = await bcrypt.hash('123456', 10);
  const adminUser = await prisma.sysUser.findFirst({ where: { username: 'admin' } });
  if (!adminUser) throw new Error('admin user not found - please check backend setup');
  console.log(`✅ 找到管理员账号: ${adminUser.username}`);

  const inspector1 = await prisma.sysUser.create({ data: { username: 'inspector1', password: pwd, realName: '李检查员', role: 'INSPECTOR', phone: '13800000001', streetId: streets[0].id } });
  const inspector2 = await prisma.sysUser.create({ data: { username: 'inspector2', password: pwd, realName: '王检查员', role: 'INSPECTOR', phone: '13800000002', streetId: streets[1].id } });
  const operator1 = await prisma.sysUser.create({ data: { username: 'operator1', password: pwd, realName: '张经营者', role: 'OPERATOR', phone: '13800000003', streetId: streets[0].id } });
  console.log(`✅ 创建了用户: inspector1, inspector2, operator1 (密码: 123456)`);

  // 3. 创建经营主体
  const entityData: any[] = [
    { name: '城东小吃店', creditCode: '91110000CD001001', type: 'RESTAURANT', legalPerson: '张三', address: '城东街道123号', streetId: streets[0].id, riskLevel: 'LOW', status: 'ACTIVE' },
    { name: '城南火锅店', creditCode: '91110000CD002001', type: 'RESTAURANT', legalPerson: '李四', address: '城南街道456号', streetId: streets[1].id, riskLevel: 'MEDIUM', status: 'ACTIVE' },
    { name: '城西食品加工厂', creditCode: '91110000CD003001', type: 'WORKSHOP', legalPerson: '王五', address: '城西街道789号', streetId: streets[2].id, riskLevel: 'HIGH', status: 'ACTIVE' },
    { name: '城北快餐店', creditCode: '91110000CD004001', type: 'RESTAURANT', legalPerson: '赵六', address: '城北街道101号', streetId: streets[3].id, riskLevel: 'LOWER', status: 'ACTIVE' },
    { name: '市中心大酒店', creditCode: '91110000CD005001', type: 'RESTAURANT', legalPerson: '钱七', address: '市中心街道888号', streetId: streets[4].id, riskLevel: 'MEDIUM', status: 'ACTIVE' },
    { name: '城东便利店', creditCode: '91110000CD006001', type: 'CONVENIENCE', legalPerson: '孙八', address: '城东街道303号', streetId: streets[0].id, riskLevel: 'LOW', status: 'ACTIVE' },
    { name: '城南超市', creditCode: '91110000CD007001', type: 'SUPERMARKET', legalPerson: '周九', address: '城南街道404号', streetId: streets[1].id, riskLevel: 'LOWER', status: 'ACTIVE' },
    { name: '城西茶餐厅', creditCode: '91110000CD008001', type: 'RESTAURANT', legalPerson: '吴十', address: '城西街道505号', streetId: streets[2].id, riskLevel: 'MEDIUM', status: 'ACTIVE' },
    { name: '城北食品批发部', creditCode: '91110000CD009001', type: 'WHOLESALE', legalPerson: '郑十一', address: '城北街道606号', streetId: streets[3].id, riskLevel: 'HIGHER', status: 'ACTIVE' },
    { name: '市中心奶茶店', creditCode: '91110000CD010001', type: 'RESTAURANT', legalPerson: '王十二', address: '市中心街道707号', streetId: streets[4].id, riskLevel: 'LOW', status: 'ACTIVE' },
  ];

  const entities: any[] = [];
  for (const d of entityData) {
    const entity = await prisma.bizEntity.create({ data: d });
    entities.push(entity);
    const qrCode = `QR${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    await prisma.qRCode.create({ data: { entityId: entity.id, code: qrCode, status: 'ACTIVE' } });
    await prisma.bizLicense.create({
      data: {
        entityId: entity.id,
        licenseType: 'CATERING',
        licenseNo: d.creditCode,
        licenseContent: '餐饮服务',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2027-12-31'),
        status: 'VALID',
      }
    });
  }
  console.log(`✅ 创建了 ${entities.length} 个经营主体（含二维码和许可证）`);

  // 4. 创建检查模板
  const template1 = await prisma.inspectionTemplate.create({
    data: {
      name: '餐饮服务日常检查表',
      type: 'ROUTINE',
      description: '适用于各类餐饮服务单位的日常监督检查',
      status: 'ACTIVE',
      createdBy: adminUser.id,
      items: {
        create: [
          { category: '证照管理', name: '食品经营许可证公示', required: true, sortOrder: 1 },
          { category: '证照管理', name: '健康证公示及有效期', required: true, sortOrder: 2 },
          { category: '环境卫生', name: '厨房及用餐区域卫生', required: true, sortOrder: 3 },
          { category: '环境卫生', name: '防蝇、防鼠、防虫设施', required: true, sortOrder: 4 },
          { category: '食品储存', name: '食品分类储存、离墙离地', required: true, sortOrder: 5 },
          { category: '食品储存', name: '冷藏冷冻温度符合要求', required: true, sortOrder: 6 },
          { category: '加工操作', name: '生熟分开、避免交叉污染', required: true, sortOrder: 7 },
          { category: '加工操作', name: '食品烧熟煮透', required: true, sortOrder: 8 },
          { category: '餐具消毒', name: '餐具清洗消毒记录', required: true, sortOrder: 9 },
          { category: '索证索票', name: '进货查验及索证索票', required: true, sortOrder: 10 },
        ]
      }
    }
  });

  const template2 = await prisma.inspectionTemplate.create({
    data: {
      name: '小作坊专项检查表',
      type: 'SPECIAL',
      description: '适用于食品小作坊的专项监督检查',
      status: 'ACTIVE',
      createdBy: adminUser.id,
      items: {
        create: [
          { category: '生产环境', name: '生产车间卫生条件', required: true, sortOrder: 1 },
          { category: '生产环境', name: '三防设施完备', required: true, sortOrder: 2 },
          { category: '原辅料', name: '原辅料来源正规、票证齐全', required: true, sortOrder: 3 },
          { category: '生产过程', name: '生产过程符合规范', required: true, sortOrder: 4 },
          { category: '产品检验', name: '产品检验报告', required: false, sortOrder: 5 },
          { category: '产品包装', name: '标签标识规范', required: true, sortOrder: 6 },
        ]
      }
    }
  });
  console.log(`✅ 创建了 2 个检查模板（含 ${(await prisma.inspectionTemplateItem.count())} 个检查项目）`);

  // 5. 创建检查计划
  const plan1 = await prisma.inspectionPlan.create({
    data: {
      name: '2026年第一季度日常检查计划',
      type: 'ROUTINE',
      templateId: template1.id,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      status: 'PUBLISHED',
      createdBy: adminUser.id,
    }
  });

  const plan2 = await prisma.inspectionPlan.create({
    data: {
      name: '2026年食品安全专项整治计划',
      type: 'SPECIAL',
      templateId: template2.id,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      status: 'PUBLISHED',
      createdBy: adminUser.id,
    }
  });
  console.log(`✅ 创建了 2 个检查计划`);

  // 6. 创建检查任务和检查记录
  const now = new Date();
  let taskCount = 0;
  for (const entity of entities.slice(0, 6)) {
    const inspector = Math.random() > 0.5 ? inspector1 : inspector2;
    const daysAgo = Math.floor(Math.random() * 30);
    const scheduled = new Date(now.getTime() - daysAgo * 86400000);
    const isCompleted = Math.random() > 0.4;

    const task = await prisma.inspectionTask.create({
      data: {
        planId: plan1.id,
        entityId: entity.id,
        inspectorId: inspector.id,
        status: isCompleted ? 'COMPLETED' : daysAgo > 7 ? 'ACCEPTED' : 'ASSIGNED',
        scheduledDate: scheduled,
        completedAt: isCompleted ? new Date(scheduled.getTime() + 3600000) : null,
      }
    });
    taskCount++;

    if (isCompleted) {
      const results = ['PASS', 'ISSUE', 'FAIL'];
      const result = results[Math.floor(Math.random() * results.length)];
      const totalScore = result === 'PASS' ? 95 : result === 'ISSUE' ? 78 : 55;

      const record = await prisma.inspectionRecord.create({
        data: {
          taskId: task.id,
          planId: plan1.id,
          entityId: entity.id,
          inspectorId: inspector.id,
          result: result as any,
          totalScore,
          issueCount: result === 'PASS' ? 0 : result === 'ISSUE' ? 2 : 4,
          summary: result === 'PASS' ? '整体良好，符合要求' : result === 'ISSUE' ? '部分项目需整改' : '存在严重问题，需立即整改',
          inspectedAt: scheduled,
        }
      });

      const items = await prisma.inspectionTemplateItem.findMany({ where: { templateId: template1.id }, orderBy: { sortOrder: 'asc' } });
      for (const item of items) {
        await prisma.inspectionItemResult.create({
          data: {
            recordId: record.id,
            templateItemId: item.id,
            result: Math.random() > 0.2 ? 'PASS' : 'FAIL',
            remark: Math.random() > 0.7 ? '需注意' : null,
          }
        });
      }

      if (result === 'FAIL') {
        await prisma.rectification.create({
          data: {
            recordId: record.id,
            entityId: entity.id,
            description: '存在食品安全隐患，需在规定时间内完成整改',
            deadline: new Date(scheduled.getTime() + 7 * 86400000),
            level: 'HIGH',
            status: 'PENDING',
          }
        });
      }
    }
  }
  console.log(`✅ 创建了 ${taskCount} 个检查任务`);

  // 7. 创建自查自纠
  for (const entity of entities.slice(0, 5)) {
    const opUsername = `op_${entity.id.slice(0, 8)}`;
    let operator = await prisma.sysUser.findUnique({ where: { username: opUsername } });
    if (!operator) {
      operator = await prisma.sysUser.create({
        data: {
          username: opUsername,
          password: pwd,
          realName: `${entity.name}经营者`,
          role: 'OPERATOR',
          entityId: entity.id,
          streetId: entity.streetId,
        }
      });
    }
    await prisma.selfInspection.create({
      data: {
        entityId: entity.id,
        operatorId: operator.id,
        type: 'DAILY',
        items: JSON.stringify([
          { name: '证照公示检查', result: 'PASS' },
          { name: '环境卫生检查', result: 'PASS' },
          { name: '食品储存检查', result: 'PASS' },
          { name: '加工操作检查', result: 'PASS' },
        ]),
        result: 'PASS',
        inspectedAt: new Date(),
      }
    });
  }
  console.log(`✅ 创建了自查自纠任务`);

  // 8. 创建投诉
  const complaintData: any[] = [
    { entityId: entities[1].id, category: 'FOOD_SAFETY', content: '在该店食用了不新鲜的食材，出现腹泻症状', reporterPhone: '13900001111', status: 'FIRST_HANDLING' },
    { entityId: entities[2].id, category: 'HYGIENE', content: '店内卫生状况差，垃圾桶未加盖，地面有油污', reporterPhone: '13900002222', status: 'PENDING' },
    { entityId: entities[4].id, category: 'SERVICE', content: '菜品中发现异物，要求退款被拒', reporterPhone: '13900003333', status: 'RESOLVED' },
  ];
  for (const d of complaintData) {
    await prisma.complaint.create({ data: d });
  }
  console.log(`✅ 创建了 ${complaintData.length} 条投诉记录`);

  // 9. 创建活动
  const activity1 = await prisma.activity.create({
    data: {
      name: '食品安全知识有奖问答',
      type: 'SURVEY',
      description: '参与食品安全知识问答，答对可获得优惠券',
      startDate: new Date(),
      endDate: new Date('2026-12-31'),
      status: 'ACTIVE',
      targetAudience: 'ALL',
      createdBy: adminUser.id,
    }
  });
  await prisma.activityParticipant.create({
    data: {
      activityId: activity1.id,
      participantName: '测试用户',
      participantPhone: '13800138000',
      content: '我认为食品安全监管非常重要，支持一店一码系统',
    }
  });
  await prisma.activity.create({
    data: {
      name: '2026年度优秀餐饮企业评选',
      type: 'PROMOTION',
      description: '评选年度食品安全优秀餐饮企业，树立行业标杆',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-10-31'),
      status: 'PUBLISHED',
      targetAudience: 'ALL',
      createdBy: adminUser.id,
    }
  });
  console.log(`✅ 创建了 2 个活动`);

  // 10. 创建通知
  await prisma.notification.createMany({
    data: [
      { type: 'INSPECTION', title: '检查任务提醒', content: '您有一个新的检查任务待执行，请及时处理', userId: inspector1.id },
      { type: 'RECTIFICATION', title: '整改通知', content: '您的经营主体有一条待处理整改任务，请尽快完成', userId: operator1.id },
      { type: 'SYSTEM', title: '系统公告', content: '一店一码食品安全监管系统已上线，欢迎使用', userId: adminUser.id },
      { type: 'ACTIVITY', title: '活动邀请', content: '食品安全知识问答活动已开始，欢迎参与', userId: adminUser.id },
    ]
  });
  console.log(`✅ 创建了通知消息`);

  console.log('\n🎉 种子数据创建完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试账号:');
  console.log('  管理员:  admin / admin123');
  console.log('  检查员:  inspector1 / 123456');
  console.log('  检查员:  inspector2 / 123456');
  console.log('  经营者:  operator1 / 123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('\n❌ 种子数据创建失败:', e.message || e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
