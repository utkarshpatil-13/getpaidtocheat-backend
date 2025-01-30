import { serve } from '@hono/node-server'
import userRoutes from '@routes/user.routes';
import authRoutes from '@routes/auth.routes';
import youtubeRoutes from '@routes/youtube.routes'
import subscriptionRoutes from '@routes/subscription.routes'
import { Hono } from 'hono'
import adminRouter from '@routes/admin.routes';
import socialMediaRouter from '@routes/socialmediaaccount.routes';
import payoutRouter from '@routes/payout.routes';
import transactionRouter from '@routes/transactions.routes';

const app = new Hono()

// Middlewares
app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow your frontend origin
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
    c.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials (cookies, auth headers)
  
    if (c.req.method === 'OPTIONS') {
      // Handle preflight requests
      return c.body(null, 204); // Respond with 204 No Content
    }
    await next();
  });

// Register Routes
app.route('/api/user', userRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/youtube', youtubeRoutes);
app.route('/api/subscription', subscriptionRoutes);
app.route('/api/payout', payoutRouter);
app.route('/api/admin', adminRouter);
app.route('/api/social-media', socialMediaRouter);
app.route('/api/transactions', transactionRouter);

// Default Route
app.get('/', (c) => c.text('Hello from Hono! 🚀'));

// Error Handling
app.onError((err, c) => {
    console.error(err);
    return c.json({ message: 'Internal Server Error' }, 500);
});

serve(app)