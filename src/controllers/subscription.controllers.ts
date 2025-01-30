import { Context } from 'hono';
import { asyncHandler } from '../utils/asynchandler';
import { ApiResponse } from '../utils/apiresponse';
import subscriptionService from '../services/subscription.services';
import { ApiError } from '@utils/apierror';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from '../constants/stripe.constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

class SubscriptionController {
  createCheckoutSession = asyncHandler(async (c: Context) => {
    const user = c.get('user'); // Access the user from context

    console.log(user);

    if (!user) {
      throw new Error('User is not available in the context');
    }

    if (!user.id) {
      throw new ApiError(400, 'User ID are required');
    }

    const checkoutUrl = await subscriptionService.createCheckoutSession(user.id);
    // return c.json(new ApiResponse(200, { checkoutUrl }, 'Checkout session created successfully'));
    return c.json({ checkoutUrl });
  });

  subscriptionSuccess = asyncHandler(async (c: Context) => {
    const sessionId = c.req.query('session_id');
    console.log('Session ID:', sessionId);

    if (!sessionId) {
      throw new ApiError(400, 'Session ID is missing');
    }

    await subscriptionService.subscriptionSuccess(sessionId);

    return c.json(new ApiResponse(200, null, 'Subscription processed successfully'));
  });

  subscriptionCancelHandler = asyncHandler(async (c: Context) => {
    const user = c.get('user');
    const { stripeSubscriptionId } = c.req.query();

    if (!user || !user.id) {
      throw new ApiError(400, 'User is not available in the context');
    }

    if (!stripeSubscriptionId) {
      throw new ApiError(400, 'Stripe Subscription ID is required');
    }

    await subscriptionService.cancelSubscription(user.id, stripeSubscriptionId);

    return c.json(new ApiResponse(200, null, 'Subscription canceled successfully'));
  });


  /**
 * Redirect user to Stripe Billing Portal
 */
  redirectToBillingPortal = asyncHandler(async (c: Context) => {
    const user = c.get('user'); // Access user details from the context

    if (!user || !user.stripeCustomerId) {
      throw new ApiError(400, 'Stripe customer ID is required');
    }

    const portalUrl = await subscriptionService.createBillingPortalSession(user.stripeCustomerId);

    return c.json(new ApiResponse(200, { portalUrl }, 'Billing portal session created successfully'));
  });

  getSubscriptionsByUser = asyncHandler(async (c: Context) => {
    const user = c.get('user');

    console.log(user);

    if (!user) {
      throw new ApiError(404, 'User does not exists');
    }

    const subscriptions = await subscriptionService.getSubscriptionsByUser(user.id);

    console.log(subscriptions);

    return c.json(new ApiResponse(201, subscriptions, `Subscriptions of user ${user.username}`));
  });


  renewSubscriptionHandler = asyncHandler(async (c: Context) => {
    const user = c.get('user'); // Access user details from the context
    const { stripeSubscriptionId } = c.req.query(); // Subscription ID from query parameters

    if (!user || !user.id) {
      throw new ApiError(400, 'User is not available in the context');
    }

    if (!stripeSubscriptionId) {
      throw new ApiError(400, 'Stripe Subscription ID is required');
    }

    const subscription = await subscriptionService.renewSubscription(user.id, stripeSubscriptionId);

    return c.json(new ApiResponse(200, subscription, 'Subscription renewed successfully'));
  });


  handleWebhook = asyncHandler(async (c: Context) => {
    const sig = c.req.header('stripe-signature') || '';
    const payload = await c.req.text(); // Get the raw body content
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new ApiError(400, 'Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        // This is where you'd handle the completion of the checkout session
        this.subscriptionSuccess;
        break;
      case 'invoice.payment_succeeded':
        // Handle invoice payment succeeded event
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        // Handle invoice payment failed event
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
        break;
    }

    // Acknowledge receipt of the event
    return c.json({ received: true });
  });

  private async handleInvoicePaymentSucceeded(invoice: any) {
    console.log('Invoice payment succeeded:', invoice);
    // Handle logic for successful payment
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    console.log('Invoice payment failed:', invoice);
    // Handle logic for failed payment
  }

}

// Singleton Pattern
export default new SubscriptionController();
