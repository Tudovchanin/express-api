import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';

import { authMiddleware } from '../middleware/authMiddleware';


const router = Router();

router.use('/users', authMiddleware, userRoutes);
router.use('/auth', authRoutes);

export default router;
