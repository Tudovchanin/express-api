
import  type { Response } from 'express';
import type { AuthRequest } from '../types';

import  userService  from '../services/UserService';



export async function getUserById(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const user = await userService.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  } 
  res.json(user);
}

export async function getUsers(req: AuthRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const users = await userService.getAllUsers();
  res.json(users);
}

export async function blockUser(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await userService.blockUser(id);
  res.json({ message: 'User blocked' });
}


export async function getCurrentUser(req: AuthRequest, res: Response) {
  const id = req.user?.userId;
  if (!id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await userService.getUserById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
}

export async function blockCurrentUser(req: AuthRequest, res: Response) {
  const id = req.user?.userId;
  if (!id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  await userService.blockUser(id);
  res.json({ message: 'User blocked' });
}

export async function unblockUser(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await userService.unblockUser(id);
  res.json({ message: 'User unblocked' });
}

export async function unblockCurrentUser(req: AuthRequest, res: Response) {
  const id = req.user?.userId;
  if (!id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  await userService.unblockUser(id);
  res.json({ message: 'User unblocked' });
}
