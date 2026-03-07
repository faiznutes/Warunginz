const path = require('path');
const bcrypt = require('bcryptjs');

function loadPrismaClient() {
  const candidates = [
    path.resolve(__dirname, "../dist/generated/client"),
    path.resolve(__dirname, '../node_modules/.prisma/client'),
    path.resolve(__dirname, '../src/generated/client'),
    path.resolve(__dirname, '../nest/src/generated/client'),
    '@prisma/client',
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate).PrismaClient;
    } catch (error) {
      if (candidate === candidates[candidates.length - 1]) throw error;
    }
  }

  throw new Error('Unable to resolve Prisma client.');
}

const PrismaClient = loadPrismaClient();

async function main() {
  const prisma = new PrismaClient();

  try {
    // 1. Create System Tenant for Super Admin
    let systemTenant = await prisma.tenant.findFirst({ where: { slug: 'system-admin' } });
    if (!systemTenant) {
      systemTenant = await prisma.tenant.create({
        data: {
          name: 'System Admin',
          email: 'admin@warungin.com',
          slug: 'system-admin',
          isActive: true, // Super Admin Tenant always active
          subscriptionPlan: 'ENTERPRISE',
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 100))
        }
      });
      console.log('✅ System Tenant created:', systemTenant.name);
    } else {
      console.log('ℹ️ System Tenant exists:', systemTenant.name);
    }

    // 2. Check/Create Super Admin
    let superAdmin = await prisma.user.findFirst({
      where: { email: 'superadmin@warungin.com', role: 'SUPER_ADMIN' }
    });

    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

    if (superAdmin) {
      // Update existing
      superAdmin = await prisma.user.update({
        where: { id: superAdmin.id },
        data: { password: hashedPassword, isActive: true, tenantId: systemTenant.id }
      });
      console.log('✅ Super Admin updated:', superAdmin.email);
    } else {
      // Create new
      superAdmin = await prisma.user.create({
        data: {
          tenantId: systemTenant.id, // Linked to System Tenant
          email: 'superadmin@warungin.com',
          password: hashedPassword,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      console.log('✅ Super Admin created:', superAdmin.email);
    }

    // 3. Create Demo Tenant
    let tenant = await prisma.tenant.findFirst({ where: { email: 'demo@warungin.com' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Demo Warung',
          email: 'demo@warungin.com',
          phone: '+6281234567890',
          slug: 'demo-warung',
          isActive: true,
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          subscriptionPlan: 'PRO',
        }
      });
      console.log('✅ Demo Tenant created:', tenant.name);
    } else {
      console.log('ℹ️ Demo Tenant exists:', tenant.name);
    }

    // 4. Create Demo Admin
    let demoAdmin = await prisma.user.findFirst({ where: { email: 'admin@demo.com', tenantId: tenant.id } });
    const demoAdminPassword = await bcrypt.hash('admin123', 10);
    if (!demoAdmin) {
      demoAdmin = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'admin@demo.com',
          password: demoAdminPassword,
          name: 'Admin Demo',
          role: 'ADMIN_TENANT',
          isActive: true
        }
      });
      console.log('✅ Demo Admin created:', demoAdmin.email);
    } else {
      console.log('ℹ️ Demo Admin exists:', demoAdmin.email);
    }

    // 5. Create Demo Cashier
    let cashier = await prisma.user.findFirst({ where: { email: 'cashier@demo.com', tenantId: tenant.id } });
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    if (!cashier) {
      cashier = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'cashier@demo.com',
          password: cashierPassword,
          name: 'Kasir Demo',
          role: 'CASHIER',
          isActive: true
        }
      });
      console.log('✅ Demo Cashier created:', cashier.email);
    } else {
      console.log('ℹ️ Demo Cashier exists:', cashier.email);
    }

    // 6. Create Demo Products
    const existingProducts = await prisma.product.count({ where: { tenantId: tenant.id } });
    if (existingProducts === 0) {
      const products = await prisma.product.createMany({
        data: [
          { tenantId: tenant.id, name: 'Nasi Goreng', sku: 'NG001', price: 15000, cost: 8000, stock: 100, category: 'Makanan', isActive: true },
          { tenantId: tenant.id, name: 'Mie Ayam', sku: 'MA001', price: 12000, cost: 6000, stock: 100, category: 'Makanan', isActive: true },
          { tenantId: tenant.id, name: 'Es Teh Manis', sku: 'ETM001', price: 3000, cost: 1000, stock: 200, category: 'Minuman', isActive: true },
          { tenantId: tenant.id, name: 'Kopi', sku: 'KP001', price: 5000, cost: 2000, stock: 200, category: 'Minuman', isActive: true },
        ],
        skipDuplicates: true
      });
      console.log('✅ Demo Products created:', products.count);
    } else {
      console.log('ℹ️ Demo Products exist:', existingProducts);
    }

    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@warungin.com / SuperAdmin123!');
    console.log('Tenant Admin: admin@demo.com / admin123');
    console.log('Cashier: cashier@demo.com / cashier123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error); // Log stack trace
  } finally {
    await prisma.$disconnect();
  }
}

main();
