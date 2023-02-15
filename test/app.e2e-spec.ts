import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import { SignupDto } from 'src/auth/auth.dto';
import {
  Conversation,
  Message,
  User,
} from '@prisma/client';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3001);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3001');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: SignupDto = {
      email: 'email@gmail.com',
      name: 'Fabien',
      password: '123',
    };

    describe('Signup', () => {
      it('Should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(200);
      });
    });

    describe('Signin', () => {
      it('Should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
            password: dto.password,
          })
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get me', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('id')
          .expectBodyContains('email')
          .expectBodyContains('name');
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
        return pactum
          .spec()
          .get('/conversations')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains(conversations[0])
          .expectBodyContains(conversations[1]);
      });
    });

    describe.skip('Get conversation', () => {
      it('Should get a messages matching the given id', () => {
        return pactum
          .spec()
          .get(`/conversations/${conversations[0].id}`)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([
            {
              id: messages[0].id,
            },
            {
              id: messages[1].id,
            },
          ]);
      });
    });
  });
});
