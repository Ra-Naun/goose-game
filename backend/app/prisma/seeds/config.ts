import * as dotenv from 'dotenv';
import { hashPassword } from '../../services/crypto';
import {
  getInitAdminEmail,
  getInitAdminPassword,
  getInitAdminUsername,
} from '../../src/config/env.config';
import { UserRoleEnum } from '../../src/user/dto/types';

dotenv.config();

const getUserData = async (
  username: string,
  email: string,
  password: string,
  roles: Array<UserRoleEnum>,
) => {
  const hashedPassword = await hashPassword(password);
  return { username, email, hashedPassword, roles };
};

export const getUsersData = async () => {
  const userRole = [UserRoleEnum.USER];
  const usersData = [
    await getUserData('Ivan', 'ivan@email.com', 'ivan123', userRole),
    await getUserData('Petr', 'petr@email.com', 'petr123', userRole),
    await getUserData('Alisa', 'alisa@email.com', 'alisa123', userRole),
    await getUserData('Boris', 'boris@email.com', 'boris123', userRole),
    await getUserData('Kirill', 'kirill@email.com', 'kirill123', userRole),
    await getUserData('David', 'david@email.com', 'david123', userRole),
    await getUserData('Eva', 'eva@email.com', 'eva123', userRole),
    await getUserData('Fedor', 'fedor@email.com', 'fedor123', userRole),
    await getUserData('Galina', 'galina@email.com', 'galina123', userRole),
    await getUserData('Khelga', 'khelga@email.com', 'khelga123', userRole),
    await getUserData('Yuliya', 'yuliya@email.com', 'yuliya123', userRole),
    await getUserData('Milana', 'milana@email.com', 'milana123', userRole),
  ];

  const adminPass = getInitAdminPassword();
  const adminRole = [UserRoleEnum.ADMIN];
  const adminUsername = getInitAdminUsername();
  const adminEmail = getInitAdminEmail();
  if (adminUsername && adminEmail && adminPass) {
    usersData.push(
      await getUserData(adminUsername, adminEmail, adminPass, adminRole),
    );
  } else {
    console.warn(
      'Admin user not created. Set INIT_ADMIN_USERNAME, INIT_ADMIN_EMAIL and INIT_ADMIN_PASSWORD env variables to create admin user',
    );
  }

  return usersData;
};
