import type { Request } from 'express';

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

export type UserRepository = {
  findByEmail(email: string): Promise<any>;
  findById(id: number): Promise<any>;
  findAll(): Promise<any[]>;
  create(userData: any): Promise<any>;
  update(id: number, data: Partial<any>): Promise<any>;
};