import {
  Body,
  Controller,
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
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  createMessage(
    @GetUser('id') userId: number,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messageService.createMessage(userId, dto);
  }

  @Patch(':id')
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
