
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
    const idUserAuth = req.user?.userId;
    if (!idUserAuth) {
      const err = new Error('Unauthorized');
      (err as any).status = 401;
      throw err;
    }
    const user = await userService.getUserById(idUserAuth);
    if (!user) {
      const err = new Error('User not found');
      (err as any).status = 404;
      throw err;
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (err) {
    next(err);
  }

}
export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idParams = Number(req.params.id);
    if (req.user?.userId !== idParams && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    const user = await userService.getUserById(idParams);
    if (!user) {
      const err = new Error('User not found');
      (err as any).status = 404;
      throw err;
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
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
    res.json({ message: `Me blocked` });

  } catch (err) {
    next(err);
  }

}
export async function blockUser(req: AuthRequest, res: Response, next: NextFunction) {

  try {

    const idParams = Number(req.params.id);
    if (req.user?.userId !== idParams && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    await userService.blockUser(idParams);
    res.json({ message: `User ${idParams} blocked` });

  } catch (err) {
    next(err);
  }

}

export async function unblockUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idParams = Number(req.params.id);
  
    if (req.user?.userId !== idParams && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }
    await userService.unblockUser(idParams);
    res.json({ message: `User ${idParams} unblocked` });

  } catch (err) {
    next(err);
  }
}



export async function deleteMe(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    const idUserAuth = req.user?.userId;
    if (!idUserAuth) {
      const err = new Error('Unauthorized, not delete user');
      (err as any).status = 401;
      throw err;
    }

    await userService.deleteUser(idUserAuth);
    res.json({ message: `Me delete` });
  } catch (err) {
    next(err);
  }

}
export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {

  try {
    const idParams = Number(req.params.id);
    if (req.user?.userId !== idParams && req.user?.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      (err as any).status = 403;
      throw err;
    }

    await userService.deleteUser(idParams);
    res.json({ message: `User ${idParams} delete` });
  } catch (err) {
    next(err);
  }

}
