import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  conversationSeeds,
  messageSeeds,
  userSeeds,
} from './seeds';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: userSeeds,
  });

  Logger.log(`Users seeded`);

  for (const conversation of conversationSeeds) {
    await prisma.conversation.create({
      data: conversation,
    });
  }

  Logger.log(`Conversations seeded`);

  await prisma.message.createMany({
    data: messageSeeds,
  });

  Logger.log(`Messages seeded`);
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
