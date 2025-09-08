
import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/',  userController.getUsers);

router.get('/me', userController.getCurrentUser);
router.get('/:id', userController.getUserById);

router.patch('/block/me', userController.blockCurrentUser);
router.patch('/block/:id', userController.blockUser);

router.patch('/unblock/me', userController.unblockCurrentUser);
router.patch('/unblock/:id', userController.unblockUser);

export default router;
