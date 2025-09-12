import { prisma } from "../prismaClient";
import type {
  UserRepository,
  RefreshTokenRepository,
  CreateUserData,
} from "../types";

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

  async create(userData: CreateUserData) {
    return prisma.user.create({ data: userData });
  },

  async update(id: number, data: Partial<any>) {
    return prisma.user.update({ where: { id }, data });
  },

  async deleteUserById(id: number) {
    return prisma.user.delete({ where: { id } });
  }
};

export const prismaRefreshTokenRepository: RefreshTokenRepository = {
  async findByUserId(userId: number) {
    return prisma.refreshToken.findUnique({ where: { userId } });
  },

  async saveToken(userId: number, token: string, expiresAt: Date) {
    return prisma.refreshToken.upsert({
      where: { userId },
      update: {
        token,
        expiresAt,
        revoked: false,
        createdAt: new Date(),
      },
      create: {
        userId,
        token,
        expiresAt,
        revoked: false,
      },
    });
  },

  async deleteToken(userId: number) {
    return prisma.refreshToken.delete({ where: { userId } });
  },

  async revokeByUserId(userId: number) {
    return prisma.refreshToken.update({
      where: { userId },
      data: { revoked: true },
    });
  },

  async restoreByUserId(userId: number) {
    return prisma.refreshToken.update({
      where: { userId },
      data: { revoked: true },
    });
  },
};
