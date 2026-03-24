import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTokens() {
  try {
    const result = await prisma.googleToken.deleteMany({});
    console.log(`✅ Deleted ${result.count} Google tokens`);
    console.log('🔄 Please login again to get new tokens with correct scopes');
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTokens();
