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

  let interlocutors: User[];
  let conversations: Conversation[];

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
          name: 'Elisa',
        },
      }),
      await prisma.user.create({
        data: {
          email: 'steffi@gmail.com',
          password: '123',
          name: 'Steffi',
        },
      }),
      await prisma.user.create({
        data: {
          email: 'jane@gmail.com',
          password: '123',
          name: 'Jane',
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
          expect(res.body.length).toBe(2);
          // @TODO: fix order
          // expect(res.body[0].id).toBe(conversations[0].id);
          // expect(res.body[1].id).toBe(conversations[1].id);
        });
    });
  });

  describe('Get conversation', () => {
    it('Should get the conversation matching the given id', () => {
      return supertest(app.getHttpServer())
        .get(`/conversations/${conversations[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(conversations[0].id);
          expect(res.body.users[0].user.name).toBe('Elisa');
        });
    });
  });

  describe('Create conversation', () => {
    describe('When the conversation already exists', () => {
      it('Should throw a Conflict Exception', () => {
        return supertest(app.getHttpServer())
          .post('/conversations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            userIds: [interlocutors[0].id],
          })
          .expect(409);
      });
    });

    it('Should create a conversation', () => {
      return supertest(app.getHttpServer())
        .post('/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userIds: [interlocutors[2].id],
        })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBe(conversations[1].id + 1);
          expect(res.body.users[1].user.name).toBe('Jane');
        });
    });
  });
});
