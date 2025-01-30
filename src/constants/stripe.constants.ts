export const STRIPE_CONFIG = {
    SUCCESS_URL: `${process.env.CLIENT_URL}/subscription?session_id={CHECKOUT_SESSION_ID}`,
    CANCEL_URL: `${process.env.CLIENT_URL}/subscription`,
    CURRENCY: 'usd',
  };