import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  isLiked?: boolean;
}
