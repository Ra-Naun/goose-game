import { PrismaClient } from '@prisma/client';
import { getUsersData } from './config';

const prisma = new PrismaClient();

async function main() {
  const usersData = await getUsersData();

  for (const userData of usersData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      console.log(
        `User with email ${userData.email} already exists, skipping...`,
      );
      continue;
    }

    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`Created user with email: ${user.email}`);
  }
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
