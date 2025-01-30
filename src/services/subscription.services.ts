import Stripe from 'stripe';
import { ISubscriptionService } from '../interfaces/subscriptions/ISubscriptionService';
import subscriptionRepository from '../repositories/subscription.repositories';
import userRepository from '../repositories/user.repositories';
import { STRIPE_CONFIG } from '../constants/stripe.constants';
import { ApiError } from '../utils/apierror';
import { IUserRepository } from '../interfaces/users/IUserRepository';
import { Subscription } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

class SubscriptionService implements ISubscriptionService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async createCheckoutSession(userId: string): Promise<string> {
        try {

            // check if the customer already exists
            let customer = await this.userRepository.getUserById(userId);

            if(!customer){
                throw new ApiError(400, "Customer does not exists");
            }

            // Create a Stripe customer
            if(!customer.stripeCustomerId){
                const stripeCustomer = await stripe.customers.create({
                    metadata: { userId },
                });
                customer.stripeCustomerId = stripeCustomer.id;

                // Update user with stripeCustomerId
                await userRepository.updateUser(userId, { stripeCustomerId: stripeCustomer.id });
            }


            // Generate an idempotency key
            const idempotencyKey = `${userId}-${Date.now()}`;

            // Create a checkout session
            const session = await stripe.checkout.sessions.create({
                customer: customer.stripeCustomerId,
                line_items: [{
                    price: process.env.STRIPE_STARTER_PLAN_PRICE,
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: STRIPE_CONFIG.SUCCESS_URL,
                cancel_url: STRIPE_CONFIG.CANCEL_URL,
                metadata: {
                    userId
                }
            },
                {
                    idempotencyKey,
                });

            return session.url || '';
        } catch (error) {
            console.error('Stripe Error:', error);
            throw new ApiError(500, 'Failed to create Stripe checkout session');
        }
    }

    async subscriptionSuccess(sessionId: string): Promise<void> {
        try {
            // Retrieve the session with expanded subscription and customer
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['subscription', 'customer'],
            });
    
            if (!session || !session.subscription) {
                throw new ApiError(400, 'Invalid Stripe session or missing subscription');
            }
    
            // Handle subscription retrieval correctly
            const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
    
            if (!subscriptionId) {
                throw new ApiError(400, 'Subscription ID could not be retrieved');
            }
    
            // Retrieve subscription details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
            // Extract relevant data
            const userId = (session.metadata?.userId as string) || '';
            const customerId = typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id as string;
            const productId = subscription.items.data[0]?.price?.product as string;
            const planId = subscription.items.data[0]?.price?.id as string;
            const startDate = new Date(subscription.start_date * 1000);
            const endDate = new Date(subscription.current_period_end * 1000);
    
            if (!userId) {
                throw new ApiError(400, 'User ID is missing from session metadata');
            }
    
            // Save subscription details to the database
            await subscriptionRepository.createCheckoutSession(
                userId,
                customerId,
                subscriptionId,
                productId,
                planId,
                startDate,
                endDate
            );
    
            console.log('Subscription success recorded in the database');
        } catch (error) {
            console.error('Error in processing subscription success:', error);
            throw new ApiError(500, 'Failed to process subscription success');
        }
    }

    async updateSubscription(stripeSubscriptionId: string, updates: Partial<Subscription>): Promise<void> {
        try {
            if (!stripeSubscriptionId) {
                throw new ApiError(400, 'Stripe Subscription ID is required');
            }

            await subscriptionRepository.updateSubscriptionStatus(
                stripeSubscriptionId,
                updates
            );

            console.log(`Subscription ${stripeSubscriptionId} updated with:`, updates);
        } catch (error) {
            console.error('Failed to update subscription:', error);
            throw new ApiError(500, 'Failed to update subscription');
        }
    }

    /**
     * Handle Subscription Expiration
     */
    async handleSubscriptionExpired(subscription: Stripe.Subscription): Promise<void> {
        await this.updateSubscription(subscription.id, {
            status: 'inactive',
            paymentStatus: 'failed',
            endDate: new Date(subscription.current_period_end * 1000),
        });
    }

    /**
     * Handle Subscription Update
     */
    async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
        const status = subscription.status === 'active' ? 'active' : 'inactive';

        await subscriptionRepository.updateSubscriptionStatus(subscription.id, {
            status,
            endDate: new Date(subscription.current_period_end * 1000),
        });
    }

    /**
     * Handle Payment Failure
     */
    async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
        await subscriptionRepository.updateSubscriptionStatus(invoice.subscription as string, {
            paymentStatus: 'failed',
        });
    }

    /**
   * Create a Stripe Billing Portal Session
   * @param customerId - Stripe customer ID
   * @returns Billing portal session URL
   */
    async createBillingPortalSession(customerId: string): Promise<string> {
        try {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${process.env.CLIENT_URL}/subscription`, // Redirect URL after portal session
            });

            return portalSession.url;
        } catch (error) {
            console.error('Error creating Stripe Billing Portal session:', error);
            throw new ApiError(500, 'Failed to create billing portal session');
        }
    }

    async getSubscriptionsByUser(userId : string) : Promise<Subscription | null>{
        try {
            const subscriptions = await subscriptionRepository.getSubscriptionsByUser(userId);

            return subscriptions;
        } catch (error) {
            console.error('Error retrieving subscriptions in services', error);
            throw new ApiError(500, 'Failed to retrive subscriptions in services');
        }
    }

    async cancelSubscription(userId: string, stripeSubscriptionId: string): Promise<void> {
        try {
            if (!stripeSubscriptionId) {
                throw new ApiError(400, 'Stripe Subscription ID is required');
            }
    
            // Cancel the subscription by updating its status in Stripe
            const canceledSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
                cancel_at_period_end: true, // Ensures subscription runs until the end of the billing cycle
            });
    
            // Update the subscription status in your database
            await subscriptionRepository.updateSubscriptionStatus(stripeSubscriptionId, {
                status: 'canceled',
                paymentStatus: 'canceled',
                endDate: new Date(canceledSubscription.current_period_end * 1000),
            });
    
            console.log(`Subscription ${stripeSubscriptionId} canceled successfully for user ${userId}`);
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            throw new ApiError(500, 'Failed to cancel subscription');
        }
    }

    async renewSubscription(userId: string, stripeSubscriptionId: string): Promise<Subscription> {
        try {
            if (!stripeSubscriptionId) {
                throw new ApiError(400, 'Stripe Subscription ID is required');
            }
    
            // Retrieve the subscription from Stripe
            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    
            if (!subscription) {
                throw new ApiError(400, 'Subscription does not exist');
            }
    
            // Reactivate the subscription in Stripe
            const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
                cancel_at_period_end: false, // Reactivate the subscription
            });
    
            // Update the subscription details in the database
            const renewed_subscription = await subscriptionRepository.renewSubscription(userId, stripeSubscriptionId, {
                status: 'active',
                paymentStatus: 'paid',
                startDate: new Date(updatedSubscription.start_date * 1000),
                endDate: new Date(updatedSubscription.current_period_end * 1000),
            });
    
            console.log(`Subscription ${stripeSubscriptionId} renewed successfully for user ${userId}`);

            return renewed_subscription;
        } catch (error) {
            console.error('Failed to renew subscription:', error);
            throw new ApiError(500, 'Failed to renew subscription');
        }
    }
    
}

// Singleton Pattern
const subscriptionServiceInstance = new SubscriptionService(userRepository);
export default subscriptionServiceInstance;
