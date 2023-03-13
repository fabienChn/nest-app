import {
  Injectable,
  OnModuleInit,
  UseGuards,
} from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from 'src/message/message.dto';
import { GetUser } from './decorator';
import { WsJwtGuard } from './guard';

@Injectable()
@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('connected', socket.id);
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @GetUser('id') userId: number,
    @MessageBody() message: CreateMessageDto,
  ): Promise<void> {
    const createdMessage = await this.prisma.message.create(
      {
        data: {
          text: message.text,
          user: {
            connect: {
              id: userId,
            },
          },
          conversation: {
            connect: {
              id: Number(message.conversationId),
            },
          },
        },
      },
    );

    this.server.emit('message', createdMessage);
  }
}
