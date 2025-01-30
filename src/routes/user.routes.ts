import { Hono } from 'hono';
import UserController from '../controllers/user.controllers';
import { verifyUser } from '@controllers/auth.controllers';

const router = new Hono();

router.get('/', UserController.getAllUsers);
router.get('/profile', verifyUser, UserController.getUser); 
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
