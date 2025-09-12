
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';

import { verifyToken } from '../utils/authUtils';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;



export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
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
  next();
}
