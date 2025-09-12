
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';

import UserService from '../services/UserService';
import { prismaUserRepository } from '../repositories/prisma-repository';


const userService = new UserService(prismaUserRepository);


export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    if (req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    const users = await userService.getAllUsers();
    res.json(users);

  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.user?.userId;
    if (!id) {
      const err = new Error('Unauthorized');
      (err as any).status = 401;
      throw err;
    }
    const user = await userService.getUserById(id);
    if (!user) {
      const err = new Error('User not found');
      (err as any).status = 404;
      throw err;
    }
    res.json(user);

  } catch (err) {
    next(err);
  }

}
export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    const user = await userService.getUserById(id);
    if (!user) {
      const err = new Error('User not found');
      (err as any).status = 404;
      throw err;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }

}


export async function blockMe(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    const id = req.user?.userId;
    if (!id) {
      const err = new Error('Unauthorized');
      (err as any).status = 401;
      throw err;
    }
    await userService.blockUser(id);
    res.json({ message: 'User blocked' });

  } catch (err) {
    next(err);
  }

}
export async function blockUser(req: AuthRequest, res: Response, next: NextFunction) {

  try {

    const id = Number(req.params.id);
    if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    await userService.blockUser(id);
    res.json({ message: 'User blocked' });

  } catch (err) {
    next(err);
  }

}


export async function unblockMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.user?.userId;
    if (!id) {
      const err = new Error('Unauthorized');
      (err as any).status = 401;
      throw err;
    }
    await userService.unblockUser(id);
    res.json({ message: 'User unblocked' });

  } catch (err) {
    next(err)
  }
}
export async function unblockUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    await userService.unblockUser(id);
    res.json({ message: 'User unblocked' });

  } catch (err) {
    next(err);
  }
}



export async function deleteMe(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    const id = req.user?.userId;
    if (!id) {
      const err = new Error('Unauthorized, not delete user');
      (err as any).status = 401;
      throw err;
    }

    await userService.deleteUser(id);
    res.json({ message: `user ${id} delete` });
  } catch (err) {
    next(err);
  }

}
export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    const id = Number(req.params.id);
    if (req.user?.userId !== id && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }

    await userService.deleteUser(id);
    res.json({ message: `user ${id} delete` });
  } catch (err) {
    next(err);
  }

}
