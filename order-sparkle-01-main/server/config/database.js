import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL?.trim();
console.log('📡 Database URL loaded:', dbUrl ? `FOUND (length: ${dbUrl.length})` : 'MISSING');

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  try {
    console.log('📡 Attempting demo seeding...');
    
    // Seed demo restaurant for Demo Mode
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
    console.log('📌 Stack trace:', error.stack);
    
    // Retry connection
    setTimeout(() => {
      connectDB();
    }, 5000);
  }
};

export { prisma };
export default connectDB;
