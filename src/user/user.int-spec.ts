import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
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

  describe('Users', () => {
    it.only('Should get the list of users', () => {
      const usersData = [
        {
          name: 'Jane',
          email: 'jane@gmail.com',
          password: 'd',
        },
        {
          name: 'Doe',
          email: 'doe@gmail.com',
          password: 'd',
        },
      ];

      prisma.user.createMany({
        data: usersData,
      });

      // @TODO: to fix
      return supertest(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body[0].email).toBe(
            usersData[0].email,
          );
          expect(response.body[0].name).toBe(
            usersData[0].name,
          );
          expect(response.body[1].email).toBe(
            usersData[1].email,
          );
          expect(response.body[1].name).toBe(
            usersData[1].name,
          );
        });
    });
  });
});
