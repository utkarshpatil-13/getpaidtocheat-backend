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

app.use('*', async (c, next) => {
  const allowedOrigins = [
    'https://getpaidtocheat-frontend-six.vercel.app',
    'http://localhost:5173'
  ];

  const origin = c.req.header('Origin');

  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin); // Set dynamic origin
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
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