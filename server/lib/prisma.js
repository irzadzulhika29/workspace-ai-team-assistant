import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance
 * Prevents connection pool exhaustion by reusing the same client
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  prisma = global.prisma;
}

export default prisma;
