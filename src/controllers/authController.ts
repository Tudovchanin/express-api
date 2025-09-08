import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/authUtils';

import  UserService  from '../services/UserService';
import { prismaUserRepository } from '../repositories/prisma-repository';

const userService = new UserService(prismaUserRepository);



export async function register(req: Request, res: Response, next:NextFunction) {
  try {
    const user = await userService.createUser(req.body);
    const token = generateToken(user.id, user.role);
    res.status(201).json({ message: 'User registered', userId: user.id, token });
  } catch (err: any) {
    if (err.message === 'Mail already exists') {
      err.status = 409;
    }
    next(err);
  }
}



export async function login(req: Request, res: Response, next:NextFunction) {
  try {
    const user = await userService.authenticateUser(req.body.email, req.body.password);
    const token = generateToken(user.id, user.role);
    res.json({ token });
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