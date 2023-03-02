import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Conversation, User } from '@prisma/client';
import { CreateConversationDto } from './conversation.dto';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  getConversations(
    userId: number,
  ): Promise<Conversation[]> {
    return this.prisma.conversation.findMany({
      where: {
        users: {
          some: {
            user: {
              id: userId,
            },
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  getConversation(
    conversationId: number,
    userId: number,
  ): Promise<Conversation> {
    return this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        users: {
          some: {
            user: {
              id: userId,
            },
          },
        },
      },
      include: {
        users: true,
      },
    });
  }

  async createConversation(
    user: User,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversations =
      await this.prisma.conversation.findMany({
        where: {
          AND: [
            users: {
              some: {
                userId: user.id,
              }
            },
            users: {
              some: {
                userId: dto.userIds[0]
              }
            }
          ],
          // users: {
          //   // some: {
          //   //   // AND: [
          //   //   // {
          //   //   userId: dto.userIds[0],
          //   //   //   },
          //   //   //   {
          //   //   //     userId: user.id,
          //   //   //   },
          //   //   // ],
          //   // },

          //   AND: [
          //     {
          //       userId: user.id,
          //     },
          //     {
          //       userId: dto.userIds[0],
          //     },
          //   ],
          // },
        },
      });

    console.log({
      conversations,
    });

    if (conversations.length > 0) {
      throw new ConflictException(
        'Conversation already exists',
      );
    }

    throw new ConflictException('WTF');

    const interlocutors = await this.prisma.user.findMany({
      where: {
        id: {
          in: dto.userIds,
        },
      },
    });

    return this.prisma.conversation.create({
      data: {
        users: {
          create: [...interlocutors, user].map(
            (interlocutor) => ({
              userId: interlocutor.id,
              user: {
                connect: {
                  id: interlocutor.id,
                },
              },
            }),
          ),
        },
      },
    });
  }
}
