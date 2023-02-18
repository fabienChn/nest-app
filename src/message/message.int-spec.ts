import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Conversation,
  Message,
  User,
} from '@prisma/client';
import { initTestServer } from 'test/test-setup';
import { AuthService } from 'src/auth/auth.service';
import { generateAuthenticatedUser } from 'test/generate-authenticated-user';

describe('Conversation', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;
  let accessToken: string;

  let interlocutor: User;
  let conversation: Conversation;

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

    interlocutor = await prisma.user.create({
      data: {
        email: 'elisa@gmail.com',
        password: '123',
        name: 'elisa',
      },
    });

    conversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            { id: user.id },
            { id: interlocutor.id },
          ],
        },
      },
    });
  });

  afterAll(() => {
    app.close();
  });

  describe('Create Message', () => {
    it('Should get create a message', () => {
      return supertest(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          text: 'my text',
          conversationId: conversation.id,
        })
        .expect(201)
        .then((res) => {
          expect(res.body.text).toBe('my text');
          expect(res.body.conversationId).toBe(
            conversation.id,
          );
        });
    });
  });

  describe('Edit Message', () => {
    it('Should edit the message', async () => {
      const message = await prisma.message.create({
        data: {
          text: '1st version of the message',
          userId: user.id,
          conversationId: conversation.id,
        },
      });

      const dto = {
        text: '2nd version of the message',
        isLiked: true,
      };

      return supertest(app.getHttpServer())
        .patch(`/messages/${message.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(message.id);
          expect(res.body.text).toBe(dto.text);
          expect(res.body.isLiked).toBe(dto.isLiked);
        });
    });
  });
});
