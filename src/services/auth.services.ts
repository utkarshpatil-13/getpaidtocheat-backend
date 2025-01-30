// src/services/authService.ts

import axios from 'axios';
import { ApiError } from '@utils/apierror';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handles user authentication via OAuth.
 */
const authenticate = async (code: string) => {
  try {
    // Exchange code for tokens from Discord
    const response = await axios.post(
      'https://discord.com/api/v10/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_CALLBACK_URL!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token } = response.data;

    // Fetch user info from Discord
    const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let user = await prisma.user.findUnique({
      where: { discordId: userInfo.data.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          discordId: userInfo.data.id,
          username: userInfo.data.username,
          email: userInfo.data.email,
          avatarUrl: userInfo.data.avatar,
          accessToken: access_token,
          refreshToken: refresh_token,
          ipAddress: 'some ip',
        },
      });
    }
    else{
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
    }

    const final_user = { ...user, access_token, refresh_token };
    return final_user;
  } catch (error: any) {
    console.error('Error during authentication:', error.response?.data || error.message);
    throw new ApiError(
      500,
      'Failed to authenticate with Discord',
      [error.response?.data?.error_description || error.message]
    );
  }
};

/**
 * Verifies a user using an access token.
 */
const verifyUser = async (access_token: string) => {
  try {
    const userInfo = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let user = await prisma.user.findUnique({
      where: { discordId: userInfo.data.id },
    });

    if (!user) {
      throw new ApiError(400, 'User does not exist');
    }

    // Update user details with the latest info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: userInfo.data.username,
        email: userInfo.data.email,
        avatarUrl: userInfo.data.avatar,
        ipAddress: 'some ip',
        accessToken: access_token
      },
    });

    return user;
  } catch (error: any) {

    if (error.response?.status === 401) {
      console.log('Access token expired, attempting to refresh...');
      try {
        // Fetch user using the stored refresh token
        const user = await prisma.user.findUnique({
          where: { accessToken: access_token },
        });

        console.log(user);

        if (!user || !user.refreshToken) {
          throw new ApiError(401, 'Refresh token not found for the user');
        }

        // Generate a new access token
        const newAccessToken = await refreshAccessToken(user.refreshToken);

        // Update the user's access token in the database
        await prisma.user.update({
          where: { id: user.id },
          data: { accessToken: newAccessToken.accessToken },
        });

        // Retry user verification with the new access token
        return await verifyUser(newAccessToken.accessToken);
      } catch (refreshError: any) {
        console.error('Error during token refresh:', refreshError.message);
        throw new ApiError(401, 'Unable to refresh access token', [refreshError.message]);
      }
    }

    console.error('Error verifying user:', error.response?.data || error.message);
    throw new ApiError(401, 'Invalid or expired token', [error.message]);
  }
};

/**
 * Refreshes access and refresh tokens.
 */
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      'https://discord.com/api/v10/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        redirect_uri: process.env.DISCORD_CALLBACK_URL!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token: new_refresh_token } = response.data;

    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) {
      throw new ApiError(404, 'User not found for the given refresh token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: new_refresh_token || user.refreshToken },
    });

    return { accessToken: access_token, refreshToken: new_refresh_token };
  } catch (error: any) {
    console.error('Error during token refresh:', error.response?.data || error.message);
    throw new ApiError(
      401,
      'Invalid or expired refresh token',
      [error.response?.data?.error_description || error.message]
    );
  }
};

export default { authenticate, verifyUser, refreshAccessToken };
