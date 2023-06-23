import { Message } from '@prisma/client';

export const messageSeeds: Pick<
  Message,
  | 'text'
  | 'is_liked'
  | 'conversation_id'
  | 'user_id'
  | 'created_at'
>[] = [
  {
    text: 'Hey',
    is_liked: false,
    conversation_id: 1,
    user_id: 1,
    created_at: new Date('2023-06-19T20:32:29.747Z'),
  },
  {
    text: 'Hi there!',
    is_liked: false,
    conversation_id: 1,
    user_id: 2,
    created_at: new Date('2023-06-19T20:33:29.747Z'),
  },
  {
    text: 'how are you today bro?',
    is_liked: false,
    conversation_id: 1,
    user_id: 1,
    created_at: new Date('2023-06-19T20:34:29.747Z'),
  },
  {
    text: "VERY GOOOOOD, I'm building a really cool messaging app rn.",
    is_liked: true,
    conversation_id: 1,
    user_id: 2,
    created_at: new Date('2023-06-19T20:35:29.747Z'),
  },
  {
    text: 'Hallo mama!',
    is_liked: false,
    conversation_id: 2,
    user_id: 1,
    created_at: new Date('2023-06-19T20:36:29.747Z'),
  },
  {
    text: 'Hi mein Son!',
    is_liked: false,
    conversation_id: 2,
    user_id: 3,
    created_at: new Date('2023-06-19T20:37:29.747Z'),
  },
  {
    text: 't ou?',
    is_liked: false,
    conversation_id: 3,
    user_id: 2,
    created_at: new Date('2023-06-19T20:38:29.747Z'),
  },
];
