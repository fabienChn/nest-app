import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from 'src/auth/auth.dto';
import { initTestServer } from 'test/test-setup';

describe('Auth', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await initTestServer();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(async () => {
    app.close();
  });

  const dto: SignupDto = {
    email: 'fabien@gmail.com',
    name: 'Fabien',
    password: '123',
  };

  describe('Signup', () => {
    it('Should throw exception if email is empty', () => {
      return supertest(app.getHttpServer())
        .post('/auth/signup')
        .send({
          password: dto.password,
        })
        .expect(400);
    });

    it('Should throw exception if password is empty', () => {
      return supertest(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: dto.email,
        })
        .expect(400);
    });

    it('Should signup', async () => {
      return supertest(app.getHttpServer())
        .post('/auth/signup')
        .send(dto)
        .expect(200);
    });
  });

  describe('Signin', () => {
    it('Should throw exception if email is empty', () => {
      return supertest(app.getHttpServer())
        .post('/auth/signin')
        .send({
          password: dto.password,
        })
        .expect(400);
    });

    it('Should throw exception if password is empty', () => {
      return supertest(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: dto.email,
        })
        .expect(400);
    });

    it('Should signin', () => {
      return supertest(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: dto.email,
          password: dto.password,
        })
        .expect(200)
        .then((res) => {
          expect(typeof res.body.access_token).toBe(
            'string',
          );
        });
    });
  });
});
