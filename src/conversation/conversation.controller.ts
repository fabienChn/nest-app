import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CreateConversationDto } from './conversation.dto';
import { ConversationService } from './conversation.service';

@UseGuards(JwtGuard)
@Controller('conversations')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getConversations(@GetUser('id') userId: number) {
    return this.conversationService.getConversations(
      userId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getConversation(
    @Param('id', ParseIntPipe) conversationId: number,
    @GetUser('id') userId: number,
  ) {
    return this.conversationService.getConversation(
      conversationId,
      userId,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Get()
  createConversation(
    @GetUser() user: User,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationService.createConversation(
      user,
      dto,
    );
  }
}
