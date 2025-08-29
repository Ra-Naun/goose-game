import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { getUsersData } from './config';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const usersToDelete = await getUsersData();
  await prisma.user.deleteMany({
    where: {
      email: { in: usersToDelete.map((u) => u.email) },
    },
  });
  console.log('Users from init-users.seed.ts deleted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma
      .$disconnect()
      .then(() => {
        console.log('Prisma client disconnected');
      })
      .catch(() => {
        console.error('Prisma client error disconnect');
      });
  });
