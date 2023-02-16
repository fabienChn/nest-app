import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from 'src/auth/auth.dto';
import {
  Conversation,
  Message,
  User,
} from '@prisma/client';
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
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
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
            accessToken = res.body.access_token;
          });
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get me', () => {
        return supertest(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((response) => {
            expect(response.body.id).not.toBe(undefined);
            expect(response.body.email).toBe(
              'fabien@gmail.com',
            );
            expect(response.body.name).toBe('Fabien');
          });
      });
    });
  });

  describe('Conversations', () => {
    let interlocutors: User[];
    let conversations: Conversation[];
    let messages: Message[];

    beforeAll(async () => {
      interlocutors = [
        await prisma.user.create({
          data: {
            email: 'elisa@gmail.com',
            password: '123',
            name: 'elisa',
          },
        }),
        await prisma.user.create({
          data: {
            email: 'steffi@gmail.com',
            password: '123',
            name: 'steffi',
          },
        }),
      ];

      user = await prisma.user.findFirst({
        where: { name: 'Fabien' },
      });

      conversations = [
        await prisma.conversation.create({
          data: {
            users: {
              connect: [
                { id: user.id },
                { id: interlocutors[0].id },
              ],
            },
          },
        }),
        await prisma.conversation.create({
          data: {
            users: {
              connect: [
                { id: user.id },
                { id: interlocutors[1].id },
              ],
            },
          },
        }),
      ];

      messages = [
        await prisma.message.create({
          data: {
            text: 'Hello',
            userId: user?.id,
            conversationId: conversations[0].id,
          },
        }),
        await prisma.message.create({
          data: {
            text: 'Hey how are you?',
            userId: interlocutors[0].id,
            conversationId: conversations[0].id,
          },
        }),
        await prisma.message.create({
          data: {
            text: 'Hey Mom!',
            userId: user?.id,
            conversationId: conversations[1].id,
          },
        }),
      ];
    });

    describe('Get conversations', () => {
      it('Should get conversations', () => {
        return supertest(app.getHttpServer())
          .get('/conversations')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].id).toBe(
              conversations[0].id,
            );
            expect(res.body[1].id).toBe(
              conversations[1].id,
            );
          });
      });
    });

    describe('Get conversation', () => {
      it('Should get a messages matching the given id', () => {
        return supertest(app.getHttpServer())
          .get(`/conversations/${conversations[0].id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].id).toBe(messages[0].id);
            expect(res.body[1].id).toBe(messages[1].id);
          });
      });
    });
  });
});
