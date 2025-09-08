import { prisma } from '../prismaClient';
import type { UserRepository } from '../types';

export const prismaUserRepository: UserRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findAll() {
    return prisma.user.findMany();
  },

  async create(userData: any) {
    return prisma.user.create({ data: userData });
  },

  async update(id: number, data: Partial<any>) {
    return prisma.user.update({ where: { id }, data });
  }
};