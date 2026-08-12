import { PrismaClient } from '@prisma/client';

// Configure Prisma Client with clean logging
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Polyfill BigInt JSON serialization globally so Express res.json() doesn't fail
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
