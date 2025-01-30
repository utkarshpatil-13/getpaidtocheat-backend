import { Hono } from 'hono';
import { AdminController } from '../controllers/admin.controllers';
import { verifyUser } from '@controllers/auth.controllers';

const adminRouter = new Hono();
const adminController = new AdminController();

adminRouter.post('/update-metrics', verifyUser, (c) => adminController.updateUserVideoMetrics(c));

export default adminRouter;