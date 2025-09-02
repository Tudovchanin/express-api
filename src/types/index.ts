import type { Request, Response, NextFunction } from 'express';

export type AuthRequest = {
  user?: { userId: number; role: string };
} & Request




export type UserRole = 'ADMIN' | 'USER';

export type CreateUserData = {
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role?: UserRole;
}