import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Helper for cleaning up during testing
    async cleanDatabase() {
        if (process.env.NODE_ENV !== 'production') {
            const models = Reflect.ownKeys(this).filter((key) => typeof key === 'string' && key[0] !== '_');
            return Promise.all(
                models.map((modelKey) => {
                    const model = this[modelKey as keyof this];
                    if (model && typeof model === 'object' && 'deleteMany' in model) {
                        return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
                    }
                    return Promise.resolve();
                }),
            );
        }
    }
}
