require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

async function main() {
  const dbUrl = new URL(process.env.DATABASE_URL);
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306'),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
  });
  const prisma = new PrismaClient({ adapter });
  
  const result = await prisma.sysUser.updateMany({
    where: { username: 'admin' },
    data: { role: 'SUPER_ADMIN' },
  });
  console.log(`Updated ${result.count} user(s) to SUPER_ADMIN role`);
  
  await prisma.$disconnect();
}

main()
  .catch(e => { console.error(e); process.exit(1); });
