const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'foway',
    database: 'foodsatety',
  }),
});

async function main() {
  // 检查是否存在 admin 用户
  const existing = await prisma.sysUser.findUnique({ where: { username: 'admin' } });
  
  if (existing) {
    console.log('Admin user exists, updating password...');
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.sysUser.update({
      where: { username: 'admin' },
      data: { password: hash, role: 'SUPER_ADMIN', realName: '系统管理员' }
    });
    console.log('Password updated for existing admin user');
  } else {
    console.log('Creating new admin user...');
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.sysUser.create({
      data: {
        username: 'admin',
        password: hash,
        realName: '系统管理员',
        role: 'SUPER_ADMIN',
        phone: '13900000000',
        status: 'ACTIVE'
      }
    });
    console.log('Admin user created');
  }
  
  // 验证
  const admin = await prisma.sysUser.findUnique({ where: { username: 'admin' } });
  console.log('Admin user:', { id: admin.id, username: admin.username, role: admin.role, realName: admin.realName });
  console.log('\n✅ Credentials: admin / admin123');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
