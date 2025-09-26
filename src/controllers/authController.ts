import type { Request, Response, NextFunction } from 'express';

import { generateAccessToken, generateRefreshToken, getTokenExpiryDate, verifyToken, clearRefreshTokenCookie } from '../utils/authUtils';
import { prismaUserRepository, prismaRefreshTokenRepository } from '../repositories/prisma-repository';

import UserService from '../services/UserService';
import RefreshTokenService from '../services/RefreshTokenService';
import EmailService from '../services/EmailService';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const emailService = new EmailService();
const userService = new UserService(prismaUserRepository, emailService);
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
      secure: true,
      sameSite: 'none',
      maxAge: validityPeriodMs,
      signed: true
    });


    res.status(201).json({ message: 'User registered', 'token Refresh ExpiresAt': expiresAt, tokenAccess });

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

    refreshTokenService.saveToken(user.id, tokenRefresh, expiresAt);


    res.cookie('refreshToken', tokenRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: validityPeriodMs,
      signed: true
    });


    res.status(200).json({ 
      message: 'Login successful', 
      tokenAccess,
      tokenRefreshExpiresAt: expiresAt 
    });

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

    console.log('COOKIES', req.signedCookies.refreshToken);


    const refreshToken = req.signedCookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);

    if (!payload || typeof payload === 'string') {

      // clear if refreshToken not valid
      clearRefreshTokenCookie(res);

      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // checking user in the db
    const user = await userService.getUserById(payload.userId);

    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(404).json({ message: "User not found" });
    }
    // user deactivation check
    if (!user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Account deactivated" });
    }

    // checking the refreshToken in the db
    const dbTokenRefresh = await refreshTokenService.getToken(payload.userId);
    if (!dbTokenRefresh) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Refresh token not found in database" });
    }

    if (dbTokenRefresh.token !== refreshToken) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Refresh token mismatch", tokenRefreshCookie: refreshToken, dbTokenRefresh: dbTokenRefresh.token });
    }

    if (dbTokenRefresh.revoked) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role, secret: JWT_ACCESS_SECRET });

   res.status(200).json({ 
      userId:user.id,
      userName: user.fullName, 
      userEmail: user.email, 
      newAccessToken 
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(reg: Request, res: Response, next: NextFunction) {

  try {

    const refreshToken = reg.signedCookies.refreshToken;
    clearRefreshTokenCookie(res);

    if (refreshToken) {
      const payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);
      if (payload && typeof payload !== 'string') {
        await refreshTokenService.revokeToken(payload.userId);
      }
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}


export async function activate(reg: Request, res: Response, next: NextFunction) {
  try {

    const token = reg.body.token;
    if (!token) {
      throw new Error('No activation token provided');
    }

    const result = await userService.activateEmail(token);

    res.status(200).json({
      message: 'Email activated successfully',
      user: {
        userId: result.id,
        email: result.email,
        fullName: result.fullName,
        emailConfirmed: result.emailConfirmed
      }
    });

  } catch (err: any) {
    if (err.message === 'User already activated') {
      err.status = 409;
    } else if (err.message === 'Invalid or expired token') {
      err.status = 400;
    } else if (err.message === 'User not found') {
      err.status = 404;
    } else if (err.message === 'No activation token provided') {
      err.status = 400;
    }
    next(err);
  }
}