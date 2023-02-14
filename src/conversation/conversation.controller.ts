import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationService } from './conversation.service';

@UseGuards(JwtGuard)
@Controller('conversation')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private prismaService: PrismaService,
  ) {}

  @Get()
  getConversations() {
    // return this.prismaService.find(Message);
  }

  @Get(':id')
  getConversation(@Param('id') userId: number) {}
}
