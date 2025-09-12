import type { Request } from 'express';

// http type
export type AuthRequest = {
  user?: { userId: number; role: string };
} & Request


// user type
export type UserRole = 'ADMIN' | 'USER';
export type User = {
  id: number;
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens?: RefreshToken[];
};
export type CreateUserData = {
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role?: UserRole;
}
export type UserRepository = {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(userData: any): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  deleteUserById(id: number) : Promise<User>
};


// tokens type
export type RefreshToken = {
  id: number;
  token: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
  user?: User;
};
export type RefreshTokenRepository = {
  findByUserId(userId: number): Promise<RefreshToken | null>;

  saveToken(userId: number, token: string, expiresAt: Date): Promise<RefreshToken>;

  deleteToken(userId:number): Promise<RefreshToken>

  revokeByUserId(userId:number): Promise<RefreshToken>

  restoreByUserId (userId:number): Promise<RefreshToken>
}

