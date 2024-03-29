import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  getMe(@GetUser() user: User) {
    delete user.password;

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Get('')
  getUsers(@GetUser('id') userId: number) {
    return this.userService.getUsers(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/new-conversation')
  getUsersForNewConversation(
    @GetUser('id') userId: number,
    @Query('name') name: string,
  ) {
    return this.userService.getUsersForNewConversation(
      userId,
      name,
    );
  }
}
