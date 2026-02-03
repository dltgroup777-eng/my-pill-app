// Mock Prisma Client - DATABASE_URL 없이도 동작
// 실제 Prisma 대신 Mock 데이터 반환

const MOCK_MODE = !process.env.DATABASE_URL;

const mockUsers = [
    { id: 'user-1', email: 'test@test.com', passwordHash: '$2a$10$mockhashedpassword', name: '테스트유저', createdAt: new Date(), updatedAt: new Date() }
];

const mockProducts = [
    { id: 'prod-1', name: '쿠마딘 (와파린)', type: 'medicine', dosageText: '1일 1회, 5mg', ingredients: ['와파린'], userId: 'user-1', createdAt: new Date() },
    { id: 'prod-2', name: '오메가3', type: 'supplement', dosageText: '1일 2회', ingredients: ['오메가3', 'EPA', 'DHA'], userId: 'user-1', createdAt: new Date() },
];

class MockPrismaClient {
    user = {
        findUnique: async ({ where }: any) => mockUsers.find(u => u.email === where.email || u.id === where.id) || null,
        findFirst: async ({ where }: any) => mockUsers.find(u => u.email === where.email) || null,
        create: async ({ data }: any) => ({ id: `user-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() }),
    };

    product = {
        findMany: async ({ where }: any) => mockProducts.filter(p => p.userId === where?.userId || true),
        findUnique: async ({ where }: any) => mockProducts.find(p => p.id === where.id) || null,
        create: async ({ data }: any) => ({ id: `prod-${Date.now()}`, ...data, createdAt: new Date() }),
        delete: async ({ where }: any) => mockProducts.find(p => p.id === where.id) || null,
    };

    scanLog = {
        create: async ({ data }: any) => ({ id: `scan-${Date.now()}`, ...data, createdAt: new Date() }),
        findMany: async () => [],
    };

    $connect = async () => console.log('[Mock Prisma] Connected (Mock Mode)');
    $disconnect = async () => console.log('[Mock Prisma] Disconnected (Mock Mode)');
}

// 실제 Prisma 또는 Mock 반환
let prisma: any;

if (MOCK_MODE) {
    console.log('[Prisma] Running in MOCK MODE - No database connection');
    prisma = new MockPrismaClient();
} else {
    // 실제 Prisma Client (DATABASE_URL 있을 때만)
    const { PrismaClient } = require('@prisma/client');
    const globalForPrisma = globalThis as unknown as { prisma: any };
    prisma = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export default prisma;
export { MOCK_MODE };
