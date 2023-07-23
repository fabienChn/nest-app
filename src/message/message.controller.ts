import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import {
  CreateMessageDto,
  EditMessageDto,
} from './message.dto';
import { MessageService } from './message.service';

@UseGuards(JwtGuard)
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get(':conversationId')
  @HttpCode(HttpStatus.OK)
  getMessages(
    @GetUser('id') userId: number,
    @Param('conversationId', ParseIntPipe)
    conversationId: number,
    @Query('page') page: number,
  ) {
    return this.messageService.getMessages(
      conversationId,
      userId,
      page,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createMessage(
    @GetUser('id') userId: number,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(userId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  editMessage(
    @Param('id', ParseIntPipe) messageId: number,
    @Body() dto: EditMessageDto,
  ) {
    return this.messageService.editMessage(messageId, dto);
  }
}
