import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { Conversation, User } from '@prisma/client';
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
        name: 'Elisa',
      },
    });

    conversation = await prisma.conversation.create({
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
                  id: interlocutor.id,
                },
              },
            },
          ],
        },
      },
    });
  });

  afterAll(() => {
    app.close();
  });

  describe('Create Message', () => {
    it('Should create a message', () => {
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
          expect(res.body.conversation_id).toBe(
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
          user_id: user.id,
          conversation_id: conversation.id,
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
          expect(res.body.is_liked).toBe(dto.isLiked);
        });
    });
  });

  describe('List messages', () => {
    let messages;

    beforeAll(async () => {
      await prisma.message.deleteMany();

      messages = [
        await prisma.message.create({
          data: {
            text: 'Hello',
            user_id: user?.id,
            conversation_id: conversation.id,
          },
        }),
        await prisma.message.create({
          data: {
            text: 'Hey how are you?',
            user_id: interlocutor.id,
            conversation_id: conversation.id,
          },
        }),
        await prisma.message.create({
          data: {
            text: 'Hey Mom!',
            user: {
              connect: {
                id: user?.id,
              },
            },
            conversation: {
              create: {
                users: {
                  create: [
                    {
                      user: {
                        connect: {
                          id: user?.id,
                        },
                      },
                    },
                    {
                      user: {
                        create: {
                          name: 'joe',
                          email: 'joe@gmail.com',
                          password: '1',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        }),
      ];
    });

    it('returns a list of the messages from the conversation matching the given id', () => {
      return supertest(app.getHttpServer())
        .get(`/messages/${conversation.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(2);
          expect(res.body[0].id).toBe(messages[0].id);
          expect(res.body[1].id).toBe(messages[1].id);
        });
    });
  });
});
