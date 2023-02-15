import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @IsNotEmpty()
  userIds: number[];
}
