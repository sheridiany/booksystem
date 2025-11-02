import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 数据库种子数据
 *
 * 功能:
 * - 创建默认管理员账号
 * - 创建测试分类
 * - 创建测试读者账号
 */
async function main() {
  console.log('📦 开始填充种子数据...');

  // ========== 1. 创建管理员账号 ==========
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ 管理员账号创建成功:', {
    username: admin.username,
    password: 'admin123',
  });

  // ========== 2. 创建测试读者账号 ==========
  const readerPassword = await bcrypt.hash('reader123', 10);

  const readerUser = await prisma.user.upsert({
    where: { username: 'reader' },
    update: {},
    create: {
      id: crypto.randomUUID(),
      username: 'reader',
      passwordHash: readerPassword,
      role: 'READER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 创建读者信息
  await prisma.reader.upsert({
    where: { userId: readerUser.id },
    update: {},
    create: {
      id: crypto.randomUUID(),
      userId: readerUser.id,
      name: '测试读者',
      studentId: '2024001',
      phone: '13800138000',
      email: 'reader@example.com',
      status: 'ACTIVE',
      maxBorrowLimit: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ 测试读者账号创建成功:', {
    username: readerUser.username,
    password: 'reader123',
  });

  // ========== 3. 创建测试分类 ==========
  const categories = [
    { name: '文学', sort: 1 },
    { name: '历史', sort: 2 },
    { name: '科技', sort: 3 },
    { name: '艺术', sort: 4 },
    { name: '哲学', sort: 5 },
    { name: '计算机', sort: 6 },
  ];

  for (const category of categories) {
    // 检查分类是否存在
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          id: crypto.randomUUID(),
          name: category.name,
          sort: category.sort,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log('✅ 测试分类创建成功:', categories.map((c) => c.name).join(', '));

  console.log('\n🎉 种子数据填充完成!');
  console.log('\n📝 登录凭证:');
  console.log('  管理员: admin / admin123');
  console.log('  读者: reader / reader123');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
