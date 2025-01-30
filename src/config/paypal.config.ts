import * as paypal from '@paypal/checkout-server-sdk';

// Set up PayPal environment
export function client() {
  const clientId = 'YOUR_CLIENT_ID';  // Replace with your PayPal Client ID
  const clientSecret = 'YOUR_CLIENT_SECRET';  // Replace with your PayPal Secret Key

  return new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(clientId, clientSecret) // Use Sandbox environment for testing
  );
}