/**
 * Reset Database Script
 * Hapus semua data dan reset database ke kondisi awal
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n');

  try {
    console.log('Deleting all data...');
    
    // Delete all data using Prisma client (safer approach)
    // Delete in reverse order of dependencies
    try {
      await prisma.webhookDelivery.deleteMany({});
      console.log('  ✓ WebhookDelivery deleted');
    } catch (e) { console.log('  ⚠ WebhookDelivery: ' + e.message); }
    
    try {
      await prisma.webhook.deleteMany({});
      console.log('  ✓ Webhook deleted');
    } catch (e) { console.log('  ⚠ Webhook: ' + e.message); }
    
    try {
      await prisma.passwordHistory.deleteMany({});
      console.log('  ✓ PasswordHistory deleted');
    } catch (e) { console.log('  ⚠ PasswordHistory: ' + e.message); }
    
    try {
      await prisma.backupLog.deleteMany({});
      console.log('  ✓ BackupLog deleted');
    } catch (e) { console.log('  ⚠ BackupLog: ' + e.message); }
    
    try {
      await prisma.contactMessage.deleteMany({});
      console.log('  ✓ ContactMessage deleted');
    } catch (e) { console.log('  ⚠ ContactMessage: ' + e.message); }
    
    try {
      await prisma.rewardPoint.deleteMany({});
      console.log('  ✓ RewardPoint deleted');
    } catch (e) { console.log('  ⚠ RewardPoint: ' + e.message); }
    
    try {
      await prisma.reward.deleteMany({});
      console.log('  ✓ Reward deleted');
    } catch (e) { console.log('  ⚠ Reward: ' + e.message); }
    
    try {
      await prisma.discount.deleteMany({});
      console.log('  ✓ Discount deleted');
    } catch (e) { console.log('  ⚠ Discount: ' + e.message); }
    
    try {
      await prisma.stockTransfer.deleteMany({});
      console.log('  ✓ StockTransfer deleted');
    } catch (e) { console.log('  ⚠ StockTransfer: ' + e.message); }
    
    try {
      await prisma.purchaseOrder.deleteMany({});
      console.log('  ✓ PurchaseOrder deleted');
    } catch (e) { console.log('  ⚠ PurchaseOrder: ' + e.message); }
    
    try {
      await prisma.orderItem.deleteMany({});
      console.log('  ✓ OrderItem deleted');
    } catch (e) { console.log('  ⚠ OrderItem: ' + e.message); }
    
    try {
      await prisma.order.deleteMany({});
      console.log('  ✓ Order deleted');
    } catch (e) { console.log('  ⚠ Order: ' + e.message); }
    
    try {
      await prisma.cashShift.deleteMany({});
      console.log('  ✓ CashShift deleted');
    } catch (e) { console.log('  ⚠ CashShift: ' + e.message); }
    
    try {
      await prisma.storeShift.deleteMany({});
      console.log('  ✓ StoreShift deleted');
    } catch (e) { console.log('  ⚠ StoreShift: ' + e.message); }
    
    try {
      await prisma.productStock.deleteMany({});
      console.log('  ✓ ProductStock deleted');
    } catch (e) { console.log('  ⚠ ProductStock: ' + e.message); }
    
    try {
      await prisma.product.deleteMany({});
      console.log('  ✓ Product deleted');
    } catch (e) { console.log('  ⚠ Product: ' + e.message); }
    
    try {
      await prisma.category.deleteMany({});
      console.log('  ✓ Category deleted');
    } catch (e) { console.log('  ⚠ Category: ' + e.message); }
    
    try {
      await prisma.supplier.deleteMany({});
      console.log('  ✓ Supplier deleted');
    } catch (e) { console.log('  ⚠ Supplier: ' + e.message); }
    
    try {
      await prisma.customer.deleteMany({});
      console.log('  ✓ Customer deleted');
    } catch (e) { console.log('  ⚠ Customer: ' + e.message); }
    
    try {
      await prisma.outlet.deleteMany({});
      console.log('  ✓ Outlet deleted');
    } catch (e) { console.log('  ⚠ Outlet: ' + e.message); }
    
    try {
      await prisma.tenantAddon.deleteMany({});
      console.log('  ✓ TenantAddon deleted');
    } catch (e) { console.log('  ⚠ TenantAddon: ' + e.message); }
    
    try {
      await prisma.subscription.deleteMany({});
      console.log('  ✓ Subscription deleted');
    } catch (e) { console.log('  ⚠ Subscription: ' + e.message); }
    
    try {
      await prisma.user.deleteMany({});
      console.log('  ✓ User deleted');
    } catch (e) { console.log('  ⚠ User: ' + e.message); }
    
    try {
      await prisma.tenant.deleteMany({});
      console.log('  ✓ Tenant deleted');
    } catch (e) { console.log('  ⚠ Tenant: ' + e.message); }

    console.log('\n✅ All data deleted\n');

    // Create system tenant
    console.log('Creating system tenant...');
    const systemTenant = await prisma.tenant.create({
      data: {
        id: 'system',
        name: 'System',
        email: 'system@warungin.com',
        slug: 'system',
        isActive: true,
      },
    });
    console.log('✅ System tenant created\n');

    // Create super admin
    console.log('Creating super admin...');
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        tenantId: systemTenant.id,
        email: 'admin@warungin.com',
        password: hashedPassword,
        defaultPassword: superAdminPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Super Admin created!');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${superAdminPassword}\n`);

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();

