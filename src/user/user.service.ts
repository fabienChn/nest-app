import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(authId: number) {
    return await this.prisma.user.findMany({
      where: {
        NOT: {
          id: authId,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
      },
    });
  }

  async getUsersForNewConversation(
    authId: number,
    name = '',
  ) {
    console.log({ name });
    const query = Prisma.sql`
      SELECT users.*
      FROM users
      WHERE users.id NOT IN (
        SELECT u.id
        FROM users u
        JOIN users_in_conversations uc ON u.id = uc.user_id
        JOIN conversations c ON uc.conversation_id = c.id
        WHERE EXISTS (
          SELECT user_id
          FROM users_in_conversations uc
          JOIN conversations c ON uc.conversation_id = c.id
          AND uc.user_id = ${authId}
        )
        GROUP BY u.id
      )
      AND lower(users.name) LIKE ${`%${name.toLowerCase()}%`}
      ORDER BY name
    `;

    const result = await this.prisma.$queryRaw(query);
    console.log(result);
    return result;
  }
}
