import { Hono } from 'hono';
import { SocialMediaAccountController } from '../controllers/socialmediaaccount.controllers';
import { verifyUser } from '@controllers/auth.controllers';

const router = new Hono();
const controller = new SocialMediaAccountController();

/**
 * @route GET /social-media/account
 * @desc Get social media account details
 */
router.get('/account', verifyUser, controller.getAccount);

/**
 * @route PUT /social-media/account/tokens
 * @desc Update social media account tokens
 */
router.put('/tokens', verifyUser, controller.updateTokens);

/**
 * @route POST /social-media/account
 * @desc Create a new social media account
 */
router.post('/account', verifyUser, controller.createAccount);

export default router;
