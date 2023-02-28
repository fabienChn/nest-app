import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { WsJwtStrategy } from './strategy';

@Module({
  providers: [ChatGateway, WsJwtStrategy],
})
export class GatewayModule {}
