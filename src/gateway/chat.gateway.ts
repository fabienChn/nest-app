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
import { Message, User } from '@prisma/client';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
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
    @GetUser() user: User,
    @MessageBody() message: Partial<Message>,
  ): Promise<void> {
    const createdMessage = await this.prisma.message.create(
      {
        data: {
          userId: user.id,
          text: message.text,
          conversationId: message.conversationId,
        },
      },
    );

    this.server.emit('message', {
      message: createdMessage,
    });
  }
}
