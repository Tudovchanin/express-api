
import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/',  userController.getUsers);

router.get('/me', userController.getMe);
router.get('/:id', userController.getUserById);

router.patch('/block/me', userController.blockMe);
router.patch('/block/:id', userController.blockUser);

router.patch('/unblock/me', userController.unblockMe);
router.patch('/unblock/:id', userController.unblockUser);

router.delete('/delete/me', userController.deleteMe);
router.delete('/delete/:id', userController.deleteUser);


export default router;
