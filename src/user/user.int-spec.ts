import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { initTestServer } from 'test/test-setup';
import { AuthService } from 'src/auth/auth.service';
import { generateAuthenticatedUser } from 'test/generate-authenticated-user';

describe('User', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    app = await initTestServer();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    const data = await generateAuthenticatedUser(
      prisma,
      app.get(AuthService),
    );

    user = data.user;
    accessToken = data.accessToken;
  });

  afterAll(() => {
    app.close();
  });

  describe('Get me', () => {
    it('Should get me', () => {
      return supertest(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(user.id);
          expect(response.body.email).toBe(user.email);
          expect(response.body.name).toBe(user.name);
        });
    });
  });
});
