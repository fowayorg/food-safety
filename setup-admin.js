const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建初始数据...');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // 创建街道
  const streets = await Promise.all([
    prisma.street.create({ data: { name: '城东街道', code: 'CD001' } }),
    prisma.street.create({ data: { name: '城南街道', code: 'CN002' } }),
    prisma.street.create({ data: { name: '城西街道', code: 'CX003' } }),
    prisma.street.create({ data: { name: '城北街道', code: 'CB004' } }),
    prisma.street.create({ data: { name: '市中心街道', code: 'SZX005' } }),
  ]);
  console.log(`创建了 ${streets.length} 个街道`);

  // 创建用户
  const adminUser = await prisma.sysUser.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      role: 'SUPER_ADMIN',
      phone: '13800000000',
      streetId: streets[4].id,
    },
  });
  console.log(`创建了管理员用户: admin / admin123`);

  // 创建经营主体
  const entities = await Promise.all([
    prisma.bizEntity.create({ data: { name: '城东小吃店', type: 'RESTAURANT', address: '城东街道123号', streetId: streets[0].id, legalPerson: '张三' } }),
    prisma.bizEntity.create({ data: { name: '城南超市', type: 'SUPERMARKET', address: '城南街道456号', streetId: streets[1].id, legalPerson: '李四' } }),
    prisma.bizEntity.create({ data: { name: '城西食品厂', type: 'WORKSHOP', address: '城西街道789号', streetId: streets[2].id, legalPerson: '王五' } }),
    prisma.bizEntity.create({ data: { name: '城北快餐店', type: 'RESTAURANT', address: '城北街道101号', streetId: streets[3].id, legalPerson: '赵六' } }),
    prisma.bizEntity.create({ data: { name: '市中心酒店', type: 'RESTAURANT', address: '市中心街道202号', streetId: streets[4].id, legalPerson: '钱七' } }),
  ]);
  console.log(`创建了 ${entities.length} 个经营主体`);

  console.log('初始数据创建完成！');
  console.log('管理员登录: admin / admin123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
