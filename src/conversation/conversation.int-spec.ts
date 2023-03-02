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

  let interlocutors: User[];
  let conversations: Conversation[];
  let messages: Message[];

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

    conversations = [
      await prisma.conversation.create({
        data: {
          users: {
            create: [
              {
                user: {
                  connect: {
                    id: user.id,
                  },
                },
              },
              {
                user: {
                  connect: {
                    id: interlocutors[0].id,
                  },
                },
              },
            ],
          },
        },
      }),
      await prisma.conversation.create({
        data: {
          users: {
            create: [
              {
                user: {
                  connect: {
                    id: user.id,
                  },
                },
              },
              {
                user: {
                  connect: {
                    id: interlocutors[1].id,
                  },
                },
              },
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

  afterAll(() => {
    app.close();
  });

  describe('Get conversations', () => {
    it('Should get conversations', () => {
      return supertest(app.getHttpServer())
        .get('/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          // TODO to fix order
          // expect(res.body[0].id).toBe(conversations[0].id);
          // expect(res.body[1].id).toBe(conversations[1].id);
          expect(res.body.length).toBe(2);
        });
    });
  });

  describe('Get conversation', () => {
    it('Should get all messages matching the given id', () => {
      return supertest(app.getHttpServer())
        .get(`/conversations/${conversations[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body[0].id).toBe(messages[0].id);
          expect(res.body[1].id).toBe(messages[1].id);
        });
    });
  });
});
