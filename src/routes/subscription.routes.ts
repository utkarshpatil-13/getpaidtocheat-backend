import { Hono } from 'hono';
import SubscriptionController from '../controllers/subscription.controllers';
import { verifyUser } from '@controllers/auth.controllers';


const router = new Hono();

router.get('/create', verifyUser, SubscriptionController.createCheckoutSession);

// Public routes for success and cancel
router.get('/success', verifyUser, SubscriptionController.subscriptionSuccess);
router.delete('/cancel', verifyUser, SubscriptionController.subscriptionCancelHandler);

router.get('/billing-portal', verifyUser, SubscriptionController.redirectToBillingPortal);

router.get('/', verifyUser, SubscriptionController.getSubscriptionsByUser);

router.post('/renew', verifyUser, SubscriptionController.renewSubscriptionHandler);

export default router;
