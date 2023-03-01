import { Prisma } from '@prisma/client';

export const conversationSeeds: Prisma.ConversationCreateInput[] =
  [
    {
      users: {
        create: [
          {
            user: {
              connect: {
                id: 1,
              },
            },
          },
          {
            user: {
              connect: {
                id: 2,
              },
            },
          },
        ],
      },
    },
    {
      users: {
        create: [
          {
            user: {
              connect: {
                id: 1,
              },
            },
          },
          {
            user: {
              connect: {
                id: 3,
              },
            },
          },
        ],
      },
    },
    {
      users: {
        create: [
          {
            user: {
              connect: {
                id: 2,
              },
            },
          },
          {
            user: {
              connect: {
                id: 3,
              },
            },
          },
        ],
      },
    },
  ];
