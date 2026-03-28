import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL?.trim();

if (dbUrl) {
  console.log('📡 Database URL loaded: FOUND (length: ' + dbUrl.length + ')');
} else {
  console.log('📡 Database URL loaded: MISSING');
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);

// Attach prisma to global to avoid hot-reload connection exhaustions
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const connectDB = async () => {
  try {
    console.log('📡 Attempting demo seeding...');
    await prisma.restaurant.upsert({
      where: { id: 'demo-restaurant-id' },
      update: {},
      create: {
        id: 'demo-restaurant-id',
        restaurantName: 'Demo Restaurant',
        adminUsername: 'demo',
        adminEmail: 'demo@restaurant.com',
        password: 'demo-password-hashed',
        phoneNumber: '0000000000',
        address: 'Demo Street',
      }
    });
    console.log('✅ Demo restaurant seeded/verified');
  } catch (error) {
    console.error('❌ Postgres seeding failed:', error);
  }
};

export { prisma };
export default connectDB;
