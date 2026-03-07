const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
    const prisma = new PrismaClient();

    try {
        console.log('🔄 Checking for existing Super Admin...');

        // Check if Super Admin exists
        let superAdmin = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'superadmin@warungin.com' },
                    { role: 'SUPER_ADMIN' }
                ]
            }
        });

        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

        if (superAdmin) {
            console.log(`ℹ️ Super Admin found: ${superAdmin.email}. Updating...`);
            // Update existing
            superAdmin = await prisma.user.update({
                where: { id: superAdmin.id },
                data: {
                    password: hashedPassword,
                    isActive: true,
                    email: 'superadmin@warungin.com', // Ensure email is correct
                    role: 'SUPER_ADMIN'
                }
            });
            console.log('✅ Super Admin updated successfully.');
        } else {
            console.log('🆕 Creating new Super Admin account...');
            // Create new
            superAdmin = await prisma.user.create({
                data: {
                    email: 'superadmin@warungin.com',
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN',
                    isActive: true
                }
            });
            console.log('✅ Super Admin created successfully.');
        }

        console.log('\n📋 Login Credentials:');
        console.log('Email: superadmin@warungin.com');
        console.log('Password: SuperAdmin123!');
        console.log('Role: SUPER_ADMIN');

    } catch (error) {
        console.error('❌ Error creating Super Admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
