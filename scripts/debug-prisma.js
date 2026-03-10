const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:@localhost:5432/warungin",
    },
  },
});

async function test() {
  try {
    // Test user findUnique with tenant include
    const user = await prisma.user.findUnique({
      where: { id: "39a7f790-6836-47a2-bf42-1178899efd3d" },
      include: { tenant: true },
    });
    console.log("User found:", JSON.stringify(user, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
