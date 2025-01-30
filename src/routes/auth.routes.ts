// src/routes/authRoutes.ts
import { Hono } from 'hono';
import { authController, refreshTokenController, verifyUser } from '@controllers/auth.controllers';

const authRoutes = new Hono();

// Route for initial OAuth authentication
authRoutes.get('/discord/redirect', authController);

// middleware : verify user with access_token
// authRoutes.use('/verify', verifyUser);

// Route for refreshing access token
authRoutes.post('/discord/refresh', verifyUser, refreshTokenController);

export default authRoutes;
