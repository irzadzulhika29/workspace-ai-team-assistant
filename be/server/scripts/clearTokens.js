import prisma from '../lib/prisma.js';

async function clearTokens() {
  try {
    const result = await prisma.googleToken.deleteMany({});
    console.log(`✅ Deleted ${result.count} Google tokens`);
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTokens();
