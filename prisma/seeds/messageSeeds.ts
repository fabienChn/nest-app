import { Message } from '@prisma/client';

export const messageSeeds: Pick<
  Message,
  'text' | 'isLiked' | 'conversationId' | 'userId'
>[] = [
  {
    text: 'Hey',
    isLiked: false,
    conversationId: 1,
    userId: 1,
  },
  {
    text: 'Hi there!',
    isLiked: false,
    conversationId: 1,
    userId: 2,
  },
  {
    text: 'how are you today bro?',
    isLiked: false,
    conversationId: 1,
    userId: 1,
  },
  {
    text: "VERY GOOOOOD, I'm building a really cool messaging app rn.",
    isLiked: true,
    conversationId: 1,
    userId: 2,
  },
  {
    text: 'Hallo mama!',
    isLiked: false,
    conversationId: 2,
    userId: 1,
  },
  {
    text: 'Hi mein Son!',
    isLiked: false,
    conversationId: 2,
    userId: 3,
  },
  {
    text: 't ou?',
    isLiked: false,
    conversationId: 3,
    userId: 2,
  },
];
