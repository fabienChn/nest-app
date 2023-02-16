import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from 'src/auth/auth.dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { initTestServer } from 'test/test-setup';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    app = await initTestServer();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    // signin
    const dto: SignupDto = {
      email: 'fabien@gmail.com',
      name: 'Fabien',
      password: '123',
    };

    user = await prisma.user.create({
      data: {
        ...dto,
        password: await argon.hash(dto.password),
      },
    });

    return supertest(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: dto.email,
        password: dto.password,
      })
      .then((res) => {
        accessToken = res.body.access_token;
      });
  });

  afterAll(() => {
    app.close();
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get me', () => {
        return supertest(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((response) => {
            expect(response.body.id).not.toBe(user.id);
            expect(response.body.email).toBe(user.email);
            expect(response.body.name).toBe(user.name);
          });
      });
    });
  });
});
