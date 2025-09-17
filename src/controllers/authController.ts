import type { Request, Response, NextFunction } from 'express';

import { generateAccessToken, generateRefreshToken, getTokenExpiryDate, verifyToken } from '../utils/authUtils';
import { prismaUserRepository, prismaRefreshTokenRepository } from '../repositories/prisma-repository';

import UserService from '../services/UserService';
import RefreshTokenService from '../services/RefreshTokenService';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const userService = new UserService(prismaUserRepository);
const refreshTokenService = new RefreshTokenService(prismaRefreshTokenRepository);


export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.body);

    const tokenAccess = generateAccessToken({ userId: user.id, role: user.role, secret: JWT_ACCESS_SECRET });
    const tokenRefresh = generateRefreshToken({ userId: user.id, secret: JWT_REFRESH_SECRET });


    // 7 дней
    const validityPeriodMs = 7 * 24 * 60 * 60 * 1000; 
    const expiresAt = getTokenExpiryDate(validityPeriodMs);
    refreshTokenService.saveToken(user.id, tokenRefresh, expiresAt);

    res.cookie('refreshToken', tokenRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validityPeriodMs,
      signed:true
    });

    res.status(201).json({ message: 'User registered', 'token Refresh ExpiresAt': expiresAt, tokenAccess, tokenRefresh });

  } catch (err: any) {
    if (err.message === 'Mail already exists') {
      err.status = 409;
    }
    next(err);
  }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  console.log(req.body, 'DATA LOGIN');
  
  try {
    const user = await userService.authenticateUser(req.body.email, req.body.password);

    const tokenAccess = generateAccessToken({ userId: user.id, role: user.role, secret: JWT_ACCESS_SECRET });
    const tokenRefresh = generateRefreshToken({ userId: user.id, secret: JWT_REFRESH_SECRET });


    // 7 дней
    const validityPeriodMs = 7 * 24 * 60 * 60 * 1000; 
    const expiresAt = getTokenExpiryDate(validityPeriodMs);

    res.cookie('refreshToken', tokenRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validityPeriodMs,
      signed:true
    });

    res.json({ message: 'User sign in', tokenRefreshExpiresAt: expiresAt, tokenAccess, tokenRefresh });

  } catch (err: any) {
    if (err.message === 'User with such email does not exist') {
      err.status = 404;
    } else if (err.message === 'Password incorrect') {
      err.status = 401;
    } else {
      err.status = 400;
    }
    next(err);
  }
}

export async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
  try {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);

    if (!payload || typeof payload === 'string') {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await userService.getUserById(payload.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role, secret: JWT_ACCESS_SECRET });
    
    res.json({userName:user.fullName, userEmail:user.email, newAccessToken: newAccessToken});
    
  } catch (err) {
    next(err);
  }
}