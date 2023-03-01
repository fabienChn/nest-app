import { Injectable } from '@nestjs/common';
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
