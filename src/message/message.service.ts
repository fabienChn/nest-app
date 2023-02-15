import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateMessageDto,
  EditMessageDto,
} from './message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  createMessage(userId: number, dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        userId,
        text: dto.text,
        conversationId: dto.conversationId,
      },
    });
  }

  editMessage(
    userId: number,
    messageId: number,
    dto: EditMessageDto,
  ) {
    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        userId,
        text: dto.text,
        isLiked: dto.isLiked,
      },
    });
  }
}
