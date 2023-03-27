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
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        messages: {
          take: 1,
          orderBy: {
            created_at: 'desc',
          },
          select: {
            id: true,
            text: true,
          },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            NOT: {
              user_id: userId,
            },
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
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async createConversation(
    user: User,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversations = await this.prisma.$queryRaw<
      Conversation[]
    >`
        SELECT c.id
        FROM conversations c
        INNER JOIN users_in_conversations uca ON uca.user_id = ${user.id} AND uca.conversation_id = c.id
        INNER JOIN users_in_conversations ucb ON ucb.user_id = ${dto.userIds[0]} AND ucb.conversation_id = c.id
        GROUP BY c.id
      `;

    if (conversations.length > 0) {
      throw new ConflictException(
        'Conversation already exists',
      );
    }

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
