import { Message } from '@prisma/client';

export const messageSeeds: Pick<
  Message,
  'text' | 'is_liked' | 'conversation_id' | 'user_id'
>[] = [
  {
    text: 'Hey',
    is_liked: false,
    conversation_id: 1,
    user_id: 1,
  },
  {
    text: 'Hi there!',
    is_liked: false,
    conversation_id: 1,
    user_id: 2,
  },
  {
    text: 'how are you today bro?',
    is_liked: false,
    conversation_id: 1,
    user_id: 1,
  },
  {
    text: "VERY GOOOOOD, I'm building a really cool messaging app rn.",
    is_liked: true,
    conversation_id: 1,
    user_id: 2,
  },
  {
    text: 'Hallo mama!',
    is_liked: false,
    conversation_id: 2,
    user_id: 1,
  },
  {
    text: 'Hi mein Son!',
    is_liked: false,
    conversation_id: 2,
    user_id: 3,
  },
  {
    text: 't ou?',
    is_liked: false,
    conversation_id: 3,
    user_id: 2,
  },
];
