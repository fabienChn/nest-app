import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNumber()
  @IsNotEmpty()
  receiver_id: number;
}
