import { User } from '@prisma/client';
import { SignupDto } from 'src/auth/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface ReturnValue {
  user: User;
  accessToken: string;
}

export const generateAuthenticatedUser = async (
  prismaService: PrismaService,
  authService: AuthService,
  signupDto?: SignupDto,
): Promise<ReturnValue> => {
  const defaultSignupDto: SignupDto = {
    email: 'fabien@gmail.com',
    name: 'Fabien',
    password: '123',
  };

  const user = await prismaService.user.create({
    data: signupDto ?? defaultSignupDto,
  });

  const { access_token } = await authService.signToken(
    user.id,
    user.email,
  );

  return {
    user,
    accessToken: access_token,
  };
};
