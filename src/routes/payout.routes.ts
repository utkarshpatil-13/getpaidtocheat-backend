import { Hono } from 'hono';
import { PayoutController } from '../controllers/payout.controllers';
import { PayoutService } from '../services/payout.services';
import { PayoutRepository } from '../repositories/payout.repositories';
import { PrismaClient } from '@prisma/client';
import { verifyUser } from '@controllers/auth.controllers';
import { TransactionService } from '@services/transactions.services';
import { TransactionRepository } from '../repositories/transactions.repositories';

const payoutRouter = new Hono();

const prisma = new PrismaClient();

const transactionRepository = new TransactionRepository(prisma);
const transactionService = new TransactionService(transactionRepository);

const payoutRepository = new PayoutRepository(prisma);
const payoutService = new PayoutService(payoutRepository, transactionService);
const payoutController = new PayoutController(payoutService);

// Explicitly bind controller methods
const approvePayout = payoutController.approvePayout.bind(payoutController);
const getTotalEarned = payoutController.getTotalEarned.bind(payoutController);
const processPayout = payoutController.processPayout.bind(payoutController);
// const getUserPayouts = payoutController.processPayout.bind(payoutController);
const stripeOnboardingSuccess = payoutController.stripeOnboardingSuccess.bind(payoutController);
const stripeOnboardingRefresh = payoutController.stripeOnboardingRefresh.bind(payoutController);

// Fetch total earned amount
payoutRouter.get('/total-earned', verifyUser, getTotalEarned);

// Approve payout
payoutRouter.post('/approve', approvePayout);

// Process payout
payoutRouter.post('/process', verifyUser, processPayout);

// retrieve user payouts
payoutRouter.get('/', verifyUser, payoutController.getUserPayouts);

// Stripe onboarding routes
payoutRouter.get('/stripe/onboarding/success', stripeOnboardingSuccess);
payoutRouter.get('/stripe/onboarding/refresh', stripeOnboardingRefresh);

export default payoutRouter;
