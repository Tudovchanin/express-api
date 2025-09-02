import { prisma } from '../prismaClient';
import argon2 from 'argon2';

import type { CreateUserData} from '../types';

class UserService {

  async createUser(data: CreateUserData) {

    const userExist = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    })
    if (userExist) {
      throw new Error('Mail already exists');
    }

    const hashed = await argon2.hash(data.password);
    const birthDateObj = new Date(data.birthDate);
    const newUser = await prisma.user.create({
      data: {
        fullName: data.fullName,
        birthDate: birthDateObj,
        email: data.email,
        password: hashed,
         // Для демонстрации роли берём из клиента, но обычно здесь всегда 'USER'
        role: data.role || 'USER',
        isActive: true,
      },
    });
    
    return newUser;
  }

  async authenticateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    if (!user) {
      throw new Error('User with such email does not exist');
    }
    const passwordIsValid = await argon2.verify(user.password, password);
    if(!passwordIsValid) {
      throw new Error ('Password incorrect');
    }
    return user;
  }

  async getUserById(id:number) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  }

  async getAllUsers() {
    const users = await prisma.user.findMany();
    return users;
  }

  async blockUser(id: number) {
    const blockUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
      },
    });
    return blockUser;
  }

  async unblockUser(id: number) {
    const unblockedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
    return unblockedUser;
  }
  
 }


 export default  new UserService();