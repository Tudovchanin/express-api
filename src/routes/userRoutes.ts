
import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/',  userController.getUsers);

router.get('/me', userController.getCurrentUser);
router.get('/:id', userController.getUserById);

router.post('/block/me', userController.blockCurrentUser);
router.post('/block/:id', userController.blockUser);

router.post('/unblock/me', userController.unblockCurrentUser);
router.post('/unblock/:id', userController.unblockUser);

export default router;
