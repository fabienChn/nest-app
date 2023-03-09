import { User } from '@prisma/client';

export const userSeeds: Pick<
  User,
  'name' | 'email' | 'password'
>[] = [
  {
    name: 'Fabien',
    email: 'fabien@gmail.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$MTnX09ULMgJy+ePmPkoLtA$fXiqiXZtGS0tTgLT3jqzW2ssciYK5aQbnLi5CfPRpUs',
  },
  {
    name: 'Elisa',
    email: 'elisa@gmail.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$MTnX09ULMgJy+ePmPkoLtA$fXiqiXZtGS0tTgLT3jqzW2ssciYK5aQbnLi5CfPRpUs',
  },
  {
    name: 'Steffi',
    email: 'steffi@gmail.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$MTnX09ULMgJy+ePmPkoLtA$fXiqiXZtGS0tTgLT3jqzW2ssciYK5aQbnLi5CfPRpUs',
  },
  {
    name: 'Jane',
    email: 'jane@gmail.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$MTnX09ULMgJy+ePmPkoLtA$fXiqiXZtGS0tTgLT3jqzW2ssciYK5aQbnLi5CfPRpUs',
  },
];
