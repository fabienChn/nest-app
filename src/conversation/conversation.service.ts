import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Message,
  Conversation,
  User,
} from '@prisma/client';
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
            id: userId,
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

  async getConversation(
    conversationId: number,
    userId: number,
  ): Promise<Message[]> {
    const conversation =
      await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          users: {
            some: {
              id: userId,
            },
          },
        },
      });

    if (!conversation) {
      throw new NotFoundException();
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  async createConversation(
    user: User,
    dto: CreateConversationDto,
  ) {
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
          connect: [...interlocutors, user],
        },
      },
    });
  }
}
