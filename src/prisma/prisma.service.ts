import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  private getAllModelNames = (): string[] => {
    return Reflect.ownKeys(this).filter((key) => {
      return (
        typeof key === 'string' &&
        !['_', '$'].includes(key[0]) &&
        key === key.toLowerCase()
      );
    }) as string[];
  };

  cleanDb() {
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        'NODE_ENV should be "test" to clean the db',
      );

      return;
    }

    return Promise.all(
      this.getAllModelNames().map((modelKey) =>
        this[modelKey].deleteMany(),
      ),
    );
  }
}
