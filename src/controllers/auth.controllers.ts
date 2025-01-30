import { Context, Next } from 'hono';
import authService from '@services/auth.services';
import { ApiResponse } from '@utils/apiresponse';
import { ApiError } from '@utils/apierror';
import { asyncHandler } from '@utils/asynchandler';

declare module 'hono' {
  interface Context {
    user?: any; // Extend Context to include 'user'
  }
}

/**
 * Handles OAuth authentication and returns tokens.
 */
const authController = asyncHandler(async (c: Context) => {
  const code = c.req.query('code');
  if (!code) {
    return c.json(new ApiResponse(400, null, 'Code parameter is missing'), 400);
  }

  const final_user = await authService.authenticate(code);
  const { access_token, refresh_token, ...user } = final_user;

  return c.json(
    new ApiResponse(200, { user, access_token, refresh_token }, 'Authentication successful')
  );
});

const verifyUser = async (c: Context, next: Next): Promise<Response | void> => {

  console.log("verifying user..")

  const authHeader = c.req.header('Authorization');
  console.log(authHeader);
  if (!authHeader) {
    return c.json(new ApiResponse(401, null, 'Authorization token is missing...'), 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json(new ApiResponse(401, null, 'Invalid token format'), 401);
  }

  const user = await authService.verifyUser(token);
  if (!user) {
    return c.json(new ApiResponse(401, null, 'Invalid or expired token'), 401);
  }

  // Attach user to the context
  c.set('user', user);

  // Proceed to the next middleware or route handler
  await next();
};

/**
 * Handles refreshing access tokens using a refresh token.
 */
const refreshTokenController = asyncHandler(async (c: Context) => {
  const refreshToken = c.req.header('Authorization')?.split(' ')[1];
  if (!refreshToken) {
    return c.json(new ApiResponse(400, null, 'Refresh token is missing'), 400);
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);

  return c.json(
    new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed successfully')
  );
});

export { authController, refreshTokenController, verifyUser };
