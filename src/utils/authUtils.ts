import jwt from 'jsonwebtoken';
import type { Response } from 'express';

type GenerateTokenParams = {
  userId: number;
  role: string;
  secret: string;
  expiresIn?: jwt.SignOptions['expiresIn'];
}

type GenerateRefreshTokenParams = {
  userId: number;
  secret: string;
  expiresIn?: jwt.SignOptions['expiresIn'];
}

export function generateAccessToken(params: GenerateTokenParams): string {
  const {
    userId,
    role,
    secret,
    expiresIn = '30m'
  } = params;

  return jwt.sign({ userId, role }, secret, { expiresIn });
}

export function generateRefreshToken(params: GenerateRefreshTokenParams): string {
  const {
    userId,
    secret,
    expiresIn = '7d'
  } = params;

  return jwt.sign({ userId }, secret, { expiresIn });
}

export function verifyToken(token: string, secret:string){
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export function getTokenExpiryDate(validityPeriodMs: number): Date {
  return new Date(Date.now() + validityPeriodMs);
}


export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
}