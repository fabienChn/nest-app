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
  ) {
    return this.messageService.getMessages(
      conversationId,
      userId,
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
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) messageId: number,
    @Body() dto: EditMessageDto,
  ) {
    return this.messageService.editMessage(
      userId,
      messageId,
      dto,
    );
  }
}
