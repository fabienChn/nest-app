import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto): Promise<string> {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException(
            'Email already exists',
          );
        }
      }
      throw e;
    }
  }

  async signin(dto: AuthDto): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Wrong credentials');
    }

    const isPasswordMatching = await argon.verify(
      user.password,
      dto.password,
    );

    if (!isPasswordMatching) {
      throw new ForbiddenException('Wrong credentials');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<string> {
    const payload = { sub: userId, email };

    return this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
