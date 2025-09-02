import { Request, Response } from 'express';
import { generateToken } from '../utils/authUtils';

import  userService  from '../services/UserService';




export async function register(req: Request, res: Response) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: 'User registered', userId: user.id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}


export async function login(req: Request, res: Response) {
  try {
    const user = await userService.authenticateUser(req.body.email, req.body.password);
    const token = generateToken(user.id, user.role);
    res.json({ token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}