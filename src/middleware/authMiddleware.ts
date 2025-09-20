
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';

import { verifyToken } from '../utils/authUtils';

import UserService from '../services/UserService';
import { prismaUserRepository } from '../repositories/prisma-repository';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

const userService = new UserService(prismaUserRepository);




export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  } 

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token, JWT_ACCESS_SECRET);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid token' });
  } 

  req.user = payload as { userId: number; role: string };
  const userStatus = await userService.userIsActive(req.user.userId);
    
  if (!userStatus) {
    return res.status(401).json({ message: 'User not found' });
  }

  if (!userStatus.isActive) {
    return res.status(401).json({ message: 'Account deactivated' });
  }

  

  next();
    
  } catch (err) {
    next(err);
  }
  
}
