const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Resetting Super Admin...\n');

  try {
    // Find system tenant
    let systemTenant = await prisma.tenant.findFirst({
      where: { email: 'system@warungin.com' },
    });

    if (!systemTenant) {
      systemTenant = await prisma.tenant.create({
        data: {
          name: 'System',
          email: 'system@warungin.com',
          slug: 'system',
          isActive: true,
        },
      });
      console.log('✅ Created system tenant');
    }

    // New password for superadmin
    const newPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find existing superadmin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        tenantId: systemTenant.id,
        role: 'SUPER_ADMIN',
      },
    });

    if (existingSuperAdmin) {
      // Update existing superadmin
      await prisma.user.update({
        where: { id: existingSuperAdmin.id },
        data: {
          password: hashedPassword,
          defaultPassword: newPassword,
          isActive: true,
        },
      });
      console.log('✅ Super Admin password reset successfully!');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   New Password: ${newPassword}\n`);
    } else {
      // Create new superadmin
      const newSuperAdmin = await prisma.user.create({
        data: {
          tenantId: systemTenant.id,
          email: 'admin@warungin.com',
          password: hashedPassword,
          defaultPassword: newPassword,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      console.log('✅ Super Admin created successfully!');
      console.log(`   Email: ${newSuperAdmin.email}`);
      console.log(`   Password: ${newPassword}\n`);
    }

    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

