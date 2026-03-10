/**
 * Cleanup script untuk membersihkan shift yang stuck
 * Menutup shift yang sudah lebih dari 24 jam tanpa aktivitas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupStuckShifts() {
  console.log('🔍 Checking for stuck shifts...\n');

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Check Cash Shifts
    const stuckCashShifts = await prisma.cashShift.findMany({
      where: {
        status: 'open',
        shiftStart: {
          lt: oneDayAgo,
        },
      },
      include: {
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`Found ${stuckCashShifts.length} stuck cash shifts:`);
    for (const shift of stuckCashShifts) {
      console.log(`  - Cash Shift ID: ${shift.id}`);
      console.log(`    Kasir: ${shift.kasir.name} (${shift.kasir.email})`);
      console.log(`    Started: ${shift.shiftStart}`);
      console.log(`    Modal: ${shift.modalAwal}`);
      
      // Close the shift
      await prisma.cashShift.update({
        where: { id: shift.id },
        data: {
          status: 'closed',
          shiftEnd: now,
          catatan: `Auto-closed: Shift stuck for more than 24 hours (original: ${shift.catatan || 'No note'})`,
        },
      });
      
      console.log(`    ✅ Closed\n`);
    }

    // 2. Check Store Shifts
    const stuckStoreShifts = await prisma.storeShift.findMany({
      where: {
        status: 'open',
        openedAt: {
          lt: oneDayAgo,
        },
      },
      include: {
        opener: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${stuckStoreShifts.length} stuck store shifts:`);
    for (const shift of stuckStoreShifts) {
      console.log(`  - Store Shift ID: ${shift.id}`);
      console.log(`    Outlet: ${shift.outlet.name}`);
      console.log(`    Shift Type: ${shift.shiftType}`);
      console.log(`    Opened by: ${shift.opener.name} (${shift.opener.email})`);
      console.log(`    Opened: ${shift.openedAt}`);
      
      // Close the shift
      await prisma.storeShift.update({
        where: { id: shift.id },
        data: {
          status: 'closed',
          closedAt: now,
          catatan: `Auto-closed: Shift stuck for more than 24 hours (original: ${shift.catatan || 'No note'})`,
        },
      });
      
      console.log(`    ✅ Closed\n`);
    }

    if (stuckCashShifts.length === 0 && stuckStoreShifts.length === 0) {
      console.log('✅ No stuck shifts found. All shifts are healthy!');
    } else {
      console.log(`\n✅ Cleanup complete! Closed ${stuckCashShifts.length + stuckStoreShifts.length} stuck shifts.`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupStuckShifts();

