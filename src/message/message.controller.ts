import {
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto';
import { EditMessageDto } from './dto/edit-message-dto';
import { MessageService } from './message.service';

@UseGuards(JwtGuard)
@Controller('message')
export class MessageController {
  constuctor(
    private messageService: MessageService,
    private prismaService: PrismaService,
  ) {}

  @Post()
  createMessage(@Body() dto: CreateMessageDto) {
    return this.messageService.createMessage();
  }

  @Patch(':id')
  editMessage(@Body() dto: EditMessageDto) {
    return this.messageService.editMessage();
  }
}
