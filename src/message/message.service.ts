import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateMessageDto,
  EditMessageDto,
} from './message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  getMessages(
    conversationId: number,
    userId: number,
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
          users: {
            some: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  createMessage(
    userId: number,
    dto: CreateMessageDto,
  ): Promise<Message> {
    return this.prisma.message.create({
      data: {
        text: dto.text,
        user: {
          connect: {
            id: userId,
          },
        },
        conversation: {
          connect: {
            id: Number(dto.conversationId),
          },
        },
      },
    });
  }

  editMessage(
    userId: number,
    messageId: number,
    dto: EditMessageDto,
  ): Promise<Message> {
    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        user_id: userId,
        text: dto.text,
        is_liked: dto.isLiked,
      },
    });
  }
}
